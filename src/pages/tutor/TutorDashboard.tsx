import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { StatCard } from '../../components/shared/StatCard';
import { UpcomingEvents } from '../../components/shared/Calendar';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Chat, ChatList } from '../../components/shared/Chat';
import { FeatureSettingsPanel } from '../../components/tutor/FeatureSettingsPanel';
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
} from 'lucide-react';
import { StudentProfile, Resource, ScheduleEvent, Subject, YearGroup } from '../../types';

export const TutorDashboard: React.FC = () => {
  const location = useLocation();
  const { getAllStudents, getParentById, updateStudent } = useAuth();
  const { schedule, getScheduleByTutorId, resources, addResource, addScheduleEvent } = useData();

  const students = getAllStudents();
  const tutorSchedule = getScheduleByTutorId('tutor-001');

  // Modal states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showAssessmentsModal, setShowAssessmentsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [selectedChatContact, setSelectedChatContact] = useState<{ id: string; name: string } | null>(null);

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
    }
  }, [location.pathname]);

  // Form states
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'worksheet' as Resource['type'],
    subject: 'mathematics' as Subject,
    topic: '',
    studentIds: [] as string[],
  });

  const [newEvent, setNewEvent] = useState({
    title: '',
    subject: 'mathematics' as Subject,
    date: '',
    startTime: '',
    endTime: '',
    location: "Student's Home",
    studentId: '',
    notes: '',
  });

  const handleAddResource = () => {
    const resource: Resource = {
      id: `resource-${Date.now()}`,
      ...newResource,
      createdAt: new Date().toISOString().split('T')[0],
      tutorId: 'tutor-001',
    };
    addResource(resource);
    setShowResourceModal(false);
    setNewResource({
      title: '',
      description: '',
      type: 'worksheet',
      subject: 'mathematics',
      topic: '',
      studentIds: [],
    });
  };

  const handleAddEvent = () => {
    const event: ScheduleEvent = {
      id: `event-${Date.now()}`,
      ...newEvent,
      tutorId: 'tutor-001',
      status: 'scheduled',
    };
    addScheduleEvent(event);
    setShowEventModal(false);
    setNewEvent({
      title: '',
      subject: 'mathematics',
      date: '',
      startTime: '',
      endTime: '',
      location: "Student's Home",
      studentId: '',
      notes: '',
    });
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
          <div className="flex gap-3">
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
          <Input
            label="Topic"
            value={newResource.topic}
            onChange={(e) => setNewResource({ ...newResource, topic: e.target.value })}
            placeholder="e.g., Quadratic Equations"
          />
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
            <Button variant="secondary" onClick={() => setShowResourceModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddResource} className="flex-1">
              Add Resource
            </Button>
          </div>
        </div>
      </Modal>

      {/* Schedule Event Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        title="Schedule Session"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Session Title"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            placeholder="e.g., Mathematics Session"
          />
          <div className="grid grid-cols-2 gap-4">
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
            <Select
              label="Student"
              value={newEvent.studentId}
              onChange={(e) => setNewEvent({ ...newEvent, studentId: e.target.value })}
              options={[
                { value: '', label: 'Select student' },
                ...students.map(s => ({ value: s.id, label: s.name })),
              ]}
            />
          </div>
          <Input
            label="Date"
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              value={newEvent.startTime}
              onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
            />
            <Input
              label="End Time"
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
          <Textarea
            label="Notes"
            value={newEvent.notes}
            onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
            placeholder="Session notes..."
            rows={2}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowEventModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddEvent} className="flex-1">
              Schedule
            </Button>
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
    </DashboardLayout>
  );
};
