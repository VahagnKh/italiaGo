import React, { useState, useEffect } from 'react';
import { Mail, MoreVertical, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const InboxPage: React.FC = () => {
  const { user, fetchWithAuth, token } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');

  const fetchMessages = () => {
    if (!token) return;
    fetchWithAuth('/api/messages')
      .then(res => res.json())
      .then(data => setMessages(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    fetchMessages();
  }, [token]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    fetchWithAuth('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId: 1, content }) // Simplified: send to admin/mentor 1
    })
    .then(() => {
      setContent('');
      fetchMessages();
    });
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm my-10">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Inbox</h2>
        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-4 ${m.sender_id === user?.uid ? 'flex-row-reverse' : ''}`}>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
              <img src={m.sender_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.sender_name}`} alt={m.sender_name} />
            </div>
            <div className={`max-w-[70%] p-4 rounded-2xl text-sm ${
              m.sender_id === user?.uid ? 'bg-[#7C3AED] text-white rounded-tr-none' : 'bg-gray-50 text-gray-900 rounded-tl-none'
            }`}>
              <p>{m.content}</p>
              <p className={`text-[10px] mt-2 opacity-60 ${m.sender_id === user?.uid ? 'text-white' : 'text-gray-400'}`}>
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <Mail size={48} className="opacity-10" />
            <p className="italic">No messages yet. Start a conversation!</p>
          </div>
        )}
      </div>
      <form onSubmit={handleSend} className="p-6 border-t border-gray-50 flex gap-4">
        <input
          type="text"
          placeholder="Type your message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#7C3AED]/20 text-sm"
        />
        <button type="submit" className="w-14 h-14 bg-[#7C3AED] text-white rounded-2xl flex items-center justify-center hover:bg-[#6D28D9] transition-all shadow-lg shadow-[#7C3AED]/20">
          <Send size={24} />
        </button>
      </form>
    </div>
  );
};

export default InboxPage;
