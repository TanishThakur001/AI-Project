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
  const messagesEndRef = useRef(null);

  const destinations = [
    {
      id: 1,
      name: 'Bali, Indonesia',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
      description: 'Tropical paradise with beautiful beaches and vibrant culture.'
    },
    {
      id: 2,
      name: 'Santorini, Greece',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff',
      description: 'Stunning white-washed buildings overlooking the Aegean Sea.'
    },
    {
      id: 3,
      name: 'Kyoto, Japan',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
      description: 'Ancient temples, traditional gardens, and cultural heritage.'
    },
    {
      id: 4,
      name: 'Machu Picchu, Peru',
      image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377',
      description: 'Iconic Incan citadel set amidst breathtaking mountain scenery.'
    },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-blue-200">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl text-blue-700">TravelBuddy</span>
          </div>
          <div className="space-x-6 hidden md:flex">
            <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-blue-700 font-semibold' : 'text-gray-600'}>Home</button>
            <button onClick={() => setActiveTab('destinations')} className={activeTab === 'destinations' ? 'text-blue-700 font-semibold' : 'text-gray-600'}>Destinations</button>
            <button onClick={() => setActiveTab('about')} className={activeTab === 'about' ? 'text-blue-700 font-semibold' : 'text-gray-600'}>About</button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'home' && (
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">Your Next Adventure Awaits</h1>
              <p className="text-lg text-gray-700 mb-6">Chat with our AI travel assistant to discover places, plan trips, and get inspired for your next journey!</p>
              <button onClick={() => setActiveTab('destinations')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">Explore Destinations</button>
            </div>
            <div className="rounded-xl overflow-hidden shadow-xl">
              <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800" alt="Travel" className="w-full h-[400px] object-cover" />
            </div>
          </div>
        )}
        {activeTab === 'destinations' && (
          <div>
            <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">Popular Destinations</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {destinations.map(dest => (
                <div key={dest.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <img src={dest.image} alt={dest.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">{dest.name}</h3>
                    <p className="text-gray-600">{dest.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'about' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">About TravelBuddy</h2>
            <p className="text-lg text-gray-700 mb-4">TravelBuddy is your AI-powered travel companion, designed to help you discover amazing destinations and plan your perfect trip. Our chatbot uses Gemini AI to answer your travel questions in real-time.</p>
          </div>
        )}

        {/* Chatbot Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">Ask Our Travel Assistant</h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="h-[400px] overflow-y-auto p-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>{msg.content}</div>
                </div>
              ))}
              {isLoading && (
                <div className="mb-4">
                  <div className="inline-block p-3 rounded-lg max-w-[80%] bg-gray-100 text-gray-800 rounded-bl-none">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t p-4 flex">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about destinations, travel tips, or plan your trip..."
                className="flex-1 bg-gray-100 rounded-l-lg px-4 py-2 focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg transition-colors disabled:bg-gray-400"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-blue-900 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 TravelBuddy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;