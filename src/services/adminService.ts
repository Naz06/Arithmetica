import { supabase, isDemoMode } from '../lib/supabase';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: 'tutor' | 'student' | 'parent';
}

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

// Demo mode storage
const demoUsers: UserRecord[] = [
  { id: '1', email: 'tutor@stellar.edu', name: 'Dr. Sarah Chen', role: 'tutor', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '2', email: 'alex@stellar.edu', name: 'Alex Thompson', role: 'student', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '3', email: 'parent.thompson@email.com', name: 'Michael Thompson', role: 'parent', created_at: '2024-01-01', updated_at: '2024-01-01' },
];

export const adminService = {
  // Get all users
  async getAllUsers(): Promise<UserRecord[]> {
    if (isDemoMode) {
      return demoUsers;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create a new user account
  async createUser(userData: CreateUserData): Promise<{ success: boolean; error?: string; user?: UserRecord }> {
    if (isDemoMode) {
      const newUser: UserRecord = {
        id: String(Date.now()),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demoUsers.push(newUser);
      return { success: true, user: newUser };
    }

    try {
      // Create auth user with Supabase Admin API
      // Note: This requires service_role key for production
      // For now, we use the signUp method which creates both auth user and profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
          },
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user' };
      }

      return {
        success: true,
        user: {
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Delete a user
  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    if (isDemoMode) {
      const index = demoUsers.findIndex(u => u.id === userId);
      if (index > -1) {
        demoUsers.splice(index, 1);
      }
      return { success: true };
    }

    try {
      // Delete from profiles (cascade will handle related data)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Update user details
  async updateUser(userId: string, updates: Partial<Pick<UserRecord, 'name' | 'role'>>): Promise<{ success: boolean; error?: string }> {
    if (isDemoMode) {
      const user = demoUsers.find(u => u.id === userId);
      if (user) {
        Object.assign(user, updates, { updated_at: new Date().toISOString() });
      }
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Send password reset email
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    if (isDemoMode) {
      // Simulate password reset in demo mode
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  // Get user statistics
  async getStats(): Promise<{ tutors: number; students: number; parents: number; total: number }> {
    if (isDemoMode) {
      return {
        tutors: demoUsers.filter(u => u.role === 'tutor').length,
        students: demoUsers.filter(u => u.role === 'student').length,
        parents: demoUsers.filter(u => u.role === 'parent').length,
        total: demoUsers.length,
      };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role');

      if (error) throw error;

      const stats = {
        tutors: 0,
        students: 0,
        parents: 0,
        total: data?.length || 0,
      };

      data?.forEach(user => {
        if (user.role === 'tutor') stats.tutors++;
        else if (user.role === 'student') stats.students++;
        else if (user.role === 'parent') stats.parents++;
      });

      return stats;
    } catch (err) {
      return { tutors: 0, students: 0, parents: 0, total: 0 };
    }
  },

  // Change admin password
  async changeAdminPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (isDemoMode) {
      // In demo mode, verify current password and update in localStorage
      const storedUser = localStorage.getItem('stellar_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.role !== 'admin') {
          return { success: false, error: 'Unauthorized' };
        }

        // Get the admin data to verify current password
        const { demoAdmin } = await import('../data/demoData');

        // Check stored admin password (may have been changed)
        const storedAdminPassword = localStorage.getItem('admin_password') || demoAdmin.password;

        if (currentPassword !== storedAdminPassword) {
          return { success: false, error: 'Current password is incorrect' };
        }

        // Store the new password
        localStorage.setItem('admin_password', newPassword);
        return { success: true };
      }
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // For Supabase, use the updateUser method
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  },
};
