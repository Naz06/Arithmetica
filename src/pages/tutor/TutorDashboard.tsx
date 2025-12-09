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
  Calendar,
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
    } else if (path.includes('/schedule') || path.includes('/calendar')) {
      setShowEventModal(true);
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-100 font-['Space_Grotesk']">
              Tutor Dashboard
            </h1>
            <p className="text-neutral-400 mt-1">Manage your students and track their progress</p>
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
            <Button variant="secondary" onClick={() => setShowEventModal(true)} icon={<Calendar className="w-4 h-4" />}>
              Schedule Session
            </Button>
            <Button variant="primary" onClick={() => setShowResourceModal(true)} icon={<Plus className="w-4 h-4" />}>
              Add Resource
            </Button>
          </div>
        </div>

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
            icon={<Calendar className="w-6 h-6" />}
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
                              <span>{student.stats.overallProgress}% progress</span>
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

                <div className="grid grid-cols-3 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-neutral-400 mb-2">Strengths</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.stats.strengths.map((s, i) => (
                        <Badge key={i} variant="success" size="sm">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-neutral-400 mb-2">Needs Work</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.stats.weaknesses.map((w, i) => (
                        <Badge key={i} variant="warning" size="sm">{w}</Badge>
                      ))}
                    </div>
                  </div>
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
                  <Calendar className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
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

      {/* Analytics Modal */}
      <Modal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        title="Analytics Overview"
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
              <p className="text-3xl font-bold text-primary-500">{students.length}</p>
              <p className="text-sm text-neutral-400">Total Students</p>
            </div>
            <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
              <p className="text-3xl font-bold text-green-500">
                {Math.round(students.reduce((acc, s) => acc + s.stats.overallProgress, 0) / students.length)}%
              </p>
              <p className="text-sm text-neutral-400">Avg. Progress</p>
            </div>
            <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
              <p className="text-3xl font-bold text-purple-500">
                {Math.round(students.reduce((acc, s) => acc + s.stats.averageScore, 0) / students.length)}%
              </p>
              <p className="text-sm text-neutral-400">Avg. Score</p>
            </div>
            <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
              <p className="text-3xl font-bold text-yellow-500">
                {students.reduce((acc, s) => acc + s.stats.totalSessions, 0)}
              </p>
              <p className="text-sm text-neutral-400">Total Sessions</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-neutral-400 mb-3">Student Performance Ranking</h4>
            <div className="space-y-3">
              {[...students].sort((a, b) => b.stats.overallProgress - a.stats.overallProgress).map((student, index) => (
                <div key={student.id} className="flex items-center gap-4 p-3 bg-neutral-800/50 rounded-xl">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                    index === 1 ? 'bg-neutral-400/20 text-neutral-400' :
                    index === 2 ? 'bg-orange-500/20 text-orange-500' :
                    'bg-neutral-700 text-neutral-500'
                  }`}>
                    {index + 1}
                  </div>
                  <Avatar name={student.name} size="sm" />
                  <div className="flex-1">
                    <p className="font-medium text-neutral-100">{student.name}</p>
                    <p className="text-xs text-neutral-500">{getYearGroupLabel(student.yearGroup)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-500">{student.stats.overallProgress}%</p>
                    <p className="text-xs text-neutral-500">Progress</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Assessments Modal */}
      <Modal
        isOpen={showAssessmentsModal}
        onClose={() => setShowAssessmentsModal(false)}
        title="Assessments"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-neutral-400 text-sm">View and manage student assessments</p>
          <div className="space-y-3">
            {students.map(student => (
              <div key={student.id} className="p-4 bg-neutral-800/50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={student.name} size="sm" />
                    <div>
                      <p className="font-medium text-neutral-100">{student.name}</p>
                      <p className="text-xs text-neutral-500">{getYearGroupLabel(student.yearGroup)}</p>
                    </div>
                  </div>
                  <Badge variant="info" size="sm">
                    Avg: {student.stats.averageScore}%
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="p-2 bg-neutral-900/50 rounded-lg text-center">
                    <p className="text-neutral-500">Completed</p>
                    <p className="font-semibold text-neutral-100">{student.stats.completedAssignments}</p>
                  </div>
                  <div className="p-2 bg-neutral-900/50 rounded-lg text-center">
                    <p className="text-neutral-500">Sessions</p>
                    <p className="font-semibold text-neutral-100">{student.stats.totalSessions}</p>
                  </div>
                  <div className="p-2 bg-neutral-900/50 rounded-lg text-center">
                    <p className="text-neutral-500">Attendance</p>
                    <p className="font-semibold text-neutral-100">{student.stats.attendanceRate}%</p>
                  </div>
                </div>
              </div>
            ))}
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
                  <div className="grid grid-cols-3 gap-2">
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
            <div className="grid grid-cols-3 gap-2">
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
