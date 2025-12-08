import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';
import { TutorProfile, StudentProfile, ParentProfile } from '../types';
import { demoTutor, demoStudents, demoParents, getAllUsers } from '../data/demoData';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, UserRole } from '../types/database';

type AnyUser = TutorProfile | StudentProfile | ParentProfile;

interface AuthContextType {
  user: AnyUser | null;
  supabaseUser: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  getUserById: (id: string) => AnyUser | undefined;
  getStudentById: (id: string) => StudentProfile | undefined;
  getParentById: (id: string) => ParentProfile | undefined;
  getTutor: () => TutorProfile;
  getAllStudents: () => StudentProfile[];
  getStudentsByParentId: (parentId: string) => StudentProfile[];
  updateStudent: (student: StudentProfile) => void;
  refreshProfile: () => Promise<void>;
  addStudent: (student: StudentProfile) => void;
  addParent: (parent: ParentProfile) => void;
  getParents: () => ParentProfile[];
  linkParentToStudent: (parentId: string, studentId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AnyUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<StudentProfile[]>(demoStudents);
  const [parents, setParents] = useState<ParentProfile[]>(demoParents);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Convert Supabase profile to app user format
  const profileToUser = (profile: Profile): AnyUser => {
    const baseUser = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      avatar: profile.avatar_url || undefined,
    };

    switch (profile.role) {
      case 'tutor':
        return {
          ...baseUser,
          role: 'tutor' as const,
          qualifications: [],
          specializations: [],
          yearsExperience: 0,
          password: '', // Not used in real auth
        } as TutorProfile;
      case 'student':
        return {
          ...baseUser,
          role: 'student' as const,
          yearGroup: 'Year 7',
          subjects: [],
          parentId: '',
          stats: {
            totalPoints: 0,
            currentStreak: 0,
            lessonsCompleted: 0,
            averageScore: 0,
            rank: 0,
            totalStudents: 0,
            subjectProgress: {},
            overallProgress: 0,
            strengths: [],
            areasToImprove: [],
          },
          avatar: {
            baseColor: '#6366f1',
            items: {},
          },
          achievements: [],
          inventory: [],
          password: '',
        } as StudentProfile;
      case 'parent':
        return {
          ...baseUser,
          role: 'parent' as const,
          childrenIds: [],
          password: '',
        } as ParentProfile;
      default:
        return baseUser as AnyUser;
    }
  };

  // Fetch user profile from Supabase
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    if (isDemoMode) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  };

  // Initialize auth state
  useEffect(() => {
    if (isDemoMode) {
      // Demo mode: check for stored session
      const storedUser = localStorage.getItem('stellar_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
        } catch {
          localStorage.removeItem('stellar_user');
        }
      }
      setIsLoading(false);
      return;
    }

    // Real Supabase mode
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (initialSession?.user) {
          setSession(initialSession);
          setSupabaseUser(initialSession.user);

          const userProfile = await fetchProfile(initialSession.user.id);
          if (userProfile) {
            setProfile(userProfile);
            setUser(profileToUser(userProfile));
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setSupabaseUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const userProfile = await fetchProfile(currentSession.user.id);
          if (userProfile) {
            setProfile(userProfile);
            setUser(profileToUser(userProfile));
          }
        } else {
          setProfile(null);
          setUser(null);
        }

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (isDemoMode) {
      // Demo mode login
      const allUsers = getAllUsers();
      const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        return { success: false, error: 'User not found. Please check your email address.' };
      }

      // For admin, check if password was changed (stored in localStorage)
      if (foundUser.role === 'admin') {
        const storedAdminPassword = localStorage.getItem('admin_password') || foundUser.password;
        if (password !== storedAdminPassword) {
          return { success: false, error: 'Incorrect password. Please try again.' };
        }
      } else if (foundUser.password !== password) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      setUser(foundUser);
      localStorage.setItem('stellar_user', JSON.stringify(foundUser));
      return { success: true };
    }

    // Real Supabase login
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const userProfile = await fetchProfile(data.user.id);
        if (userProfile) {
          setProfile(userProfile);
          setUser(profileToUser(userProfile));
        }
        return { success: true };
      }

      return { success: false, error: 'Login failed. Please try again.' };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred.' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    if (isDemoMode) {
      return { success: false, error: 'Sign up is not available in demo mode.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        return { success: true };
      }

      return { success: false, error: 'Sign up failed. Please try again.' };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred.' };
    }
  };

  const logout = async () => {
    if (isDemoMode) {
      setUser(null);
      localStorage.removeItem('stellar_user');
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setSupabaseUser(null);
  };

  const refreshProfile = async () => {
    if (isDemoMode || !supabaseUser) return;

    const userProfile = await fetchProfile(supabaseUser.id);
    if (userProfile) {
      setProfile(userProfile);
      setUser(profileToUser(userProfile));
    }
  };

  const getUserById = (id: string): AnyUser | undefined => {
    if (isDemoMode) {
      return getAllUsers().find(u => u.id === id);
    }
    // In real mode, this would fetch from Supabase
    return getAllUsers().find(u => u.id === id);
  };

  const getStudentById = (id: string): StudentProfile | undefined => {
    return students.find(s => s.id === id);
  };

  const getParentById = (id: string): ParentProfile | undefined => {
    return parents.find(p => p.id === id);
  };

  const getParents = (): ParentProfile[] => {
    return parents;
  };

  const addStudent = (student: StudentProfile) => {
    setStudents(prev => [...prev, student]);
  };

  const addParent = (parent: ParentProfile) => {
    setParents(prev => [...prev, parent]);
  };

  const linkParentToStudent = (parentId: string, studentId: string) => {
    // Update the student to have the parentId
    setStudents(prev => prev.map(s =>
      s.id === studentId ? { ...s, parentId } : s
    ));
    // Update the parent to include this child in childrenIds
    setParents(prev => prev.map(p =>
      p.id === parentId
        ? { ...p, childrenIds: [...(p.childrenIds || []), studentId] }
        : p
    ));
  };

  const getTutor = (): TutorProfile => {
    if (user?.role === 'tutor') {
      return user as TutorProfile;
    }
    return demoTutor;
  };

  const getAllStudents = (): StudentProfile[] => {
    return students;
  };

  const getStudentsByParentId = (parentId: string): StudentProfile[] => {
    return students.filter(s => s.parentId === parentId);
  };

  const updateStudent = (updatedStudent: StudentProfile) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        isAuthenticated: !!user,
        isLoading,
        isDemoMode,
        login,
        signUp,
        logout,
        getUserById,
        getStudentById,
        getParentById,
        getTutor,
        getAllStudents,
        getStudentsByParentId,
        updateStudent,
        refreshProfile,
        addStudent,
        addParent,
        getParents,
        linkParentToStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
