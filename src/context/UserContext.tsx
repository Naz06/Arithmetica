import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, StudentProfile, TutorProfile, ParentProfile } from '../../types';

interface UserContextType {
  user: User | null;
  student: StudentProfile | null;
  tutor: TutorProfile | null;
  parent: ParentProfile | null;
  isLoading: boolean;
  updateUser: (user: User) => void;
  loadUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [parent, setParent] = useState<ParentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);

    try {
      if (user.role === 'student') {
        const studentData = await fetchStudentData(user.id);
        setStudent(studentData);
      } else if (user.role === 'tutor') {
        const tutorData = await fetchTutorData(user.id);
        setTutor(tutorData);
      } else if (user.role === 'parent') {
        const parentData = await fetchParentData(user.id);
        setParent(parentData);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <UserContext.Provider value={{
      user,
      student,
      tutor,
      parent,
      isLoading,
      updateUser,
      loadUserData,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

async function fetchStudentData(userId: string): Promise<StudentProfile> {
  const response = await fetch(`/api/students/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch student');
  return response.json();
}

async function fetchTutorData(userId: string): Promise<TutorProfile> {
  const response = await fetch(`/api/tutors/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch tutor');
  return response.json();
}

async function fetchParentData(userId: string): Promise<ParentProfile> {
  const response = await fetch(`/api/parents/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch parent');
  return response.json();
}
