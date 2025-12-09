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
  username?: string; // Public display name for leaderboard (not login)
  // Command Center - Space Shop System
  inventory?: string[]; // IDs of owned items
  equippedItems?: EquippedItems; // Currently equipped items
  activeBoosters?: ActiveBooster[]; // Currently active boosters
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
  attendanceRate?: number;
  streakDays?: number;
  // Penalty tracking
  penaltyHistory?: PenaltyRecord[];
  currentStreak?: number;
  longestStreak?: number;
  lastActiveDate?: string;
  lastActivityDate?: string; // For streak detection
  missedSessionsCount?: number;
  lateHomeworkCount?: number;
  lowEngagementWeeks?: number;
  // Bonus tracking
  bonusHistory?: BonusRecord[];
  homeworkStreak?: number; // Consecutive on-time homework submissions
}

// Command Center - Equipped Items
export interface EquippedItems {
  title: string | null;       // Leaderboard title
  frame: string | null;       // Profile frame
  avatar: string;             // Character avatar
  spaceship: string;          // Stellar Journey ship
  celebration: string;        // Achievement animation
}

// Command Center - Active Boosters
export interface ActiveBooster {
  id: string;
  itemId: string;             // Reference to the booster item
  activatedAt: string;        // ISO timestamp
  expiresAt?: string;         // ISO timestamp (for duration-based boosters)
  effect: string;             // Effect description
  used?: boolean;             // For single-use boosters
}

// Bonus System Types
export type BonusType =
  | 'streak-milestone'
  | 'clean-week'
  | 'clean-month'
  | 'perfect-session'
  | 'homework-streak'
  | 'improvement-bonus'
  | 'attendance-bonus';

export interface BonusRecord {
  id: string;
  type: BonusType;
  pointsAwarded: number;
  reason: string;
  awardedAt: string;
  awardedBy: 'system' | 'tutor';
}

// Penalty System Types
export type PenaltyType =
  | 'streak-break'
  | 'missed-session'
  | 'late-homework'
  | 'no-homework'
  | 'low-engagement'
  | 'constellation-decay';

export interface PenaltyRecord {
  id: string;
  type: PenaltyType;
  pointsDeducted: number;
  reason: string;
  appliedAt: string;
  appliedBy: 'system' | 'tutor';
  waived?: boolean;
  waivedBy?: string;
  waivedAt?: string;
  waivedReason?: string;
}

export interface PenaltyConfig {
  streakBreak: {
    minPoints: number;
    percentage: number;
  };
  missedSession: {
    firstOffense: { percentage: number; minPoints: number; maxPoints: number };
    repeat: { percentage: number; minPoints: number; maxPoints: number };
  };
  lateHomework: {
    firstOffense: { percentage: number; minPoints: number; maxPoints: number };
    secondOffense: { percentage: number; minPoints: number; maxPoints: number };
    repeat: { percentage: number; minPoints: number; maxPoints: number };
  };
  noHomework: {
    firstOffense: { percentage: number; minPoints: number; maxPoints: number };
    repeat: { percentage: number; minPoints: number; maxPoints: number };
  };
  lowEngagement: {
    warningWeeks: number; // Number of warning weeks before penalty
    firstOffense: { percentage: number; minPoints: number; maxPoints: number };
    repeat: { percentage: number; minPoints: number; maxPoints: number };
  };
}

// Default penalty configuration
export const DEFAULT_PENALTY_CONFIG: PenaltyConfig = {
  streakBreak: {
    minPoints: 10,
    percentage: 3, // 3-5% of current points
  },
  missedSession: {
    firstOffense: { percentage: 5, minPoints: 15, maxPoints: 50 },
    repeat: { percentage: 10, minPoints: 25, maxPoints: 75 },
  },
  lateHomework: {
    firstOffense: { percentage: 5, minPoints: 25, maxPoints: 50 },
    secondOffense: { percentage: 8, minPoints: 35, maxPoints: 75 },
    repeat: { percentage: 10, minPoints: 50, maxPoints: 100 },
  },
  noHomework: {
    firstOffense: { percentage: 8, minPoints: 35, maxPoints: 75 },
    repeat: { percentage: 10, minPoints: 50, maxPoints: 100 },
  },
  lowEngagement: {
    warningWeeks: 1,
    firstOffense: { percentage: 5, minPoints: 20, maxPoints: 50 },
    repeat: { percentage: 10, minPoints: 40, maxPoints: 100 },
  },
};

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
  // Lesson Plan (for upcoming sessions)
  lessonPlan?: {
    objectives: string[];      // What will be covered
    topics: string[];          // Topics from skill tree
    resources?: string[];      // Resources to bring/use
    homework?: string;         // Pre-session homework
  };
  // Session Notes (for completed sessions)
  sessionNotes?: {
    summary: string;           // What was covered
    topicsCovered: string[];   // Topics actually covered
    studentPerformance?: 'excellent' | 'good' | 'needs-improvement';
    tutorNotes?: string;       // Private tutor observations
    nextSteps?: string;        // Recommendations for next session
    homeworkAssigned?: string; // Post-session homework
  };
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
