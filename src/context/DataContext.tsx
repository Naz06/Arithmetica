import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Resource,
  Assessment,
  ScheduleEvent,
  ChatMessage,
  ShopItem,
  StudentProfile,
  Notification,
} from '../types';
import {
  demoResources,
  demoAssessments,
  demoSchedule,
  demoChatMessages,
  shopItems as initialShopItems,
} from '../data/demoData';
import { isDemoMode } from '../lib/supabase';

interface DataContextType {
  // Resources
  resources: Resource[];
  addResource: (resource: Resource) => void;
  getResourcesByStudentId: (studentId: string) => Resource[];

  // Assessments
  assessments: Assessment[];
  addAssessment: (assessment: Assessment) => void;
  getAssessmentsByStudentId: (studentId: string) => Assessment[];
  updateAssessment: (assessment: Assessment) => void;

  // Schedule
  schedule: ScheduleEvent[];
  addScheduleEvent: (event: ScheduleEvent) => void;
  updateScheduleEvent: (event: ScheduleEvent) => void;
  getScheduleByStudentId: (studentId: string) => ScheduleEvent[];
  getScheduleByTutorId: (tutorId: string) => ScheduleEvent[];

  // Chat
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  getConversation: (userId1: string, userId2: string) => ChatMessage[];
  markAsRead: (messageId: string) => void;

  // Shop
  shopItems: ShopItem[];
  purchaseItem: (itemId: string, studentId: string, updateStudent: (s: StudentProfile) => void, student: StudentProfile) => boolean;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  getNotificationsByUserId: (userId: string) => Notification[];
  getUnreadNotificationCount: (userId: string) => number;
  markNotificationAsRead: (notificationId: string) => void;
  deleteNotification: (notificationId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // In live mode, start with empty arrays - data comes from Supabase
  // In demo mode, use demo data for demonstration purposes
  const [resources, setResources] = useState<Resource[]>(isDemoMode ? demoResources : []);
  const [assessments, setAssessments] = useState<Assessment[]>(isDemoMode ? demoAssessments : []);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>(isDemoMode ? demoSchedule : []);
  const [messages, setMessages] = useState<ChatMessage[]>(isDemoMode ? demoChatMessages : []);
  const [shopItems, setShopItems] = useState<ShopItem[]>(isDemoMode ? initialShopItems : []);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Resources
  const addResource = (resource: Resource) => {
    setResources(prev => [...prev, resource]);
  };

  const getResourcesByStudentId = (studentId: string): Resource[] => {
    return resources.filter(r => r.studentIds.includes(studentId));
  };

  // Assessments
  const addAssessment = (assessment: Assessment) => {
    setAssessments(prev => [...prev, assessment]);
  };

  const getAssessmentsByStudentId = (studentId: string): Assessment[] => {
    return assessments.filter(a => a.studentId === studentId);
  };

  const updateAssessment = (assessment: Assessment) => {
    setAssessments(prev => prev.map(a => a.id === assessment.id ? assessment : a));
  };

  // Schedule
  const addScheduleEvent = (event: ScheduleEvent) => {
    setSchedule(prev => [...prev, event]);
  };

  const updateScheduleEvent = (event: ScheduleEvent) => {
    setSchedule(prev => prev.map(e => e.id === event.id ? event : e));
  };

  const getScheduleByStudentId = (studentId: string): ScheduleEvent[] => {
    return schedule.filter(e => e.studentId === studentId);
  };

  const getScheduleByTutorId = (tutorId: string): ScheduleEvent[] => {
    return schedule.filter(e => e.tutorId === tutorId);
  };

  // Chat
  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const getConversation = (userId1: string, userId2: string): ChatMessage[] => {
    return messages.filter(m =>
      (m.senderId === userId1 && m.receiverId === userId2) ||
      (m.senderId === userId2 && m.receiverId === userId1)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const markAsRead = (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, read: true } : m));
  };

  // Shop
  const purchaseItem = (
    itemId: string,
    studentId: string,
    updateStudent: (s: StudentProfile) => void,
    student: StudentProfile
  ): boolean => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item || student.points < item.cost) {
      return false;
    }

    const updatedStudent: StudentProfile = {
      ...student,
      points: student.points - item.cost,
      avatar: {
        ...student.avatar,
        unlockedItems: [...student.avatar.unlockedItems, item.id],
      },
    };

    updateStudent(updatedStudent);
    setShopItems(prev => prev.map(i => i.id === itemId ? { ...i, unlocked: true } : i));
    return true;
  };

  // Notifications
  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const getNotificationsByUserId = (userId: string): Notification[] => {
    return notifications.filter(n => n.userId === userId);
  };

  const getUnreadNotificationCount = (userId: string): number => {
    return notifications.filter(n => n.userId === userId && !n.read).length;
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <DataContext.Provider
      value={{
        resources,
        addResource,
        getResourcesByStudentId,
        assessments,
        addAssessment,
        getAssessmentsByStudentId,
        updateAssessment,
        schedule,
        addScheduleEvent,
        updateScheduleEvent,
        getScheduleByStudentId,
        getScheduleByTutorId,
        messages,
        addMessage,
        getConversation,
        markAsRead,
        shopItems,
        purchaseItem,
        notifications,
        addNotification,
        getNotificationsByUserId,
        getUnreadNotificationCount,
        markNotificationAsRead,
        deleteNotification,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
