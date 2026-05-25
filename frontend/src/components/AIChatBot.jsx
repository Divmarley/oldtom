/** @format */

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm the Old Toms AI assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let botResponse = "";
      const query = input.toLowerCase();

      if (query.includes('alumni')) {
        botResponse = "You can explore our alumni directory in the 'Alumni' section. We have graduates from various fields like Tech, Law, and Medicine!";
      } else if (query.includes('event')) {
        botResponse = "Check out our 'Events' page to see upcoming reunions, charity drives, and networking sessions.";
      } else if (query.includes('join')) {
        botResponse = "We'd love to have you! Click the 'Join' button in the navbar to create your profile.";
      } else if (query.includes('blog')) {
        botResponse = "Our 'Magazine' section features stories and updates from the Class of 2016. Happy reading!";
      } else {
        botResponse = "That's interesting! I'm still learning, but you can always contact our support team for more specific information.";
      }

      const botMessage = { id: Date.now() + 1, text: botResponse, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {/* Chat Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group relative"
        >
          <div className="absolute -top-2 -right-1 bg-secondary text-primary text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
            AI
          </div>
          <MessageSquare className="h-7 w-7" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-[350px] md:w-[400px] h-[500px] rounded-[2.5rem] shadow-2xl flex flex-col border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-10">
          {/* Header */}
          <div className="bg-primary p-6 text-white flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-full bg-secondary opacity-10 skew-x-12 translate-x-10"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="bg-secondary p-2 rounded-xl">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-widest text-xs">Old Tom Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold text-blue-200">Always Online</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all relative z-10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-secondary text-primary'}`}>
                    {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[85%]">
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 bg-secondary text-primary shadow-sm">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 flex gap-1">
                    <div className="h-1.5 w-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                    <div className="h-1.5 w-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="h-1.5 w-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-6 bg-white border-t border-gray-50 flex gap-3">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-secondary outline-none transition-all"
            />
            <button 
              type="submit"
              className="bg-primary text-white p-3 rounded-2xl hover:bg-blue-900 transition-all shadow-lg active:scale-95"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatBot;
