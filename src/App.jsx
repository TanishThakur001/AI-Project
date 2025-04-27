import { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize with your API key
const genAI = new GoogleGenerativeAI('AIzaSyAZmTERIiv2ly2jJD6IX9dLONULTbRJdk8');

// Get the model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Generate function to handle AI responses
const generate = async (userPrompt) => {
  try {
    const defaultPrompt = `
      You are TravelBuddy AI, a travel assistant developed to help users discover destinations, 
      plan trips, and get inspired for their next adventure.
      
      You provide travel recommendations, tips about destinations, and help with planning itineraries.
      
      If a user asks about your creation, mention you were developed as a travel companion app.
      If the user asks something unrelated to travel, gently redirect them back to travel-related topics.
      
      Now, respond to the following user request accordingly:
    `;
    
    const prompt = `${defaultPrompt} ${userPrompt}`;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    return response;
  } catch (error) {
    console.error("Error generating content:", error);
    return "Sorry, I encountered an error. Please try again later.";
  }
};

function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your travel assistant. Ask me about destinations, travel tips, or anything related to your next adventure!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [theme, setTheme] = useState('light');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const regions = [
    { id: 'all', name: 'All Regions' },
    { id: 'asia', name: 'Asia' },
    { id: 'europe', name: 'Europe' },
    { id: 'americas', name: 'Americas' },
    { id: 'africa', name: 'Africa' },
    { id: 'oceania', name: 'Oceania' }
  ];

  const destinations = [
    {
      id: 1,
      name: 'Bali, Indonesia',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
      description: 'Tropical paradise with beautiful beaches and vibrant culture.',
      region: 'asia',
      activities: ['Beaches', 'Culture', 'Temples', 'Surfing'],
      bestTime: 'May to September'
    },
    {
      id: 2,
      name: 'Santorini, Greece',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff',
      description: 'Stunning white-washed buildings overlooking the Aegean Sea.',
      region: 'europe',
      activities: ['Sightseeing', 'Beaches', 'Cuisine', 'Photography'],
      bestTime: 'April to October'
    },
    {
      id: 3,
      name: 'Kyoto, Japan',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
      description: 'Ancient temples, traditional gardens, and cultural heritage.',
      region: 'asia',
      activities: ['Temples', 'Gardens', 'History', 'Cherry Blossoms'],
      bestTime: 'March to May, October to November'
    },
    {
      id: 4,
      name: 'Machu Picchu, Peru',
      image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377',
      description: 'Iconic Incan citadel set amidst breathtaking mountain scenery.',
      region: 'americas',
      activities: ['Hiking', 'History', 'Photography', 'Nature'],
      bestTime: 'May to October'
    },
    {
      id: 5,
      name: 'Serengeti, Tanzania',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801',
      description: 'Vast plains where you can witness the Great Migration.',
      region: 'africa',
      activities: ['Safari', 'Wildlife', 'Photography', 'Nature'],
      bestTime: 'June to October'
    },
    {
      id: 6,
      name: 'Sydney, Australia',
      image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9',
      description: 'Iconic harbor city with famous landmarks and beautiful beaches.',
      region: 'oceania',
      activities: ['Beaches', 'City Life', 'Culture', 'Hiking'],
      bestTime: 'September to November, March to May'
    },
    {
      id: 7,
      name: 'Amalfi Coast, Italy',
      image: 'https://images.unsplash.com/photo-1533600536142-35a74f532b56',
      description: 'Dramatic coastline with colorful cliff-side villages.',
      region: 'europe',
      activities: ['Beaches', 'Cuisine', 'Driving', 'Boat Tours'],
      bestTime: 'May to October'
    },
    {
      id: 8,
      name: 'New Zealand',
      image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad',
      description: 'Land of stunning landscapes, adventure, and Maori culture.',
      region: 'oceania',
      activities: ['Hiking', 'Adventure Sports', 'Lord of the Rings', 'Nature'],
      bestTime: 'December to February'
    },
  ];

  const travelSuggestions = [
    "What are the best beaches in Thailand?",
    "Create a 5-day itinerary for Paris",
    "What's the best time to visit Japan?",
    "Budget-friendly destinations in Europe",
    "Family-friendly activities in Barcelona",
    "What should I pack for a tropical vacation?"
  ];

  const filteredDestinations = destinations
    .filter(dest => selectedRegion === 'all' || dest.region === selectedRegion)
    .filter(dest => dest.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                   dest.description.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('travelBuddyFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
    // Load theme preference
    const savedTheme = localStorage.getItem('travelBuddyTheme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Save favorites to localStorage when changed
  useEffect(() => {
    localStorage.setItem('travelBuddyFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Apply theme to document body
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-sky-100 to-blue-200';
    localStorage.setItem('travelBuddyTheme', theme);
  }, [theme]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Get AI response using the generate function
      const aiResponse = await generate(input);
      
      // Add assistant's response to messages
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };

  const toggleFavorite = (destId) => {
    if (favorites.includes(destId)) {
      setFavorites(favorites.filter(id => id !== destId));
    } else {
      setFavorites([...favorites, destId]);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Hello! I'm your travel assistant. Ask me about destinations, travel tips, or anything related to your next adventure!"
    }]);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-sky-100 to-blue-200'}`}>
      {/* Navbar */}
      {/* Main Navbar */}
      <nav className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-md sticky top-0 z-10`}>
  <div className="container mx-auto px-4 flex items-center justify-between py-4">
    <div className="flex items-center space-x-2">
      <span className={`font-bold text-xl ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
        <span className="mr-2">✈️</span>
        TravelBuddy
      </span>
    </div>
    
    <div className="flex items-center space-x-2">
      {/* Navigation Links - Always visible */}
      <div className="flex space-x-2">
        <button 
          onClick={() => setActiveTab('home')} 
          className={`px-3 py-1 rounded-md transition-colors text-sm sm:text-base ${activeTab === 'home' 
            ? (theme === 'dark' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-700') 
            : ''}`}
        >
          Home
        </button>
        <button 
          onClick={() => setActiveTab('destinations')} 
          className={`px-3 py-1 rounded-md transition-colors text-sm sm:text-base ${activeTab === 'destinations' 
            ? (theme === 'dark' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-700') 
            : ''}`}
        >
          Dest
        </button>
        <button 
          onClick={() => setActiveTab('favorites')} 
          className={`px-2 py-1 rounded-md transition-colors hidden sm:block ${activeTab === 'favorites' 
            ? (theme === 'dark' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-700') 
            : ''}`}
        >
          Favorites
        </button>
        <button 
          onClick={() => setActiveTab('planner')} 
          className={`px-2 py-1 rounded-md transition-colors hidden md:block ${activeTab === 'planner' 
            ? (theme === 'dark' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-700') 
            : ''}`}
        >
          Trip Planner
        </button>
        <button 
          onClick={() => setActiveTab('about')} 
          className={`px-2 py-1 rounded-md transition-colors hidden md:block ${activeTab === 'about' 
            ? (theme === 'dark' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-700') 
            : ''}`}
        >
          About
        </button>
      </div>
      
      {/* Theme Toggle */}
      <button 
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className={`p-2 rounded-full ml-2 ${theme === 'dark' ? 'bg-gray-700 text-yellow-300' : 'bg-blue-100 text-blue-800'}`}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      
      {/* Menu Button for Smaller Screens */}
      <button 
        className={`p-2 rounded sm:hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-100'}`}
        onClick={() => {
          const menu = document.getElementById('moreOptions');
          menu.classList.toggle('hidden');
        }}
      >
        •••
      </button>
    </div>
  </div>
  
  {/* More Options Menu for Smaller Screens */}
  <div id="moreOptions" className="hidden sm:hidden">
    <div className={`flex flex-col space-y-2 p-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <button 
        onClick={() => {
          setActiveTab('favorites');
          document.getElementById('moreOptions').classList.add('hidden');
        }}
        className={`px-3 py-1 rounded-md ${activeTab === 'favorites' 
          ? (theme === 'dark' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-700') 
          : ''}`}
      >
        Favorites
      </button>
      <button 
        onClick={() => {
          setActiveTab('planner');
          document.getElementById('moreOptions').classList.add('hidden');
        }}
        className={`px-3 py-1 rounded-md ${activeTab === 'planner' 
          ? (theme === 'dark' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-700') 
          : ''}`}
      >
        Trip Planner
      </button>
      <button 
        onClick={() => {
          setActiveTab('about');
          document.getElementById('moreOptions').classList.add('hidden');
        }}
        className={`px-3 py-1 rounded-md ${activeTab === 'about' 
          ? (theme === 'dark' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-700') 
          : ''}`}
      >
        About
      </button>
    </div>
  </div>
</nav>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'home' && (
          <div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <h1 className={`text-4xl md:text-5xl font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'} mb-4`}>
                  Your Next Adventure <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Awaits</span>
                </h1>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
                  Chat with our AI travel assistant to discover places, plan trips, and get inspired for your next journey!
                </p>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => setActiveTab('destinations')} 
                    className={`${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-3 rounded-lg font-medium transition-colors`}
                  >
                    Explore Destinations
                  </button>
                  <button 
                    onClick={() => setActiveTab('planner')} 
                    className={`${theme === 'dark' ? 'bg-purple-700 hover:bg-purple-800' : 'bg-purple-600 hover:bg-purple-700'} text-white px-6 py-3 rounded-lg font-medium transition-colors`}
                  >
                    Plan Your Trip
                  </button>
                </div>
              </div>
              <div className="order-1 md:order-2 rounded-xl overflow-hidden shadow-xl transform transition-transform hover:scale-105">
                <img 
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800" 
                  alt="Travel" 
                  className="w-full h-[400px] object-cover"
                />
              </div>
            </div>

            {/* Featured Destinations */}
            <div className="mt-16">
              <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'} mb-8 text-center`}>
                Featured Destinations
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {destinations.slice(0, 3).map(dest => (
                  <div key={dest.id} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105 group`}>
                    <div className="relative">
                      <img src={dest.image} alt={dest.name} className="w-full h-56 object-cover group-hover:opacity-90 transition-opacity" />
                      <button 
                        onClick={() => toggleFavorite(dest.id)}
                        className="absolute top-3 right-3 bg-white bg-opacity-70 rounded-full p-2 hover:bg-opacity-100 transition-all"
                      >
                        {favorites.includes(dest.id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                    <div className="p-5">
                      <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'} mb-2`}>{dest.name}</h3>
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3`}>{dest.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {dest.activities.slice(0, 3).map((activity, i) => (
                          <span key={i} className={`inline-block text-xs px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                            {activity}
                          </span>
                        ))}
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span className="font-semibold">Best time to visit:</span> {dest.bestTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <button 
                  onClick={() => setActiveTab('destinations')} 
                  className={`${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-800 border-blue-600' : 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200'} px-5 py-2 rounded-lg border transition-colors inline-flex items-center gap-2`}
                >
                  View All Destinations <span>→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'destinations' && (
          <div>
            <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'} mb-6 text-center`}>
              Explore Amazing Destinations
            </h2>
            
            <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex flex-wrap gap-2">
                {regions.map(region => (
                  <button
                    key={region.id}
                    onClick={() => setSelectedRegion(region.id)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      selectedRegion === region.id 
                        ? (theme === 'dark' ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white') 
                        : (theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-blue-100 text-blue-800 hover:bg-blue-200')
                    }`}
                  >
                    {region.name}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search destinations..."
                  className={`pl-10 pr-4 py-2 rounded-lg w-full md:w-64 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 text-white border border-gray-600 focus:border-blue-500' 
                      : 'bg-white text-gray-800 border border-gray-300 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <span className="absolute left-3 top-2.5">🔍</span>
              </div>
            </div>

            {filteredDestinations.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="text-lg">No destinations found matching your criteria.</p>
                <button 
                  onClick={() => {setSelectedRegion('all'); setSearchQuery('');}}
                  className="mt-3 underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDestinations.map(dest => (
                  <div 
                    key={dest.id} 
                    className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1`}
                  >
                    <div className="relative">
                      <img src={dest.image} alt={dest.name} className="w-full h-56 object-cover" />
                      <button 
                        onClick={() => toggleFavorite(dest.id)}
                        className="absolute top-3 right-3 bg-white bg-opacity-70 rounded-full p-2 hover:bg-opacity-100 transition-all"
                      >
                        {favorites.includes(dest.id) ? '❤️' : '🤍'}
                      </button>
                      <div className={`absolute bottom-3 left-3 px-2 py-1 rounded-full text-xs ${theme === 'dark' ? 'bg-gray-900 bg-opacity-70' : 'bg-white bg-opacity-70'}`}>
                        {regions.find(r => r.id === dest.region)?.name}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'} mb-2`}>{dest.name}</h3>
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3`}>{dest.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {dest.activities.map((activity, i) => (
                          <span key={i} className={`inline-block text-xs px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                            {activity}
                          </span>
                        ))}
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span className="font-semibold">Best time to visit:</span> {dest.bestTime}
                      </p>
                      <button 
                        onClick={() => {
                          setInput(`Tell me more about ${dest.name}`);
                          setActiveTab('planner');
                        }}
                        className={`mt-4 w-full py-2 rounded-lg ${
                          theme === 'dark' 
                            ? 'bg-blue-700 hover:bg-blue-800 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } transition-colors`}
                      >
                        Plan a Trip Here
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'} mb-6 text-center`}>
              Your Favorite Destinations
            </h2>
            
            {favorites.length === 0 ? (
              <div className={`text-center py-16 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md`}>
                <div className="text-6xl mb-4">❤️</div>
                <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Start adding destinations to your favorites</p>
                <button 
                  onClick={() => setActiveTab('destinations')} 
                  className={`${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-2 rounded-lg transition-colors`}
                >
                  Explore Destinations
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.filter(dest => favorites.includes(dest.id)).map(dest => (
                  <div 
                    key={dest.id} 
                    className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl overflow-hidden shadow-lg relative`}
                  >
                    <div className="relative">
                      <img src={dest.image} alt={dest.name} className="w-full h-48 object-cover" />
                      <button 
                        onClick={() => toggleFavorite(dest.id)}
                        className="absolute top-3 right-3 bg-white bg-opacity-70 rounded-full p-2 hover:bg-opacity-100 transition-all"
                      >
                        ❤️
                      </button>
                    </div>
                    <div className="p-5">
                      <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'} mb-2`}>{dest.name}</h3>
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3`}>{dest.description}</p>
                      <button 
                        onClick={() => {
                          setInput(`Tell me more about ${dest.name}`);
                          setActiveTab('planner');
                        }}
                        className={`w-full py-2 rounded-lg ${
                          theme === 'dark' 
                            ? 'bg-blue-700 hover:bg-blue-800 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } transition-colors`}
                      >
                        Plan a Trip Here
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'planner' && (
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'} mb-6 text-center`}>
              Plan Your Perfect Trip
            </h2>
            
            {/* Chatbot */}{/* Chatbot */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
              {/* Chat messages container */}
              <div className="h-[500px] overflow-y-auto p-4">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === 'user' 
                          ? (theme === 'dark' ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white') 
                          : (theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800')
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className={`rounded-lg px-4 py-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Suggestions */}
              {showSuggestions && messages.length <= 2 && (
                <div className={`px-4 py-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {travelSuggestions.map((suggestion, index) => (
                      <button 
                        key={index} 
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          theme === 'dark' 
                            ? 'border-gray-600 hover:bg-gray-600 text-gray-300' 
                            : 'border-gray-300 hover:bg-gray-200 text-gray-800'
                        }`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Input area */}
              <div className={`p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex">
                  <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about destinations, travel tips, or itineraries..."
                    className={`flex-grow px-4 py-2 rounded-l-lg ${
                      theme === 'dark' 
                        ? 'bg-gray-800 text-white border-gray-700' 
                        : 'bg-gray-100 text-gray-800 border-gray-300'
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-r-lg ${
                      theme === 'dark' 
                        ? 'bg-blue-700 hover:bg-blue-800 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } transition-colors flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <span>Send</span>
                    )}
                  </button>
                </div>
                
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={clearChat}
                    className={`text-xs px-2 py-1 ${
                      theme === 'dark' 
                        ? 'text-gray-400 hover:text-gray-300' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Clear Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-3xl mx-auto">
            <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'} mb-6 text-center`}>
              About TravelBuddy
            </h2>
            
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'} mb-3`}>Our Mission</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                TravelBuddy was created to help travelers discover amazing destinations, plan unforgettable trips, and get personalized travel advice using the power of AI.
              </p>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                Whether you're a seasoned globetrotter or planning your first adventure, our AI assistant is here to provide inspiration, recommendations, and practical travel tips tailored to your preferences.
              </p>
            </div>
            
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'} mb-3`}>Features</h3>
              <ul className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} space-y-2 mb-4 list-disc pl-5`}>
                <li>Personal AI travel assistant that responds to your questions</li>
                <li>Curated collection of amazing destinations from around the world</li>
                <li>Save your favorite destinations for future reference</li>
                <li>Get customized itineraries and travel plans</li>
                <li>Travel tips and recommendations based on your preferences</li>
                <li>Dark mode for comfortable browsing at night</li>
              </ul>
            </div>
            
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'} mb-3`}>How It Works</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                TravelBuddy uses advanced AI to provide you with personalized travel information. Simply ask questions in the Trip Planner tab, and our assistant will help you with destination information, itineraries, or travel advice.
              </p>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Browse our curated destinations, save your favorites, and get inspired for your next adventure. Whether you're looking for beaches in Thailand or planning a week in Paris, TravelBuddy has you covered.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className={`py-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-600'} mt-12`}>
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 TravelBuddy - Your AI Travel Companion</p>
        </div>
      </footer>
    </div>
  );
}

export default App;