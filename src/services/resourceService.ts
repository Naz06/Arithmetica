import { supabase, isDemoMode } from '../lib/supabase';
import type { Resource } from '../types/database';

// Demo resources data
const demoResources: Resource[] = [
  {
    id: 'resource-1',
    tutor_id: 'tutor-1',
    title: 'Quadratic Equations Worksheet',
    description: 'Practice problems for quadratic equations',
    type: 'pdf',
    url: '/resources/quadratic-worksheet.pdf',
    subject: 'Mathematics',
    year_group: 'GCSE',
    assigned_to: ['student-1', 'student-2'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'resource-2',
    tutor_id: 'tutor-1',
    title: 'Newton\'s Laws Video',
    description: 'Comprehensive explanation of Newton\'s three laws of motion',
    type: 'video',
    url: 'https://example.com/physics-video',
    subject: 'Physics',
    year_group: 'GCSE',
    assigned_to: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'resource-3',
    tutor_id: 'tutor-1',
    title: 'Economics Revision Guide',
    description: 'Complete A-Level economics revision notes',
    type: 'document',
    url: '/resources/economics-guide.pdf',
    subject: 'Economics',
    year_group: 'A-Level',
    assigned_to: ['student-3'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const resourceService = {
  // Get all resources for a tutor
  async getResourcesByTutor(tutorId: string): Promise<Resource[]> {
    if (isDemoMode) {
      return demoResources;
    }

    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resources:', error);
      return [];
    }

    return data;
  },

  // Get resources assigned to a student
  async getResourcesForStudent(studentId: string): Promise<Resource[]> {
    if (isDemoMode) {
      return demoResources.filter(r =>
        r.assigned_to.includes(studentId) || r.assigned_to.length === 0
      );
    }

    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .or(`assigned_to.cs.{${studentId}},assigned_to.eq.{}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resources:', error);
      return [];
    }

    return data;
  },

  // Get resources by subject
  async getResourcesBySubject(tutorId: string, subject: string): Promise<Resource[]> {
    if (isDemoMode) {
      return demoResources.filter(r => r.subject === subject);
    }

    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('tutor_id', tutorId)
      .eq('subject', subject)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resources:', error);
      return [];
    }

    return data;
  },

  // Create a new resource
  async createResource(resource: Omit<Resource, 'id' | 'created_at' | 'updated_at'>): Promise<Resource | null> {
    if (isDemoMode) {
      const newResource: Resource = {
        ...resource,
        id: `resource-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demoResources.push(newResource);
      return newResource;
    }

    const { data, error } = await supabase
      .from('resources')
      .insert(resource)
      .select()
      .single();

    if (error) {
      console.error('Error creating resource:', error);
      return null;
    }

    return data;
  },

  // Update a resource
  async updateResource(resourceId: string, updates: Partial<Resource>): Promise<boolean> {
    if (isDemoMode) {
      const index = demoResources.findIndex(r => r.id === resourceId);
      if (index >= 0) {
        demoResources[index] = { ...demoResources[index], ...updates };
      }
      return true;
    }

    const { error } = await supabase
      .from('resources')
      .update(updates)
      .eq('id', resourceId);

    return !error;
  },

  // Assign resource to students
  async assignToStudents(resourceId: string, studentIds: string[]): Promise<boolean> {
    return this.updateResource(resourceId, { assigned_to: studentIds });
  },

  // Delete a resource
  async deleteResource(resourceId: string): Promise<boolean> {
    if (isDemoMode) {
      const index = demoResources.findIndex(r => r.id === resourceId);
      if (index >= 0) {
        demoResources.splice(index, 1);
      }
      return true;
    }

    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', resourceId);

    return !error;
  },

  // Upload a file to Supabase Storage
  async uploadFile(file: File, path: string): Promise<string | null> {
    if (isDemoMode) {
      return `/uploads/${path}`;
    }

    const { data, error } = await supabase.storage
      .from('resources')
      .upload(path, file);

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resources')
      .getPublicUrl(data.path);

    return publicUrl;
  },
};
