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
import { ProgressBar, CircularProgress } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Chat } from '../../components/shared/Chat';
import { ConstellationSkillTree } from '../../components/shared/ConstellationSkillTree';
import { LessonPlans } from '../../components/shared/LessonPlans';
import {
  TrendingUp,
  BookOpen,
  Calendar,
  MessageCircle,
  Award,
  Target,
  Clock,
  CheckCircle,
  Star,
  BarChart3,
  FileText,
  Send,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { StudentProfile, ParentProfile, Notification } from '../../types';

export const ParentDashboard: React.FC = () => {
  const location = useLocation();
  const { user, getStudentsByParentId, getTutor } = useAuth();
  const { getScheduleByStudentId, getAssessmentsByStudentId, addNotification } = useData();

  const parent = user as ParentProfile | null;
  const children = parent ? getStudentsByParentId(parent.id) : [];
  const tutor = getTutor();

  const [showChatModal, setShowChatModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFeedbackRequestModal, setShowFeedbackRequestModal] = useState(false);
  const [feedbackRequestSent, setFeedbackRequestSent] = useState(false);
  const [selectedChild, setSelectedChild] = useState<StudentProfile | null>(children[0] || null);

  // Handle URL-based navigation for sidebar items
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/messages')) {
      setShowChatModal(true);
    } else if (path.includes('/progress')) {
      setShowProgressModal(true);
    } else if (path.includes('/reports')) {
      setShowReportsModal(true);
    } else if (path.includes('/schedule')) {
      setShowScheduleModal(true);
    } else if (path.includes('/feedback-request')) {
      setShowFeedbackRequestModal(true);
    }
  }, [location.pathname]);

  // Handle feedback request
  const handleSendFeedbackRequest = () => {
    if (!parent || !selectedChild) return;

    const notification: Notification = {
      id: `notification-${Date.now()}`,
      userId: tutor.id,
      title: `Feedback Request from ${parent.name}`,
      message: `${parent.name} is requesting feedback on ${selectedChild.name}'s progress.`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
      fromId: parent.id,
      fromName: parent.name,
      fromRole: 'parent',
      notificationType: 'feedback-request',
    };

    addNotification(notification);
    setFeedbackRequestSent(true);
    setTimeout(() => {
      setFeedbackRequestSent(false);
      setShowFeedbackRequestModal(false);
    }, 2000);
  };

  if (!parent || children.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-neutral-400">Loading data...</p>
        </div>
      </DashboardLayout>
    );
  }

  const child = selectedChild || children[0];
  const schedule = getScheduleByStudentId(child.id);
  const assessments = getAssessmentsByStudentId(child.id);

  // Chart colors
  const COLORS = ['#0EA5E9', '#22C55E', '#A855F7', '#F59E0B'];

  // Prepare subject breakdown for pie chart
  const subjectData = child.stats.subjectStats.map(stat => ({
    name: stat.subject.charAt(0).toUpperCase() + stat.subject.slice(1),
    value: stat.progress,
    grade: stat.grade,
  }));

  // Weekly progress data
  const weeklyData = child.stats.weeklyProgress;

  // Assessment scores over time
  const assessmentData = assessments.map(a => ({
    name: a.title.substring(0, 15) + '...',
    score: Math.round((a.score / a.maxScore) * 100),
    subject: a.subject,
  }));

  // Session completion data
  const sessionData = [
    { name: 'Completed', value: child.stats.totalSessions },
    { name: 'Assignments', value: child.stats.completedAssignments },
  ];

  const getYearGroupLabel = (yg: string): string => {
    const labels: Record<string, string> = {
      year5: 'Year 5',
      year6: 'Year 6',
      gcse: 'GCSE',
      alevel: 'A-Level',
    };
    return labels[yg] || yg;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-100 font-['Space_Grotesk']">
              Parent Dashboard
            </h1>
            <p className="text-neutral-400 mt-1">Track your child's educational progress</p>
          </div>
          <div className="flex gap-3">
            {children.length > 1 && (
              <select
                value={selectedChild?.id || ''}
                onChange={(e) => {
                  const child = children.find(c => c.id === e.target.value);
                  setSelectedChild(child || null);
                }}
                className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2 text-neutral-100"
              >
                {children.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            <Button variant="secondary" onClick={() => setShowFeedbackRequestModal(true)} icon={<Send className="w-4 h-4" />}>
              Request Feedback
            </Button>
            <Button variant="primary" onClick={() => setShowChatModal(true)} icon={<MessageCircle className="w-4 h-4" />}>
              Contact Tutor
            </Button>
          </div>
        </div>

        {/* Child Overview Card */}
        <Card className="bg-gradient-to-br from-primary-500/10 to-purple-500/10 border-primary-500/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Avatar name={child.name} size="xl" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-neutral-100">{child.name}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="info">{getYearGroupLabel(child.yearGroup)}</Badge>
                  {child.subjects.map(subj => (
                    <Badge key={subj} variant="default">{subj}</Badge>
                  ))}
                </div>
                <div className="flex items-center gap-6 mt-4">
                  <div>
                    <p className="text-sm text-neutral-400">Level</p>
                    <p className="text-xl font-bold text-primary-500">{child.level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Points</p>
                    <p className="text-xl font-bold text-yellow-500">{child.points}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Avg Score</p>
                    <p className="text-xl font-bold text-green-500">{child.stats.averageScore}%</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <CircularProgress
                  value={child.stats.overallProgress}
                  size={120}
                  strokeWidth={10}
                  label="Overall Progress"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Overall Progress"
            value={`${child.stats.overallProgress}%`}
            icon={<TrendingUp className="w-6 h-6" />}
            change={5}
            changeLabel="this month"
            variant="gradient"
          />
          <StatCard
            title="Sessions Attended"
            value={child.stats.totalSessions}
            icon={<Calendar className="w-6 h-6" />}
          />
          <StatCard
            title="Assignments Completed"
            value={child.stats.completedAssignments}
            icon={<CheckCircle className="w-6 h-6" />}
          />
          <StatCard
            title="Average Score"
            value={`${child.stats.averageScore}%`}
            icon={<Award className="w-6 h-6" />}
            change={3}
            changeLabel="improvement"
          />
        </div>

        {/* Constellation Skill Tree - Curriculum Progress */}
        <ConstellationSkillTree
          enrolledSubjects={child.subjects}
          subjectStats={child.stats.subjectStats.filter(s => child.subjects.includes(s.subject))}
          yearGroup={child.yearGroup}
        />

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Progress Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                Progress Over Time
              </CardTitle>
              <CardDescription>Weekly performance trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                    <XAxis dataKey="week" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#a3a3a3', fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#171717',
                        border: '1px solid #404040',
                        borderRadius: '8px',
                      }}
                    />
                    <Area type="monotone" dataKey="mathematics" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="physics" stackId="2" stroke="#A855F7" fill="#A855F7" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="economics" stackId="3" stroke="#22C55E" fill="#22C55E" fillOpacity={0.3} />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Subject Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                Subject Performance
              </CardTitle>
              <CardDescription>Current grades and progress by subject</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, grade }) => `${name}: ${grade}`}
                    >
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#171717',
                        border: '1px solid #404040',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row of Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Assessment Scores */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" />
                Recent Assessment Scores
              </CardTitle>
              <CardDescription>Performance on recent tests and quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              {assessmentData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-neutral-500">
                  No assessments yet
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={assessmentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                      <XAxis dataKey="name" tick={{ fill: '#a3a3a3', fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                      <YAxis tick={{ fill: '#a3a3a3', fontSize: 12 }} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#171717',
                          border: '1px solid #404040',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="score" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lesson Plans & Session History */}
          <LessonPlans schedule={schedule} />
        </div>

        {/* Strengths & Areas for Improvement */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <Star className="w-5 h-5" />
                Areas of Strength
              </CardTitle>
              <CardDescription>Topics where your child excels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {child.stats.strengths.map((strength, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-neutral-100">{strength}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <Target className="w-5 h-5" />
                Areas for Improvement
              </CardTitle>
              <CardDescription>Topics that need more focus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...child.stats.weaknesses, ...child.stats.improvements].map((area, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                    <Target className="w-5 h-5 text-orange-500" />
                    <span className="text-neutral-100">{area}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Progress Details */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Progress Details</CardTitle>
            <CardDescription>Detailed breakdown of progress in each subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {child.stats.subjectStats.map(stat => (
                <div key={stat.subject} className="p-4 bg-neutral-800/50 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        stat.subject === 'mathematics' ? 'bg-blue-500/20' :
                        stat.subject === 'physics' ? 'bg-purple-500/20' : 'bg-green-500/20'
                      }`}>
                        <BookOpen className={`w-5 h-5 ${
                          stat.subject === 'mathematics' ? 'text-blue-400' :
                          stat.subject === 'physics' ? 'text-purple-400' : 'text-green-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-100 capitalize">{stat.subject}</h3>
                        <p className="text-sm text-neutral-400">{stat.topicsCompleted} of {stat.totalTopics} topics completed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={stat.progress >= 80 ? 'success' : stat.progress >= 60 ? 'warning' : 'error'} size="md">
                        Grade: {stat.grade}
                      </Badge>
                    </div>
                  </div>
                  <ProgressBar
                    value={stat.progress}
                    showLabel
                    label="Progress"
                    variant="gradient"
                  />
                  <div className="mt-3 flex items-center gap-4">
                    <span className="text-sm text-neutral-400">Recent scores:</span>
                    <div className="flex gap-2">
                      {stat.recentScores.map((score, i) => (
                        <span
                          key={i}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            score >= 80 ? 'bg-green-500/20 text-green-400' :
                            score >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {score}%
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Modal */}
      <Modal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        title="Chat with Tutor"
        size="lg"
      >
        <Chat recipientId={tutor.id} recipientName={tutor.name} />
      </Modal>

      {/* Progress Modal */}
      <Modal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        title={`${child.name}'s Progress`}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
              <p className="text-2xl font-bold text-primary-500">{child.stats.overallProgress}%</p>
              <p className="text-sm text-neutral-400">Overall Progress</p>
            </div>
            <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
              <p className="text-2xl font-bold text-green-500">Lv.{child.level}</p>
              <p className="text-sm text-neutral-400">Level</p>
            </div>
            <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
              <p className="text-2xl font-bold text-purple-500">{child.stats.averageScore}%</p>
              <p className="text-sm text-neutral-400">Avg. Score</p>
            </div>
            <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
              <p className="text-2xl font-bold text-yellow-500">{child.stats.attendanceRate}%</p>
              <p className="text-sm text-neutral-400">Attendance</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-neutral-400 mb-3">Subject Progress</h4>
            <div className="space-y-4">
              {child.stats.subjectStats.map(stat => (
                <div key={stat.subject} className="p-4 bg-neutral-800/50 rounded-xl">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-neutral-100 capitalize">{stat.subject}</span>
                    <span className="text-primary-500 font-bold">{stat.grade}</span>
                  </div>
                  <ProgressBar value={stat.progress} variant="gradient" />
                  <p className="text-xs text-neutral-500 mt-2">
                    {stat.topicsCompleted} of {stat.totalTopics} topics completed
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Reports Modal */}
      <Modal
        isOpen={showReportsModal}
        onClose={() => setShowReportsModal(false)}
        title="Performance Reports"
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-neutral-800/50 rounded-xl">
            <h4 className="font-medium text-neutral-100 mb-3">Summary for {child.name}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-500">Total Sessions Attended</p>
                <p className="text-lg font-semibold text-neutral-100">{child.stats.totalSessions}</p>
              </div>
              <div>
                <p className="text-neutral-500">Assignments Completed</p>
                <p className="text-lg font-semibold text-neutral-100">{child.stats.completedAssignments}</p>
              </div>
              <div>
                <p className="text-neutral-500">Average Test Score</p>
                <p className="text-lg font-semibold text-neutral-100">{child.stats.averageScore}%</p>
              </div>
              <div>
                <p className="text-neutral-500">Current Level</p>
                <p className="text-lg font-semibold text-neutral-100">Level {child.level}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <h4 className="font-medium text-green-400 mb-2">Strengths</h4>
              <div className="space-y-1">
                {child.stats.strengths.map((s, i) => (
                  <p key={i} className="text-sm text-neutral-300">{s}</p>
                ))}
              </div>
            </div>
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
              <h4 className="font-medium text-orange-400 mb-2">Areas to Improve</h4>
              <div className="space-y-1">
                {child.stats.weaknesses.map((w, i) => (
                  <p key={i} className="text-sm text-neutral-300">{w}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Upcoming Sessions"
        size="lg"
      >
        <div className="space-y-4">
          {schedule.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-500">No upcoming sessions scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedule.map(event => (
                <div
                  key={event.id}
                  className="p-4 bg-neutral-800/50 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-neutral-100">{event.title}</h4>
                    <Badge variant={event.status === 'completed' ? 'success' : 'info'} size="sm">
                      {event.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-neutral-400">
                    <span>{event.date}</span>
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">{event.location}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Feedback Request Modal */}
      <Modal
        isOpen={showFeedbackRequestModal}
        onClose={() => {
          setShowFeedbackRequestModal(false);
          setFeedbackRequestSent(false);
        }}
        title="Request Feedback"
        size="md"
      >
        {feedbackRequestSent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-100 mb-2">Request Sent!</h3>
            <p className="text-neutral-400 text-sm">The tutor will be notified of your feedback request.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-neutral-400 text-sm">
              Request a feedback update from your child's tutor. They will be notified and can provide you with a progress report.
            </p>

            <div className="p-4 bg-neutral-800/50 rounded-xl">
              <p className="text-sm text-neutral-400 mb-2">Requesting feedback for:</p>
              <div className="flex items-center gap-3">
                <Avatar name={child.name} size="sm" />
                <div>
                  <p className="font-medium text-neutral-100">{child.name}</p>
                  <p className="text-xs text-neutral-500">{getYearGroupLabel(child.yearGroup)}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
              <p className="text-sm text-primary-400">
                Your tutor will receive a notification that you've requested feedback on {child.name}'s progress.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowFeedbackRequestModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSendFeedbackRequest}
                icon={<Send className="w-4 h-4" />}
              >
                Send Request
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};
