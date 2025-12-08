// User Types
export type UserRole = 'tutor' | 'student' | 'parent';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  avatar?: string | AvatarConfig;
  createdAt: string;
}

export interface TutorProfile extends User {
  role: 'tutor';
  bio: string;
  qualifications: string[];
  subjects: Subject[];
}

export interface StudentProfile extends User {
  role: 'student';
  yearGroup: YearGroup;
  subjects: Subject[];
  parentId?: string;
  tutorId: string;
  points: number;
  level: number;
  avatar: AvatarConfig;
  stats: StudentStats;
  schedule: ScheduleEvent[];
}

export interface ParentProfile extends User {
  role: 'parent';
  childrenIds: string[];
  tutorId: string;
}

// Academic Types
export type Subject = 'mathematics' | 'economics' | 'physics';
export type YearGroup = 'year5' | 'year6' | 'gcse' | 'alevel';

export interface Topic {
  id: string;
  name: string;
  subject: Subject;
  yearGroup: YearGroup;
  description: string;
}

export interface StudentStats {
  overallProgress: number;
  subjectStats: SubjectStat[];
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  weeklyProgress: WeeklyProgress[];
  totalSessions: number;
  completedAssignments: number;
  averageScore: number;
}

export interface SubjectStat {
  subject: Subject;
  progress: number;
  grade: string;
  topicsCompleted: number;
  totalTopics: number;
  recentScores: number[];
}

export interface WeeklyProgress {
  week: string;
  mathematics: number;
  economics: number;
  physics: number;
  points: number;
}

// Avatar System
export interface AvatarConfig {
  baseCharacter: string;
  outfit: string;
  accessory: string;
  background: string;
  badge: string;
  pet?: string;
  unlockedItems: string[];
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'outfit' | 'accessory' | 'background' | 'badge' | 'pet';
  cost: number;
  image: string;
  unlocked: boolean;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  description?: string;
}

// Constellation Points Configuration
export const CONSTELLATION_POINTS = {
  LESSON_COMPLETED: 25,
  ASSESSMENT_SCORE_70_84: 30,
  ASSESSMENT_SCORE_85_94: 50,
  ASSESSMENT_SCORE_95_100: 100,
  STREAK_7_DAYS: 50,
  STREAK_30_DAYS: 200,
} as const;

// Resource Levels and Subtypes
export type ResourceLevel = 'year5-6' | 'gcse' | 'alevel';
export type ResourceSubtype = 'workbook' | 'revision-note' | 'end-of-unit-test' | 'exam';

// Resources & Assessments
export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'worksheet' | 'quiz';
  subject: Subject;
  topic: string;
  fileUrl?: string;
  createdAt: string;
  tutorId: string;
  studentIds: string[];
  level?: ResourceLevel;
  subtype?: ResourceSubtype;
}

export interface Assessment {
  id: string;
  title: string;
  subject: Subject;
  topic: string;
  studentId: string;
  tutorId: string;
  score: number;
  maxScore: number;
  feedback: string;
  createdAt: string;
  gradedAt?: string;
}

// Calendar & Schedule
export interface ScheduleEvent {
  id: string;
  title: string;
  subject: Subject;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  studentId: string;
  tutorId: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

// Chat System
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage: ChatMessage;
  unreadCount: number;
}

// Notifications
export type QuickNotificationType = 'update' | 'todo' | 'specifics' | 'homework-help';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  createdAt: string;
  link?: string;
  fromId?: string;
  fromName?: string;
  fromRole?: 'student' | 'parent';
  notificationType?: QuickNotificationType | 'feedback-request';
}
