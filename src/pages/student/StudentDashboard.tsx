import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { GameStatCard } from '../../components/shared/StatCard';
import { UpcomingEvents } from '../../components/shared/Calendar';
import { GameAvatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar, CircularProgress } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Chat } from '../../components/shared/Chat';
import { Tabs } from '../../components/ui/Tabs';
import {
  Star,
  Zap,
  Target,
  Trophy,
  Flame,
  Shield,
  Sword,
  Heart,
  BookOpen,
  MessageCircle,
  ShoppingBag,
  FileText,
  TrendingUp,
  TrendingDown,
  Award,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { StudentProfile, ShopItem } from '../../types';
import { shopItems } from '../../data/demoData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

export const StudentDashboard: React.FC = () => {
  const location = useLocation();
  const { user, getStudentById, updateStudent, getTutor } = useAuth();
  const { getResourcesByStudentId, getAssessmentsByStudentId, getScheduleByStudentId, shopItems: items, purchaseItem } = useData();

  const student = user?.role === 'student' ? getStudentById(user.id) : null;
  const tutor = getTutor();
  const resources = student ? getResourcesByStudentId(student.id) : [];
  const assessments = student ? getAssessmentsByStudentId(student.id) : [];
  const schedule = student ? getScheduleByStudentId(student.id) : [];

  const [showChatModal, setShowChatModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Handle URL-based navigation for sidebar items
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/shop')) {
      setShowShopModal(true);
    } else if (path.includes('/achievements')) {
      setShowAchievementsModal(true);
    } else if (path.includes('/messages')) {
      setShowChatModal(true);
    } else if (path.includes('/resources')) {
      setShowResourcesModal(true);
    } else if (path.includes('/schedule')) {
      setShowScheduleModal(true);
    } else if (path.includes('/stats')) {
      setShowStatsModal(true);
    }
  }, [location.pathname]);

  if (!student) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-neutral-400">Loading student data...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate XP for next level
  const xpForNextLevel = student.level * 500;
  const currentXP = student.points % 500;
  const xpProgress = (currentXP / 500) * 100;

  // Prepare radar chart data
  const skillsData = student.stats.subjectStats.map(stat => ({
    subject: stat.subject.charAt(0).toUpperCase() + stat.subject.slice(1),
    value: stat.progress,
  }));

  // Weekly progress data
  const weeklyData = student.stats.weeklyProgress;

  const handlePurchase = (item: ShopItem) => {
    if (student.points >= item.cost && !student.avatar.unlockedItems.includes(item.id)) {
      purchaseItem(item.id, student.id, updateStudent, student);
    }
  };

  const achievements = [
    { id: 1, name: 'First Steps', description: 'Complete your first session', earned: true, icon: '🚀' },
    { id: 2, name: 'Quick Learner', description: 'Score 80%+ on 5 assessments', earned: true, icon: '⚡' },
    { id: 3, name: 'Consistent', description: 'Attend 10 sessions in a row', earned: true, icon: '🔥' },
    { id: 4, name: 'Math Wizard', description: 'Reach 90% progress in Mathematics', earned: student.stats.subjectStats.find(s => s.subject === 'mathematics')?.progress >= 90, icon: '🧮' },
    { id: 5, name: 'Physics Pro', description: 'Reach 90% progress in Physics', earned: false, icon: '⚛️' },
    { id: 6, name: 'Perfect Score', description: 'Get 100% on any assessment', earned: false, icon: '💯' },
    { id: 7, name: 'Knowledge Seeker', description: 'Complete 50 assignments', earned: false, icon: '📚' },
    { id: 8, name: 'Star Student', description: 'Reach Level 20', earned: false, icon: '⭐' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header with Avatar and Level */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-6">
            <GameAvatar
              character={student.avatar.baseCharacter}
              outfit={student.avatar.outfit}
              accessory={student.avatar.accessory}
              background={student.avatar.background}
              badge={student.avatar.badge}
              level={student.level}
              size="lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-neutral-100 font-['Space_Grotesk']">
                Welcome back, {student.name.split(' ')[0]}! 🌟
              </h1>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-lg font-bold text-yellow-500">{student.points} pts</span>
                </div>
                <div className="w-48">
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>Level {student.level}</span>
                    <span>Level {student.level + 1}</span>
                  </div>
                  <ProgressBar value={xpProgress} size="sm" variant="gradient" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowShopModal(true)} icon={<ShoppingBag className="w-4 h-4" />}>
              Shop
            </Button>
            <Button variant="secondary" onClick={() => setShowAchievementsModal(true)} icon={<Trophy className="w-4 h-4" />}>
              Achievements
            </Button>
            <Button variant="primary" onClick={() => setShowChatModal(true)} icon={<MessageCircle className="w-4 h-4" />}>
              Chat with Tutor
            </Button>
          </div>
        </div>

        {/* Game Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GameStatCard
            title="Power Level"
            value={student.stats.overallProgress}
            maxValue={100}
            icon={<Zap className="w-6 h-6" />}
            color="blue"
          />
          <GameStatCard
            title="Sessions"
            value={student.stats.totalSessions}
            icon={<Target className="w-6 h-6" />}
            color="green"
          />
          <GameStatCard
            title="Quests Done"
            value={student.stats.completedAssignments}
            icon={<CheckCircle className="w-6 h-6" />}
            color="purple"
          />
          <GameStatCard
            title="Accuracy"
            value={`${student.stats.averageScore}%`}
            icon={<Trophy className="w-6 h-6" />}
            color="orange"
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Stats & Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subject Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-500" />
                  Skill Tree
                </CardTitle>
                <CardDescription>Your abilities across different subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Radar Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={skillsData}>
                        <PolarGrid stroke="#404040" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#a3a3a3' }} />
                        <Radar
                          name="Skills"
                          dataKey="value"
                          stroke="#0EA5E9"
                          fill="#0EA5E9"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Subject Bars */}
                  <div className="space-y-4">
                    {student.stats.subjectStats.map(stat => (
                      <div key={stat.subject} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {stat.subject === 'mathematics' && <Sword className="w-4 h-4 text-blue-400" />}
                            {stat.subject === 'physics' && <Zap className="w-4 h-4 text-purple-400" />}
                            {stat.subject === 'economics' && <Target className="w-4 h-4 text-green-400" />}
                            <span className="text-sm font-medium text-neutral-100 capitalize">{stat.subject}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="info" size="sm">{stat.grade}</Badge>
                            <span className="text-sm text-neutral-400">{stat.progress}%</span>
                          </div>
                        </div>
                        <ProgressBar value={stat.progress} variant="gradient" size="md" />
                        <p className="text-xs text-neutral-500">
                          {stat.topicsCompleted}/{stat.totalTopics} topics mastered
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Progress Quest
                </CardTitle>
                <CardDescription>Your journey over the past weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                      <XAxis dataKey="week" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#171717',
                          border: '1px solid #404040',
                          borderRadius: '8px',
                        }}
                      />
                      <Line type="monotone" dataKey="mathematics" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
                      <Line type="monotone" dataKey="physics" stroke="#A855F7" strokeWidth={2} dot={{ fill: '#A855F7' }} />
                      <Line type="monotone" dataKey="economics" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-neutral-400">Maths</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-sm text-neutral-400">Physics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-neutral-400">Economics</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <TrendingUp className="w-5 h-5" />
                    Power Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {student.stats.strengths.map((strength, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-neutral-100">{strength}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-400">
                    <Target className="w-5 h-5" />
                    Training Grounds
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[...student.stats.weaknesses, ...student.stats.improvements].slice(0, 4).map((area, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-lg">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-neutral-100">{area}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Schedule & Resources */}
          <div className="space-y-6">
            <UpcomingEvents events={schedule} />

            {/* Recent Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-500" />
                  Quest Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resources.length === 0 ? (
                  <p className="text-sm text-neutral-500 text-center py-4">No resources yet</p>
                ) : (
                  <div className="space-y-3">
                    {resources.map(resource => (
                      <div
                        key={resource.id}
                        className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-100 truncate">{resource.title}</p>
                          <p className="text-xs text-neutral-500">{resource.topic}</p>
                        </div>
                        <Badge size="sm">{resource.type}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Assessments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Battle Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assessments.length === 0 ? (
                  <p className="text-sm text-neutral-500 text-center py-4">No assessments yet</p>
                ) : (
                  <div className="space-y-3">
                    {assessments.map(assessment => (
                      <div
                        key={assessment.id}
                        className="p-3 bg-neutral-800/50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-neutral-100">{assessment.title}</p>
                          <Badge
                            variant={assessment.score >= 80 ? 'success' : assessment.score >= 60 ? 'warning' : 'error'}
                            size="sm"
                          >
                            {assessment.score}/{assessment.maxScore}
                          </Badge>
                        </div>
                        <p className="text-xs text-neutral-500">{assessment.feedback}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
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

      {/* Shop Modal */}
      <Modal
        isOpen={showShopModal}
        onClose={() => setShowShopModal(false)}
        title="Cosmic Shop"
        size="xl"
      >
        <div className="mb-6 p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-neutral-400">Your Balance</p>
              <p className="text-2xl font-bold text-yellow-500">{student.points} Points</p>
            </div>
          </div>
        </div>

        <Tabs
          tabs={[
            {
              id: 'outfits',
              label: 'Outfits',
              content: (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {items.filter(i => i.type === 'outfit').map(item => {
                    const owned = student.avatar.unlockedItems.includes(item.id);
                    const canAfford = student.points >= item.cost;
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border text-center ${
                          owned
                            ? 'bg-green-500/10 border-green-500/30'
                            : canAfford
                            ? 'bg-neutral-800/50 border-neutral-700 hover:border-primary-500'
                            : 'bg-neutral-800/30 border-neutral-800 opacity-50'
                        }`}
                      >
                        <div className="text-4xl mb-2">{item.image}</div>
                        <p className="text-sm font-medium text-neutral-100">{item.name}</p>
                        <p className="text-xs text-yellow-500 mt-1">
                          {owned ? 'Owned' : `${item.cost} pts`}
                        </p>
                        {!owned && canAfford && (
                          <Button
                            size="sm"
                            variant="primary"
                            className="mt-2 w-full"
                            onClick={() => handlePurchase(item)}
                          >
                            Buy
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ),
            },
            {
              id: 'accessories',
              label: 'Accessories',
              content: (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {items.filter(i => i.type === 'accessory').map(item => {
                    const owned = student.avatar.unlockedItems.includes(item.id);
                    const canAfford = student.points >= item.cost;
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border text-center ${
                          owned
                            ? 'bg-green-500/10 border-green-500/30'
                            : canAfford
                            ? 'bg-neutral-800/50 border-neutral-700 hover:border-primary-500'
                            : 'bg-neutral-800/30 border-neutral-800 opacity-50'
                        }`}
                      >
                        <div className="text-4xl mb-2">{item.image}</div>
                        <p className="text-sm font-medium text-neutral-100">{item.name}</p>
                        <p className="text-xs text-yellow-500 mt-1">
                          {owned ? 'Owned' : `${item.cost} pts`}
                        </p>
                        {!owned && canAfford && (
                          <Button
                            size="sm"
                            variant="primary"
                            className="mt-2 w-full"
                            onClick={() => handlePurchase(item)}
                          >
                            Buy
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ),
            },
            {
              id: 'backgrounds',
              label: 'Backgrounds',
              content: (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {items.filter(i => i.type === 'background').map(item => {
                    const owned = student.avatar.unlockedItems.includes(item.id);
                    const canAfford = student.points >= item.cost;
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border text-center ${
                          owned
                            ? 'bg-green-500/10 border-green-500/30'
                            : canAfford
                            ? 'bg-neutral-800/50 border-neutral-700 hover:border-primary-500'
                            : 'bg-neutral-800/30 border-neutral-800 opacity-50'
                        }`}
                      >
                        <div className="text-4xl mb-2">{item.image}</div>
                        <p className="text-sm font-medium text-neutral-100">{item.name}</p>
                        <p className="text-xs text-yellow-500 mt-1">
                          {owned ? 'Owned' : `${item.cost} pts`}
                        </p>
                        {!owned && canAfford && (
                          <Button
                            size="sm"
                            variant="primary"
                            className="mt-2 w-full"
                            onClick={() => handlePurchase(item)}
                          >
                            Buy
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ),
            },
            {
              id: 'badges',
              label: 'Badges',
              content: (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {items.filter(i => i.type === 'badge').map(item => {
                    const owned = student.avatar.unlockedItems.includes(item.id);
                    const canAfford = student.points >= item.cost;
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border text-center ${
                          owned
                            ? 'bg-green-500/10 border-green-500/30'
                            : canAfford
                            ? 'bg-neutral-800/50 border-neutral-700 hover:border-primary-500'
                            : 'bg-neutral-800/30 border-neutral-800 opacity-50'
                        }`}
                      >
                        <div className="text-4xl mb-2">{item.image}</div>
                        <p className="text-sm font-medium text-neutral-100">{item.name}</p>
                        <p className="text-xs text-yellow-500 mt-1">
                          {owned ? 'Owned' : `${item.cost} pts`}
                        </p>
                        {!owned && canAfford && (
                          <Button
                            size="sm"
                            variant="primary"
                            className="mt-2 w-full"
                            onClick={() => handlePurchase(item)}
                          >
                            Buy
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ),
            },
          ]}
        />
      </Modal>

      {/* Resources Modal */}
      <Modal
        isOpen={showResourcesModal}
        onClose={() => setShowResourcesModal(false)}
        title="My Resources"
        size="lg"
      >
        <div className="space-y-4">
          {resources.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-500">No resources assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map(resource => (
                <div
                  key={resource.id}
                  className="flex items-center gap-3 p-4 bg-neutral-800/50 rounded-xl hover:bg-neutral-800 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-100">{resource.title}</p>
                    <p className="text-sm text-neutral-400">{resource.topic}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge size="sm">{resource.type}</Badge>
                      <Badge size="sm" variant="info">{resource.subject}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="My Schedule"
        size="lg"
      >
        <div className="space-y-4">
          {schedule.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-500">No upcoming sessions</p>
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

      {/* Stats Modal */}
      <Modal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        title="My Stats"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
              <p className="text-2xl font-bold text-primary-500">{student.stats.overallProgress}%</p>
              <p className="text-sm text-neutral-400">Overall Progress</p>
            </div>
            <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
              <p className="text-2xl font-bold text-green-500">Lv.{student.level}</p>
              <p className="text-sm text-neutral-400">Level</p>
            </div>
            <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
              <p className="text-2xl font-bold text-yellow-500">{student.points}</p>
              <p className="text-sm text-neutral-400">Points</p>
            </div>
            <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
              <p className="text-2xl font-bold text-purple-500">{student.stats.averageScore}%</p>
              <p className="text-sm text-neutral-400">Avg. Score</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-neutral-400 mb-3">Subject Progress</h4>
            <div className="space-y-3">
              {student.stats.subjectStats.map(stat => (
                <div key={stat.subject}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-100 capitalize">{stat.subject}</span>
                    <span className="text-neutral-400">Grade: {stat.grade}</span>
                  </div>
                  <ProgressBar value={stat.progress} variant="gradient" />
                  <p className="text-xs text-neutral-500 mt-1">
                    {stat.topicsCompleted}/{stat.totalTopics} topics mastered
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-neutral-800/30 rounded-lg">
              <p className="text-neutral-500 text-sm">Total Sessions</p>
              <p className="text-lg font-semibold text-neutral-100">{student.stats.totalSessions}</p>
            </div>
            <div className="p-3 bg-neutral-800/30 rounded-lg">
              <p className="text-neutral-500 text-sm">Attendance Rate</p>
              <p className="text-lg font-semibold text-neutral-100">{student.stats.attendanceRate}%</p>
            </div>
            <div className="p-3 bg-neutral-800/30 rounded-lg">
              <p className="text-neutral-500 text-sm">Assignments Done</p>
              <p className="text-lg font-semibold text-neutral-100">{student.stats.completedAssignments}</p>
            </div>
            <div className="p-3 bg-neutral-800/30 rounded-lg">
              <p className="text-neutral-500 text-sm">Current Streak</p>
              <p className="text-lg font-semibold text-neutral-100">{student.stats.streakDays} days</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Achievements Modal */}
      <Modal
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
        title="Achievements"
        size="lg"
      >
        <div className="grid grid-cols-2 gap-4">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`p-4 rounded-xl border ${
                achievement.earned
                  ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                  : 'bg-neutral-800/30 border-neutral-800 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{achievement.icon}</div>
                <div>
                  <p className="font-medium text-neutral-100">{achievement.name}</p>
                  <p className="text-xs text-neutral-400">{achievement.description}</p>
                </div>
              </div>
              {achievement.earned && (
                <Badge variant="success" size="sm" className="mt-2">Earned!</Badge>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </DashboardLayout>
  );
};
