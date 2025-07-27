import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, Paperclip, Smile, MoreVertical } from 'lucide-react';
import { 
  subscribeToChannelMessages, 
  sendMessage, 
  ChatMessage,
  ChatChannel 
} from '../firebase/chat';
import { useNotifications } from '../hooks/useNotifications';

interface ChannelChatProps {
  channel: ChatChannel;
  currentUser: {
    id: string;
    name: string;
    email?: string;
  };
  onClose?: () => void;
}

const ChannelChat: React.FC<ChannelChatProps> = ({ 
  channel, 
  currentUser, 
  onClose 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showSuccess, showError } = useNotifications();

  // Subscribe to messages in real-time
  useEffect(() => {
    if (!channel.id) return;

    setIsLoading(true);
    const unsubscribe = subscribeToChannelMessages(
      channel.id,
      (newMessages) => {
        setMessages(newMessages);
        setIsLoading(false);
        scrollToBottom();
      },
      100 // Load last 100 messages
    );

    return () => unsubscribe();
  }, [channel.id]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      await sendMessage(
        channel.id,
        currentUser.id,
        currentUser.name,
        messageText,
        currentUser.email
      );
      
      showSuccess('Message Sent', 'Your message has been sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Send Failed', 'Failed to send message. Please try again.');
      setNewMessage(messageText); // Restore the message
    } finally {
      setIsSending(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // If less than 1 minute ago
    if (diff < 60000) {
      return 'Just now';
    }
    
    // If less than 1 hour ago
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    
    // If today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    // If this year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    
    // Older
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Check if message is from current user
  const isMyMessage = (message: ChatMessage) => {
    return message.senderId === currentUser.id;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {channel.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{channel.name}</h3>
            <p className="text-sm text-gray-500">
              {channel.memberCount} member{channel.memberCount !== 1 ? 's' : ''} • {channel.type}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <MoreVertical className="w-5 h-5" />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-500">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm">Be the first to start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isMe = isMyMessage(message);
            const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
            
            return (
              <div
                key={message.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${
                  showAvatar ? 'mt-4' : 'mt-1'
                }`}
              >
                <div className={`flex max-w-xs lg:max-w-md ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  {showAvatar && !isMe && (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                      <span className="text-white text-xs font-semibold">
                        {message.senderName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Message Bubble */}
                  <div className={`${showAvatar && !isMe ? '' : 'ml-10'} ${isMe ? 'mr-2' : ''}`}>
                    {/* Sender Name (only for others' messages and when showing avatar) */}
                    {showAvatar && !isMe && (
                      <div className="text-xs text-gray-500 mb-1 ml-1">
                        {message.senderName}
                      </div>
                    )}
                    
                    {/* Message Content */}
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isMe
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      } ${
                        isMe ? 'rounded-br-sm' : 'rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      
                      {/* Timestamp */}
                      <div className={`text-xs mt-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatTimestamp(message.timestamp)}
                        {message.edited && <span className="ml-1">(edited)</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          {/* Attachment Buttons */}
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            title="Attach Image"
          >
            <Image className="w-5 h-5" />
          </button>
          
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            title="Attach File"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          {/* Message Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message #${channel.name}...`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={isSending}
              maxLength={1000}
            />
            
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Add Emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>
          
          {/* Send Button */}
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className={`p-2 rounded-lg transition-colors ${
              newMessage.trim() && !isSending
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title="Send Message"
          >
            {isSending ? (
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        
        {/* Character Count */}
        {newMessage.length > 800 && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            {newMessage.length}/1000
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelChat;
