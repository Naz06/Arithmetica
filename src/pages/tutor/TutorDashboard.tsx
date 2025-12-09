import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { StatCard } from '../../components/shared/StatCard';
import { Calendar, UpcomingEvents } from '../../components/shared/Calendar';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Chat, ChatList } from '../../components/shared/Chat';
import { FeatureSettingsPanel } from '../../components/tutor/FeatureSettingsPanel';
import { PenaltyManagement } from '../../components/tutor/PenaltyManagement';
import { BonusManagement } from '../../components/tutor/BonusManagement';
import { TopicMasteryManagement } from '../../components/tutor/TopicMasteryManagement';
import { Leaderboard } from '../../components/shared/Leaderboard';
import {
  Users,
  BookOpen,
  Calendar as CalendarIcon,
  TrendingUp,
  FileText,
  MessageCircle,
  Plus,
  Eye,
  Send,
  Clock,
  Target,
  Award,
  Settings,
  Bell,
  Shield,
  Trash2,
  X,
  UserPlus,
  Key,
  CheckCircle,
  AlertCircle,
  MapPin,
  Sparkles,
  ListChecks,
  ClipboardCheck,
  AlertTriangle,
  Gift,
  Trophy,
  Upload,
  File,
  Loader2,
  BarChart3,
} from 'lucide-react';
import { StudentProfile, ParentProfile, Resource, ScheduleEvent, Subject, YearGroup, ResourceLevel, ResourceSubtype, Notification } from '../../types';
import { adminService, UserRecord, CreateUserData } from '../../services/adminService';
import { resourceService } from '../../services/resourceService';

