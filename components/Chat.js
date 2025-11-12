import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';

export default function Chat({ matchId }) {
  const {  session } = useSession();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/matches/${matchId}/chat`);
        const data = await res.json();
        setMessages(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setLoading(false);
      }
    };
    fetchMessages();
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch('/api/matches/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          message: newMessage.trim(),
          senderId: session.user.id
        }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        setNewMessage('');
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 h-96 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">Chat</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 h-96 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold">Chat</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(message => (
          <div key={message._id} className="bg-gray-700/50 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <img 
                src={message.sender.avatar} 
                alt={message.sender.username} 
                className="w-6 h-6 rounded-full mr-2"
              />
              <span className="font-bold text-sm">{message.sender.username}</span>
              <span className="text-xs text-gray-400 ml-2">
                {new Date(message.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm">{message.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-lg text-white focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-r-lg transition-all duration-300"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
