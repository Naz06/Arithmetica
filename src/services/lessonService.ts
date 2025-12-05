import { supabase, isDemoMode } from '../lib/supabase';
import type { Lesson } from '../types/database';

// Demo lessons data
const demoLessons: Lesson[] = [
  {
    id: 'lesson-1',
    tutor_id: 'tutor-1',
    student_id: 'student-1',
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    date: new Date().toISOString().split('T')[0],
    start_time: '10:00',
    end_time: '11:00',
    status: 'scheduled',
    notes: null,
    score: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'lesson-2',
    tutor_id: 'tutor-1',
    student_id: 'student-2',
    subject: 'Physics',
    topic: 'Newton\'s Laws',
    date: new Date().toISOString().split('T')[0],
    start_time: '14:00',
    end_time: '15:00',
    status: 'scheduled',
    notes: null,
    score: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const lessonService = {
  // Get all lessons for a tutor
  async getLessonsByTutor(tutorId: string): Promise<Lesson[]> {
    if (isDemoMode) {
      return demoLessons;
    }

    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching lessons:', error);
      return [];
    }

    return data;
  },

  // Get lessons for a student
  async getLessonsByStudent(studentId: string): Promise<Lesson[]> {
    if (isDemoMode) {
      return demoLessons.filter(l => l.student_id === studentId);
    }

    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching lessons:', error);
      return [];
    }

    return data;
  },

  // Get upcoming lessons
  async getUpcomingLessons(tutorId: string, limit = 5): Promise<Lesson[]> {
    if (isDemoMode) {
      return demoLessons.filter(l => l.status === 'scheduled').slice(0, limit);
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('tutor_id', tutorId)
      .gte('date', today)
      .eq('status', 'scheduled')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching upcoming lessons:', error);
      return [];
    }

    return data;
  },

  // Create a new lesson
  async createLesson(lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>): Promise<Lesson | null> {
    if (isDemoMode) {
      const newLesson: Lesson = {
        ...lesson,
        id: `lesson-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demoLessons.push(newLesson);
      return newLesson;
    }

    const { data, error } = await supabase
      .from('lessons')
      .insert(lesson)
      .select()
      .single();

    if (error) {
      console.error('Error creating lesson:', error);
      return null;
    }

    return data;
  },

  // Update a lesson
  async updateLesson(lessonId: string, updates: Partial<Lesson>): Promise<boolean> {
    if (isDemoMode) {
      const index = demoLessons.findIndex(l => l.id === lessonId);
      if (index >= 0) {
        demoLessons[index] = { ...demoLessons[index], ...updates };
      }
      return true;
    }

    const { error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', lessonId);

    return !error;
  },

  // Complete a lesson
  async completeLesson(lessonId: string, notes?: string, score?: number): Promise<boolean> {
    return this.updateLesson(lessonId, {
      status: 'completed',
      notes,
      score,
    });
  },

  // Cancel a lesson
  async cancelLesson(lessonId: string): Promise<boolean> {
    return this.updateLesson(lessonId, { status: 'cancelled' });
  },

  // Delete a lesson
  async deleteLesson(lessonId: string): Promise<boolean> {
    if (isDemoMode) {
      const index = demoLessons.findIndex(l => l.id === lessonId);
      if (index >= 0) {
        demoLessons.splice(index, 1);
      }
      return true;
    }

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId);

    return !error;
  },
};
