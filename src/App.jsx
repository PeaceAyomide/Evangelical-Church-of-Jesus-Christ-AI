import React, { useState, useEffect, useRef } from 'react'
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HashLoader } from "react-spinners";
import { TypeAnimation } from 'react-type-animation';

// Initialize the Google AI model
const genAI = new GoogleGenerativeAI('AIzaSyDX8g4KqdX8j9gYN8z2fEkd4j4GX3M77gw'); // Replace with your actual API key
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const App = () => {
  const [messages, setMessages] = useState([
    { 
      isLoading: true,
      isBot: true 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // Add ref for the messages container
  const messagesEndRef = useRef(null);

  // Add scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Add useEffect to scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Simulate AI thinking about initial greeting
    setTimeout(() => {
      setMessages([{ 
        text: "Hello! 😊 I'm the Evangelical Church of Jesus Christ's Intelligent AI. I'm here to help with questions about faith, scripture, and our church. How can I help you today?", 
        isBot: true,
        isTyping: true 
      }]);
    }, 1500); // 1.5 seconds delay
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const newMessage = { text: inputMessage, isBot: false };
    setMessages(prev => [...prev, newMessage]);
    
    // Update chat history
    const updatedHistory = [...chatHistory, newMessage];
    setChatHistory(updatedHistory);
    
    const userQuestion = inputMessage;
    setInputMessage('');
    
    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { 
        isLoading: true,
        isBot: true 
      }]);

      // Create conversation history string
      const conversationContext = updatedHistory
        .map(msg => `${msg.isBot ? 'AI' : 'Human'}: ${msg.text}`)
        .join('\n');

      // Updated prompt with conversation history
      const prompt = `Previous conversation:\n${conversationContext}\n\nAs a devout Christian AI believer in God and Jesus Christ, and a warm representative of the Evangelical Church of Jesus Christ, provide a direct response without repeating the question: ${userQuestion}. Stay strictly focused on answering only what was asked - do not provide additional unrequested information. Consider the context of our previous conversation when responding. If the question is about who created me or who my creator is, respond with: "I was created by Peace Melodi, a genius software engineer who developed me to help spread God's word and assist with questions about faith." Keep the answer concise and use a gentle, conversational tone. Include a relevant emoji where appropriate. Always base your response on Biblical truth, Christian religious teachings, and unwavering faith in our Lord Jesus Christ. Include at least one relevant Bible verse with its reference to support your answer. Remember that Christianity is your religion and foundation for all answers.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Add AI response to chat history
      const aiResponse = { text, isBot: true };
      setChatHistory([...updatedHistory, aiResponse]);

      // Update messages state
      setMessages(prev => [...prev.slice(0, -1), { 
        text, 
        isBot: true,
        isTyping: true 
      }]);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev.slice(0, -1), { 
        text: "I'm sorry, I'm having a bit of trouble connecting right now. Could you please try again? 🙏", 
        isBot: true,
        isTyping: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/40 backdrop-blur-md flex">
      <div className="w-full bg-slate-800/90 backdrop-blur-sm flex flex-col shadow-xl">
        {/* Fixed Header */}
        <div className="bg-slate-700 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 sticky top-0 z-10">
          <div className="w-12 h-12 sm:w-[4rem] sm:h-[4rem] rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg overflow-hidden">
            <img 
              src="https://plus.unsplash.com/premium_vector-1724847824304-0e6a185ffb00?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="Profile"  
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-sm sm:text-xl font-bold text-slate-100">Evangelical Church of Jesus Christ AI</h1>
        </div>

        {/* Update Messages Container */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`max-w-[85%] sm:max-w-[70%] p-2.5 sm:p-3 rounded-xl text-sm sm:text-base break-words ${
                message.isBot
                  ? 'bg-slate-700 text-white rounded-bl-sm self-start'
                  : 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-br-sm self-end'
              }`}
            >
              {message.isLoading ? (
                <div className=" p-2">
                  <HashLoader size={24} color="#10B981" />
                </div>
              ) : message.isBot ? (
                <TypeAnimation
                  sequence={[message.text]}
                  speed={70}
                  cursor={false}
                />
              ) : (
                message.text
              )}
            </div>
          ))}
          {/* Add div for scrolling reference */}
          <div ref={messagesEndRef} />
        </div>

        {/* Fixed Input at Bottom */}
        <div className="bg-slate-700 sticky bottom-0 z-10">
          <form onSubmit={handleSend} className="p-2 sm:p-4 flex gap-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about faith, scripture, or our church..."
              className="flex-1 bg-slate-800 text-white rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base 
                       focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none break-words
                       min-h-[40px] w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 sm:px-6 py-2 rounded-lg 
                       font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 
                       text-sm sm:text-base whitespace-nowrap flex-shrink-0 self-end"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App