export const TutorDashboard: React.FC = () => {
  const location = useLocation();
  const { getAllStudents, getParentById, updateStudent, user, addStudent, addParent, getParents, linkParentToStudent } = useAuth();
  const {
    schedule,
    getScheduleByTutorId,
    resources,
    addResource,
    addScheduleEvent,
    updateScheduleEvent,
    notifications,
    getNotificationsByUserId,
    getUnreadNotificationCount,
    markNotificationAsRead,
    deleteNotification,
  } = useData();

  const students = getAllStudents();
  const tutorSchedule = getScheduleByTutorId('tutor-001');
  const tutorId = user?.id || 'tutor-001';
  const tutorNotifications = getNotificationsByUserId(tutorId);
  const unreadCount = getUnreadNotificationCount(tutorId);

  // Modal states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsStudent, setAnalyticsStudent] = useState<StudentProfile | null>(null);
  const [showAssessmentsModal, setShowAssessmentsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showTopicMasteryModal, setShowTopicMasteryModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [selectedChatContact, setSelectedChatContact] = useState<{ id: string; name: string } | null>(null);

  // Edit strengths/weaknesses state
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [editStrengths, setEditStrengths] = useState<string[]>([]);
  const [editWeaknesses, setEditWeaknesses] = useState<string[]>([]);
  const [newStrength, setNewStrength] = useState('');
  const [newWeakness, setNewWeakness] = useState('');
  const [isSavingSkills, setIsSavingSkills] = useState(false);

  // Assessment editing state
  const [assessmentStudent, setAssessmentStudent] = useState<StudentProfile | null>(null);
  const [editAverageScore, setEditAverageScore] = useState(0);
  const [editCompletedAssignments, setEditCompletedAssignments] = useState(0);
  const [editTotalSessions, setEditTotalSessions] = useState(0);
  const [editAttendanceRate, setEditAttendanceRate] = useState(0);
  const [isSavingAssessment, setIsSavingAssessment] = useState(false);
  const [assessmentSaveSuccess, setAssessmentSaveSuccess] = useState(false);

  // Admin states
  const [adminUsers, setAdminUsers] = useState<UserRecord[]>([]);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [adminMessage, setAdminMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create user form state
  const [newUserRole, setNewUserRole] = useState<'student' | 'parent'>('student');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserYearGroup, setNewUserYearGroup] = useState<YearGroup>('gcse');
  const [newUserSubjects, setNewUserSubjects] = useState<Subject[]>(['mathematics']);
  const [newUserParentId, setNewUserParentId] = useState('');
  const [newUserChildId, setNewUserChildId] = useState('');
  const [createUserSuccess, setCreateUserSuccess] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [createUserError, setCreateUserError] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Handle URL-based navigation for sidebar items
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/students')) {
      setSelectedStudent(null); // Start with no student selected - show list first
      setShowStudentModal(true);
    } else if (path.includes('/resources')) {
      setShowResourceModal(true);
    } else if (path.includes('/messages')) {
      setShowChatModal(true);
    } else if (path.includes('/analytics')) {
      setShowAnalyticsModal(true);
    } else if (path.includes('/assessments')) {
      setShowAssessmentsModal(true);
    } else if (path.includes('/settings')) {
      setShowSettingsModal(true);
    } else if (path.includes('/notifications')) {
      setShowNotificationsModal(true);
    } else if (path.includes('/admin')) {
      loadAdminData();
      setShowAdminModal(true);
    } else if (path.includes('/penalties')) {
      setShowPenaltyModal(true);
    } else if (path.includes('/bonuses') || path.includes('/rewards')) {
      setShowBonusModal(true);
    } else if (path.includes('/topic-mastery') || path.includes('/skill-tree')) {
      setShowTopicMasteryModal(true);
    } else if (path.includes('/leaderboard')) {
      setShowLeaderboardModal(true);
    }
  }, [location.pathname]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
    };

    if (showNotificationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationDropdown]);

  // Load admin data
  const loadAdminData = async () => {
    setIsLoadingAdmin(true);
    try {
      const usersData = await adminService.getAllUsers();
      setAdminUsers(usersData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }
    setIsLoadingAdmin(false);
  };

  // Form states
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'worksheet' as Resource['type'],
    subject: 'mathematics' as Subject,
    topic: '',
    studentIds: [] as string[],
    level: 'gcse' as ResourceLevel,
    subtype: 'workbook' as ResourceSubtype,
  });
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [isUploadingResource, setIsUploadingResource] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    subject: 'mathematics' as Subject,
    date: '',
    startTime: '',
    endTime: '',
    location: "Student's Home",
    studentId: '',
    notes: '',
    // Lesson plan fields
    objectives: [''],
    topics: [''],
    resources: '',
    homework: '',
  });

  // Session notes state for completing sessions
  const [sessionNotes, setSessionNotes] = useState({
    summary: '',
    topicsCovered: [''],
    studentPerformance: 'good' as 'excellent' | 'good' | 'needs-improvement',
    tutorNotes: '',
    nextSteps: '',
    homeworkAssigned: '',
  });
  const [showCompleteSessionForm, setShowCompleteSessionForm] = useState(false);

  const handleAddResource = async () => {
    setIsUploadingResource(true);

    let fileUrl: string | undefined;

    // Upload file if one was selected
    if (resourceFile) {
      const timestamp = Date.now();
      const sanitizedName = resourceFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user?.id || 'tutor'}/${timestamp}-${sanitizedName}`;

      const uploadedUrl = await resourceService.uploadFile(resourceFile, filePath);
      if (uploadedUrl) {
        fileUrl = uploadedUrl;
      }
    }

    const resource: Resource = {
      id: `resource-${Date.now()}`,
      ...newResource,
      fileUrl,
      createdAt: new Date().toISOString().split('T')[0],
      tutorId: user?.id || 'tutor-001',
    };

    addResource(resource);
    setShowResourceModal(false);
    setIsUploadingResource(false);
    setResourceFile(null);
    setNewResource({
      title: '',
      description: '',
      type: 'worksheet',
      subject: 'mathematics',
      topic: '',
      studentIds: [],
      level: 'gcse',
      subtype: 'workbook',
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResourceFile(file);
      // Auto-fill title from filename if empty
      if (!newResource.title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setNewResource(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  };

  // Notification helpers
  const getNotificationTypeLabel = (type?: string) => {
    switch (type) {
      case 'update': return 'Update';
      case 'todo': return 'To-Do';
      case 'specifics': return 'Specifics';
      case 'homework-help': return 'Homework Help';
      case 'feedback-request': return 'Feedback Request';
      default: return 'Notification';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id);
  };

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotification(notificationId);
  };

  // Create new user
  const handleCreateUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    setIsCreatingUser(true);
    setCreateUserError(null);

    try {
      if (newUserRole === 'student') {
        const newStudent: StudentProfile = {
          id: `student-${Date.now()}`,
          email: newUserEmail,
          password: '',
          name: newUserName,
          role: 'student',
          createdAt: new Date().toISOString(),
          yearGroup: newUserYearGroup,
          subjects: newUserSubjects,
          parentId: newUserParentId || undefined,
          tutorId: user?.id || 'tutor-001',
          points: 0,
          level: 1,
          avatar: {
            baseCharacter: 'default',
            outfit: 'default',
            accessory: 'none',
            background: 'default',
            badge: 'none',
            unlockedItems: [],
          },
          stats: {
            overallProgress: 0,
            subjectStats: newUserSubjects.map(subject => ({
              subject,
              progress: 0,
              grade: 'N/A',
              topicsCompleted: 0,
              totalTopics: 10,
              recentScores: [],
            })),
            strengths: [],
            weaknesses: [],
            improvements: [],
            weeklyProgress: [],
            totalSessions: 0,
            completedAssignments: 0,
            averageScore: 0,
          },
          schedule: [],
        };

        const result = await addStudent(newStudent);

        if (!result.success) {
          setCreateUserError(result.error || 'Failed to create student');
          setIsCreatingUser(false);
          return;
        }

        // Store credentials to display
        setGeneratedCredentials({ email: newUserEmail, password: result.password || '' });

        // If parent is selected, link them
        if (newUserParentId && result.success) {
          linkParentToStudent(newUserParentId, newStudent.id);
        }
      } else {
        // Creating a parent
        const newParent: ParentProfile = {
          id: `parent-${Date.now()}`,
          email: newUserEmail,
          password: '',
          name: newUserName,
          role: 'parent',
          createdAt: new Date().toISOString(),
          childrenIds: newUserChildId ? [newUserChildId] : [],
          tutorId: user?.id || 'tutor-001',
        };

        const result = await addParent(newParent);

        if (!result.success) {
          setCreateUserError(result.error || 'Failed to create parent');
          setIsCreatingUser(false);
          return;
        }

        // Store credentials to display
        setGeneratedCredentials({ email: newUserEmail, password: result.password || '' });

        // If child is selected, link them
        if (newUserChildId && result.success) {
          linkParentToStudent(newParent.id, newUserChildId);
        }
      }

      setCreateUserSuccess(true);
      setIsCreatingUser(false);
    } catch (error) {
      setCreateUserError('An unexpected error occurred');
      setIsCreatingUser(false);
    }
  };

  const resetCreateUserForm = () => {
    setNewUserRole('student');
    setNewUserName('');
    setNewUserEmail('');
    setNewUserYearGroup('gcse');
    setNewUserSubjects(['mathematics']);
    setNewUserParentId('');
    setNewUserChildId('');
    setGeneratedCredentials(null);
    setCreateUserError(null);
    setCreateUserSuccess(false);
  };

  const handleAddEvent = () => {
    // Filter out empty objectives and topics
    const filteredObjectives = newEvent.objectives.filter(o => o.trim() !== '');
    const filteredTopics = newEvent.topics.filter(t => t.trim() !== '');
    const filteredResources = newEvent.resources.split(',').map(r => r.trim()).filter(r => r !== '');

    const event: ScheduleEvent = {
      id: `event-${Date.now()}`,
      title: newEvent.title,
      subject: newEvent.subject,
      date: newEvent.date,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      location: newEvent.location,
      studentId: newEvent.studentId,
      notes: newEvent.notes,
      tutorId: 'tutor-001',
      status: 'scheduled',
      lessonPlan: (filteredObjectives.length > 0 || filteredTopics.length > 0) ? {
        objectives: filteredObjectives,
        topics: filteredTopics,
        resources: filteredResources.length > 0 ? filteredResources : undefined,
        homework: newEvent.homework.trim() || undefined,
      } : undefined,
    };
    addScheduleEvent(event);
    setShowEventModal(false);
    resetEventForm();
  };

  const resetEventForm = () => {
    setNewEvent({
      title: '',
      subject: 'mathematics',
      date: '',
      startTime: '',
      endTime: '',
      location: "Student's Home",
      studentId: '',
      notes: '',
      objectives: [''],
      topics: [''],
      resources: '',
      homework: '',
    });
  };

  const resetSessionNotes = () => {
    setSessionNotes({
      summary: '',
      topicsCovered: [''],
      studentPerformance: 'good',
      tutorNotes: '',
      nextSteps: '',
      homeworkAssigned: '',
    });
    setShowCompleteSessionForm(false);
  };

  // Helper functions for dynamic objective/topic inputs
  const addObjective = () => {
    setNewEvent(prev => ({ ...prev, objectives: [...prev.objectives, ''] }));
  };

  const updateObjective = (index: number, value: string) => {
    setNewEvent(prev => ({
      ...prev,
      objectives: prev.objectives.map((o, i) => i === index ? value : o),
    }));
  };

  const removeObjective = (index: number) => {
    if (newEvent.objectives.length > 1) {
      setNewEvent(prev => ({
        ...prev,
        objectives: prev.objectives.filter((_, i) => i !== index),
      }));
    }
  };

  const addTopic = () => {
    setNewEvent(prev => ({ ...prev, topics: [...prev.topics, ''] }));
  };

  const updateTopic = (index: number, value: string) => {
    setNewEvent(prev => ({
      ...prev,
      topics: prev.topics.map((t, i) => i === index ? value : t),
    }));
  };

  const removeTopic = (index: number) => {
    if (newEvent.topics.length > 1) {
      setNewEvent(prev => ({
        ...prev,
        topics: prev.topics.filter((_, i) => i !== index),
      }));
    }
  };

  // Helper functions for session notes topics
  const addTopicCovered = () => {
    setSessionNotes(prev => ({ ...prev, topicsCovered: [...prev.topicsCovered, ''] }));
  };

  const updateTopicCovered = (index: number, value: string) => {
    setSessionNotes(prev => ({
      ...prev,
      topicsCovered: prev.topicsCovered.map((t, i) => i === index ? value : t),
    }));
  };

  const removeTopicCovered = (index: number) => {
    if (sessionNotes.topicsCovered.length > 1) {
      setSessionNotes(prev => ({
        ...prev,
        topicsCovered: prev.topicsCovered.filter((_, i) => i !== index),
      }));
    }
  };

  // Handle completing a session with notes
  const handleCompleteSession = async () => {
    if (!selectedEvent) return;

    const filteredTopics = sessionNotes.topicsCovered.filter(t => t.trim() !== '');

    const updatedEvent: ScheduleEvent = {
      ...selectedEvent,
      status: 'completed',
      sessionNotes: {
        summary: sessionNotes.summary,
        topicsCovered: filteredTopics,
        studentPerformance: sessionNotes.studentPerformance,
        tutorNotes: sessionNotes.tutorNotes || undefined,
        nextSteps: sessionNotes.nextSteps || undefined,
        homeworkAssigned: sessionNotes.homeworkAssigned || undefined,
      },
    };

    await updateScheduleEvent(updatedEvent);
    setSelectedEvent(updatedEvent);
    resetSessionNotes();
  };

  // Skill editing handlers
  const handleStartEditingSkills = () => {
    if (selectedStudent) {
      setEditStrengths([...selectedStudent.stats.strengths]);
      setEditWeaknesses([...selectedStudent.stats.weaknesses]);
      setIsEditingSkills(true);
    }
  };

  const handleCancelEditingSkills = () => {
    setIsEditingSkills(false);
    setNewStrength('');
    setNewWeakness('');
  };

  const handleAddStrength = () => {
    if (newStrength.trim() && !editStrengths.includes(newStrength.trim())) {
      setEditStrengths([...editStrengths, newStrength.trim()]);
      setNewStrength('');
    }
  };

  const handleRemoveStrength = (index: number) => {
    setEditStrengths(editStrengths.filter((_, i) => i !== index));
  };

  const handleAddWeakness = () => {
    if (newWeakness.trim() && !editWeaknesses.includes(newWeakness.trim())) {
      setEditWeaknesses([...editWeaknesses, newWeakness.trim()]);
      setNewWeakness('');
    }
  };

  const handleRemoveWeakness = (index: number) => {
    setEditWeaknesses(editWeaknesses.filter((_, i) => i !== index));
  };

  const handleSaveSkills = async () => {
    if (!selectedStudent) return;
    setIsSavingSkills(true);
    try {
      await updateStudent(selectedStudent.id, {
        strengths: editStrengths,
        weaknesses: editWeaknesses,
      });
      // Update local state
      setSelectedStudent({
        ...selectedStudent,
        stats: {
          ...selectedStudent.stats,
          strengths: editStrengths,
          weaknesses: editWeaknesses,
        },
      });
      setIsEditingSkills(false);
      setNewStrength('');
      setNewWeakness('');
    } catch (error) {
      console.error('Failed to save skills:', error);
    } finally {
      setIsSavingSkills(false);
    }
  };

  // Assessment editing handlers
  const handleEditAssessment = (student: StudentProfile) => {
    setAssessmentStudent(student);
    setEditAverageScore(student.stats?.averageScore || 0);
    setEditCompletedAssignments(student.stats?.completedAssignments || 0);
    setEditTotalSessions(student.stats?.totalSessions || 0);
    setEditAttendanceRate(student.stats?.attendanceRate || 100);
    setAssessmentSaveSuccess(false);
  };

  const handleCancelAssessmentEdit = () => {
    setAssessmentStudent(null);
    setAssessmentSaveSuccess(false);
  };

  const handleSaveAssessment = async () => {
    if (!assessmentStudent) return;
    setIsSavingAssessment(true);
    setAssessmentSaveSuccess(false);
    try {
      await updateStudent(assessmentStudent.id, {
        average_score: editAverageScore,
        completed_assignments: editCompletedAssignments,
        total_sessions: editTotalSessions,
        attendance_rate: editAttendanceRate,
      });
      setAssessmentSaveSuccess(true);
      // Clear success message after 2 seconds
      setTimeout(() => setAssessmentSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save assessment:', error);
    } finally {
      setIsSavingAssessment(false);
    }
  };

  const chatContacts = [
    ...students.map(s => ({ id: s.id, name: s.name, role: 'Student', lastMessage: 'Last message...' })),
    ...students
      .filter(s => s.parentId)
      .map(s => {
        const parent = getParentById(s.parentId!);
        return parent ? { id: parent.id, name: parent.name, role: 'Parent', lastMessage: 'Last message...' } : null;
      })
      .filter(Boolean) as { id: string; name: string; role: string; lastMessage: string }[],
  ];

  const getYearGroupLabel = (yg: YearGroup): string => {
    const labels: Record<YearGroup, string> = {
      year5: 'Year 5',
      year6: 'Year 6',
      gcse: 'GCSE',
      alevel: 'A-Level',
    };
    return labels[yg];
  };

  // Check if we're on the schedule page or analytics page
  const isSchedulePage = location.pathname.includes('/schedule');
  const isAnalyticsPage = location.pathname.includes('/analytics');

  // Get page title and description
  const getPageInfo = () => {
    if (isSchedulePage) return { title: 'Schedule', description: 'Manage your tutoring sessions' };
    if (isAnalyticsPage) return { title: 'Analytics & Insights', description: 'Deep dive into student performance data' };
    return { title: 'Tutor Dashboard', description: 'Manage your students and track their progress' };
  };
  const pageInfo = getPageInfo();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-100 font-['Space_Grotesk']">
              {pageInfo.title}
            </h1>
            <p className="text-neutral-400 mt-1">
              {pageInfo.description}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {/* Notification Bell */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="relative p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors"
              >
                <Bell className="w-5 h-5 text-neutral-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {/* Notification Dropdown */}
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
                    <h3 className="font-semibold text-neutral-100">Notifications</h3>
                    <button
                      onClick={() => {
                        setShowNotificationDropdown(false);
                        setShowNotificationsModal(true);
                      }}
                      className="text-xs text-primary-500 hover:text-primary-400"
                    >
                      View All
                    </button>
                  </div>
                  {tutorNotifications.length === 0 ? (
                    <div className="p-4 text-center text-neutral-500 text-sm">
                      No notifications
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {tutorNotifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-3 border-b border-neutral-800 hover:bg-neutral-800/50 cursor-pointer ${
                            !notification.read ? 'bg-primary-500/5' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-primary-500' : 'bg-neutral-600'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-100 truncate">
                                {notification.fromName && `${notification.fromName}: `}{getNotificationTypeLabel(notification.notificationType)}
                              </p>
                              <p className="text-xs text-neutral-400 truncate">{notification.message}</p>
                              <p className="text-xs text-neutral-500 mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowLeaderboardModal(true)}
              icon={<Trophy className="w-4 h-4" />}
              className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10"
            >
              Leaderboard
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowTopicMasteryModal(true)}
              icon={<Sparkles className="w-4 h-4" />}
              className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10"
            >
              Topic Mastery
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowBonusModal(true)}
              icon={<Gift className="w-4 h-4" />}
              className="text-green-400 border-green-500/30 hover:bg-green-500/10"
            >
              Bonuses
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowPenaltyModal(true)}
              icon={<AlertTriangle className="w-4 h-4" />}
              className="text-orange-400 border-orange-500/30 hover:bg-orange-500/10"
            >
              Penalties
            </Button>
            <Button variant="secondary" onClick={() => setShowEventModal(true)} icon={<CalendarIcon className="w-4 h-4" />}>
              Schedule Session
            </Button>
            <Button variant="primary" onClick={() => setShowResourceModal(true)} icon={<Plus className="w-4 h-4" />}>
              Add Resource
            </Button>
          </div>
        </div>

        {/* Inline Schedule View - shown when on /tutor/schedule */}
        {isSchedulePage ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar View - spans 2 columns on large screens */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <Calendar
                events={tutorSchedule}
                editable={true}
                onAddEvent={(date) => {
                  setNewEvent({ ...newEvent, date });
                  setShowAddEventForm(true);
                  setSelectedEvent(null);
                  setShowEventModal(true);
                }}
                onEventClick={(event) => {
                  setSelectedEvent(event);
                  setShowAddEventForm(false);
                  setShowEventModal(true);
                }}
              />
              <p className="text-xs text-neutral-500 mt-2 text-center">
                Click on a date to add a session, or click on an event to view details
              </p>
            </div>

            {/* Side Panel - Upcoming Events + Quick Add */}
            <div className="space-y-6 order-1 lg:order-2">
              {/* Quick Add Button */}
              <Card>
                <CardContent className="p-4">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setNewEvent({ ...newEvent, date: today });
                      setShowAddEventForm(true);
                      setSelectedEvent(null);
                      setShowEventModal(true);
                    }}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Add New Session
                  </Button>
                </CardContent>
              </Card>

              {/* Upcoming Sessions */}
              <UpcomingEvents
                events={tutorSchedule}
                limit={8}
                onEventClick={(event) => {
                  setSelectedEvent(event);
                  setShowAddEventForm(false);
                  setShowEventModal(true);
                }}
              />

              {/* Session Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Session Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Scheduled</span>
                    <Badge variant="info">{tutorSchedule.filter(e => e.status === 'scheduled').length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Completed</span>
                    <Badge variant="success">{tutorSchedule.filter(e => e.status === 'completed').length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Cancelled</span>
                    <Badge variant="error">{tutorSchedule.filter(e => e.status === 'cancelled').length}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : isAnalyticsPage ? (
          /* ============ COMPREHENSIVE ANALYTICS PAGE ============ */
          <div className="space-y-6">
            {/* Student Selector */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setAnalyticsStudent(null)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      !analyticsStudent ? 'bg-primary-500 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    All Students Overview
                  </button>
                  {students.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setAnalyticsStudent(s)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        analyticsStudent?.id === s.id ? 'bg-primary-500 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {!analyticsStudent ? (
              /* ===== ALL STUDENTS OVERVIEW ===== */
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Class Performance Summary */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary-500" />
                      Class Performance by Subject
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'].map(subject => {
                        const avgScore = students.length > 0
                          ? Math.round(students.reduce((acc, s) => {
                              const subjectStat = s.stats?.subjectStats?.find(ss => ss.subject === subject);
                              return acc + (subjectStat?.score || s.stats?.averageScore || 70);
                            }, 0) / students.length)
                          : 0;
                        return (
                          <div key={subject} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-neutral-300">{subject}</span>
                              <span className={`font-medium ${avgScore >= 80 ? 'text-green-400' : avgScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {avgScore}% avg
                              </span>
                            </div>
                            <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${avgScore >= 80 ? 'bg-green-500' : avgScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${avgScore}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Class Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-400">Avg Score</span>
                        <span className="text-lg font-bold text-primary-500">
                          {students.length > 0 ? Math.round(students.reduce((a, s) => a + (s.stats?.averageScore || 0), 0) / students.length) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-400">Avg Attendance</span>
                        <span className="text-lg font-bold text-green-400">
                          {students.length > 0 ? Math.round(students.reduce((a, s) => a + (s.stats?.attendanceRate || 100), 0) / students.length) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-400">Total Sessions</span>
                        <span className="text-lg font-bold text-purple-400">
                          {students.reduce((a, s) => a + (s.stats?.totalSessions || 0), 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-400">Assignments Done</span>
                        <span className="text-lg font-bold text-yellow-400">
                          {students.reduce((a, s) => a + (s.stats?.completedAssignments || 0), 0)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Attention Needed */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        Needs Attention
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {students
                          .filter(s => (s.stats?.averageScore || 100) < 60 || (s.stats?.attendanceRate || 100) < 75)
                          .slice(0, 3)
                          .map(s => (
                            <button
                              key={s.id}
                              onClick={() => setAnalyticsStudent(s)}
                              className="w-full flex items-center justify-between p-2 bg-neutral-800/50 rounded-lg hover:bg-neutral-700/50 transition-colors"
                            >
                              <span className="text-sm text-neutral-300">{s.name}</span>
                              <Badge variant="warning" size="sm">
                                {(s.stats?.averageScore || 0) < 60 ? 'Low Score' : 'Low Attendance'}
                              </Badge>
                            </button>
                          ))
                        }
                        {students.filter(s => (s.stats?.averageScore || 100) < 60 || (s.stats?.attendanceRate || 100) < 75).length === 0 && (
                          <p className="text-sm text-neutral-500 text-center py-2">All students on track!</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Improvement Rankings */}
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      Student Performance Rankings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-xs text-neutral-500 uppercase">
                            <th className="pb-3 pr-4">Student</th>
                            <th className="pb-3 pr-4">Avg Score</th>
                            <th className="pb-3 pr-4">Attendance</th>
                            <th className="pb-3 pr-4">Sessions</th>
                            <th className="pb-3 pr-4">Assignments</th>
                            <th className="pb-3 pr-4">Streak</th>
                            <th className="pb-3">Trend</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                          {[...students]
                            .sort((a, b) => (b.stats?.averageScore || 0) - (a.stats?.averageScore || 0))
                            .map((s, i) => {
                              const weeklyProgress = Array.isArray(s.stats?.weeklyProgress) ? s.stats.weeklyProgress : [];
                              const trend = weeklyProgress.length >= 2
                                ? (weeklyProgress[weeklyProgress.length - 1] || 0) - (weeklyProgress[0] || 0)
                                : 0;
                              return (
                                <tr key={s.id} className="hover:bg-neutral-800/30 cursor-pointer" onClick={() => setAnalyticsStudent(s)}>
                                  <td className="py-3 pr-4">
                                    <div className="flex items-center gap-2">
                                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-neutral-400 text-black' : i === 2 ? 'bg-orange-600 text-white' : 'bg-neutral-700 text-neutral-300'}`}>
                                        {i + 1}
                                      </span>
                                      <span className="text-neutral-100">{s.name}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 pr-4">
                                    <span className={`font-medium ${(s.stats?.averageScore || 0) >= 80 ? 'text-green-400' : (s.stats?.averageScore || 0) >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                      {s.stats?.averageScore || 0}%
                                    </span>
                                  </td>
                                  <td className="py-3 pr-4 text-neutral-300">{s.stats?.attendanceRate || 100}%</td>
                                  <td className="py-3 pr-4 text-neutral-300">{s.stats?.totalSessions || 0}</td>
                                  <td className="py-3 pr-4 text-neutral-300">{s.stats?.completedAssignments || 0}</td>
                                  <td className="py-3 pr-4 text-neutral-300">{s.stats?.streakDays || s.stats?.currentStreak || 0} days</td>
                                  <td className="py-3">
                                    <span className={`flex items-center gap-1 ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-neutral-500'}`}>
                                      {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                      {students.length === 0 && (
                        <p className="text-center text-neutral-500 py-8">No students enrolled yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* ===== INDIVIDUAL STUDENT DEEP DIVE ===== */
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Student Header */}
                <Card className="lg:col-span-3">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar name={analyticsStudent.name} size="lg" />
                        <div>
                          <h2 className="text-xl font-bold text-neutral-100">{analyticsStudent.name}</h2>
                          <p className="text-neutral-400">{getYearGroupLabel(analyticsStudent.yearGroup)} • {analyticsStudent.subjects.join(', ')}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        {(() => {
                          const riskScore =
                            ((analyticsStudent.stats?.attendanceRate || 100) < 80 ? 2 : 0) +
                            ((analyticsStudent.stats?.averageScore || 100) < 60 ? 2 : 0) +
                            ((analyticsStudent.stats?.streakDays || 0) < 2 ? 1 : 0);
                          const riskLevel = riskScore >= 4 ? 'high' : riskScore >= 2 ? 'medium' : 'low';
                          return (
                            <Badge
                              variant={riskLevel === 'high' ? 'error' : riskLevel === 'medium' ? 'warning' : 'success'}
                              className="flex items-center gap-1"
                            >
                              {riskLevel === 'high' ? <AlertTriangle className="w-3 h-3" /> :
                               riskLevel === 'medium' ? <AlertCircle className="w-3 h-3" /> :
                               <CheckCircle className="w-3 h-3" />}
                              {riskLevel === 'high' ? 'Needs Attention' : riskLevel === 'medium' ? 'Monitor' : 'On Track'}
                            </Badge>
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics */}
                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-primary-500">{analyticsStudent.stats?.overallProgress || 0}%</p>
                      <p className="text-sm text-neutral-400">Overall Progress</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-purple-400">{analyticsStudent.stats?.averageScore || 0}%</p>
                      <p className="text-sm text-neutral-400">Average Score</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-green-400">{analyticsStudent.stats?.attendanceRate || 100}%</p>
                      <p className="text-sm text-neutral-400">Attendance</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-yellow-400">{analyticsStudent.stats?.streakDays || analyticsStudent.stats?.currentStreak || 0}</p>
                      <p className="text-sm text-neutral-400">Day Streak</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Subject Performance */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary-500" />
                      Subject Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(analyticsStudent.stats?.subjectStats && analyticsStudent.stats.subjectStats.length > 0
                        ? analyticsStudent.stats.subjectStats
                        : analyticsStudent.subjects.map(sub => ({ subject: sub, score: analyticsStudent.stats?.averageScore || 75, progress: analyticsStudent.stats?.overallProgress || 50 }))
                      ).map((stat: any, i: number) => (
                        <div key={i} className="p-4 bg-neutral-800/50 rounded-xl">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-neutral-100">{stat.subject}</span>
                            <span className={`font-bold ${stat.score >= 80 ? 'text-green-400' : stat.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {stat.score}%
                            </span>
                          </div>
                          <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${stat.score >= 80 ? 'bg-green-500' : stat.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${stat.score}%` }}
                            />
                          </div>
                          <p className="text-xs text-neutral-500 mt-1">Progress: {stat.progress || 50}%</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Topic Mastery */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      Topic Mastery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(analyticsStudent.stats?.topicMastery && analyticsStudent.stats.topicMastery.length > 0
                        ? analyticsStudent.stats.topicMastery.slice(0, 8)
                        : [
                            { topic: 'Algebra', mastery: 85 },
                            { topic: 'Geometry', mastery: 72 },
                            { topic: 'Calculus', mastery: 65 },
                            { topic: 'Statistics', mastery: 78 },
                            { topic: 'Trigonometry', mastery: 58 },
                          ]
                      ).map((tm: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-neutral-300">{tm.topic || tm.topicId}</span>
                              <span className={`${(tm.mastery || tm.masteryLevel || 0) >= 80 ? 'text-green-400' : (tm.mastery || tm.masteryLevel || 0) >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {tm.mastery || tm.masteryLevel || 0}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${(tm.mastery || tm.masteryLevel || 0) >= 80 ? 'bg-green-500' : (tm.mastery || tm.masteryLevel || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${tm.mastery || tm.masteryLevel || 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Progress Chart */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      Weekly Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2 h-40">
                      {(() => {
                        const weeklyData = Array.isArray(analyticsStudent.stats?.weeklyProgress) && analyticsStudent.stats.weeklyProgress.length > 0
                          ? analyticsStudent.stats.weeklyProgress.slice(-8)
                          : [65, 68, 72, 70, 75, 78, 82, 80]; // Demo data
                        const maxVal = Math.max(...weeklyData, 100);
                        return weeklyData.map((val: any, i: number) => {
                          const numVal = typeof val === 'number' ? val : (val?.progress || 70);
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <div
                                className="w-full bg-primary-500/80 rounded-t hover:bg-primary-400 transition-colors"
                                style={{ height: `${(numVal / maxVal) * 100}%` }}
                                title={`Week ${i + 1}: ${numVal}%`}
                              />
                              <span className="text-xs text-neutral-500">W{i + 1}</span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Strengths & Weaknesses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                      Strengths & Focus Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-neutral-500 uppercase mb-2">Strengths</p>
                      <div className="flex flex-wrap gap-1">
                        {(analyticsStudent.stats?.strengths && analyticsStudent.stats.strengths.length > 0
                          ? analyticsStudent.stats.strengths
                          : ['Problem Solving', 'Quick Learner']
                        ).map((s: string, i: number) => (
                          <Badge key={i} variant="success" size="sm">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 uppercase mb-2">Focus Areas</p>
                      <div className="flex flex-wrap gap-1">
                        {(analyticsStudent.stats?.weaknesses && analyticsStudent.stats.weaknesses.length > 0
                          ? analyticsStudent.stats.weaknesses
                          : ['Time Management', 'Complex Equations']
                        ).map((w: string, i: number) => (
                          <Badge key={i} variant="warning" size="sm">{w}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Session & Assignment Stats */}
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5 text-blue-400" />
                      Detailed Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-neutral-100">{analyticsStudent.stats?.totalSessions || 0}</p>
                        <p className="text-xs text-neutral-500">Total Sessions</p>
                      </div>
                      <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-neutral-100">{analyticsStudent.stats?.completedAssignments || 0}</p>
                        <p className="text-xs text-neutral-500">Assignments Done</p>
                      </div>
                      <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-neutral-100">{analyticsStudent.stats?.homeworkStreak || 0}</p>
                        <p className="text-xs text-neutral-500">Homework Streak</p>
                      </div>
                      <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-neutral-100">{analyticsStudent.stats?.missedSessionsCount || 0}</p>
                        <p className="text-xs text-neutral-500">Missed Sessions</p>
                      </div>
                      <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-neutral-100">{analyticsStudent.points || 0}</p>
                        <p className="text-xs text-neutral-500">Total Points</p>
                      </div>
                      <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-neutral-100">Lv.{analyticsStudent.level || 1}</p>
                        <p className="text-xs text-neutral-500">Current Level</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lesson Prep Recommendations */}
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ListChecks className="w-5 h-5 text-primary-500" />
                      Lesson Prep Recommendations
                    </CardTitle>
                    <CardDescription>Based on {analyticsStudent.name}'s performance data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(() => {
                        const weakTopics = analyticsStudent.stats?.weaknesses || ['Complex Equations'];
                        const lowMastery = (analyticsStudent.stats?.topicMastery || [])
                          .filter((tm: any) => (tm.mastery || tm.masteryLevel || 100) < 60)
                          .slice(0, 2);
                        const avgScore = analyticsStudent.stats?.averageScore || 75;

                        const recommendations = [
                          ...(avgScore < 70 ? [{
                            priority: 'high',
                            icon: <AlertTriangle className="w-4 h-4" />,
                            title: 'Review Fundamentals',
                            desc: 'Score below 70% - consider reviewing core concepts before advancing'
                          }] : []),
                          ...(weakTopics.length > 0 ? [{
                            priority: 'medium',
                            icon: <Target className="w-4 h-4" />,
                            title: `Focus on: ${weakTopics[0]}`,
                            desc: 'Identified as a focus area - allocate extra practice time'
                          }] : []),
                          ...(lowMastery.length > 0 ? [{
                            priority: 'medium',
                            icon: <BookOpen className="w-4 h-4" />,
                            title: `Topic: ${lowMastery[0]?.topic || lowMastery[0]?.topicId || 'N/A'}`,
                            desc: `Mastery at ${lowMastery[0]?.mastery || lowMastery[0]?.masteryLevel || 0}% - needs reinforcement`
                          }] : []),
                          {
                            priority: 'low',
                            icon: <Award className="w-4 h-4" />,
                            title: 'Build on Strengths',
                            desc: `Use ${analyticsStudent.stats?.strengths?.[0] || 'existing strengths'} to tackle challenging topics`
                          },
                          {
                            priority: 'low',
                            icon: <TrendingUp className="w-4 h-4" />,
                            title: 'Progress Check',
                            desc: 'Current progress at ' + (analyticsStudent.stats?.overallProgress || 0) + '% - maintain momentum'
                          }
                        ];

                        return recommendations.slice(0, 3).map((rec, i) => (
                          <div key={i} className={`p-4 rounded-xl border ${
                            rec.priority === 'high' ? 'bg-red-500/10 border-red-500/30' :
                            rec.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                            'bg-neutral-800/50 border-neutral-700'
                          }`}>
                            <div className={`flex items-center gap-2 mb-2 ${
                              rec.priority === 'high' ? 'text-red-400' :
                              rec.priority === 'medium' ? 'text-yellow-400' : 'text-primary-400'
                            }`}>
                              {rec.icon}
                              <span className="font-medium text-sm">{rec.title}</span>
                            </div>
                            <p className="text-xs text-neutral-400">{rec.desc}</p>
                          </div>
                        ));
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Students"
                value={students.length}
                icon={<Users className="w-6 h-6" />}
                change={12}
                changeLabel="this month"
              />
              <StatCard
                title="Sessions This Week"
                value={tutorSchedule.filter(e => e.status === 'scheduled').length}
                icon={<CalendarIcon className="w-6 h-6" />}
              />
              <StatCard
                title="Resources Shared"
                value={resources.length}
                icon={<BookOpen className="w-6 h-6" />}
                change={8}
                changeLabel="this week"
              />
              <StatCard
                title="Avg. Student Progress"
                value="78%"
                icon={<TrendingUp className="w-6 h-6" />}
                change={5}
                changeLabel="vs last month"
                variant="gradient"
              />
            </div>

            {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Students List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Students</CardTitle>
                    <CardDescription>Manage and view student profiles</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowChatModal(true)}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messages
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map(student => {
                    const parent = student.parentId ? getParentById(student.parentId) : null;
                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-xl hover:bg-neutral-800 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar name={student.name} size="lg" />
                          <div>
                            <h3 className="font-medium text-neutral-100">{student.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="info" size="sm">{getYearGroupLabel(student.yearGroup)}</Badge>
                              {student.subjects.map(subj => (
                                <Badge key={subj} size="sm" variant="default">
                                  {subj}
                                </Badge>
                              ))}
                            </div>
                            {parent && (
                              <p className="text-xs text-neutral-500 mt-1">Parent: {parent.name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <div className="flex items-center gap-2 text-sm text-neutral-400">
                              <Target className="w-4 h-4" />
                              <span>{student.stats?.overallProgress || 0}% progress</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-neutral-400 mt-1">
                              <Award className="w-4 h-4" />
                              <span>Level {student.level}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowStudentModal(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedChatContact({ id: student.id, name: student.name });
                                setShowChatModal(true);
                              }}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <UpcomingEvents events={tutorSchedule} />

            {/* Recent Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resources.slice(0, 4).map(resource => (
                    <div
                      key={resource.id}
                      className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-100 truncate">{resource.title}</p>
                        <p className="text-xs text-neutral-500">{resource.subject} • {resource.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Student Details Modal - Two Panel Layout */}
      <Modal
        isOpen={showStudentModal}
        onClose={() => {
          setShowStudentModal(false);
          setSelectedStudent(null);
        }}
        title="Students"
        size="xl"
      >
        <div className="grid md:grid-cols-3 gap-4 h-[500px]">
          {/* Student List Panel */}
          <div className="md:col-span-1 overflow-y-auto">
            <div className="space-y-2">
              {students.map(student => {
                const isSelected = selectedStudent?.id === student.id;
                return (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                      isSelected
                        ? 'bg-primary-500/20 border border-primary-500/50'
                        : 'bg-neutral-800/50 hover:bg-neutral-800 border border-transparent'
                    }`}
                  >
                    <Avatar name={student.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isSelected ? 'text-primary-400' : 'text-neutral-100'}`}>
                        {student.name}
                      </p>
                      <p className="text-xs text-neutral-500">{getYearGroupLabel(student.yearGroup)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-neutral-400">{student.stats.overallProgress}% progress</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Details Panel */}
          <div className="md:col-span-2 overflow-y-auto">
            {selectedStudent ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar name={selectedStudent.name} size="xl" />
                  <div>
                    <h3 className="text-xl font-bold text-neutral-100">{selectedStudent.name}</h3>
                    <p className="text-neutral-400">{getYearGroupLabel(selectedStudent.yearGroup)}</p>
                    <div className="flex gap-2 mt-2">
                      {selectedStudent.subjects.map(subj => (
                        <Badge key={subj} variant="info">{subj}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-primary-500">{selectedStudent.points}</p>
                    <p className="text-sm text-neutral-400">Points</p>
                  </div>
                  <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-green-500">Lv.{selectedStudent.level}</p>
                    <p className="text-sm text-neutral-400">Level</p>
                  </div>
                  <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-purple-500">{selectedStudent.stats.overallProgress}%</p>
                    <p className="text-sm text-neutral-400">Progress</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-neutral-400 mb-3">Subject Progress</h4>
                  <div className="space-y-3">
                    {selectedStudent.stats.subjectStats.map(stat => (
                      <div key={stat.subject}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-neutral-100 capitalize">{stat.subject}</span>
                          <span className="text-neutral-400">Grade: {stat.grade}</span>
                        </div>
                        <ProgressBar value={stat.progress} variant="gradient" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Power Skills & Training Grounds */}
                <div className="border-t border-neutral-800 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-neutral-400">Power Skills & Training Grounds</h4>
                    {!isEditingSkills ? (
                      <Button variant="ghost" size="sm" onClick={handleStartEditingSkills}>
                        <Settings className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={handleCancelEditingSkills}>
                          Cancel
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleSaveSkills} disabled={isSavingSkills}>
                          {isSavingSkills ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                        </Button>
                      </div>
                    )}
                  </div>

                  {!isEditingSkills ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-medium text-green-400 mb-2 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Power Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedStudent.stats.strengths.length > 0 ? (
                            selectedStudent.stats.strengths.map((s, i) => (
                              <Badge key={i} variant="success" size="sm">{s}</Badge>
                            ))
                          ) : (
                            <p className="text-xs text-neutral-500 italic">No skills added yet</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-orange-400 mb-2 flex items-center gap-1">
                          <Target className="w-3 h-3" /> Training Grounds
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedStudent.stats.weaknesses.length > 0 ? (
                            selectedStudent.stats.weaknesses.map((w, i) => (
                              <Badge key={i} variant="warning" size="sm">{w}</Badge>
                            ))
                          ) : (
                            <p className="text-xs text-neutral-500 italic">No areas added yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {/* Edit Strengths */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-green-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Power Skills
                        </h4>
                        <div className="flex gap-2">
                          <Input
                            value={newStrength}
                            onChange={(e) => setNewStrength(e.target.value)}
                            placeholder="Add skill..."
                            onKeyDown={(e) => e.key === 'Enter' && handleAddStrength()}
                            className="text-sm"
                          />
                          <Button variant="ghost" size="sm" onClick={handleAddStrength}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-neutral-800/30 rounded-lg">
                          {editStrengths.map((s, i) => (
                            <Badge key={i} variant="success" size="sm" className="flex items-center gap-1">
                              {s}
                              <button onClick={() => handleRemoveStrength(i)} className="ml-1 hover:text-red-400">
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                          {editStrengths.length === 0 && (
                            <p className="text-xs text-neutral-500 italic">Type and press Enter to add</p>
                          )}
                        </div>
                      </div>

                      {/* Edit Weaknesses */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-orange-400 flex items-center gap-1">
                          <Target className="w-3 h-3" /> Training Grounds
                        </h4>
                        <div className="flex gap-2">
                          <Input
                            value={newWeakness}
                            onChange={(e) => setNewWeakness(e.target.value)}
                            placeholder="Add area..."
                            onKeyDown={(e) => e.key === 'Enter' && handleAddWeakness()}
                            className="text-sm"
                          />
                          <Button variant="ghost" size="sm" onClick={handleAddWeakness}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-neutral-800/30 rounded-lg">
                          {editWeaknesses.map((w, i) => (
                            <Badge key={i} variant="warning" size="sm" className="flex items-center gap-1">
                              {w}
                              <button onClick={() => handleRemoveWeakness(i)} className="ml-1 hover:text-red-400">
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                          {editWeaknesses.length === 0 && (
                            <p className="text-xs text-neutral-500 italic">Type and press Enter to add</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Analytics */}
                <div className="border-t border-neutral-800 pt-4">
                  <h4 className="text-sm font-medium text-neutral-400 mb-3">Performance Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-neutral-800/30 rounded-lg">
                      <p className="text-neutral-500">Total Sessions</p>
                      <p className="text-lg font-semibold text-neutral-100">{selectedStudent.stats.totalSessions}</p>
                    </div>
                    <div className="p-3 bg-neutral-800/30 rounded-lg">
                      <p className="text-neutral-500">Avg. Score</p>
                      <p className="text-lg font-semibold text-neutral-100">{selectedStudent.stats.averageScore}%</p>
                    </div>
                    <div className="p-3 bg-neutral-800/30 rounded-lg">
                      <p className="text-neutral-500">Assignments Done</p>
                      <p className="text-lg font-semibold text-neutral-100">{selectedStudent.stats.completedAssignments}</p>
                    </div>
                    <div className="p-3 bg-neutral-800/30 rounded-lg">
                      <p className="text-neutral-500">Attendance Rate</p>
                      <p className="text-lg font-semibold text-neutral-100">{selectedStudent.stats.attendanceRate}%</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                  <p className="text-neutral-500">Select a student to view their analytics</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </Modal>

      {/* Add Resource Modal */}
      <Modal
        isOpen={showResourceModal}
        onClose={() => setShowResourceModal(false)}
        title="Add New Resource"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={newResource.title}
            onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
            placeholder="Resource title"
          />
          <Textarea
            label="Description"
            value={newResource.description}
            onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
            placeholder="Brief description"
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              value={newResource.type}
              onChange={(e) => setNewResource({ ...newResource, type: e.target.value as Resource['type'] })}
              options={[
                { value: 'worksheet', label: 'Worksheet' },
                { value: 'document', label: 'Document' },
                { value: 'video', label: 'Video' },
                { value: 'quiz', label: 'Quiz' },
              ]}
            />
            <Select
              label="Subject"
              value={newResource.subject}
              onChange={(e) => setNewResource({ ...newResource, subject: e.target.value as Subject })}
              options={[
                { value: 'mathematics', label: 'Mathematics' },
                { value: 'economics', label: 'Economics' },
                { value: 'physics', label: 'Physics' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Level"
              value={newResource.level}
              onChange={(e) => setNewResource({ ...newResource, level: e.target.value as ResourceLevel })}
              options={[
                { value: 'year5-6', label: 'Year 5-6' },
                { value: 'gcse', label: 'GCSEs' },
                { value: 'alevel', label: 'A-Level' },
              ]}
            />
            <Select
              label="Resource Subtype"
              value={newResource.subtype}
              onChange={(e) => setNewResource({ ...newResource, subtype: e.target.value as ResourceSubtype })}
              options={[
                { value: 'workbook', label: 'Workbook' },
                { value: 'revision-note', label: 'Revision Note' },
                { value: 'end-of-unit-test', label: 'End of Unit Test' },
                { value: 'exam', label: 'Exam' },
              ]}
            />
          </div>
          <Input
            label="Topic"
            value={newResource.topic}
            onChange={(e) => setNewResource({ ...newResource, topic: e.target.value })}
            placeholder="e.g., Quadratic Equations"
          />

          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Upload File (PDF, Word, etc.)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                resourceFile
                  ? 'border-green-500/50 bg-green-500/10'
                  : 'border-neutral-700 hover:border-neutral-600 bg-neutral-800/50'
              }`}
            >
              {resourceFile ? (
                <div className="flex items-center justify-center gap-3">
                  <File className="w-8 h-8 text-green-400" />
                  <div className="text-left">
                    <p className="text-neutral-100 font-medium">{resourceFile.name}</p>
                    <p className="text-sm text-neutral-400">
                      {(resourceFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setResourceFile(null);
                    }}
                    className="ml-4 p-1 hover:bg-neutral-700 rounded"
                  >
                    <X className="w-4 h-4 text-neutral-400" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-10 h-10 text-neutral-500 mx-auto mb-2" />
                  <p className="text-neutral-300">Click to upload a file</p>
                  <p className="text-sm text-neutral-500 mt-1">PDF, Word, PowerPoint, Excel, Images</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Assign to Students</label>
            <div className="space-y-2">
              {students.map(student => (
                <label key={student.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newResource.studentIds.includes(student.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewResource({ ...newResource, studentIds: [...newResource.studentIds, student.id] });
                      } else {
                        setNewResource({
                          ...newResource,
                          studentIds: newResource.studentIds.filter(id => id !== student.id),
                        });
                      }
                    }}
                    className="rounded border-neutral-700 bg-neutral-800 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-neutral-100">{student.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowResourceModal(false)} className="flex-1" disabled={isUploadingResource}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddResource}
              className="flex-1"
              disabled={isUploadingResource || !newResource.title}
            >
              {isUploadingResource ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                'Add Resource'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Schedule Calendar Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setShowAddEventForm(false);
          setSelectedEvent(null);
        }}
        title="Schedule"
        size="xl"
      >
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Calendar
              events={tutorSchedule}
              editable={true}
              onAddEvent={(date) => {
                setNewEvent({ ...newEvent, date });
                setShowAddEventForm(true);
                setSelectedEvent(null);
              }}
              onEventClick={(event) => {
                setSelectedEvent(event);
                setShowAddEventForm(false);
              }}
            />
            <p className="text-xs text-neutral-500 mt-2 text-center">
              Click on a date to add a session, or click on an event to view details
            </p>
          </div>

          {/* Side Panel - Add Event Form or Event Details */}
          <div className="lg:col-span-1 max-h-[600px] overflow-y-auto">
            {showAddEventForm ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Session</CardTitle>
                  <CardDescription>Schedule a new lesson with a plan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Session Title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="e.g., Algebra Review"
                  />
                  <Select
                    label="Student"
                    value={newEvent.studentId}
                    onChange={(e) => setNewEvent({ ...newEvent, studentId: e.target.value })}
                    options={[
                      { value: '', label: 'Select student' },
                      ...students.map(s => ({ value: s.id, label: s.name })),
                    ]}
                  />
                  <Select
                    label="Subject"
                    value={newEvent.subject}
                    onChange={(e) => setNewEvent({ ...newEvent, subject: e.target.value as Subject })}
                    options={[
                      { value: 'mathematics', label: 'Mathematics' },
                      { value: 'economics', label: 'Economics' },
                      { value: 'physics', label: 'Physics' },
                    ]}
                  />
                  <Input
                    label="Date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Start"
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    />
                    <Input
                      label="End"
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Student's Home"
                  />

                  {/* Lesson Plan Section */}
                  <div className="border-t border-neutral-800 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-primary-400 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Lesson Plan
                    </h4>

                    {/* Objectives */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-400 mb-2">
                        Learning Objectives
                      </label>
                      <div className="space-y-2">
                        {newEvent.objectives.map((obj, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={obj}
                              onChange={(e) => updateObjective(index, e.target.value)}
                              placeholder={`Objective ${index + 1}`}
                            />
                            {newEvent.objectives.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeObjective(index)}
                                className="px-2"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={addObjective}
                          className="w-full text-primary-400 hover:text-primary-300"
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add Objective
                        </Button>
                      </div>
                    </div>

                    {/* Topics */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-400 mb-2">
                        Topics to Cover
                      </label>
                      <div className="space-y-2">
                        {newEvent.topics.map((topic, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={topic}
                              onChange={(e) => updateTopic(index, e.target.value)}
                              placeholder={`Topic ${index + 1}`}
                            />
                            {newEvent.topics.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTopic(index)}
                                className="px-2"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={addTopic}
                          className="w-full text-primary-400 hover:text-primary-300"
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add Topic
                        </Button>
                      </div>
                    </div>

                    {/* Resources */}
                    <Input
                      label="Resources (comma-separated)"
                      value={newEvent.resources}
                      onChange={(e) => setNewEvent({ ...newEvent, resources: e.target.value })}
                      placeholder="e.g., Textbook Ch.5, Worksheet 3"
                    />

                    {/* Pre-session Homework */}
                    <Textarea
                      label="Pre-session Homework (optional)"
                      value={newEvent.homework}
                      onChange={(e) => setNewEvent({ ...newEvent, homework: e.target.value })}
                      placeholder="What should the student prepare?"
                      rows={2}
                    />
                  </div>

                  <Textarea
                    label="Additional Notes"
                    value={newEvent.notes}
                    onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                    placeholder="Private session notes..."
                    rows={2}
                  />
                  <div className="flex gap-2 pt-2">
                    <Button variant="secondary" onClick={() => { setShowAddEventForm(false); resetEventForm(); }} className="flex-1" size="sm">
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={() => { handleAddEvent(); setShowAddEventForm(false); }} className="flex-1" size="sm">
                      Add Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : selectedEvent ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedEvent.title}</CardTitle>
                  <CardDescription className="capitalize">{selectedEvent.subject}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-300">{selectedEvent.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-300">{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-300">{selectedEvent.location || 'No location set'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-300">
                        {students.find(s => s.id === selectedEvent.studentId)?.name || 'Unknown student'}
                      </span>
                    </div>
                  </div>
                  <Badge variant={selectedEvent.status === 'completed' ? 'success' : selectedEvent.status === 'cancelled' ? 'error' : 'info'}>
                    {selectedEvent.status}
                  </Badge>

                  {/* Lesson Plan Display */}
                  {selectedEvent.lessonPlan && selectedEvent.status === 'scheduled' && (
                    <div className="border-t border-neutral-800 pt-4">
                      <h4 className="text-sm font-medium text-primary-400 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Lesson Plan
                      </h4>
                      {selectedEvent.lessonPlan.objectives.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-neutral-500 mb-2">Objectives</p>
                          <div className="space-y-1">
                            {selectedEvent.lessonPlan.objectives.map((obj, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-neutral-300">
                                <Target className="w-3 h-3 text-primary-400 mt-1 flex-shrink-0" />
                                <span>{obj}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedEvent.lessonPlan.topics.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-neutral-500 mb-2">Topics</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedEvent.lessonPlan.topics.map((topic, i) => (
                              <Badge key={i} variant="default" size="sm">{topic}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedEvent.lessonPlan.resources && selectedEvent.lessonPlan.resources.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-neutral-500 mb-2">Resources</p>
                          <div className="space-y-1">
                            {selectedEvent.lessonPlan.resources.map((res, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-neutral-400">
                                <FileText className="w-3 h-3" />
                                <span>{res}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedEvent.lessonPlan.homework && (
                        <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                          <p className="text-xs text-amber-400 mb-1">Pre-session Homework</p>
                          <p className="text-sm text-neutral-300">{selectedEvent.lessonPlan.homework}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Session Notes Display (for completed sessions) */}
                  {selectedEvent.sessionNotes && selectedEvent.status === 'completed' && (
                    <div className="border-t border-neutral-800 pt-4">
                      <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4" />
                        Session Review
                      </h4>
                      {selectedEvent.sessionNotes.studentPerformance && (
                        <div className="mb-3">
                          <Badge
                            variant={
                              selectedEvent.sessionNotes.studentPerformance === 'excellent' ? 'success' :
                              selectedEvent.sessionNotes.studentPerformance === 'good' ? 'info' : 'warning'
                            }
                            size="sm"
                          >
                            {selectedEvent.sessionNotes.studentPerformance === 'excellent' ? 'Excellent' :
                             selectedEvent.sessionNotes.studentPerformance === 'good' ? 'Good Progress' : 'Needs Improvement'}
                          </Badge>
                        </div>
                      )}
                      {selectedEvent.sessionNotes.summary && (
                        <div className="mb-3">
                          <p className="text-xs text-neutral-500 mb-1">Summary</p>
                          <p className="text-sm text-neutral-300">{selectedEvent.sessionNotes.summary}</p>
                        </div>
                      )}
                      {selectedEvent.sessionNotes.topicsCovered.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-neutral-500 mb-2">Topics Covered</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedEvent.sessionNotes.topicsCovered.map((topic, i) => (
                              <Badge key={i} variant="success" size="sm">{topic}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedEvent.sessionNotes.nextSteps && (
                        <div className="mb-3">
                          <p className="text-xs text-neutral-500 mb-1">Next Steps</p>
                          <p className="text-sm text-neutral-300">{selectedEvent.sessionNotes.nextSteps}</p>
                        </div>
                      )}
                      {selectedEvent.sessionNotes.homeworkAssigned && (
                        <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                          <p className="text-xs text-amber-400 mb-1">Homework Assigned</p>
                          <p className="text-sm text-neutral-300">{selectedEvent.sessionNotes.homeworkAssigned}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedEvent.notes && (
                    <div className="pt-2 border-t border-neutral-800">
                      <p className="text-xs text-neutral-500 mb-1">Private Notes</p>
                      <p className="text-sm text-neutral-300">{selectedEvent.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="secondary" onClick={() => setSelectedEvent(null)} className="flex-1" size="sm">
                      Close
                    </Button>
                    {selectedEvent.status === 'scheduled' && (
                      <Button
                        variant="primary"
                        onClick={() => setShowCompleteSessionForm(true)}
                        className="flex-1"
                        size="sm"
                        icon={<CheckCircle className="w-4 h-4" />}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                  <p className="text-neutral-500 text-sm">
                    Click a date to add a session<br />
                    or click an event to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Modal>

      {/* Chat Modal */}
      <Modal
        isOpen={showChatModal}
        onClose={() => {
          setShowChatModal(false);
          setSelectedChatContact(null);
        }}
        title="Messages"
        size="xl"
      >
        <div className="grid md:grid-cols-3 gap-4 h-[500px]">
          <div className="md:col-span-1">
            <ChatList
              contacts={chatContacts}
              onSelectContact={(id) => {
                const contact = chatContacts.find(c => c.id === id);
                if (contact) {
                  setSelectedChatContact({ id: contact.id, name: contact.name });
                }
              }}
              selectedContactId={selectedChatContact?.id}
            />
          </div>
          <div className="md:col-span-2">
            {selectedChatContact ? (
              <Chat recipientId={selectedChatContact.id} recipientName={selectedChatContact.name} />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <p className="text-neutral-500">Select a contact to start chatting</p>
              </Card>
            )}
          </div>
        </div>
      </Modal>

      {/* Analytics Modal - Student Deep Dive */}
      <Modal
        isOpen={showAnalyticsModal}
        onClose={() => {
          setShowAnalyticsModal(false);
          setAnalyticsStudent(null);
        }}
        title="Analytics & Insights"
        size="xl"
      >
        <div className="grid lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto">
          {/* Left Panel - Student List with Improvement Rates */}
          <div className="lg:col-span-1 space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-neutral-800/50 rounded-xl text-center">
                <p className="text-2xl font-bold text-primary-500">{students.length}</p>
                <p className="text-xs text-neutral-400">Students</p>
              </div>
              <div className="p-3 bg-neutral-800/50 rounded-xl text-center">
                <p className="text-2xl font-bold text-green-500">
                  {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.stats.averageScore, 0) / students.length) : 0}%
                </p>
                <p className="text-xs text-neutral-400">Avg Score</p>
              </div>
            </div>

            {/* Improvement Rate Ranking */}
            <div>
              <h4 className="text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Improvement Rate
              </h4>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {[...students]
                  .map(s => {
                    // Calculate improvement rate from weekly progress
                    const weeklyProgress = Array.isArray(s.stats.weeklyProgress) ? s.stats.weeklyProgress : [];
                    const recentWeeks = weeklyProgress.slice(-4);
                    const improvementRate = recentWeeks.length >= 2
                      ? ((recentWeeks[recentWeeks.length - 1] || 0) - (recentWeeks[0] || 0))
                      : Math.floor(Math.random() * 20) - 5; // Demo: random improvement
                    return { ...s, improvementRate };
                  })
                  .sort((a, b) => b.improvementRate - a.improvementRate)
                  .map((student, index) => {
                    const isSelected = analyticsStudent?.id === student.id;
                    const isImproving = student.improvementRate > 0;
                    const isStagnant = student.improvementRate === 0;
                    return (
                      <button
                        key={student.id}
                        onClick={() => setAnalyticsStudent(student)}
                        className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-primary-500/20 border-2 border-primary-500'
                            : 'bg-neutral-800/50 border-2 border-transparent hover:bg-neutral-800'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-green-500/20 text-green-400' :
                          index === students.length - 1 ? 'bg-red-500/20 text-red-400' :
                          'bg-neutral-700 text-neutral-400'
                        }`}>
                          {index + 1}
                        </div>
                        <Avatar name={student.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-100 text-sm truncate">{student.name}</p>
                          <p className="text-xs text-neutral-500">{getYearGroupLabel(student.yearGroup)}</p>
                        </div>
                        <div className={`text-right ${
                          isImproving ? 'text-green-400' : isStagnant ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          <p className="text-sm font-bold flex items-center gap-1">
                            {isImproving ? '↑' : isStagnant ? '→' : '↓'}
                            {Math.abs(student.improvementRate)}%
                          </p>
                          <p className="text-xs opacity-70">
                            {isImproving ? 'Growing' : isStagnant ? 'Steady' : 'Declining'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Right Panel - Student Deep Dive */}
          <div className="lg:col-span-2">
            {analyticsStudent ? (
              <div className="space-y-4">
                {/* Student Header */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-500/10 to-transparent rounded-xl border border-primary-500/20">
                  <div className="flex items-center gap-4">
                    <Avatar name={analyticsStudent.name} size="lg" />
                    <div>
                      <h3 className="text-xl font-bold text-neutral-100">{analyticsStudent.name}</h3>
                      <p className="text-sm text-neutral-400">
                        {getYearGroupLabel(analyticsStudent.yearGroup)} • {analyticsStudent.subjects.join(', ')}
                      </p>
                    </div>
                  </div>
                  {/* Risk Indicator */}
                  {(() => {
                    const riskScore =
                      ((analyticsStudent.stats.attendanceRate || 100) < 80 ? 2 : 0) +
                      ((analyticsStudent.stats.averageScore || 0) < 60 ? 2 : 0) +
                      ((analyticsStudent.stats.streakDays || analyticsStudent.stats.currentStreak || 0) < 2 ? 1 : 0) +
                      ((analyticsStudent.stats.missedSessionsCount || 0) > 2 ? 2 : 0);
                    const riskLevel = riskScore >= 4 ? 'high' : riskScore >= 2 ? 'medium' : 'low';
                    return (
                      <Badge
                        variant={riskLevel === 'high' ? 'error' : riskLevel === 'medium' ? 'warning' : 'success'}
                        className="flex items-center gap-1"
                      >
                        {riskLevel === 'high' ? <AlertTriangle className="w-3 h-3" /> :
                         riskLevel === 'medium' ? <AlertCircle className="w-3 h-3" /> :
                         <CheckCircle className="w-3 h-3" />}
                        {riskLevel === 'high' ? 'Needs Attention' : riskLevel === 'medium' ? 'Monitor' : 'On Track'}
                      </Badge>
                    );
                  })()}
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-neutral-800/50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-primary-500">{analyticsStudent.stats.overallProgress}%</p>
                    <p className="text-xs text-neutral-400">Progress</p>
                  </div>
                  <div className="p-3 bg-neutral-800/50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-purple-400">{analyticsStudent.stats.averageScore}%</p>
                    <p className="text-xs text-neutral-400">Avg Score</p>
                  </div>
                  <div className="p-3 bg-neutral-800/50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-green-400">{analyticsStudent.stats.attendanceRate}%</p>
                    <p className="text-xs text-neutral-400">Attendance</p>
                  </div>
                  <div className="p-3 bg-neutral-800/50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-yellow-400">{analyticsStudent.stats.streakDays || analyticsStudent.stats.currentStreak || 0}</p>
                    <p className="text-xs text-neutral-400">Day Streak</p>
                  </div>
                </div>

                {/* Engagement Score */}
                <div className="p-4 bg-neutral-800/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-neutral-300">Engagement Score</h4>
                    {(() => {
                      const engagementScore = Math.round(
                        ((analyticsStudent.stats.attendanceRate || 100) * 0.3) +
                        ((analyticsStudent.stats.averageScore || 0) * 0.25) +
                        ((analyticsStudent.stats.homeworkStreak || 0) * 5) +
                        ((analyticsStudent.stats.streakDays || analyticsStudent.stats.currentStreak || 0) * 2) +
                        (Math.min(analyticsStudent.stats.totalSessions || 0, 20) * 1)
                      );
                      return (
                        <span className={`text-lg font-bold ${
                          engagementScore >= 80 ? 'text-green-400' :
                          engagementScore >= 50 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {Math.min(engagementScore, 100)}/100
                        </span>
                      );
                    })()}
                  </div>
                  <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                    {(() => {
                      const engagementScore = Math.min(Math.round(
                        (analyticsStudent.stats.attendanceRate * 0.3) +
                        (analyticsStudent.stats.averageScore * 0.25) +
                        ((analyticsStudent.stats.homeworkStreak || 0) * 5) +
                        (analyticsStudent.stats.currentStreak * 2) +
                        (Math.min(analyticsStudent.stats.totalSessions, 20) * 1)
                      ), 100);
                      return (
                        <div
                          className={`h-full transition-all ${
                            engagementScore >= 80 ? 'bg-green-500' :
                            engagementScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${engagementScore}%` }}
                        />
                      );
                    })()}
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500 mt-1">
                    <span>Attendance: {analyticsStudent.stats.attendanceRate}%</span>
                    <span>Sessions: {analyticsStudent.stats.totalSessions}</span>
                    <span>Homework: {analyticsStudent.stats.homeworkStreak || 0} streak</span>
                  </div>
                </div>

                {/* Weekly Progress Chart (Visual Bar Chart) */}
                <div className="p-4 bg-neutral-800/30 rounded-xl">
                  <h4 className="text-sm font-medium text-neutral-300 mb-3">Weekly Progress (Last 8 Weeks)</h4>
                  <div className="flex items-end gap-2 h-24">
                    {(() => {
                      const weeklyProgress = Array.isArray(analyticsStudent.stats.weeklyProgress)
                        ? analyticsStudent.stats.weeklyProgress
                        : [65, 70, 68, 75, 72, 78, 82, 85]; // Demo data
                      const maxVal = Math.max(...weeklyProgress, 100);
                      return weeklyProgress.slice(-8).map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-primary-500/60 rounded-t transition-all hover:bg-primary-500"
                            style={{ height: `${(val / maxVal) * 100}%` }}
                            title={`Week ${i + 1}: ${val}%`}
                          />
                          <span className="text-xs text-neutral-500">W{i + 1}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Strengths ({analyticsStudent.strengths?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {(analyticsStudent.strengths || []).slice(0, 5).map((s, i) => (
                        <Badge key={i} variant="success" size="sm">{s}</Badge>
                      ))}
                      {(!analyticsStudent.strengths || analyticsStudent.strengths.length === 0) && (
                        <p className="text-xs text-neutral-500">No strengths recorded yet</p>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Focus Areas ({analyticsStudent.weaknesses?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {(analyticsStudent.weaknesses || []).slice(0, 5).map((w, i) => (
                        <Badge key={i} variant="error" size="sm">{w}</Badge>
                      ))}
                      {(!analyticsStudent.weaknesses || analyticsStudent.weaknesses.length === 0) && (
                        <p className="text-xs text-neutral-500">No focus areas recorded yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detailed Stats */}
                <div className="p-4 bg-neutral-800/30 rounded-xl">
                  <h4 className="text-sm font-medium text-neutral-300 mb-3">Detailed Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-500">Total Sessions</p>
                      <p className="font-semibold text-neutral-100">{analyticsStudent.stats.totalSessions}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Completed Assignments</p>
                      <p className="font-semibold text-neutral-100">{analyticsStudent.stats.completedAssignments}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Total Points</p>
                      <p className="font-semibold text-yellow-400">{analyticsStudent.stats.totalPoints} ⭐</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Missed Sessions</p>
                      <p className={`font-semibold ${(analyticsStudent.stats.missedSessionsCount || 0) > 2 ? 'text-red-400' : 'text-neutral-100'}`}>
                        {analyticsStudent.stats.missedSessionsCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Low Engagement Weeks</p>
                      <p className={`font-semibold ${(analyticsStudent.stats.lowEngagementWeeks || 0) > 2 ? 'text-orange-400' : 'text-neutral-100'}`}>
                        {analyticsStudent.stats.lowEngagementWeeks || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Achievements</p>
                      <p className="font-semibold text-purple-400">{analyticsStudent.achievements?.length || 0} 🏆</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center py-12">
                <div>
                  <BarChart3 className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-300 mb-2">Select a Student</h3>
                  <p className="text-sm text-neutral-500 max-w-xs">
                    Click on a student from the list to view their detailed analytics, engagement score, and progress trends.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Assessments Modal */}
      <Modal
        isOpen={showAssessmentsModal}
        onClose={() => {
          setShowAssessmentsModal(false);
          setAssessmentStudent(null);
        }}
        title="Assessments"
        size="xl"
      >
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Student List */}
          <div className="space-y-3">
            <p className="text-neutral-400 text-sm font-medium">Select a student to edit their stats</p>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {students.map(student => {
                const isSelected = assessmentStudent?.id === student.id;
                return (
                  <button
                    key={student.id}
                    onClick={() => handleEditAssessment(student)}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-primary-500/20 border-2 border-primary-500'
                        : 'bg-neutral-800/50 border-2 border-transparent hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar name={student.name} size="sm" />
                        <div>
                          <p className="font-medium text-neutral-100">{student.name}</p>
                          <p className="text-xs text-neutral-500">{getYearGroupLabel(student.yearGroup)}</p>
                        </div>
                      </div>
                      <Badge variant="info" size="sm">
                        {student.stats?.averageScore || 0}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <p className="text-neutral-500">Assignments</p>
                        <p className="font-semibold text-neutral-300">{student.stats?.completedAssignments || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-neutral-500">Sessions</p>
                        <p className="font-semibold text-neutral-300">{student.stats?.totalSessions || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-neutral-500">Attendance</p>
                        <p className="font-semibold text-neutral-300">{student.stats?.attendanceRate || 100}%</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Edit Panel */}
          <div className="bg-neutral-800/30 rounded-xl p-6">
            {assessmentStudent ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={assessmentStudent.name} size="md" />
                    <div>
                      <h3 className="font-semibold text-neutral-100">{assessmentStudent.name}</h3>
                      <p className="text-sm text-neutral-400">Edit Assessment Stats</p>
                    </div>
                  </div>
                  {assessmentSaveSuccess && (
                    <Badge variant="success" size="sm" className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Saved!
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Average Score */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                      Average Score (%)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editAverageScore}
                        onChange={(e) => setEditAverageScore(Number(e.target.value))}
                        className="flex-1 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                      />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editAverageScore}
                        onChange={(e) => setEditAverageScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-20 text-center"
                      />
                    </div>
                  </div>

                  {/* Completed Assignments */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                      Completed Assignments
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditCompletedAssignments(Math.max(0, editCompletedAssignments - 1))}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min="0"
                        value={editCompletedAssignments}
                        onChange={(e) => setEditCompletedAssignments(Math.max(0, Number(e.target.value)))}
                        className="w-24 text-center"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditCompletedAssignments(editCompletedAssignments + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Total Sessions */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                      Total Sessions
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditTotalSessions(Math.max(0, editTotalSessions - 1))}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min="0"
                        value={editTotalSessions}
                        onChange={(e) => setEditTotalSessions(Math.max(0, Number(e.target.value)))}
                        className="w-24 text-center"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditTotalSessions(editTotalSessions + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Attendance Rate */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                      Attendance Rate (%)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editAttendanceRate}
                        onChange={(e) => setEditAttendanceRate(Number(e.target.value))}
                        className="flex-1 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                      />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editAttendanceRate}
                        onChange={(e) => setEditAttendanceRate(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-20 text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-neutral-700">
                  <Button
                    variant="ghost"
                    onClick={handleCancelAssessmentEdit}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveAssessment}
                    disabled={isSavingAssessment}
                    className="flex-1"
                  >
                    {isSavingAssessment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Save to Database'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <FileText className="w-12 h-12 text-neutral-600 mb-4" />
                <h4 className="font-medium text-neutral-300 mb-2">Select a Student</h4>
                <p className="text-sm text-neutral-500 max-w-[200px]">
                  Click on a student from the list to view and edit their assessment stats
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Settings"
        size="xl"
      >
        <FeatureSettingsPanel onClose={() => setShowSettingsModal(false)} />
      </Modal>

      {/* Notifications History Modal */}
      <Modal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        title="Notification History"
        size="lg"
      >
        <div className="space-y-4">
          {tutorNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-500">No notifications yet</p>
              <p className="text-sm text-neutral-600 mt-1">Notifications from students and parents will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tutorNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border ${
                    !notification.read
                      ? 'bg-primary-500/5 border-primary-500/30'
                      : 'bg-neutral-800/50 border-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={notification.fromRole === 'student' ? 'info' : 'default'}
                          size="sm"
                        >
                          {notification.fromRole === 'student' ? 'Student' : 'Parent'}
                        </Badge>
                        <Badge variant="default" size="sm">
                          {getNotificationTypeLabel(notification.notificationType)}
                        </Badge>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-primary-500" />
                        )}
                      </div>
                      <p className="font-medium text-neutral-100">
                        {notification.fromName}
                      </p>
                      <p className="text-sm text-neutral-400 mt-1">{notification.message}</p>
                      <p className="text-xs text-neutral-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleNotificationClick(notification)}
                          className="p-2 text-neutral-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Admin Modal */}
      <Modal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        title="User Management"
        size="xl"
      >
        <div className="space-y-6">
          {/* Admin Message */}
          {adminMessage && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl ${
                adminMessage.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}
            >
              {adminMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <p className="text-sm flex-1">{adminMessage.text}</p>
              <button onClick={() => setAdminMessage(null)} className="hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-neutral-400 text-sm">Manage user accounts for students, parents, and tutors</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateUserModal(true)}
              icon={<UserPlus className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </div>

          {isLoadingAdmin ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : adminUsers.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
              <p className="text-sm mt-1">Create your first user account to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-neutral-900">
                  <tr className="border-b border-neutral-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Role</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-neutral-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u) => (
                    <tr key={u.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                      <td className="py-3 px-4">
                        <span className="text-neutral-100">{u.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-neutral-400">{u.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={u.role === 'tutor' ? 'info' : u.role === 'student' ? 'success' : 'default'}
                          size="sm"
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={async () => {
                              const result = await adminService.resetPassword(u.email);
                              if (result.success) {
                                setAdminMessage({ type: 'success', text: `Password reset email sent to ${u.email}` });
                              } else {
                                setAdminMessage({ type: 'error', text: result.error || 'Failed to reset password' });
                              }
                            }}
                            className="p-2 text-neutral-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this user?')) {
                                const result = await adminService.deleteUser(u.id);
                                if (result.success) {
                                  setAdminMessage({ type: 'success', text: 'User deleted successfully' });
                                  loadAdminData();
                                } else {
                                  setAdminMessage({ type: 'error', text: result.error || 'Failed to delete user' });
                                }
                              }
                            }}
                            className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
      {/* Create User Modal */}
      <Modal
        isOpen={showCreateUserModal}
        onClose={() => {
          setShowCreateUserModal(false);
          resetCreateUserForm();
        }}
        title="Create New Account"
        size="md"
      >
        {createUserSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-100 mb-2">Account Created!</h3>
            <p className="text-neutral-400 text-sm mb-6">The new {newUserRole} account has been created successfully.</p>

            {generatedCredentials && (
              <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4 text-left mx-auto max-w-sm">
                <h4 className="text-sm font-medium text-neutral-300 mb-3 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Login Credentials
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-neutral-500">Email</p>
                    <p className="text-sm text-neutral-100 font-mono bg-neutral-900 px-2 py-1 rounded">{generatedCredentials.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Temporary Password</p>
                    <p className="text-sm text-neutral-100 font-mono bg-neutral-900 px-2 py-1 rounded">{generatedCredentials.password}</p>
                  </div>
                </div>
                <p className="text-xs text-amber-400 mt-3 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  User should change password on first login
                </p>
              </div>
            )}

            <Button
              variant="primary"
              className="mt-6"
              onClick={() => {
                setShowCreateUserModal(false);
                resetCreateUserForm();
              }}
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-3">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setNewUserRole('student')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    newUserRole === 'student'
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-neutral-700 hover:border-neutral-600'
                  }`}
                >
                  <Users className={`w-6 h-6 mx-auto mb-2 ${newUserRole === 'student' ? 'text-primary-500' : 'text-neutral-400'}`} />
                  <p className={`font-medium ${newUserRole === 'student' ? 'text-primary-400' : 'text-neutral-300'}`}>Student</p>
                </button>
                <button
                  onClick={() => setNewUserRole('parent')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    newUserRole === 'parent'
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-neutral-700 hover:border-neutral-600'
                  }`}
                >
                  <UserPlus className={`w-6 h-6 mx-auto mb-2 ${newUserRole === 'parent' ? 'text-primary-500' : 'text-neutral-400'}`} />
                  <p className={`font-medium ${newUserRole === 'parent' ? 'text-primary-400' : 'text-neutral-300'}`}>Parent</p>
                </button>
              </div>
            </div>

            {/* Common Fields */}
            <Input
              label="Full Name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder={`Enter ${newUserRole}'s full name`}
            />
            <Input
              label="Email Address"
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder={`Enter ${newUserRole}'s email`}
            />

            {/* Student-specific fields */}
            {newUserRole === 'student' && (
              <>
                <Select
                  label="Year Group"
                  value={newUserYearGroup}
                  onChange={(e) => setNewUserYearGroup(e.target.value as YearGroup)}
                  options={[
                    { value: 'year5', label: 'Year 5' },
                    { value: 'year6', label: 'Year 6' },
                    { value: 'gcse', label: 'GCSE' },
                    { value: 'alevel', label: 'A-Level' },
                  ]}
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Subjects</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(['mathematics', 'economics', 'physics'] as Subject[]).map((subject) => (
                      <label
                        key={subject}
                        className={`flex items-center justify-center p-3 rounded-lg cursor-pointer transition-all ${
                          newUserSubjects.includes(subject)
                            ? 'bg-primary-500/20 border border-primary-500/50'
                            : 'bg-neutral-800 border border-neutral-700 hover:border-neutral-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={newUserSubjects.includes(subject)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewUserSubjects([...newUserSubjects, subject]);
                            } else {
                              setNewUserSubjects(newUserSubjects.filter((s) => s !== subject));
                            }
                          }}
                          className="sr-only"
                        />
                        <span className={`text-sm capitalize ${newUserSubjects.includes(subject) ? 'text-primary-400' : 'text-neutral-300'}`}>
                          {subject}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <Select
                  label="Link to Parent (Optional)"
                  value={newUserParentId}
                  onChange={(e) => setNewUserParentId(e.target.value)}
                  options={[
                    { value: '', label: 'No parent linked' },
                    ...getParents().map((p) => ({ value: p.id, label: `${p.name} (${p.email})` })),
                  ]}
                />
              </>
            )}

            {/* Parent-specific fields */}
            {newUserRole === 'parent' && (
              <Select
                label="Link to Child"
                value={newUserChildId}
                onChange={(e) => setNewUserChildId(e.target.value)}
                options={[
                  { value: '', label: 'Select a student to link' },
                  ...students.map((s) => ({ value: s.id, label: `${s.name} (${getYearGroupLabel(s.yearGroup)})` })),
                ]}
              />
            )}

            {createUserError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">{createUserError}</p>
              </div>
            )}

            <div className="pt-4 border-t border-neutral-800">
              <p className="text-xs text-neutral-500 mb-4">
                A temporary password will be generated using today's day and date (e.g., "Monday08"). The user should change it after first login.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowCreateUserModal(false);
                    resetCreateUserForm();
                  }}
                  disabled={isCreatingUser}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleCreateUser}
                  disabled={!newUserName.trim() || !newUserEmail.trim() || (newUserRole === 'student' && newUserSubjects.length === 0) || isCreatingUser}
                  icon={isCreatingUser ? undefined : <UserPlus className="w-4 h-4" />}
                >
                  {isCreatingUser ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Creating...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Complete Session Modal */}
      <Modal
        isOpen={showCompleteSessionForm}
        onClose={() => {
          setShowCompleteSessionForm(false);
          resetSessionNotes();
        }}
        title="Complete Session"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-neutral-800/50 rounded-xl">
            <p className="text-sm text-neutral-400">Completing session:</p>
            <p className="font-medium text-neutral-100">{selectedEvent?.title}</p>
            <p className="text-sm text-neutral-500">
              {selectedEvent?.date} • {students.find(s => s.id === selectedEvent?.studentId)?.name}
            </p>
          </div>

          {/* Student Performance */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Student Performance
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(['excellent', 'good', 'needs-improvement'] as const).map((performance) => (
                <button
                  key={performance}
                  onClick={() => setSessionNotes({ ...sessionNotes, studentPerformance: performance })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    sessionNotes.studentPerformance === performance
                      ? performance === 'excellent' ? 'bg-green-500/20 border-green-500/50 text-green-400' :
                        performance === 'good' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' :
                        'bg-orange-500/20 border-orange-500/50 text-orange-400'
                      : 'bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  <p className="text-sm font-medium capitalize">
                    {performance === 'needs-improvement' ? 'Needs Work' : performance}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Session Summary */}
          <Textarea
            label="Session Summary"
            value={sessionNotes.summary}
            onChange={(e) => setSessionNotes({ ...sessionNotes, summary: e.target.value })}
            placeholder="What was covered in this session?"
            rows={3}
          />

          {/* Topics Covered */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Topics Covered
            </label>
            <div className="space-y-2">
              {sessionNotes.topicsCovered.map((topic, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={topic}
                    onChange={(e) => updateTopicCovered(index, e.target.value)}
                    placeholder={`Topic ${index + 1}`}
                  />
                  {sessionNotes.topicsCovered.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTopicCovered(index)}
                      className="px-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={addTopicCovered}
                className="w-full text-primary-400 hover:text-primary-300"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Topic
              </Button>
            </div>
          </div>

          {/* Next Steps */}
          <Textarea
            label="Next Steps (optional)"
            value={sessionNotes.nextSteps}
            onChange={(e) => setSessionNotes({ ...sessionNotes, nextSteps: e.target.value })}
            placeholder="Recommendations for the next session"
            rows={2}
          />

          {/* Homework Assigned */}
          <Textarea
            label="Homework Assigned (optional)"
            value={sessionNotes.homeworkAssigned}
            onChange={(e) => setSessionNotes({ ...sessionNotes, homeworkAssigned: e.target.value })}
            placeholder="Any homework or practice for the student"
            rows={2}
          />

          {/* Private Tutor Notes */}
          <Textarea
            label="Private Notes (optional)"
            value={sessionNotes.tutorNotes}
            onChange={(e) => setSessionNotes({ ...sessionNotes, tutorNotes: e.target.value })}
            placeholder="Personal observations (not visible to students/parents)"
            rows={2}
          />

          <div className="flex gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCompleteSessionForm(false);
                resetSessionNotes();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCompleteSession}
              className="flex-1"
              disabled={!sessionNotes.summary.trim()}
              icon={<CheckCircle className="w-4 h-4" />}
            >
              Mark Complete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Penalty Management Modal */}
      <Modal
        isOpen={showPenaltyModal}
        onClose={() => setShowPenaltyModal(false)}
        title="Penalty Management"
        size="xl"
      >
        <PenaltyManagement
          students={students}
          onUpdateStudent={(updatedStudent) => {
            updateStudent(updatedStudent);
          }}
        />
      </Modal>

      {/* Bonus Management Modal */}
      <Modal
        isOpen={showBonusModal}
        onClose={() => setShowBonusModal(false)}
        title="Bonus & Rewards Management"
        size="xl"
      >
        <BonusManagement
          students={students}
          onUpdateStudent={(updatedStudent) => {
            updateStudent(updatedStudent);
          }}
        />
      </Modal>

      {/* Topic Mastery Modal */}
      <Modal
        isOpen={showTopicMasteryModal}
        onClose={() => setShowTopicMasteryModal(false)}
        title="Topic Mastery Management"
        size="xl"
      >
        <TopicMasteryManagement
          students={students}
          tutorId={user?.id || ''}
          onUpdateStudent={(updatedStudent) => {
            updateStudent(updatedStudent);
          }}
        />
      </Modal>

      {/* Leaderboard Modal */}
      <Modal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        title="Student Leaderboard"
        size="lg"
      >
        <Leaderboard
          students={students}
          showAllLevels={true}
        />
      </Modal>
    </DashboardLayout>
  );
};
