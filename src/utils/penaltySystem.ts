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
