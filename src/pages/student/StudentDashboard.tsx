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
import { ConstellationSkillTree } from '../../components/shared/ConstellationSkillTree';
import { LessonPlans } from '../../components/shared/LessonPlans';
import { StellarJourney } from '../../components/shared/StellarJourney';
import { LeaderboardPreview, Leaderboard } from '../../components/shared/Leaderboard';
import { CommandCenter, CommandCenterPreview } from '../../components/shared/CommandCenter';
import { SpaceItemCategory, getItemById, getItemPrice, defaultEquippedItems, defaultInventory } from '../../data/spaceShopItems';
import {
  Star,
  Zap,
  Target,
  Trophy,
  Flame,
  BookOpen,
  MessageCircle,
  ShoppingBag,
  FileText,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  Send,
  AlertTriangle,
  History,
  TrendingDown,
} from 'lucide-react';
import { StudentProfile, ShopItem, QuickNotificationType, Notification, ResourceLevel, PenaltyRecord, EquippedItems, ActiveBooster } from '../../types';
import { Rocket } from 'lucide-react';
import { shopItems } from '../../data/demoData';
import { getPenaltyDisplayInfo, getTotalPenaltiesInPeriod, isStudentAtRisk } from '../../utils/penaltySystem';

export const StudentDashboard: React.FC = () => {
  const location = useLocation();
  const { user, getStudentById, updateStudent, getTutor, getAllStudents } = useAuth();
  const { getResourcesByStudentId, getAssessmentsByStudentId, getScheduleByStudentId, shopItems: items, purchaseItem, addNotification } = useData();

  const student = user?.role === 'student' ? getStudentById(user.id) : null;
  const tutor = getTutor();
  const allResources = student ? getResourcesByStudentId(student.id) : [];
  const assessments = student ? getAssessmentsByStudentId(student.id) : [];
  const schedule = student ? getScheduleByStudentId(student.id) : [];

  // Map student year group to resource level
  const getStudentLevel = (): ResourceLevel | null => {
    if (!student) return null;
    switch (student.yearGroup) {
      case 'year5':
      case 'year6':
        return 'year5-6';
      case 'gcse':
        return 'gcse';
      case 'alevel':
        return 'alevel';
      default:
        return null;
    }
  };

  const studentLevel = getStudentLevel();
  // Filter resources by student's level
  const resources = allResources.filter(r => !r.level || r.level === studentLevel);

  const [showChatModal, setShowChatModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showQuickMessageModal, setShowQuickMessageModal] = useState(false);
  const [showPenaltyHistoryModal, setShowPenaltyHistoryModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showCommandCenterModal, setShowCommandCenterModal] = useState(false);

  // Calculate penalty stats
  const penaltyHistory = student?.stats.penaltyHistory || [];
  const recentPenalties = penaltyHistory.filter(p => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return new Date(p.appliedAt) >= cutoff && !p.waived;
  });
  const { count: penaltyCount, totalPoints: penaltyPointsLost } = student
    ? getTotalPenaltiesInPeriod(penaltyHistory, 30)
    : { count: 0, totalPoints: 0 };
  const riskStatus = student ? isStudentAtRisk(student) : { atRisk: false, riskLevel: 'low' as const, reasons: [] };

  // Quick message state
  const [quickMessageType, setQuickMessageType] = useState<QuickNotificationType>('update');
  const [quickMessageText, setQuickMessageText] = useState('');
  const [quickMessageSent, setQuickMessageSent] = useState(false);

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
    } else if (path.includes('/quick-message')) {
      setShowQuickMessageModal(true);
    } else if (path.includes('/leaderboard')) {
      setShowLeaderboardModal(true);
    } else if (path.includes('/command-center')) {
      setShowCommandCenterModal(true);
    }
  }, [location.pathname]);

  // Handle quick message send
  const handleSendQuickMessage = () => {
    if (!student || !quickMessageText.trim()) return;

    const notification: Notification = {
      id: `notification-${Date.now()}`,
      userId: tutor.id,
      title: `Quick Message from ${student.name}`,
      message: quickMessageText.trim(),
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
      fromId: student.id,
      fromName: student.name,
      fromRole: 'student',
      notificationType: quickMessageType,
    };

    addNotification(notification);
    setQuickMessageSent(true);
    setQuickMessageText('');
    setTimeout(() => {
      setQuickMessageSent(false);
      setShowQuickMessageModal(false);
    }, 2000);
  };

  const getQuickMessageTypeLabel = (type: QuickNotificationType): string => {
    switch (type) {
      case 'update': return 'Update';
      case 'homework-help': return 'Question';
      default: return 'Message';
    }
  };

  // Handle username update for leaderboard
  const handleUpdateUsername = (studentId: string, username: string) => {
    const studentToUpdate = getStudentById(studentId);
    if (studentToUpdate) {
      updateStudent({
        ...studentToUpdate,
        username,
      });
    }
  };

  // Command Center handlers
  const handlePurchaseItem = (itemId: string, price: number) => {
    if (!student || student.points < price) return;

    const currentInventory = student.inventory || [...defaultInventory];
    if (currentInventory.includes(itemId)) return; // Already owned

    updateStudent({
      ...student,
      points: student.points - price,
      inventory: [...currentInventory, itemId],
    });
  };

  const handleEquipItem = (category: SpaceItemCategory, itemId: string | null) => {
    if (!student) return;

    const currentEquipped = student.equippedItems || { ...defaultEquippedItems };
    const updatedEquipped: EquippedItems = { ...currentEquipped };

    switch (category) {
      case 'title':
        updatedEquipped.title = itemId;
        break;
      case 'frame':
        updatedEquipped.frame = itemId;
        break;
      case 'avatar':
        if (itemId) updatedEquipped.avatar = itemId;
        break;
      case 'spaceship':
        if (itemId) updatedEquipped.spaceship = itemId;
        break;
      case 'celebration':
        if (itemId) updatedEquipped.celebration = itemId;
        break;
    }

    updateStudent({
      ...student,
      equippedItems: updatedEquipped,
    });
  };

  const handleActivateBooster = (itemId: string) => {
    if (!student) return;

    const item = getItemById(itemId);
    if (!item || item.category !== 'booster') return;

    const currentInventory = student.inventory || [];
    if (!currentInventory.includes(itemId)) return; // Don't own it

    // Remove from inventory (consumable)
    const updatedInventory = currentInventory.filter(id => id !== itemId);

    // Add to active boosters
    const currentBoosters = student.activeBoosters || [];
    const now = new Date();
    const newBooster: ActiveBooster = {
      id: `booster-${Date.now()}`,
      itemId: itemId,
      activatedAt: now.toISOString(),
      effect: item.effect || '',
    };

    // If booster has duration, set expiry
    if (item.duration) {
      const expiresAt = new Date(now.getTime() + item.duration * 24 * 60 * 60 * 1000);
      newBooster.expiresAt = expiresAt.toISOString();
    }

    updateStudent({
      ...student,
      inventory: updatedInventory,
      activeBoosters: [...currentBoosters, newBooster],
    });
  };

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

  // Filter subject stats to only enrolled subjects
  const enrolledSubjectStats = student.stats.subjectStats.filter(
    stat => student.subjects.includes(stat.subject)
  );

  const handlePurchase = (item: ShopItem) => {
    if (student.points >= item.cost && !student.avatar.unlockedItems.includes(item.id)) {
      purchaseItem(item.id, student.id, updateStudent, student);
    }
  };

  // Rarity color mapping
  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'common': return 'text-neutral-400 border-neutral-600';
      case 'rare': return 'text-blue-400 border-blue-500/50';
      case 'epic': return 'text-purple-400 border-purple-500/50';
      case 'legendary': return 'text-yellow-400 border-yellow-500/50';
      default: return 'text-neutral-400 border-neutral-600';
    }
  };

  const getRarityGlow = (rarity?: string) => {
    switch (rarity) {
      case 'epic': return 'shadow-purple-500/20 shadow-lg';
      case 'legendary': return 'shadow-yellow-500/30 shadow-lg animate-pulse';
      default: return '';
    }
  };

  // Filter shop items by student level - unlock more items as level increases
  const getAvailableShopItems = (allItems: ShopItem[], type: string): ShopItem[] => {
    const filtered = allItems.filter(i => i.type === type);
    const level = student.level;

    // Calculate how many items to show based on level
    // Level 1-5: ~40% of items (mostly common)
    // Level 6-10: ~60% of items (common + rare)
    // Level 11-15: ~80% of items (common + rare + epic)
    // Level 16+: 100% of items (all including legendary)

    const sortedByRarity = filtered.sort((a, b) => {
      const rarityOrder = { 'common': 0, 'rare': 1, 'epic': 2, 'legendary': 3 };
      return (rarityOrder[a.rarity || 'common'] || 0) - (rarityOrder[b.rarity || 'common'] || 0);
    });

    let percentToShow = 0.4;
    if (level >= 16) percentToShow = 1;
    else if (level >= 11) percentToShow = 0.8;
    else if (level >= 6) percentToShow = 0.6;

    const itemCount = Math.max(2, Math.ceil(sortedByRarity.length * percentToShow));
    return sortedByRarity.slice(0, itemCount);
  };

  // Render shop item card
  const renderShopItem = (item: ShopItem) => {
    const owned = student.avatar.unlockedItems.includes(item.id);
    const canAfford = student.points >= item.cost;
    return (
      <div
        key={item.id}
        className={`p-4 rounded-xl border text-center transition-all ${getRarityGlow(item.rarity)} ${
          owned
            ? 'bg-green-500/10 border-green-500/30'
            : canAfford
            ? `bg-neutral-800/50 ${getRarityColor(item.rarity)} hover:border-primary-500`
            : 'bg-neutral-800/30 border-neutral-800 opacity-50'
        }`}
      >
        <div className="text-4xl mb-2">{item.image}</div>
        <p className="text-sm font-medium text-neutral-100">{item.name}</p>
        {item.rarity && (
          <span className={`text-xs capitalize ${getRarityColor(item.rarity).split(' ')[0]}`}>
            {item.rarity}
          </span>
        )}
        {item.description && (
          <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{item.description}</p>
        )}
        <p className="text-xs text-yellow-500 mt-1">
          {owned ? '✓ Owned' : `${item.cost} pts`}
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
  };

  // Dynamic achievements based on actual student data
  const hasPerfectScore = assessments.some(a => a.score === a.maxScore);
  const highScoreCount = assessments.filter(a => (a.score / a.maxScore) * 100 >= 80).length;
  const mathProgress = student.stats.subjectStats.find(s => s.subject === 'mathematics')?.progress || 0;
  const physicsProgress = student.stats.subjectStats.find(s => s.subject === 'physics')?.progress || 0;
  const economicsProgress = student.stats.subjectStats.find(s => s.subject === 'economics')?.progress || 0;

  // Build achievements - only include subject achievements for enrolled subjects
  const baseAchievements = [
    { id: 1, name: 'First Steps', description: 'Complete your first session', earned: student.stats.totalSessions >= 1, icon: '🚀', points: 25 },
    { id: 2, name: 'Getting Started', description: 'Reach Level 5', earned: student.level >= 5, icon: '🌱', points: 50 },
    { id: 3, name: 'Quick Learner', description: 'Score 80%+ on 5 assessments', earned: highScoreCount >= 5, icon: '⚡', points: 75 },
    { id: 4, name: 'Consistent', description: 'Complete 10 sessions', earned: student.stats.totalSessions >= 10, icon: '🔥', points: 100 },
  ];

  const subjectAchievements = [
    ...(student.subjects.includes('mathematics') ? [{ id: 5, name: 'Math Wizard', description: 'Reach 90% progress in Mathematics', earned: mathProgress >= 90, icon: '🧮', points: 150 }] : []),
    ...(student.subjects.includes('physics') ? [{ id: 6, name: 'Physics Pro', description: 'Reach 90% progress in Physics', earned: physicsProgress >= 90, icon: '⚛️', points: 150 }] : []),
    ...(student.subjects.includes('economics') ? [{ id: 7, name: 'Economics Expert', description: 'Reach 90% progress in Economics', earned: economicsProgress >= 90, icon: '📊', points: 150 }] : []),
  ];

  const additionalAchievements = [
    { id: 8, name: 'Perfect Score', description: 'Get 100% on any assessment', earned: hasPerfectScore, icon: '💯', points: 100 },
    { id: 9, name: 'Knowledge Seeker', description: 'Complete 50 assignments', earned: student.stats.completedAssignments >= 50, icon: '📚', points: 200 },
    { id: 10, name: 'Star Student', description: 'Reach Level 20', earned: student.level >= 20, icon: '⭐', points: 250 },
    { id: 11, name: 'Point Collector', description: 'Earn 1000 constellation points', earned: student.points >= 1000, icon: '💫', points: 100 },
    { id: 12, name: 'Cosmic Champion', description: 'Earn 5000 constellation points', earned: student.points >= 5000, icon: '🏆', points: 500 },
  ];

  const achievements = [...baseAchievements, ...subjectAchievements, ...additionalAchievements];

  const earnedAchievements = achievements.filter(a => a.earned).length;
  const totalAchievements = achievements.length;

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
            <Button variant="secondary" onClick={() => setShowQuickMessageModal(true)} icon={<Send className="w-4 h-4" />}>
              Quick Message
            </Button>
            <Button variant="secondary" onClick={() => setShowShopModal(true)} icon={<ShoppingBag className="w-4 h-4" />}>
              Shop
            </Button>
            <Button variant="secondary" onClick={() => setShowAchievementsModal(true)} icon={<Trophy className="w-4 h-4" />}>
              Achievements
            </Button>
            <Button variant="primary" onClick={() => setShowCommandCenterModal(true)} icon={<Rocket className="w-4 h-4" />}>
              Command Center
            </Button>
          </div>
        </div>

        {/* Risk Warning Banner */}
        {riskStatus.atRisk && (
          <div className={`p-4 rounded-xl border flex items-center gap-4 ${
            riskStatus.riskLevel === 'high'
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-orange-500/10 border-orange-500/30'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              riskStatus.riskLevel === 'high' ? 'bg-red-500/20' : 'bg-orange-500/20'
            }`}>
              <AlertTriangle className={`w-5 h-5 ${
                riskStatus.riskLevel === 'high' ? 'text-red-400' : 'text-orange-400'
              }`} />
            </div>
            <div className="flex-1">
              <p className={`font-medium ${
                riskStatus.riskLevel === 'high' ? 'text-red-400' : 'text-orange-400'
              }`}>
                {riskStatus.riskLevel === 'high' ? 'High Risk Alert!' : 'Engagement Warning'}
              </p>
              <p className="text-sm text-neutral-400">
                {riskStatus.reasons.slice(0, 2).join(' • ')}
              </p>
            </div>
            {penaltyCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPenaltyHistoryModal(true)}
                className="text-neutral-400 hover:text-neutral-100"
              >
                <History className="w-4 h-4 mr-1" />
                View History
              </Button>
            )}
          </div>
        )}

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
            {/* Constellation Skill Tree */}
            <ConstellationSkillTree
              enrolledSubjects={student.subjects}
              subjectStats={enrolledSubjectStats}
              yearGroup={student.yearGroup}
            />

            {/* Stellar Journey - Weekly Progress */}
            <StellarJourney
              weeklyData={student.stats.weeklyProgress}
              enrolledSubjects={student.subjects}
              currentPoints={student.points}
              streakDays={student.stats.streakDays}
              recentPenalties={recentPenalties}
              showWarnings={true}
            />

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
            <LessonPlans schedule={schedule} />

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

            {/* Command Center Preview */}
            <CommandCenterPreview
              student={student}
              onClick={() => setShowCommandCenterModal(true)}
            />

            {/* Leaderboard */}
            <LeaderboardPreview
              students={getAllStudents()}
              currentStudent={student}
              currentYearGroup={student.yearGroup}
            />
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

        <div className="mb-4 p-3 bg-neutral-800/30 rounded-lg">
          <p className="text-xs text-neutral-400 text-center">
            Level {student.level} — {student.level < 6 ? 'Unlock more items at Level 6!' : student.level < 11 ? 'Unlock more items at Level 11!' : student.level < 16 ? 'Unlock legendary items at Level 16!' : 'All items unlocked!'}
          </p>
        </div>
        <Tabs
          tabs={[
            {
              id: 'outfits',
              label: 'Outfits',
              content: (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getAvailableShopItems(items, 'outfit').map(renderShopItem)}
                </div>
              ),
            },
            {
              id: 'accessories',
              label: 'Accessories',
              content: (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getAvailableShopItems(items, 'accessory').map(renderShopItem)}
                </div>
              ),
            },
            {
              id: 'backgrounds',
              label: 'Backgrounds',
              content: (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getAvailableShopItems(items, 'background').map(renderShopItem)}
                </div>
              ),
            },
            {
              id: 'badges',
              label: 'Badges',
              content: (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getAvailableShopItems(items, 'badge').map(renderShopItem)}
                </div>
              ),
            },
            {
              id: 'pets',
              label: 'Pets',
              content: (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getAvailableShopItems(items, 'pet').map(renderShopItem)}
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
              {enrolledSubjectStats.map(stat => (
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
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-neutral-400">Progress</p>
                <p className="text-xl font-bold text-yellow-500">{earnedAchievements} / {totalAchievements}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-400">Completion</p>
              <p className="text-xl font-bold text-neutral-100">{Math.round((earnedAchievements / totalAchievements) * 100)}%</p>
            </div>
          </div>
          <ProgressBar value={(earnedAchievements / totalAchievements) * 100} variant="gradient" className="mt-3" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`p-4 rounded-xl border transition-all ${
                achievement.earned
                  ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                  : 'bg-neutral-800/30 border-neutral-800 opacity-60 grayscale'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`text-3xl ${achievement.earned ? '' : 'opacity-50'}`}>{achievement.icon}</div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-100">{achievement.name}</p>
                  <p className="text-xs text-neutral-400">{achievement.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                {achievement.earned ? (
                  <Badge variant="success" size="sm">✓ Earned!</Badge>
                ) : (
                  <Badge variant="default" size="sm">Locked</Badge>
                )}
                <span className={`text-xs font-medium ${achievement.earned ? 'text-yellow-500' : 'text-neutral-500'}`}>
                  +{achievement.points} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Penalty History Modal */}
      <Modal
        isOpen={showPenaltyHistoryModal}
        onClose={() => setShowPenaltyHistoryModal(false)}
        title="Penalty History"
        size="md"
      >
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
              <p className="text-2xl font-bold text-red-400">{penaltyCount}</p>
              <p className="text-sm text-neutral-400">Penalties (30 days)</p>
            </div>
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl text-center">
              <p className="text-2xl font-bold text-orange-400">-{penaltyPointsLost}</p>
              <p className="text-sm text-neutral-400">Points Lost</p>
            </div>
          </div>

          {/* Tips to Avoid Penalties */}
          <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-xl">
            <p className="text-sm font-medium text-primary-400 mb-2">Tips to Avoid Penalties:</p>
            <ul className="text-xs text-neutral-400 space-y-1">
              <li>• Attend all scheduled sessions</li>
              <li>• Submit homework on time</li>
              <li>• Maintain your daily streak</li>
              <li>• Stay engaged with at least 50% progress weekly</li>
            </ul>
          </div>

          {/* Penalty List */}
          {penaltyHistory.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-neutral-400">No penalties! Keep up the great work!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {penaltyHistory.slice().reverse().map((penalty) => {
                const displayInfo = getPenaltyDisplayInfo(penalty.type);
                return (
                  <div
                    key={penalty.id}
                    className={`p-3 rounded-xl border ${
                      penalty.waived
                        ? 'bg-neutral-800/30 border-neutral-700 opacity-60'
                        : 'bg-red-500/5 border-red-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={penalty.waived ? 'default' : 'error'}
                          size="sm"
                        >
                          {displayInfo.label}
                        </Badge>
                        {penalty.waived && (
                          <Badge variant="success" size="sm">Waived</Badge>
                        )}
                      </div>
                      <span className={`font-bold ${penalty.waived ? 'text-neutral-500 line-through' : 'text-red-400'}`}>
                        -{penalty.pointsDeducted} pts
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400">{penalty.reason}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {new Date(penalty.appliedAt).toLocaleDateString()}
                      {penalty.waived && penalty.waivedReason && (
                        <span className="ml-2 text-green-400">• Waived: {penalty.waivedReason}</span>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* Quick Message Modal */}
      <Modal
        isOpen={showQuickMessageModal}
        onClose={() => {
          setShowQuickMessageModal(false);
          setQuickMessageSent(false);
          setQuickMessageText('');
        }}
        title="Quick Message to Tutor"
        size="md"
      >
        {quickMessageSent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-100 mb-2">Message Sent!</h3>
            <p className="text-neutral-400 text-sm">Your tutor will be notified.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-neutral-400 text-sm">
              Send a quick notification to your tutor. Select a category and add a brief explanation.
            </p>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Message Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['update', 'homework-help'] as QuickNotificationType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setQuickMessageType(type)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      quickMessageType === type
                        ? 'bg-primary-500/20 border-primary-500/50 text-primary-400'
                        : 'bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    <p className="font-medium text-sm">{getQuickMessageTypeLabel(type)}</p>
                    <p className="text-xs opacity-70 mt-0.5">
                      {type === 'update' && 'Share progress or updates'}
                      {type === 'homework-help' && 'Ask a question or get help'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Brief Explanation (2-3 sentences)
              </label>
              <textarea
                value={quickMessageText}
                onChange={(e) => setQuickMessageText(e.target.value)}
                placeholder="Describe what you need help with..."
                rows={3}
                maxLength={200}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 resize-none"
              />
              <p className="text-xs text-neutral-500 mt-1 text-right">{quickMessageText.length}/200</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowQuickMessageModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSendQuickMessage}
                disabled={!quickMessageText.trim()}
                icon={<Send className="w-4 h-4" />}
              >
                Send to Tutor
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Leaderboard Modal */}
      <Modal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        title="Leaderboard"
        size="lg"
      >
        <Leaderboard
          students={getAllStudents()}
          currentStudent={student}
          currentYearGroup={student.yearGroup}
          onUpdateUsername={handleUpdateUsername}
          showAllLevels={false}
        />
      </Modal>

      {/* Command Center Modal */}
      <Modal
        isOpen={showCommandCenterModal}
        onClose={() => setShowCommandCenterModal(false)}
        title="Command Center"
        size="xl"
      >
        <CommandCenter
          student={student}
          onPurchaseItem={handlePurchaseItem}
          onEquipItem={handleEquipItem}
          onActivateBooster={handleActivateBooster}
        />
      </Modal>
    </DashboardLayout>
  );
};
