import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Resource,
  Assessment,
  ScheduleEvent,
  ChatMessage,
  ShopItem,
  StudentProfile,
  Notification,
  CONSTELLATION_POINTS,
} from '../types';
import {
  demoResources,
  demoAssessments,
  demoSchedule,
  demoChatMessages,
  shopItems as initialShopItems,
} from '../data/demoData';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface DataContextType {
  // Resources
  resources: Resource[];
  addResource: (resource: Resource) => Promise<void>;
  getResourcesByStudentId: (studentId: string) => Resource[];

  // Assessments
  assessments: Assessment[];
  addAssessment: (assessment: Assessment) => Promise<void>;
  getAssessmentsByStudentId: (studentId: string) => Assessment[];
  updateAssessment: (assessment: Assessment) => Promise<void>;

  // Schedule
  schedule: ScheduleEvent[];
  addScheduleEvent: (event: ScheduleEvent) => Promise<void>;
  updateScheduleEvent: (event: ScheduleEvent) => Promise<void>;
  getScheduleByStudentId: (studentId: string) => ScheduleEvent[];
  getScheduleByTutorId: (tutorId: string) => ScheduleEvent[];

  // Chat
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => Promise<void>;
  getConversation: (userId1: string, userId2: string) => ChatMessage[];
  markAsRead: (messageId: string) => Promise<void>;

  // Shop
  shopItems: ShopItem[];
  purchaseItem: (itemId: string, studentId: string, updateStudent: (s: StudentProfile) => void, student: StudentProfile) => Promise<boolean>;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Notification) => Promise<void>;
  getNotificationsByUserId: (userId: string) => Notification[];
  getUnreadNotificationCount: (userId: string) => number;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;

  // Student Stats
  updateStudentStats: (studentId: string, stats: Partial<StudentProfile['stats']>) => Promise<void>;
  updateStudentProgress: (studentId: string, subject: string, score: number) => Promise<void>;

  // Data loading
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isDemoMode } = useAuth();

  // In live mode, start with empty arrays - data comes from Supabase
  // In demo mode, use demo data for demonstration purposes
  const [resources, setResources] = useState<Resource[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reset data when demo mode changes
  useEffect(() => {
    if (isDemoMode) {
      setResources(demoResources);
      setAssessments(demoAssessments);
      setSchedule(demoSchedule);
      setMessages(demoChatMessages);
      setShopItems(initialShopItems);
    } else {
      setResources([]);
      setAssessments([]);
      setSchedule([]);
      setMessages([]);
      setShopItems([]);
    }
  }, [isDemoMode]);

  // Load data from Supabase when user logs in (live mode only)
  useEffect(() => {
    if (!isDemoMode && user?.role === 'tutor') {
      loadAllData();
    }
  }, [user, isDemoMode]);

  const loadAllData = async () => {
    if (isDemoMode || !user) return;

    setIsLoading(true);
    try {
      await Promise.all([
        loadResources(),
        loadAssessments(),
        loadSchedule(),
        loadMessages(),
        loadShopItems(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const refreshData = async () => {
    await loadAllData();
  };

  // Load resources from Supabase
  const loadResources = async () => {
    if (isDemoMode) return;

    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('tutor_id', user?.id);

    if (error) {
      console.error('Error loading resources:', error);
      return;
    }

    if (data) {
      const mappedResources: Resource[] = data.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        type: r.type,
        subject: r.subject,
        topic: r.year_group,
        studentIds: r.assigned_to || [],
        createdAt: r.created_at,
        tutorId: r.tutor_id,
      }));
      setResources(mappedResources);
    }
  };

  // Load assessments from Supabase
  const loadAssessments = async () => {
    if (isDemoMode) return;

    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('tutor_id', user?.id);

    if (error) {
      console.error('Error loading assessments:', error);
      return;
    }

    if (data) {
      const mappedAssessments: Assessment[] = data.map(a => ({
        id: a.id,
        studentId: a.student_id,
        tutorId: a.tutor_id,
        subject: a.subject,
        title: a.title,
        type: a.type || 'test',
        topic: a.topic || '',
        score: a.score,
        maxScore: a.max_score,
        grade: a.grade,
        classAverage: a.class_average,
        dateTaken: a.date_taken || a.created_at,
        feedback: a.feedback || '',
        createdAt: a.created_at,
        gradedAt: a.graded_at,
      }));
      setAssessments(mappedAssessments);
    }
  };

  // Load schedule from Supabase
  const loadSchedule = async () => {
    if (isDemoMode) return;

    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('tutor_id', user?.id);

    if (error) {
      console.error('Error loading schedule:', error);
      return;
    }

    if (data) {
      const mappedSchedule: ScheduleEvent[] = data.map(l => ({
        id: l.id,
        title: l.topic,
        subject: l.subject,
        date: l.date,
        startTime: l.start_time,
        endTime: l.end_time,
        studentId: l.student_id,
        tutorId: l.tutor_id,
        location: '',
        notes: l.notes || '',
        status: l.status,
      }));
      setSchedule(mappedSchedule);
    }
  };

  // Load messages from Supabase
  const loadMessages = async () => {
    if (isDemoMode) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`);

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    if (data) {
      const mappedMessages: ChatMessage[] = data.map(m => ({
        id: m.id,
        senderId: m.sender_id,
        receiverId: m.recipient_id,
        content: m.content,
        timestamp: m.created_at,
        read: m.read,
      }));
      setMessages(mappedMessages);
    }
  };

  // Load shop items from Supabase
  const loadShopItems = async () => {
    if (isDemoMode) return;

    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .eq('available', true);

    if (error) {
      console.error('Error loading shop items:', error);
      return;
    }

    if (data) {
      const mappedItems: ShopItem[] = data.map(i => ({
        id: i.id,
        name: i.name,
        description: i.description,
        category: i.category,
        cost: i.price,
        image: i.image_url,
        rarity: i.rarity,
        unlocked: false,
      }));
      setShopItems(mappedItems);
    }
  };

  // Resources
  const addResource = async (resource: Resource) => {
    setResources(prev => [...prev, resource]);

    if (!isDemoMode && user) {
      const { error } = await supabase.from('resources').insert({
        id: resource.id,
        tutor_id: user.id,
        title: resource.title,
        description: resource.description,
        type: resource.type,
        url: '',
        subject: resource.subject,
        year_group: resource.topic,
        assigned_to: resource.studentIds,
      });

      if (error) {
        console.error('Error saving resource:', error);
      }
    }
  };

  const getResourcesByStudentId = (studentId: string): Resource[] => {
    return resources.filter(r => r.studentIds.includes(studentId));
  };

  // Calculate constellation points based on assessment score percentage
  const calculateAssessmentPoints = (score: number, maxScore: number): number => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 95) return CONSTELLATION_POINTS.ASSESSMENT_SCORE_95_100;
    if (percentage >= 85) return CONSTELLATION_POINTS.ASSESSMENT_SCORE_85_94;
    if (percentage >= 70) return CONSTELLATION_POINTS.ASSESSMENT_SCORE_70_84;
    return 0; // No points for scores below 70%
  };

  // Award constellation points to a student
  const awardConstellationPoints = async (studentId: string, points: number) => {
    if (points <= 0) return;

    if (!isDemoMode) {
      // Get current points
      const { data } = await supabase
        .from('students')
        .select('total_points')
        .eq('id', studentId)
        .single();

      const currentPoints = data?.total_points || 0;
      const newPoints = currentPoints + points;

      // Update points in Supabase
      const { error } = await supabase
        .from('students')
        .update({ total_points: newPoints })
        .eq('id', studentId);

      if (error) {
        console.error('Error awarding constellation points:', error);
      }
    }
  };

  // Assessments
  const addAssessment = async (assessment: Assessment) => {
    setAssessments(prev => [...prev, assessment]);

    if (!isDemoMode && user) {
      const { error } = await supabase.from('assessments').insert({
        id: assessment.id,
        tutor_id: user.id,
        student_id: assessment.studentId,
        subject: assessment.subject,
        title: assessment.title,
        type: assessment.type || 'test',
        topic: assessment.topic,
        score: assessment.score,
        max_score: assessment.maxScore,
        grade: assessment.grade,
        class_average: assessment.classAverage,
        date_taken: assessment.dateTaken || assessment.createdAt,
        feedback: assessment.feedback,
        created_at: assessment.createdAt,
        graded_at: assessment.gradedAt,
      });

      if (error) {
        console.error('Error saving assessment:', error);
      }

      // Also add to progress history
      await supabase.from('progress_history').insert({
        student_id: assessment.studentId,
        subject: assessment.subject,
        score: Math.round((assessment.score / assessment.maxScore) * 100),
        date: assessment.dateTaken || assessment.createdAt,
      });

      // Award constellation points based on assessment score
      const pointsEarned = calculateAssessmentPoints(assessment.score, assessment.maxScore);
      await awardConstellationPoints(assessment.studentId, pointsEarned);

      // Update student's overall progress based on assessments
      await recalculateStudentProgress(assessment.studentId);
    }
  };

  const getAssessmentsByStudentId = (studentId: string): Assessment[] => {
    return assessments.filter(a => a.studentId === studentId);
  };

  const updateAssessment = async (assessment: Assessment) => {
    setAssessments(prev => prev.map(a => a.id === assessment.id ? assessment : a));

    if (!isDemoMode) {
      const { error } = await supabase
        .from('assessments')
        .update({
          title: assessment.title,
          type: assessment.type,
          topic: assessment.topic,
          score: assessment.score,
          max_score: assessment.maxScore,
          grade: assessment.grade,
          class_average: assessment.classAverage,
          date_taken: assessment.dateTaken,
          feedback: assessment.feedback,
          graded_at: assessment.gradedAt,
        })
        .eq('id', assessment.id);

      if (error) {
        console.error('Error updating assessment:', error);
      }

      await recalculateStudentProgress(assessment.studentId);
    }
  };

  // Recalculate student progress based on their assessments
  const recalculateStudentProgress = async (studentId: string) => {
    if (isDemoMode) return;

    const studentAssessments = assessments.filter(a => a.studentId === studentId);

    if (studentAssessments.length === 0) return;

    // Calculate average score
    const totalScore = studentAssessments.reduce((sum, a) => sum + (a.score / a.maxScore) * 100, 0);
    const averageScore = Math.round(totalScore / studentAssessments.length);

    // Update student record
    const { error } = await supabase
      .from('students')
      .update({
        overall_progress: averageScore,
      })
      .eq('id', studentId);

    if (error) {
      console.error('Error updating student progress:', error);
    }
  };

  // Schedule
  const addScheduleEvent = async (event: ScheduleEvent) => {
    setSchedule(prev => [...prev, event]);

    if (!isDemoMode && user) {
      const { error } = await supabase.from('lessons').insert({
        id: event.id,
        tutor_id: user.id,
        student_id: event.studentId,
        subject: event.subject,
        topic: event.title,
        date: event.date,
        start_time: event.startTime,
        end_time: event.endTime,
        status: event.status || 'scheduled',
        notes: event.notes,
      });

      if (error) {
        console.error('Error saving schedule event:', error);
      }
    }
  };

  const updateScheduleEvent = async (event: ScheduleEvent) => {
    setSchedule(prev => prev.map(e => e.id === event.id ? event : e));

    if (!isDemoMode) {
      const { error } = await supabase
        .from('lessons')
        .update({
          status: event.status,
          notes: event.notes,
          score: event.status === 'completed' ? 100 : null,
        })
        .eq('id', event.id);

      if (error) {
        console.error('Error updating schedule event:', error);
      }

      // If lesson completed, update student stats
      if (event.status === 'completed') {
        await incrementStudentSessions(event.studentId);
      }
    }
  };

  const incrementStudentSessions = async (studentId: string) => {
    if (isDemoMode) return;

    // Get current session count and points
    const { data } = await supabase
      .from('students')
      .select('current_streak, total_points')
      .eq('id', studentId)
      .single();

    const currentStreak = (data?.current_streak || 0) + 1;
    let pointsToAward = CONSTELLATION_POINTS.LESSON_COMPLETED;

    // Check for streak bonuses
    if (currentStreak === 7) {
      pointsToAward += CONSTELLATION_POINTS.STREAK_7_DAYS;
    } else if (currentStreak === 30) {
      pointsToAward += CONSTELLATION_POINTS.STREAK_30_DAYS;
    }

    const newTotalPoints = (data?.total_points || 0) + pointsToAward;

    // Update streak and points together
    await supabase
      .from('students')
      .update({
        current_streak: currentStreak,
        total_points: newTotalPoints
      })
      .eq('id', studentId);
  };

  const getScheduleByStudentId = (studentId: string): ScheduleEvent[] => {
    return schedule.filter(e => e.studentId === studentId);
  };

  const getScheduleByTutorId = (tutorId: string): ScheduleEvent[] => {
    return schedule.filter(e => e.tutorId === tutorId);
  };

  // Chat
  const addMessage = async (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);

    if (!isDemoMode) {
      const { error } = await supabase.from('messages').insert({
        id: message.id,
        sender_id: message.senderId,
        recipient_id: message.receiverId,
        content: message.content,
        read: false,
      });

      if (error) {
        console.error('Error saving message:', error);
      }
    }
  };

  const getConversation = (userId1: string, userId2: string): ChatMessage[] => {
    return messages.filter(m =>
      (m.senderId === userId1 && m.receiverId === userId2) ||
      (m.senderId === userId2 && m.receiverId === userId1)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const markAsRead = async (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, read: true } : m));

    if (!isDemoMode) {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);
    }
  };

  // Shop
  const purchaseItem = async (
    itemId: string,
    studentId: string,
    updateStudent: (s: StudentProfile) => void,
    student: StudentProfile
  ): Promise<boolean> => {
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

    if (!isDemoMode) {
      // Record purchase
      await supabase.from('student_purchases').insert({
        student_id: studentId,
        item_id: itemId,
      });

      // Update student points
      await supabase
        .from('students')
        .update({ total_points: updatedStudent.points })
        .eq('id', studentId);
    }

    return true;
  };

  // Notifications
  const addNotification = async (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    // Notifications are local-only for now
  };

  const getNotificationsByUserId = (userId: string): Notification[] => {
    return notifications.filter(n => n.userId === userId);
  };

  const getUnreadNotificationCount = (userId: string): number => {
    return notifications.filter(n => n.userId === userId && !n.read).length;
  };

  const markNotificationAsRead = async (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Student Stats Updates
  const updateStudentStats = async (studentId: string, stats: Partial<StudentProfile['stats']>) => {
    if (!isDemoMode) {
      const updateData: Record<string, unknown> = {};

      if (stats.overallProgress !== undefined) {
        updateData.overall_progress = stats.overallProgress;
      }
      if (stats.strengths !== undefined) {
        updateData.strengths = stats.strengths;
      }
      if (stats.weaknesses !== undefined) {
        updateData.weaknesses = stats.weaknesses;
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('students')
          .update(updateData)
          .eq('id', studentId);

        if (error) {
          console.error('Error updating student stats:', error);
        }
      }
    }
  };

  const updateStudentProgress = async (studentId: string, subject: string, score: number) => {
    if (!isDemoMode) {
      // Add to progress history
      await supabase.from('progress_history').insert({
        student_id: studentId,
        subject: subject,
        score: score,
        date: new Date().toISOString().split('T')[0],
      });

      // Recalculate overall progress
      await recalculateStudentProgress(studentId);
    }
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
        updateStudentStats,
        updateStudentProgress,
        isLoading,
        refreshData,
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
