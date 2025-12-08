import {
  PenaltyType,
  PenaltyRecord,
  PenaltyConfig,
  DEFAULT_PENALTY_CONFIG,
  StudentProfile,
} from '../types';

/**
 * Calculate penalty points based on offense type and count
 */
export function calculatePenalty(
  currentPoints: number,
  penaltyType: PenaltyType,
  offenseCount: number,
  config: PenaltyConfig = DEFAULT_PENALTY_CONFIG
): number {
  let percentage = 0;
  let minPoints = 0;
  let maxPoints = 0;

  switch (penaltyType) {
    case 'streak-break':
      percentage = config.streakBreak.percentage + Math.min(offenseCount, 2); // 3-5%
      minPoints = config.streakBreak.minPoints;
      maxPoints = Math.round(currentPoints * 0.05); // Max 5%
      break;

    case 'missed-session':
      if (offenseCount <= 1) {
        ({ percentage, minPoints, maxPoints } = config.missedSession.firstOffense);
      } else {
        ({ percentage, minPoints, maxPoints } = config.missedSession.repeat);
      }
      break;

    case 'late-homework':
      if (offenseCount <= 1) {
        ({ percentage, minPoints, maxPoints } = config.lateHomework.firstOffense);
      } else if (offenseCount === 2) {
        ({ percentage, minPoints, maxPoints } = config.lateHomework.secondOffense);
      } else {
        ({ percentage, minPoints, maxPoints } = config.lateHomework.repeat);
      }
      break;

    case 'no-homework':
      if (offenseCount <= 1) {
        ({ percentage, minPoints, maxPoints } = config.noHomework.firstOffense);
      } else {
        ({ percentage, minPoints, maxPoints } = config.noHomework.repeat);
      }
      break;

    case 'low-engagement':
      if (offenseCount <= 1) {
        ({ percentage, minPoints, maxPoints } = config.lowEngagement.firstOffense);
      } else {
        ({ percentage, minPoints, maxPoints } = config.lowEngagement.repeat);
      }
      break;

    case 'constellation-decay':
      // Topic-specific decay - smaller penalty
      percentage = 2;
      minPoints = 5;
      maxPoints = 25;
      break;

    default:
      return 0;
  }

  // Calculate based on percentage
  const calculatedPenalty = Math.round(currentPoints * (percentage / 100));

  // Apply min/max bounds
  const boundedPenalty = Math.max(minPoints, Math.min(maxPoints, calculatedPenalty));

  // Floor protection - never reduce to less than 0 points
  return Math.min(boundedPenalty, currentPoints);
}

/**
 * Create a penalty record
 */
