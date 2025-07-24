import React, { useState, useEffect, useRef } from 'react';
import { Send, AlertTriangle, Reply, Trash2 } from 'lucide-react';
import { ClubMessage } from '../../types/bookclub';
import { BookClubService } from '../../services/bookClubService';
import { useUserStore } from '../../store/userStore';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface BookClubChatProps {
  clubId: string;
}

const BookClubChat: React.FC<BookClubChatProps> = ({ clubId }) => {
  const [messages, setMessages] = useState<ClubMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState<ClubMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUserStore();

  useEffect(() => {
    loadMessages();
  }, [clubId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const messagesData = await BookClubService.getClubMessages(clubId);
      setMessages(messagesData.reverse()); // Reverse to show oldest first
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const message = await BookClubService.sendMessage(
        clubId,
        newMessage,
        false, // TODO: Add NSFW detection
        replyTo?.id
      );
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await BookClubService.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="h-[600px] flex flex-col">
      {/* Messages */}
      <div className="flex-grow overflow-y-auto space-y-4 mb-4 p-4 bg-neutral-50 rounded-lg">
        {messages.length === 0 ? (
          <div className="text-center text-neutral-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-3">
              <img
                src={message.user?.avatar_url || '/default-avatar.png'}
                alt={message.user?.display_name || 'User'}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
                    {message.user?.display_name || 'Anonymous'}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {formatTime(message.created_at)}
                  </span>
                  {message.is_nsfw && (
                    <span className="text-xs bg-error-100 text-error-600 px-2 py-0.5 rounded-full flex items-center">
                      <AlertTriangle size={12} className="mr-1" />
                      NSFW
                    </span>
                  )}
                </div>

                {message.reply_to_message && (
                  <div className="mt-1 p-2 bg-neutral-100 rounded border-l-2 border-primary-500">
                    <p className="text-xs text-neutral-600">
                      Replying to {message.reply_to_message.user?.display_name}
                    </p>
                    <p className="text-sm text-neutral-700 truncate">
                      {message.reply_to_message.content}
                    </p>
                  </div>
                )}

                <p className="mt-1 text-neutral-700">{message.content}</p>

                <div className="mt-2 flex items-center space-x-2">
                  <button
                    onClick={() => setReplyTo(message)}
                    className="text-xs text-neutral-500 hover:text-primary-500 flex items-center"
                  >
                    <Reply size={12} className="mr-1" />
                    Reply
                  </button>
                  {user?.id === message.user_id && (
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="text-xs text-neutral-500 hover:text-error-500 flex items-center"
                    >
                      <Trash2 size={12} className="mr-1" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      {replyTo && (
        <div className="mb-2 p-2 bg-primary-50 rounded border-l-2 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-primary-600">
                Replying to {replyTo.user?.display_name}
              </p>
              <p className="text-sm text-neutral-700 truncate">
                {replyTo.content}
              </p>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="text-neutral-500 hover:text-neutral-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={replyTo ? `Reply to ${replyTo.user?.display_name}...` : "Type your message..."}
          className="flex-grow"
          disabled={sending}
        />
        <Button 
          type="submit" 
          disabled={!newMessage.trim() || sending}
          className="flex items-center"
        >
          <Send size={18} className="mr-2" />
          {sending ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </div>
  );
};

export default BookClubChat;

