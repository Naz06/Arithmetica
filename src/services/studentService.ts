import { supabase, isDemoMode } from '../lib/supabase';
import { demoStudents } from '../data/demoData';
import type { Student, Profile } from '../types/database';

export interface StudentWithProfile extends Student {
  profile: Profile;
}

export const studentService = {
  // Get all students for a tutor
  async getStudentsByTutor(tutorId: string): Promise<StudentWithProfile[]> {
    if (isDemoMode) {
      return demoStudents.map(s => ({
        id: s.id,
        user_id: s.id,
        tutor_id: 'tutor-1',
        year_group: s.yearGroup,
        subjects: s.subjects,
        overall_progress: s.stats.overallProgress,
        total_points: s.stats.totalPoints,
        current_streak: s.stats.currentStreak,
        avatar_items: s.avatar.items,
        achievements: s.achievements.map(a => a.id),
        strengths: s.stats.strengths,
        weaknesses: s.stats.areasToImprove,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile: {
          id: s.id,
          email: s.email,
          name: s.name,
          role: 'student' as const,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }));
    }

    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        profile:profiles!students_user_id_fkey(*)
      `)
      .eq('tutor_id', tutorId);

    if (error) {
      console.error('Error fetching students:', error);
      return [];
    }

    return data as StudentWithProfile[];
  },

  // Get a single student by ID
  async getStudentById(studentId: string): Promise<StudentWithProfile | null> {
    if (isDemoMode) {
      const student = demoStudents.find(s => s.id === studentId);
      if (!student) return null;

      return {
        id: student.id,
        user_id: student.id,
        tutor_id: 'tutor-1',
        year_group: student.yearGroup,
        subjects: student.subjects,
        overall_progress: student.stats.overallProgress,
        total_points: student.stats.totalPoints,
        current_streak: student.stats.currentStreak,
        avatar_items: student.avatar.items,
        achievements: student.achievements.map(a => a.id),
        strengths: student.stats.strengths,
        weaknesses: student.stats.areasToImprove,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile: {
          id: student.id,
          email: student.email,
          name: student.name,
          role: 'student' as const,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      };
    }

    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        profile:profiles!students_user_id_fkey(*)
      `)
      .eq('id', studentId)
      .single();

    if (error) {
      console.error('Error fetching student:', error);
      return null;
    }

    return data as StudentWithProfile;
  },

  // Create a new student
  async createStudent(
    userId: string,
    tutorId: string,
    yearGroup: string,
    subjects: string[]
  ): Promise<Student | null> {
    if (isDemoMode) {
      return null;
    }

    const { data, error } = await supabase
      .from('students')
      .insert({
        user_id: userId,
        tutor_id: tutorId,
        year_group: yearGroup,
        subjects,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating student:', error);
      return null;
    }

    return data;
  },

  // Update student progress
  async updateProgress(studentId: string, progress: number): Promise<boolean> {
    if (isDemoMode) return true;

    const { error } = await supabase
      .from('students')
      .update({ overall_progress: progress })
      .eq('id', studentId);

    return !error;
  },

  // Update student points
  async updatePoints(studentId: string, points: number): Promise<boolean> {
    if (isDemoMode) return true;

    const { error } = await supabase
      .from('students')
      .update({ total_points: points })
      .eq('id', studentId);

    return !error;
  },

  // Add achievement to student
  async addAchievement(studentId: string, achievementId: string): Promise<boolean> {
    if (isDemoMode) return true;

    const { data: student } = await supabase
      .from('students')
      .select('achievements')
      .eq('id', studentId)
      .single();

    if (!student) return false;

    const achievements = [...(student.achievements || []), achievementId];

    const { error } = await supabase
      .from('students')
      .update({ achievements })
      .eq('id', studentId);

    return !error;
  },

  // Update avatar items
  async updateAvatarItems(studentId: string, items: Record<string, string | null>): Promise<boolean> {
    if (isDemoMode) return true;

    const { error } = await supabase
      .from('students')
      .update({ avatar_items: items })
      .eq('id', studentId);

    return !error;
  },

  // Update streak
  async updateStreak(studentId: string, streak: number): Promise<boolean> {
    if (isDemoMode) return true;

    const { error } = await supabase
      .from('students')
      .update({ current_streak: streak })
      .eq('id', studentId);

    return !error;
  },
};
