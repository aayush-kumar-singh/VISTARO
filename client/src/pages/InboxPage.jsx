import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { inboxApi } from '../api/inboxApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  MessageSquare,
  Send,
  User,
  Building,
  ArrowLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';

export default function InboxPage() {
  const { user, setUnreadCount } = useAuth();
  const { socket } = useSocket();
  const { showError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);
  const selectedConvId = searchParams.get('conv') || '';

  // 1. Fetch all conversations
  useEffect(() => {
    async function fetchConversations() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await inboxApi.getConversations();
        setConversations(data.conversations || []);

        if (selectedConvId) {
          const found = data.conversations.find((c) => c._id === selectedConvId);
          if (found) setActiveConversation(found);
        } else if (data.conversations.length > 0) {
          setActiveConversation(data.conversations[0]);
          setSearchParams({ conv: data.conversations[0]._id });
        }
      } catch (err) {
        showError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, [user]);

  // 2. Fetch messages when active conversation changes & join room
  useEffect(() => {
    if (!activeConversation) return;

    async function fetchMessages() {
      try {
        setLoadingMessages(true);
        const data = await inboxApi.getConversation(activeConversation._id);
        setMessages(data.messages || []);
        setActiveConversation(data.conversation);
      } catch (err) {
        showError(err.message);
      } finally {
        setLoadingMessages(false);
      }
    }

    fetchMessages();

    // Socket.io room join
    if (socket) {
      socket.emit('join_conversation', activeConversation._id);
    }
  }, [activeConversation?._id, socket]);

  // 3. Listen for incoming socket messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (activeConversation && msg.conversation === activeConversation._id) {
        setMessages((prev) => [...prev, msg]);
      }

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c._id === msg.conversation
            ? { ...c, lastMessage: msg.body, lastMessageAt: msg.createdAt }
            : c
        )
      );
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, activeConversation]);

  // 4. Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setSearchParams({ conv: conv._id });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const text = newMessage.trim();
    setNewMessage('');

    try {
      setIsSending(true);
      const data = await inboxApi.sendMessage(activeConversation._id, text);
      setMessages((prev) => [...prev, data.messageDoc]);
    } catch (err) {
      showError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-zinc-200 rounded-3xl text-center space-y-4 shadow-sm">
        <MessageSquare className="w-10 h-10 text-[#dc3545] mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900">Messages & Inbox</h2>
        <p className="text-sm text-zinc-500">Sign in to communicate with hosts and guests.</p>
        <Link
          to="/login"
          className="inline-block bg-[#dc3545] hover:bg-[#b02a37] text-white text-sm font-bold py-3 px-6 rounded-full transition-colors"
        >
          Log In
        </Link>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading messages..." />;
  }

  return (
    <div className="w-full h-[calc(100vh-210px)] min-h-[520px] bg-white rounded-3xl border border-zinc-200 shadow-sm flex overflow-hidden">
      
      {/* LEFT PANE: Conversations list */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-zinc-200 flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Inbox Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <h2 className="font-extrabold text-lg text-zinc-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#dc3545]" /> Messages
          </h2>
          <span className="text-xs font-semibold text-zinc-400">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400">
              No conversations yet. Inquire on a stay to message a host!
            </div>
          ) : (
            conversations.map((conv) => {
              const otherUser = conv.participants?.find((p) => (p._id || p) !== user._id);
              const otherName = typeof otherUser === 'object' ? otherUser?.username : 'Host';
              const isSelected = activeConversation?._id === conv._id;

              return (
                <button
                  key={conv._id}
                  type="button"
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full p-4 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                    isSelected ? 'bg-zinc-100/80' : 'hover:bg-zinc-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#222222] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {otherName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900 truncate">{otherName}</h4>
                      {conv.lastMessageAt && (
                        <span className="text-[10px] text-zinc-400">
                          {new Date(conv.lastMessageAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] font-semibold text-[#dc3545] truncate mb-1">
                      {conv.listing?.title || 'Stay Inquiry'}
                    </p>

                    <p className="text-xs text-zinc-500 truncate">
                      {typeof conv.lastMessage === 'object' ? conv.lastMessage?.body : (conv.lastMessage || 'Started conversation')}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

      </div>

      {/* RIGHT PANE: Chat Messages Thread */}
      <div className={`flex-1 flex flex-col bg-zinc-50/40 ${!activeConversation ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {!activeConversation ? (
          <div className="text-center p-8">
            <MessageSquare className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
            <h3 className="font-bold text-base text-zinc-700">Select a conversation</h3>
            <p className="text-xs text-zinc-400 mt-1">Choose from your existing chats on the left to start messaging.</p>
          </div>
        ) : (
          <>
            {/* Chat Thread Header */}
            {(() => {
              const otherUser = activeConversation.participants?.find((p) => (p._id || p) !== user._id);
              const otherName = typeof otherUser === 'object' ? otherUser?.username : 'Host';

              return (
                <div className="p-4 bg-white border-b border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveConversation(null)}
                      className="md:hidden p-1 rounded-full hover:bg-zinc-100"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="w-5 h-5 text-zinc-700" />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-[#222222] text-white flex items-center justify-center font-bold text-xs">
                      {otherName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900">@{otherName}</h3>
                      {activeConversation.listing && (
                        <Link
                          to={`/listings/${activeConversation.listing._id}`}
                          className="text-[11px] text-[#dc3545] font-semibold hover:underline flex items-center gap-1 truncate max-w-xs"
                        >
                          <Building className="w-3 h-3" /> {activeConversation.listing.title}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {loadingMessages ? (
                <LoadingSpinner text="Loading thread..." />
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-zinc-400">
                  Send your first message below to say hello!
                </div>
              ) : (
                messages.map((msg) => {
                  const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
                  const isMe = senderId === user._id;

                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-xs ${
                          isMe
                            ? 'bg-[#222222] text-white rounded-br-xs'
                            : 'bg-white text-zinc-800 border border-zinc-200 rounded-bl-xs'
                        }`}
                      >
                        {msg.body}
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-white border-t border-zinc-200 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-zinc-100 border border-transparent rounded-full px-4 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:bg-white focus:border-[#dc3545] transition-colors"
                required
              />
              <button
                type="submit"
                disabled={isSending || !newMessage.trim()}
                className="bg-[#dc3545] hover:bg-[#b02a37] text-white p-2.5 rounded-full transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>

    </div>
  );
}
