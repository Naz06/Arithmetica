import { supabase, isDemoMode } from '../lib/supabase';
import type { Message, Profile } from '../types/database';

export interface MessageWithSender extends Message {
  sender: Profile;
}

export interface Conversation {
  recipientId: string;
  recipientName: string;
  recipientRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

// Demo messages data
const demoMessages: Message[] = [
  {
    id: 'msg-1',
    sender_id: 'student-1',
    recipient_id: 'tutor-1',
    content: 'Hi, I have a question about the homework.',
    read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'msg-2',
    sender_id: 'tutor-1',
    recipient_id: 'student-1',
    content: 'Of course! What do you need help with?',
    read: true,
    created_at: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: 'msg-3',
    sender_id: 'parent-1',
    recipient_id: 'tutor-1',
    content: 'Thank you for the progress report!',
    read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const messageService = {
  // Get all messages for a user
  async getMessagesForUser(userId: string): Promise<MessageWithSender[]> {
    if (isDemoMode) {
      return demoMessages
        .filter(m => m.sender_id === userId || m.recipient_id === userId)
        .map(m => ({
          ...m,
          sender: {
            id: m.sender_id,
            email: `${m.sender_id}@example.com`,
            name: m.sender_id === 'tutor-1' ? 'Sarah Mitchell' :
                  m.sender_id === 'student-1' ? 'Alex Johnson' : 'Parent',
            role: m.sender_id === 'tutor-1' ? 'tutor' :
                  m.sender_id.startsWith('student') ? 'student' : 'parent',
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Profile,
        }));
    }

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data as MessageWithSender[];
  },

  // Get conversation between two users
  async getConversation(userId1: string, userId2: string): Promise<MessageWithSender[]> {
    if (isDemoMode) {
      return demoMessages
        .filter(m =>
          (m.sender_id === userId1 && m.recipient_id === userId2) ||
          (m.sender_id === userId2 && m.recipient_id === userId1)
        )
        .map(m => ({
          ...m,
          sender: {
            id: m.sender_id,
            email: `${m.sender_id}@example.com`,
            name: m.sender_id === 'tutor-1' ? 'Sarah Mitchell' :
                  m.sender_id === 'student-1' ? 'Alex Johnson' : 'Parent',
            role: m.sender_id === 'tutor-1' ? 'tutor' :
                  m.sender_id.startsWith('student') ? 'student' : 'parent',
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Profile,
        }))
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*)
      `)
      .or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching conversation:', error);
      return [];
    }

    return data as MessageWithSender[];
  },

  // Send a message
  async sendMessage(senderId: string, recipientId: string, content: string): Promise<Message | null> {
    if (isDemoMode) {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        sender_id: senderId,
        recipient_id: recipientId,
        content,
        read: false,
        created_at: new Date().toISOString(),
      };
      demoMessages.push(newMessage);
      return newMessage;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    return data;
  },

  // Mark message as read
  async markAsRead(messageId: string): Promise<boolean> {
    if (isDemoMode) {
      const message = demoMessages.find(m => m.id === messageId);
      if (message) message.read = true;
      return true;
    }

    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);

    return !error;
  },

  // Mark all messages from a sender as read
  async markConversationAsRead(recipientId: string, senderId: string): Promise<boolean> {
    if (isDemoMode) {
      demoMessages.forEach(m => {
        if (m.sender_id === senderId && m.recipient_id === recipientId) {
          m.read = true;
        }
      });
      return true;
    }

    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', senderId)
      .eq('recipient_id', recipientId);

    return !error;
  },

  // Get unread message count
  async getUnreadCount(userId: string): Promise<number> {
    if (isDemoMode) {
      return demoMessages.filter(m => m.recipient_id === userId && !m.read).length;
    }

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }

    return count || 0;
  },

  // Subscribe to new messages (real-time)
  subscribeToMessages(userId: string, callback: (message: Message) => void) {
    if (isDemoMode) {
      return { unsubscribe: () => {} };
    }

    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        subscription.unsubscribe();
      },
    };
  },
};