export function createPenaltyRecord(
  type: PenaltyType,
  pointsDeducted: number,
  reason: string,
  appliedBy: 'system' | 'tutor' = 'system'
): PenaltyRecord {
  return {
    id: `penalty-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    pointsDeducted,
    reason,
    appliedAt: new Date().toISOString(),
    appliedBy,
  };
}

/**
 * Get penalty reason text based on type
 */
export function getPenaltyReasonText(type: PenaltyType, offenseCount: number): string {
  switch (type) {
    case 'streak-break':
      return `Streak broken after ${offenseCount} consecutive days of inactivity`;
    case 'missed-session':
      return offenseCount === 1
        ? 'Missed scheduled tutoring session'
        : `Missed tutoring session (${offenseCount}x offense)`;
    case 'late-homework':
      return offenseCount === 1
        ? 'Late homework submission'
        : `Late homework submission (${offenseCount}x offense)`;
    case 'no-homework':
      return offenseCount === 1
        ? 'Homework not submitted'
        : `Homework not submitted (${offenseCount}x offense)`;
    case 'low-engagement':
      return offenseCount === 1
        ? 'Low engagement this week'
        : `Continued low engagement (${offenseCount} weeks)`;
    case 'constellation-decay':
      return 'Topic skills decayed from lack of practice';
    default:
      return 'Penalty applied';
  }
}

/**
 * Get penalty display info for UI
 */
export function getPenaltyDisplayInfo(type: PenaltyType): {
  label: string;
  color: string;
  icon: string;
} {
  switch (type) {
    case 'streak-break':
      return { label: 'Streak Break', color: 'orange', icon: 'flame-off' };
    case 'missed-session':
      return { label: 'Missed Session', color: 'red', icon: 'calendar-x' };
    case 'late-homework':
      return { label: 'Late Homework', color: 'yellow', icon: 'clock' };
    case 'no-homework':
      return { label: 'Missing Homework', color: 'red', icon: 'file-x' };
    case 'low-engagement':
      return { label: 'Low Engagement', color: 'orange', icon: 'trending-down' };
    case 'constellation-decay':
      return { label: 'Skill Decay', color: 'purple', icon: 'star-off' };
    default:
      return { label: 'Penalty', color: 'gray', icon: 'alert-circle' };
  }
}

/**
 * Check if a week was low engagement (< 50% average progress)
 */
export function isLowEngagementWeek(weekData: {
  mathematics?: number;
  physics?: number;
  economics?: number;
}, enrolledSubjects: string[]): boolean {
  let total = 0;
  let count = 0;

  enrolledSubjects.forEach(subject => {
    const value = weekData[subject as keyof typeof weekData];
    if (typeof value === 'number') {
      total += value;
      count++;
    }
  });

  if (count === 0) return true; // No data = low engagement
  return (total / count) < 50;
}

/**
 * Calculate star brightness for Stellar Journey based on performance
 * Returns a value between 0.2 (faded) and 1 (bright)
 */
export function calculateStarBrightness(avgScore: number): number {
  if (avgScore >= 80) return 1;
  if (avgScore >= 60) return 0.8;
  if (avgScore >= 40) return 0.6;
  if (avgScore >= 20) return 0.4;
  return 0.2; // Very faded for very low performance
}

/**
 * Check if constellation/topic should show decay
 * Returns decay level: 0 = no decay, 1 = slight, 2 = moderate, 3 = severe
 */
export function getTopicDecayLevel(
  lastPracticeDate: string | undefined,
  currentDate: Date = new Date()
): number {
  if (!lastPracticeDate) return 3; // Never practiced = severe decay

  const lastPractice = new Date(lastPracticeDate);
  const daysSince = Math.floor(
    (currentDate.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince <= 7) return 0; // Active
  if (daysSince <= 14) return 1; // Slight decay
  if (daysSince <= 30) return 2; // Moderate decay
  return 3; // Severe decay
}

/**
 * Get total penalties for a student in a time period
 */
export function getTotalPenaltiesInPeriod(
  penalties: PenaltyRecord[],
  days: number = 30
): { count: number; totalPoints: number } {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentPenalties = penalties.filter(
    p => new Date(p.appliedAt) >= cutoffDate && !p.waived
  );

  return {
    count: recentPenalties.length,
    totalPoints: recentPenalties.reduce((sum, p) => sum + p.pointsDeducted, 0),
  };
}

/**
 * Apply penalty to student and return updated student profile
 */
export function applyPenalty(
  student: StudentProfile,
  penaltyType: PenaltyType,
  appliedBy: 'system' | 'tutor' = 'system',
  customReason?: string
): { updatedStudent: StudentProfile; penalty: PenaltyRecord } {
  // Get offense count for escalation
  const existingPenalties = student.stats.penaltyHistory || [];
  const typeOffenseCount = existingPenalties.filter(
    p => p.type === penaltyType && !p.waived
  ).length;

  // Calculate penalty amount
  const pointsToDeduct = calculatePenalty(
    student.points,
    penaltyType,
    typeOffenseCount + 1
  );

  // Create penalty record
  const reason = customReason || getPenaltyReasonText(penaltyType, typeOffenseCount + 1);
  const penalty = createPenaltyRecord(penaltyType, pointsToDeduct, reason, appliedBy);

  // Update student
  const updatedStudent: StudentProfile = {
    ...student,
    points: Math.max(0, student.points - pointsToDeduct),
    stats: {
      ...student.stats,
      penaltyHistory: [...existingPenalties, penalty],
    },
  };

  return { updatedStudent, penalty };
}

/**
 * Waive a penalty and restore points
 */
export function waivePenalty(
  student: StudentProfile,
  penaltyId: string,
  waivedBy: string,
  reason: string
): StudentProfile {
  const penaltyHistory = student.stats.penaltyHistory || [];
  const penaltyIndex = penaltyHistory.findIndex(p => p.id === penaltyId);

  if (penaltyIndex === -1) return student;

  const penalty = penaltyHistory[penaltyIndex];
  if (penalty.waived) return student; // Already waived

  // Update penalty record
  const updatedPenalty: PenaltyRecord = {
    ...penalty,
    waived: true,
    waivedBy,
    waivedAt: new Date().toISOString(),
    waivedReason: reason,
  };

  // Restore points
  const updatedHistory = [...penaltyHistory];
  updatedHistory[penaltyIndex] = updatedPenalty;

  return {
    ...student,
    points: student.points + penalty.pointsDeducted,
    stats: {
      ...student.stats,
      penaltyHistory: updatedHistory,
    },
  };
}

/**
 * Check if student is at risk (multiple recent penalties)
 */
export function isStudentAtRisk(student: StudentProfile): {
  atRisk: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
} {
  const reasons: string[] = [];
  let riskScore = 0;

  const penalties = student.stats.penaltyHistory || [];
  const { count: recentPenaltyCount } = getTotalPenaltiesInPeriod(penalties, 14);

  // Check recent penalties
  if (recentPenaltyCount >= 3) {
    riskScore += 2;
    reasons.push(`${recentPenaltyCount} penalties in the last 2 weeks`);
  } else if (recentPenaltyCount >= 1) {
    riskScore += 1;
    reasons.push(`${recentPenaltyCount} recent penalty`);
  }

  // Check streak
  const streakDays = student.stats.streakDays || 0;
  if (streakDays === 0) {
    riskScore += 1;
    reasons.push('No active streak');
  }

  // Check engagement
  const lowEngagementWeeks = student.stats.lowEngagementWeeks || 0;
  if (lowEngagementWeeks >= 2) {
    riskScore += 2;
    reasons.push(`${lowEngagementWeeks} weeks of low engagement`);
  }

  // Check missed sessions
  const missedSessions = student.stats.missedSessionsCount || 0;
  if (missedSessions >= 2) {
    riskScore += 2;
    reasons.push(`${missedSessions} missed sessions`);
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (riskScore >= 4) riskLevel = 'high';
  else if (riskScore >= 2) riskLevel = 'medium';

  return {
    atRisk: riskScore >= 2,
    riskLevel,
    reasons,
  };
}

// ============================================================================
// REWARD BONUS SYSTEM
// ============================================================================

export type BonusType =
  | 'streak-milestone'      // 7, 14, 30, 60, 90 day streaks
  | 'clean-week'            // No penalties for a week
  | 'clean-month'           // No penalties for a month
  | 'perfect-session'       // Excellent performance in session
  | 'homework-streak'       // Multiple on-time homework submissions
  | 'improvement-bonus'     // Significant score improvement
  | 'attendance-bonus';     // Perfect attendance for a period

export interface BonusRecord {
  id: string;
  type: BonusType;
  pointsAwarded: number;
  reason: string;
  awardedAt: string;
  awardedBy: 'system' | 'tutor';
}

export interface BonusConfig {
  streakMilestones: { [days: number]: number };  // days -> bonus points
  cleanWeekBonus: number;
  cleanMonthBonus: number;
  perfectSessionBonus: number;
  homeworkStreakBonus: { [count: number]: number };  // consecutive submissions -> bonus
  improvementThresholds: { percentage: number; bonus: number }[];
  perfectAttendanceWeekly: number;
  perfectAttendanceMonthly: number;
}

export const DEFAULT_BONUS_CONFIG: BonusConfig = {
  streakMilestones: {
    7: 50,     // 1 week
    14: 100,   // 2 weeks
    30: 250,   // 1 month
    60: 500,   // 2 months
    90: 1000,  // 3 months
  },
  cleanWeekBonus: 25,
  cleanMonthBonus: 100,
  perfectSessionBonus: 30,
  homeworkStreakBonus: {
    3: 20,    // 3 in a row
    5: 50,    // 5 in a row
    10: 100,  // 10 in a row
  },
  improvementThresholds: [
    { percentage: 10, bonus: 25 },   // 10% improvement
    { percentage: 20, bonus: 50 },   // 20% improvement
    { percentage: 30, bonus: 100 },  // 30% improvement
  ],
  perfectAttendanceWeekly: 15,
  perfectAttendanceMonthly: 75,
};

/**
 * Create a bonus record
 */
export function createBonusRecord(
  type: BonusType,
  pointsAwarded: number,
  reason: string,
  awardedBy: 'system' | 'tutor' = 'system'
): BonusRecord {
  return {
    id: `bonus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    pointsAwarded,
    reason,
    awardedAt: new Date().toISOString(),
    awardedBy,
  };
}

