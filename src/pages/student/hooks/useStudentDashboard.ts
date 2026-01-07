import { useMemo, useState, useCallback, useEffect } from 'react';
import { StudentProfile, ResourceLevel } from '../../../types';

export function useStudentStats(student: StudentProfile | null) {
  const level = student?.level || 1;
  const points = student?.points || 0;

  const xpForNextLevel = useMemo(() => level * 500, [level]);
  const currentXP = useMemo(() => points % 500, [points]);
  const xpProgress = useMemo(() => (currentXP / 500) * 100, [currentXP]);

  const enrolledSubjectStats = useMemo(() => {
    if (!student) return [];
    return student.stats.subjectStats.filter(stat => student.subjects.includes(stat.subject));
  }, [student?.subjects, student?.stats.subjectStats]);

  return { level, points, xpForNextLevel, currentXP, xpProgress, enrolledSubjectStats };
}

export function usePenaltyStats(student: StudentProfile | null) {
  const { count: penaltyCount, totalPoints: penaltyPointsLost } = useMemo(() => {
    if (!student) return { count: 0, totalPoints: 0 };

    const penaltyHistory = student.stats.penaltyHistory || [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const recentPenalties = penaltyHistory.filter(p => {
      const penaltyDate = new Date(p.appliedAt);
      return penaltyDate >= cutoff && !p.waived;
    });

    const totalPoints = recentPenalties.reduce((sum, p) => sum + p.pointsDeducted, 0);

    return { count: recentPenalties.length, totalPoints };
  }, [student]);

  const recentPenalties = useMemo(() => {
    if (!student) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return (student.stats.penaltyHistory || []).filter(p => {
      const penaltyDate = new Date(p.appliedAt);
      return penaltyDate >= cutoff && !p.waived;
    });
  }, [student]);

  const { atRisk, riskLevel, reasons } = useMemo(() => {
    if (!student) return { atRisk: false, riskLevel: 'low' as const, reasons: [] };
    const totalPenaltiesInPeriod = recentPenalties.length;
    const totalPointsLost = recentPenalties.reduce((sum, p) => sum + p.pointsDeducted, 0);
    const currentStreak = student.stats.currentStreak || 0;

    const riskFactors = [];
    let level = 'low';

    if (totalPenaltiesInPeriod >= 5) {
      riskFactors.push('Multiple penalties in last 30 days');
      level = 'high';
    } else if (totalPenaltiesInPeriod >= 3) {
      riskFactors.push('Recent penalties');
      level = 'medium';
    }

    if (totalPointsLost > 200) {
      riskFactors.push('High point loss from penalties');
      level = level === 'high' ? 'high' : 'medium';
    }

    return { atRisk: riskFactors.length > 0, riskLevel: level, reasons: riskFactors };
  }, [student, recentPenalties]);

  return { penaltyCount, penaltyPointsLost, recentPenalties, atRisk, riskLevel, reasons };
}

export function useAchievements(student: StudentProfile | null) {
  const achievements = useMemo(() => {
    if (!student) return [];

    const baseAchievements = [{
      id: 'first-login',
      name: 'Explorer',
      description: 'Logged in for the first time',
      earned: true,
      icon: '🚀',
      points: 10,
    }];

    const subjectAchievements = [];
    const subjectStats = student.stats.subjectStats;

    if (student.subjects.includes('mathematics')) {
      const mathProgress = subjectStats.find(s => s.subject === 'mathematics')?.progress || 0;
      if (mathProgress >= 90) {
        subjectAchievements.push({ id: 'math-master', name: 'Math Wizard', description: 'Reach 90% progress in Mathematics', earned: true, icon: '🧮', points: 150 });
      } else if (mathProgress >= 70) {
        subjectAchievements.push({ id: 'math-pro', name: 'Math Apprentice', description: 'Reach 70% progress in Mathematics', earned: true, icon: '📐', points: 75 });
      }
    }

    const additionalAchievements = [];
    const currentStreak = student.stats.currentStreak || 0;

    if (currentStreak >= 30) {
      additionalAchievements.push({ id: 'streak-30', name: 'Monthly Mastery', description: 'Maintain a 30-day streak', earned: true, icon: '🔥', points: 200 });
    } else if (currentStreak >= 7) {
      additionalAchievements.push({ id: 'streak-7', name: 'Weekly Warrior', description: 'Maintain a 7-day streak', earned: true, icon: '🔥', points: 50 });
    }

    return [...baseAchievements, ...subjectAchievements, ...additionalAchievements];
  }, [student]);

  return { achievements };
}

export function useLevelUp(student: StudentProfile | null, onLevelUp: (newLevel: number) => void) {
  const [previousLevel, setPreviousLevel] = useState(student?.level || 1);

  useEffect(() => {
    if (!student) return;
    if (student.level > previousLevel) {
      onLevelUp(student.level);
      setPreviousLevel(student.level);
    }
  }, [student?.level, previousLevel, onLevelUp]);
}

export function useFilteredResources(allResources: any[], studentLevel: ResourceLevel | null) {
  const filtered = useMemo(() => {
    return allResources.filter(r => !r.level || r.level === studentLevel);
  }, [allResources, studentLevel]);

  return filtered;
}
