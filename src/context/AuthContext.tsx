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
  addStudent: (student: StudentProfile) => Promise<{ success: boolean; password?: string; error?: string }>;
  addParent: (parent: ParentProfile) => Promise<{ success: boolean; password?: string; error?: string }>;
  getParents: () => ParentProfile[];
  linkParentToStudent: (parentId: string, studentId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AnyUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // In live mode, start with empty arrays - data comes from Supabase
  // In demo mode, use demo data
  const [students, setStudents] = useState<StudentProfile[]>(isDemoMode ? demoStudents : []);
  const [parents, setParents] = useState<ParentProfile[]>(isDemoMode ? demoParents : []);
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

  // Fetch students from Supabase for a tutor
  const fetchStudents = async (tutorId: string) => {
    if (isDemoMode) return;

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('tutor_id', tutorId);

    if (error) {
      console.error('Error fetching students:', error);
      return;
    }

    if (data) {
      // Convert Supabase student data to StudentProfile format
      const studentProfiles: StudentProfile[] = data.map(s => ({
        id: s.id,
        email: '', // Will need to fetch from profiles
        name: s.user_id, // Placeholder - would join with profiles
        role: 'student' as const,
        password: '',
        yearGroup: s.year_group,
        subjects: s.subjects || [],
        parentId: '',
        tutorId: s.tutor_id,
        points: s.total_points || 0,
        level: 1,
        avatar: { baseCharacter: 'astronaut', unlockedItems: [] },
        stats: {
          overallProgress: s.overall_progress || 0,
          subjectStats: [],
          strengths: s.strengths || [],
          weaknesses: s.weaknesses || [],
          improvements: [],
          weeklyProgress: [],
        },
        achievements: s.achievements || [],
      }));
      setStudents(studentProfiles);
    }
  };

  // Fetch parents from Supabase
  const fetchParents = async () => {
    if (isDemoMode) return;

    const { data, error } = await supabase
      .from('parents')
      .select('*');

    if (error) {
      console.error('Error fetching parents:', error);
      return;
    }

    if (data) {
      const parentProfiles: ParentProfile[] = data.map(p => ({
        id: p.id,
        email: '',
        name: p.user_id,
        role: 'parent' as const,
        password: '',
        childrenIds: p.student_ids || [],
      }));
      setParents(parentProfiles);
    }
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

            // If tutor, fetch their students and parents
            if (userProfile.role === 'tutor') {
              await fetchStudents(initialSession.user.id);
              await fetchParents();
            }
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

            // If tutor, fetch their students and parents
            if (userProfile.role === 'tutor') {
              await fetchStudents(currentSession.user.id);
              await fetchParents();
            }
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
    // In live mode, check current user, students, and parents
    if (user?.id === id) return user;
    const student = students.find(s => s.id === id);
    if (student) return student;
    const parent = parents.find(p => p.id === id);
    if (parent) return parent;
    return undefined;
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

  // Generate password from day + date (e.g., "Sunday08")
  const generatePassword = (): string => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[now.getDay()];
    const date = String(now.getDate()).padStart(2, '0');
    return `${day}${date}`;
  };

  const addStudent = async (student: StudentProfile): Promise<{ success: boolean; password?: string; error?: string }> => {
    // Generate password
    const generatedPassword = generatePassword();

    // If in live mode, create auth user and save to Supabase
    if (!isDemoMode && user?.role === 'tutor') {
      try {
        // Create auth user via signUp
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: student.email,
          password: generatedPassword,
          options: {
            data: {
              name: student.name,
              role: 'student',
              must_change_password: true,
            },
          },
        });

        if (authError) {
          console.error('Error creating student auth:', authError);
          return { success: false, error: authError.message };
        }

        if (authData?.user) {
          // Insert student record linked to auth user
          const { error: insertError } = await supabase.from('students').insert({
            id: authData.user.id,
            user_id: authData.user.id,
            tutor_id: user.id,
            year_group: student.yearGroup,
            subjects: student.subjects,
            overall_progress: 0,
            total_points: 0,
          });

          if (insertError) {
            console.error('Error inserting student record:', insertError);
            return { success: false, error: insertError.message };
          }

          // Update local state with the new student (using auth user id)
          const newStudent: StudentProfile = {
            ...student,
            id: authData.user.id,
          };
          setStudents(prev => [...prev, newStudent]);

          return { success: true, password: generatedPassword };
        }

        return { success: false, error: 'Failed to create user' };
      } catch (error) {
        console.error('Error saving student to Supabase:', error);
        return { success: false, error: 'An unexpected error occurred' };
      }
    } else {
      // Demo mode - just update local state
      setStudents(prev => [...prev, student]);
      return { success: true, password: generatedPassword };
    }
  };

  const addParent = async (parent: ParentProfile): Promise<{ success: boolean; password?: string; error?: string }> => {
    // Generate password
    const generatedPassword = generatePassword();

    // If in live mode, create auth user and save to Supabase
    if (!isDemoMode && user?.role === 'tutor') {
      try {
        // Create auth user via signUp
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: parent.email,
          password: generatedPassword,
          options: {
            data: {
              name: parent.name,
              role: 'parent',
              must_change_password: true,
            },
          },
        });

        if (authError) {
          console.error('Error creating parent auth:', authError);
          return { success: false, error: authError.message };
        }

        if (authData?.user) {
          // Insert parent record
          const { error: insertError } = await supabase.from('parents').insert({
            id: authData.user.id,
            user_id: authData.user.id,
            student_ids: parent.childrenIds || [],
          });

          if (insertError) {
            console.error('Error inserting parent record:', insertError);
            return { success: false, error: insertError.message };
          }

          // Update local state with the new parent
          const newParent: ParentProfile = {
            ...parent,
            id: authData.user.id,
          };
          setParents(prev => [...prev, newParent]);

          return { success: true, password: generatedPassword };
        }

        return { success: false, error: 'Failed to create user' };
      } catch (error) {
        console.error('Error saving parent to Supabase:', error);
        return { success: false, error: 'An unexpected error occurred' };
      }
    } else {
      // Demo mode - just update local state
      setParents(prev => [...prev, parent]);
      return { success: true, password: generatedPassword };
    }
  };

  const linkParentToStudent = async (parentId: string, studentId: string) => {
    // Update local state
    setStudents(prev => prev.map(s =>
      s.id === studentId ? { ...s, parentId } : s
    ));
    setParents(prev => prev.map(p =>
      p.id === parentId
        ? { ...p, childrenIds: [...(p.childrenIds || []), studentId] }
        : p
    ));

    // If in live mode, update Supabase
    if (!isDemoMode) {
      try {
        // Get current parent's student_ids
        const { data: parentData } = await supabase
          .from('parents')
          .select('student_ids')
          .eq('id', parentId)
          .single();

        const currentIds = parentData?.student_ids || [];

        // Update parent's student_ids
        await supabase
          .from('parents')
          .update({ student_ids: [...currentIds, studentId] })
          .eq('id', parentId);
      } catch (error) {
        console.error('Error linking parent to student in Supabase:', error);
      }
    }
  };

  const getTutor = (): TutorProfile => {
    if (user?.role === 'tutor') {
      return user as TutorProfile;
    }
    // Only return demo tutor in demo mode
    if (isDemoMode) {
      return demoTutor;
    }
    // In live mode, return a placeholder (should be logged in as tutor)
    return {
      id: '',
      email: '',
      name: 'Not logged in',
      role: 'tutor',
      password: '',
      subjects: [],
      qualifications: [],
    } as TutorProfile;
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