/**
 * Check and award streak milestone bonuses
 */
export function checkStreakMilestoneBonus(
  currentStreak: number,
  previousStreak: number,
  config: BonusConfig = DEFAULT_BONUS_CONFIG
): BonusRecord | null {
  const milestones = Object.keys(config.streakMilestones)
    .map(Number)
    .sort((a, b) => a - b);

  for (const milestone of milestones) {
    // Award if we just crossed this milestone
    if (currentStreak >= milestone && previousStreak < milestone) {
      const bonus = config.streakMilestones[milestone];
      return createBonusRecord(
        'streak-milestone',
        bonus,
        `${milestone}-day streak achieved! Keep up the great work!`
      );
    }
  }

  return null;
}

/**
 * Check for clean week bonus (no penalties in last 7 days)
 */
export function checkCleanWeekBonus(
  student: StudentProfile,
  lastBonusCheck: string | undefined,
  config: BonusConfig = DEFAULT_BONUS_CONFIG
): BonusRecord | null {
  const penalties = student.stats.penaltyHistory || [];
  const { count } = getTotalPenaltiesInPeriod(penalties, 7);

  if (count === 0) {
    // Check if we already awarded this bonus recently
    const bonusHistory = student.stats.bonusHistory || [];
    const recentCleanBonus = bonusHistory.find(
      b => b.type === 'clean-week' &&
           new Date(b.awardedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    if (!recentCleanBonus) {
      return createBonusRecord(
        'clean-week',
        config.cleanWeekBonus,
        'No penalties this week - excellent behavior!'
      );
    }
  }

  return null;
}

/**
 * Check for clean month bonus
 */
export function checkCleanMonthBonus(
  student: StudentProfile,
  config: BonusConfig = DEFAULT_BONUS_CONFIG
): BonusRecord | null {
  const penalties = student.stats.penaltyHistory || [];
  const { count } = getTotalPenaltiesInPeriod(penalties, 30);

  if (count === 0) {
    const bonusHistory = student.stats.bonusHistory || [];
    const recentCleanBonus = bonusHistory.find(
      b => b.type === 'clean-month' &&
           new Date(b.awardedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    if (!recentCleanBonus) {
      return createBonusRecord(
        'clean-month',
        config.cleanMonthBonus,
        'A full month with no penalties - outstanding!'
      );
    }
  }

  return null;
}

/**
 * Award perfect session bonus
 */
export function awardPerfectSessionBonus(
  config: BonusConfig = DEFAULT_BONUS_CONFIG
): BonusRecord {
  return createBonusRecord(
    'perfect-session',
    config.perfectSessionBonus,
    'Excellent performance in tutoring session!'
  );
}

/**
 * Check for improvement bonus based on score increase
 */
export function checkImprovementBonus(
  previousScore: number,
  currentScore: number,
  config: BonusConfig = DEFAULT_BONUS_CONFIG
): BonusRecord | null {
  if (previousScore <= 0) return null;

  const improvement = ((currentScore - previousScore) / previousScore) * 100;

  // Find the highest threshold met
  const thresholds = [...config.improvementThresholds].sort((a, b) => b.percentage - a.percentage);

  for (const threshold of thresholds) {
    if (improvement >= threshold.percentage) {
      return createBonusRecord(
        'improvement-bonus',
        threshold.bonus,
        `Amazing ${Math.round(improvement)}% improvement in scores!`
      );
    }
  }

  return null;
}

/**
 * Apply bonus to student
 */
export function applyBonus(
  student: StudentProfile,
  bonus: BonusRecord
): StudentProfile {
  const bonusHistory = student.stats.bonusHistory || [];

  return {
    ...student,
    points: student.points + bonus.pointsAwarded,
    stats: {
      ...student.stats,
      bonusHistory: [...bonusHistory, bonus],
    },
  };
}

/**
 * Get all available bonuses for a student (for checking what they could earn)
 */
export function getAvailableBonuses(
  student: StudentProfile,
  config: BonusConfig = DEFAULT_BONUS_CONFIG
): { type: BonusType; label: string; requirement: string; reward: number }[] {
  const available: { type: BonusType; label: string; requirement: string; reward: number }[] = [];
  const currentStreak = student.stats.streakDays || 0;

  // Find next streak milestone
  const milestones = Object.keys(config.streakMilestones)
    .map(Number)
    .sort((a, b) => a - b);

  for (const milestone of milestones) {
    if (currentStreak < milestone) {
      available.push({
        type: 'streak-milestone',
        label: `${milestone}-Day Streak`,
        requirement: `${milestone - currentStreak} more days`,
        reward: config.streakMilestones[milestone],
      });
      break; // Only show next milestone
    }
  }

  // Clean week bonus
  const { count: weekPenalties } = getTotalPenaltiesInPeriod(student.stats.penaltyHistory || [], 7);
  if (weekPenalties === 0) {
    const bonusHistory = student.stats.bonusHistory || [];
    const hasRecentBonus = bonusHistory.some(
      b => b.type === 'clean-week' &&
           new Date(b.awardedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    if (!hasRecentBonus) {
      available.push({
        type: 'clean-week',
        label: 'Clean Week',
        requirement: 'Available now!',
        reward: config.cleanWeekBonus,
      });
    }
  }

  // Clean month bonus
  const { count: monthPenalties } = getTotalPenaltiesInPeriod(student.stats.penaltyHistory || [], 30);
  if (monthPenalties === 0) {
    const bonusHistory = student.stats.bonusHistory || [];
    const hasRecentBonus = bonusHistory.some(
      b => b.type === 'clean-month' &&
           new Date(b.awardedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    if (!hasRecentBonus) {
      available.push({
        type: 'clean-month',
        label: 'Clean Month',
        requirement: 'Available now!',
        reward: config.cleanMonthBonus,
      });
    }
  }

  return available;
}

/**
 * Get bonus display info for UI
 */
export function getBonusDisplayInfo(type: BonusType): {
  label: string;
  color: string;
  icon: string;
} {
  switch (type) {
    case 'streak-milestone':
      return { label: 'Streak Milestone', color: 'orange', icon: 'flame' };
    case 'clean-week':
      return { label: 'Clean Week', color: 'green', icon: 'shield-check' };
    case 'clean-month':
      return { label: 'Clean Month', color: 'emerald', icon: 'trophy' };
    case 'perfect-session':
      return { label: 'Perfect Session', color: 'blue', icon: 'star' };
    case 'homework-streak':
      return { label: 'Homework Streak', color: 'purple', icon: 'check-circle' };
    case 'improvement-bonus':
      return { label: 'Improvement', color: 'cyan', icon: 'trending-up' };
    case 'attendance-bonus':
      return { label: 'Perfect Attendance', color: 'yellow', icon: 'calendar-check' };
    default:
      return { label: 'Bonus', color: 'gray', icon: 'gift' };
  }
}

// ============================================================================
// AUTOMATIC STREAK DETECTION
// ============================================================================

export interface StreakCheckResult {
  streakBroken: boolean;
  previousStreak: number;
  newStreak: number;
  daysMissed: number;
  penalty?: PenaltyRecord;
  updatedStudent?: StudentProfile;
}

/**
 * Check if student's streak should be broken based on last activity
 */
export function checkStreakStatus(
  student: StudentProfile,
  lastActivityDate: string | undefined,
  currentDate: Date = new Date()
): StreakCheckResult {
  const currentStreak = student.stats.streakDays || 0;

  if (!lastActivityDate) {
    // No activity recorded, streak should be 0
    return {
      streakBroken: currentStreak > 0,
      previousStreak: currentStreak,
      newStreak: 0,
      daysMissed: currentStreak,
    };
  }

  const lastActivity = new Date(lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);

  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);

  const daysSinceActivity = Math.floor(
    (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Streak breaks if more than 1 day has passed without activity
  if (daysSinceActivity > 1) {
    const { updatedStudent, penalty } = applyPenalty(
      student,
      'streak-break',
      'system',
      `Streak broken after ${currentStreak} days (${daysSinceActivity} days of inactivity)`
    );

    return {
      streakBroken: true,
      previousStreak: currentStreak,
      newStreak: 0,
      daysMissed: daysSinceActivity,
      penalty,
      updatedStudent: {
        ...updatedStudent,
        stats: {
          ...updatedStudent.stats,
          streakDays: 0,
        },
      },
    };
  }

  return {
    streakBroken: false,
    previousStreak: currentStreak,
    newStreak: currentStreak,
    daysMissed: 0,
  };
}

/**
 * Update streak after activity (increment or maintain)
 */
export function updateStreakAfterActivity(
  student: StudentProfile,
  lastActivityDate: string | undefined,
  currentDate: Date = new Date()
): { updatedStudent: StudentProfile; bonus?: BonusRecord } {
  const currentStreak = student.stats.streakDays || 0;
  let newStreak = currentStreak;

  if (!lastActivityDate) {
    // First activity ever
    newStreak = 1;
  } else {
    const lastActivity = new Date(lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);

    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);

    const daysSinceActivity = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceActivity === 1) {
      // Activity on consecutive day - increment streak
      newStreak = currentStreak + 1;
    } else if (daysSinceActivity === 0) {
      // Same day - maintain streak
      newStreak = currentStreak;
    } else {
      // Streak was broken - reset to 1
      newStreak = 1;
    }
  }

  let updatedStudent: StudentProfile = {
    ...student,
    stats: {
      ...student.stats,
      streakDays: newStreak,
      lastActivityDate: currentDate.toISOString(),
    },
  };

  // Check for streak milestone bonus
  const bonus = checkStreakMilestoneBonus(newStreak, currentStreak);
  if (bonus) {
    updatedStudent = applyBonus(updatedStudent, bonus);
  }

  return { updatedStudent, bonus };
}

/**
 * Run all automatic bonus checks for a student
 */
export function runAutomaticBonusChecks(
  student: StudentProfile
): { updatedStudent: StudentProfile; bonusesAwarded: BonusRecord[] } {
  const bonusesAwarded: BonusRecord[] = [];
  let updatedStudent = { ...student };

  // Check clean week bonus
  const cleanWeekBonus = checkCleanWeekBonus(updatedStudent, undefined);
  if (cleanWeekBonus) {
    updatedStudent = applyBonus(updatedStudent, cleanWeekBonus);
    bonusesAwarded.push(cleanWeekBonus);
  }

  // Check clean month bonus
  const cleanMonthBonus = checkCleanMonthBonus(updatedStudent);
  if (cleanMonthBonus) {
    updatedStudent = applyBonus(updatedStudent, cleanMonthBonus);
    bonusesAwarded.push(cleanMonthBonus);
  }

  return { updatedStudent, bonusesAwarded };
}
