import { supabase, isDemoMode } from '../lib/supabase';
import type { Assessment } from '../types/database';

// Demo assessments data
const demoAssessments: Assessment[] = [
  {
    id: 'assessment-1',
    tutor_id: 'tutor-1',
    student_id: 'student-1',
    subject: 'Mathematics',
    title: 'Algebra Test',
    score: 85,
    max_score: 100,
    date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    feedback: 'Great work on solving equations. Practice factoring more.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'assessment-2',
    tutor_id: 'tutor-1',
    student_id: 'student-1',
    subject: 'Physics',
    title: 'Forces Quiz',
    score: 92,
    max_score: 100,
    date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    feedback: 'Excellent understanding of Newton\'s laws!',
    created_at: new Date().toISOString(),
  },
  {
    id: 'assessment-3',
    tutor_id: 'tutor-1',
    student_id: 'student-2',
    subject: 'Economics',
    title: 'Market Structures Test',
    score: 78,
    max_score: 100,
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    feedback: 'Good effort. Review monopoly pricing strategies.',
    created_at: new Date().toISOString(),
  },
];

export const assessmentService = {
  // Get all assessments for a tutor
  async getAssessmentsByTutor(tutorId: string): Promise<Assessment[]> {
    if (isDemoMode) {
      return demoAssessments;
    }

    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching assessments:', error);
      return [];
    }

    return data;
  },

  // Get assessments for a student
  async getAssessmentsByStudent(studentId: string): Promise<Assessment[]> {
    if (isDemoMode) {
      return demoAssessments.filter(a => a.student_id === studentId);
    }

    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching assessments:', error);
      return [];
    }

    return data;
  },

  // Get assessments by subject
  async getAssessmentsBySubject(tutorId: string, subject: string): Promise<Assessment[]> {
    if (isDemoMode) {
      return demoAssessments.filter(a => a.subject === subject);
    }

    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('tutor_id', tutorId)
      .eq('subject', subject)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching assessments:', error);
      return [];
    }

    return data;
  },

  // Create a new assessment
  async createAssessment(assessment: Omit<Assessment, 'id' | 'created_at'>): Promise<Assessment | null> {
    if (isDemoMode) {
      const newAssessment: Assessment = {
        ...assessment,
        id: `assessment-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      demoAssessments.push(newAssessment);
      return newAssessment;
    }

    const { data, error } = await supabase
      .from('assessments')
      .insert(assessment)
      .select()
      .single();

    if (error) {
      console.error('Error creating assessment:', error);
      return null;
    }

    return data;
  },

  // Update an assessment
  async updateAssessment(assessmentId: string, updates: Partial<Assessment>): Promise<boolean> {
    if (isDemoMode) {
      const index = demoAssessments.findIndex(a => a.id === assessmentId);
      if (index >= 0) {
        demoAssessments[index] = { ...demoAssessments[index], ...updates };
      }
      return true;
    }

    const { error } = await supabase
      .from('assessments')
      .update(updates)
      .eq('id', assessmentId);

    return !error;
  },

  // Delete an assessment
  async deleteAssessment(assessmentId: string): Promise<boolean> {
    if (isDemoMode) {
      const index = demoAssessments.findIndex(a => a.id === assessmentId);
      if (index >= 0) {
        demoAssessments.splice(index, 1);
      }
      return true;
    }

    const { error } = await supabase
      .from('assessments')
      .delete()
      .eq('id', assessmentId);

    return !error;
  },

  // Get student's average score
  async getStudentAverageScore(studentId: string): Promise<number> {
    const assessments = await this.getAssessmentsByStudent(studentId);

    if (assessments.length === 0) return 0;

    const totalPercentage = assessments.reduce((sum, a) => {
      return sum + (a.score / a.max_score) * 100;
    }, 0);

    return Math.round(totalPercentage / assessments.length);
  },

  // Get student's average score by subject
  async getStudentScoresBySubject(studentId: string): Promise<Record<string, number>> {
    const assessments = await this.getAssessmentsByStudent(studentId);

    const subjectScores: Record<string, { total: number; count: number }> = {};

    assessments.forEach(a => {
      if (!subjectScores[a.subject]) {
        subjectScores[a.subject] = { total: 0, count: 0 };
      }
      subjectScores[a.subject].total += (a.score / a.max_score) * 100;
      subjectScores[a.subject].count += 1;
    });

    const averages: Record<string, number> = {};
    Object.entries(subjectScores).forEach(([subject, { total, count }]) => {
      averages[subject] = Math.round(total / count);
    });

    return averages;
  },

  // Get recent assessments
  async getRecentAssessments(tutorId: string, limit = 5): Promise<Assessment[]> {
    if (isDemoMode) {
      return demoAssessments.slice(0, limit);
    }

    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent assessments:', error);
      return [];
    }

    return data;
  },
};
