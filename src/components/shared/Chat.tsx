import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Send, Search } from 'lucide-react';

interface ChatProps {
  recipientId: string;
  recipientName: string;
}

export const Chat: React.FC<ChatProps> = ({ recipientId, recipientName }) => {
  const { user } = useAuth();
  const { getConversation, addMessage } = useData();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = user ? getConversation(user.id, recipientId) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      receiverId: recipientId,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    addMessage(message);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: ChatMessage[] }[] = [];
  messages.forEach(msg => {
    const date = formatDate(msg.timestamp);
    const group = groupedMessages.find(g => g.date === date);
    if (group) {
      group.messages.push(msg);
    } else {
      groupedMessages.push({ date, messages: [msg] });
    }
  });

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <Avatar name={recipientName} size="md" />
          <div>
            <CardTitle>{recipientName}</CardTitle>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {groupedMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-neutral-500">
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            groupedMessages.map(group => (
              <div key={group.date}>
                <div className="flex items-center justify-center my-4">
                  <span className="text-xs text-neutral-500 bg-neutral-800 px-3 py-1 rounded-full">
                    {group.date}
                  </span>
                </div>
                {group.messages.map(msg => {
                  const isOwn = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isOwn
                            ? 'bg-primary-500 text-white rounded-br-none'
                            : 'bg-neutral-800 text-neutral-100 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-primary-200' : 'text-neutral-500'}`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-neutral-800">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={!newMessage.trim()}
              icon={<Send className="w-4 h-4" />}
            >
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ChatListProps {
  contacts: { id: string; name: string; role: string; lastMessage?: string }[];
  onSelectContact: (id: string) => void;
  selectedContactId?: string;
}

export const ChatList: React.FC<ChatListProps> = ({
  contacts,
  onSelectContact,
  selectedContactId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b border-neutral-800 pb-4">
        <CardTitle>Messages</CardTitle>
        <div className="mt-3">
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        {filteredContacts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-neutral-500">
            <p>No contacts found</p>
          </div>
        ) : (
          <div>
            {filteredContacts.map(contact => (
              <div
                key={contact.id}
                onClick={() => onSelectContact(contact.id)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-neutral-800 ${
                  selectedContactId === contact.id
                    ? 'bg-primary-500/10'
                    : 'hover:bg-neutral-800/50'
                }`}
              >
                <Avatar name={contact.name} size="md" showBadge />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-100">{contact.name}</p>
                  <p className="text-xs text-neutral-500 capitalize">{contact.role}</p>
                  {contact.lastMessage && (
                    <p className="text-xs text-neutral-400 truncate mt-1">
                      {contact.lastMessage}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
