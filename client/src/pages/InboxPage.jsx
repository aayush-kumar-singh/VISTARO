import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { inboxApi } from '../api/inboxApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  MessageSquare,
  Send,
  Building,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function InboxPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { showSuccess, showError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [error, setError] = useState(null);

  const messagesContainerRef = useRef(null);
  const selectedConvId = searchParams.get('conv') || '';

  // Scroll to top on page mount to prevent sticky navbar clipping
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // 1. Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await inboxApi.getConversations();
      const convList = data.conversations || [];
      setConversations(convList);

      if (selectedConvId) {
        const found = convList.find((c) => c._id === selectedConvId);
        if (found) {
          setActiveConversation(found);
        } else {
          try {
            const single = await inboxApi.getConversation(selectedConvId);
            if (single.conversation) {
              setActiveConversation(single.conversation);
              setConversations((prev) => [single.conversation, ...prev]);
            }
          } catch (e) {
            // Ignore if not found
          }
        }
      } else if (convList.length > 0) {
        setActiveConversation(convList[0]);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to load conversations.';
      setError(errMsg);
      showError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [user, selectedConvId, showError]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 2. Fetch messages when active conversation changes & join room
  useEffect(() => {
    if (!activeConversation?._id) return;

    let isMounted = true;
    async function fetchMessages() {
      try {
        setLoadingMessages(true);
        setSendError('');
        const data = await inboxApi.getConversation(activeConversation._id);
        if (isMounted) {
          setMessages(Array.isArray(data.messages) ? data.messages : []);
          if (data.conversation) {
            setActiveConversation(data.conversation);
          }
        }
      } catch (err) {
        if (isMounted) {
          showError(err.message || 'Failed to load messages.');
        }
      } finally {
        if (isMounted) {
          setLoadingMessages(false);
        }
      }
    }

    fetchMessages();

    // Socket.io room join
    if (socket) {
      socket.emit('join_conversation', activeConversation._id);
    }

    return () => {
      isMounted = false;
    };
  }, [activeConversation?._id, socket]);

  // 3. Listen for incoming socket messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (!msg) return;
      const msgConvId = msg.conversation || msg.conversationId;

      if (activeConversation && msgConvId === activeConversation._id) {
        setMessages((prev) => {
          const exists = prev.some((m) => m && m._id === msg._id);
          return exists ? prev : [...prev, msg];
        });
      }

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c._id === msgConvId
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

  // 4. Scroll messages container to bottom smoothly
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, loadingMessages]);

  const handleSelectConversation = (conv) => {
    setSendError('');
    setActiveConversation(conv);
    if (searchParams.has('conv')) {
      setSearchParams({}, { replace: true });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation?._id || isSending) return;

    const text = newMessage.trim();
    setSendError('');
    setIsSending(true);

    try {
      const data = await inboxApi.sendMessage(activeConversation._id, text);
      const sentDoc = data.messageDoc || data.message;

      if (sentDoc) {
        setMessages((prev) => {
          const exists = prev.some((m) => m && m._id === sentDoc._id);
          return exists ? prev : [...prev, sentDoc];
        });

        // Update conversation in sidebar
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConversation._id
              ? { ...c, lastMessage: sentDoc.body, lastMessageAt: sentDoc.createdAt }
              : c
          )
        );

        setNewMessage('');
        showSuccess('Message delivered.');
      } else {
        throw new Error('Unexpected response format from server.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to send message.';
      setSendError(errMsg);
      showError(errMsg);
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-vistaro-surface border border-vistaro-border rounded-3xl text-center space-y-4 shadow-sm text-vistaro-primary">
        <MessageSquare className="w-10 h-10 text-vistaro-accent mx-auto" />
        <h2 className="text-display-h2 text-vistaro-primary">Messages & Inbox</h2>
        <p className="text-body text-vistaro-muted">Sign in to communicate with hosts and guests.</p>
        <Link
          to="/login"
          className="inline-block bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-colors cursor-pointer"
        >
          Log In
        </Link>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading messages..." />;
  }

  if (error) {
    return (
      <div className="bg-vistaro-surface border border-vistaro-error/30 rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto my-12 shadow-sm text-vistaro-primary">
        <div className="w-12 h-12 rounded-full bg-vistaro-secondary text-vistaro-error flex items-center justify-center mx-auto border border-vistaro-border">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h2 className="text-display-h2 text-xl text-vistaro-primary">Unable to Load Messages</h2>
        <p className="text-body-sm text-vistaro-secondary">{error}</p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={fetchConversations}
            className="inline-flex items-center gap-2 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 px-6 rounded-full transition-colors cursor-pointer shadow-xs"
          >
            Retry Loading
          </button>
          <Link
            to="/"
            className="bg-vistaro-secondary border border-vistaro-border hover:bg-vistaro-main text-vistaro-primary text-cta py-2.5 px-5 rounded-full transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100dvh-200px)] md:h-[calc(100vh-210px)] min-h-[440px] md:min-h-[520px] mb-16 md:mb-0 bg-vistaro-surface rounded-3xl border border-vistaro-border shadow-sm flex overflow-hidden text-vistaro-primary transition-colors duration-200">

      {/* LEFT PANE: Conversations list */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-vistaro-border flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>

        {/* Inbox Header */}
        <div className="p-4 border-b border-vistaro-border flex items-center justify-between">
          <h2 className="text-display-h3 text-lg text-vistaro-primary flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-vistaro-accent" /> Messages
          </h2>
          <span className="text-caption text-vistaro-muted">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-vistaro-border">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-body-sm text-vistaro-muted">
              No conversations yet. Inquire on a stay to message a host!
            </div>
          ) : (
            conversations.map((conv) => {
              const otherUser = conv.participants?.find((p) => (p?._id || p) !== user._id);
              const otherName = typeof otherUser === 'object' ? otherUser?.username : 'Host';
              const isSelected = activeConversation?._id === conv._id;

              return (
                <button
                  key={conv._id}
                  type="button"
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full p-4 text-left flex items-start gap-3 transition-colors cursor-pointer ${isSelected ? 'bg-vistaro-secondary' : 'hover:bg-vistaro-secondary/50'
                    }`}
                >
                  <div className="w-10 h-10 rounded-full bg-vistaro-accent text-white flex items-center justify-center font-semibold text-sm shrink-0 uppercase">
                    {(otherName || 'H').charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-semibold text-body-sm text-vistaro-primary truncate">@{otherName || 'Host'}</h4>
                      {conv.lastMessageAt && (
                        <span className="text-caption text-vistaro-muted">
                          {new Date(conv.lastMessageAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>

                    <p className="text-caption font-semibold text-vistaro-accent truncate mb-1">
                      {conv.listing?.title || 'Stay Inquiry'}
                    </p>

                    <p className="text-body-sm text-vistaro-muted truncate">
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
      <div className={`flex-1 flex flex-col bg-vistaro-main/40 ${!activeConversation ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {!activeConversation ? (
          <div className="text-center p-8">
            <MessageSquare className="w-12 h-12 text-vistaro-muted mx-auto mb-2" />
            <h3 className="text-display-h3 text-base text-vistaro-primary">Select a conversation</h3>
            <p className="text-body-sm text-vistaro-muted mt-1">Choose from your existing chats on the left to start messaging.</p>
          </div>
        ) : (
          <>
            {/* Chat Thread Header */}
            {(() => {
              const otherUser = activeConversation.participants?.find((p) => (p?._id || p) !== user._id);
              const otherName = typeof otherUser === 'object' ? otherUser?.username : 'Host';

              return (
                <div className="p-4 bg-vistaro-surface border-b border-vistaro-border flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveConversation(null)}
                      className="md:hidden p-1 rounded-full hover:bg-vistaro-secondary cursor-pointer"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="w-5 h-5 text-vistaro-primary" />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-vistaro-accent text-white flex items-center justify-center font-semibold text-xs uppercase">
                      {(otherName || 'H').charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-body text-vistaro-primary">@{otherName || 'Host'}</h3>
                      {activeConversation.listing && (
                        <Link
                          to={`/listings/${activeConversation.listing._id || activeConversation.listing}`}
                          className="text-caption text-vistaro-accent font-semibold hover:underline flex items-center gap-1 truncate max-w-xs"
                        >
                          <Building className="w-3 h-3" /> {activeConversation.listing.title || 'View Stay'}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Messages Scroll Area */}
            <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3">
              {loadingMessages ? (
                <LoadingSpinner text="Loading thread..." />
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-body-sm text-vistaro-muted space-y-2">
                  <MessageSquare className="w-8 h-8 text-vistaro-muted mx-auto" />
                  <p>Send your first message below to start chatting with the host!</p>
                </div>
              ) : (
                messages
                  .filter(Boolean)
                  .map((msg) => {
                    const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
                    const isMe = senderId === user._id;

                    return (
                      <div
                        key={msg._id || Math.random()}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`}
                      >
                        <div
                          className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-2.5 text-body-sm shadow-xs ${isMe
                              ? 'bg-vistaro-accent text-white rounded-br-xs'
                              : 'bg-vistaro-surface text-vistaro-primary border border-vistaro-border rounded-bl-xs'
                            }`}
                        >
                          {msg.body}
                        </div>
                        <span className="text-caption text-vistaro-muted mt-1 px-1">
                          {msg.createdAt
                            ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Just now'}
                        </span>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Error Banner if sending fails */}
            {sendError && (
              <div className="mx-4 mb-2 p-3 rounded-2xl bg-vistaro-secondary border border-vistaro-error/30 flex items-center gap-2 text-body-sm text-vistaro-error animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="flex-1 font-medium">{sendError}</span>
                <button
                  type="button"
                  onClick={() => setSendError('')}
                  className="font-semibold text-cta hover:underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Message Input Box */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-vistaro-surface border-t border-vistaro-border flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  if (sendError) setSendError('');
                }}
                disabled={isSending}
                className="flex-1 bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-full px-4 py-2.5 text-body-sm focus:outline-hidden focus:bg-vistaro-surface focus:border-vistaro-accent transition-colors disabled:opacity-50"
                required
              />
              <button
                type="submit"
                disabled={isSending || !newMessage.trim()}
                className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white p-2.5 rounded-full transition-colors disabled:opacity-40 cursor-pointer shadow-xs flex items-center justify-center shrink-0"
                aria-label="Send message"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </>
        )}
      </div>

    </div>
  );
}
