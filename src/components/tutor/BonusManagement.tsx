import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input, Textarea, Select } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import {
  Gift,
  Star,
  Trophy,
  Flame,
  CheckCircle,
  TrendingUp,
  Calendar,
  Shield,
  Plus,
  Sparkles,
} from 'lucide-react';
import { StudentProfile } from '../../types';
import {
  BonusType,
  BonusRecord,
  getBonusDisplayInfo,
  getAvailableBonuses,
  createBonusRecord,
  applyBonus,
  awardPerfectSessionBonus,
  runAutomaticBonusChecks,
  DEFAULT_BONUS_CONFIG,
} from '../../utils/penaltySystem';

interface BonusManagementProps {
  students: StudentProfile[];
  onUpdateStudent: (student: StudentProfile) => void;
}

export const BonusManagement: React.FC<BonusManagementProps> = ({
  students,
  onUpdateStudent,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [showAwardBonusModal, setShowAwardBonusModal] = useState(false);

  // Award bonus form state
  const [bonusType, setBonusType] = useState<BonusType>('perfect-session');
  const [customPoints, setCustomPoints] = useState<number>(0);
  const [customReason, setCustomReason] = useState('');
  const [isAwarding, setIsAwarding] = useState(false);

  // Success states
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const bonusTypeOptions: { value: BonusType; label: string; icon: React.ReactNode; defaultPoints: number }[] = [
    { value: 'perfect-session', label: 'Perfect Session', icon: <Star className="w-4 h-4" />, defaultPoints: DEFAULT_BONUS_CONFIG.perfectSessionBonus },
    { value: 'streak-milestone', label: 'Streak Milestone', icon: <Flame className="w-4 h-4" />, defaultPoints: 50 },
    { value: 'clean-week', label: 'Clean Week', icon: <Shield className="w-4 h-4" />, defaultPoints: DEFAULT_BONUS_CONFIG.cleanWeekBonus },
    { value: 'homework-streak', label: 'Homework Streak', icon: <CheckCircle className="w-4 h-4" />, defaultPoints: 30 },
    { value: 'improvement-bonus', label: 'Improvement Bonus', icon: <TrendingUp className="w-4 h-4" />, defaultPoints: 50 },
    { value: 'attendance-bonus', label: 'Perfect Attendance', icon: <Calendar className="w-4 h-4" />, defaultPoints: DEFAULT_BONUS_CONFIG.perfectAttendanceWeekly },
  ];

  const handleAwardBonus = async () => {
    if (!selectedStudent) return;

    setIsAwarding(true);

    const selectedOption = bonusTypeOptions.find(o => o.value === bonusType);
    const points = customPoints || selectedOption?.defaultPoints || 25;
    const reason = customReason || `Awarded by tutor: ${selectedOption?.label || 'Bonus'}`;

    const bonus = createBonusRecord(bonusType, points, reason, 'tutor');
    const updatedStudent = applyBonus(selectedStudent, bonus);

    onUpdateStudent(updatedStudent);
    setSelectedStudent(updatedStudent);

    setActionSuccess(`Bonus awarded: +${points} points!`);
    setShowAwardBonusModal(false);
    setBonusType('perfect-session');
    setCustomPoints(0);
    setCustomReason('');
    setIsAwarding(false);

    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleRunAutoChecks = () => {
    if (!selectedStudent) return;

    const { updatedStudent, bonusesAwarded } = runAutomaticBonusChecks(selectedStudent);

    if (bonusesAwarded.length > 0) {
      onUpdateStudent(updatedStudent);
      setSelectedStudent(updatedStudent);
      const totalPoints = bonusesAwarded.reduce((sum, b) => sum + b.pointsAwarded, 0);
      setActionSuccess(`${bonusesAwarded.length} bonus(es) awarded: +${totalPoints} points!`);
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionSuccess('No new bonuses available at this time.');
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const getBonusIcon = (type: BonusType) => {
    switch (type) {
      case 'streak-milestone': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'clean-week': return <Shield className="w-4 h-4 text-green-400" />;
      case 'clean-month': return <Trophy className="w-4 h-4 text-emerald-400" />;
      case 'perfect-session': return <Star className="w-4 h-4 text-blue-400" />;
      case 'homework-streak': return <CheckCircle className="w-4 h-4 text-purple-400" />;
      case 'improvement-bonus': return <TrendingUp className="w-4 h-4 text-cyan-400" />;
      case 'attendance-bonus': return <Calendar className="w-4 h-4 text-yellow-400" />;
      default: return <Gift className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {actionSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm">{actionSuccess}</span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4 h-[500px]">
        {/* Student List */}
        <div className="md:col-span-1 overflow-y-auto space-y-2">
          <p className="text-sm text-neutral-400 mb-3">Select a student to manage bonuses</p>
          {students.map(student => {
            const availableBonuses = getAvailableBonuses(student);
            const bonusHistory = student.stats.bonusHistory || [];
            const totalBonusPoints = bonusHistory.reduce((sum, b) => sum + b.pointsAwarded, 0);
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
                <Avatar name={student.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium truncate ${isSelected ? 'text-primary-400' : 'text-neutral-100'}`}>
                      {student.name}
                    </p>
                    {availableBonuses.length > 0 && (
                      <Sparkles className="w-3 h-3 text-yellow-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-neutral-500">{student.points} pts</span>
                    {totalBonusPoints > 0 && (
                      <Badge variant="success" size="sm">+{totalBonusPoints} earned</Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bonus Details */}
        <div className="md:col-span-2 overflow-y-auto">
          {selectedStudent ? (
            <div className="space-y-4">
              {/* Student Header */}
              <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <Avatar name={selectedStudent.name} size="lg" />
                  <div>
                    <h3 className="text-lg font-bold text-neutral-100">{selectedStudent.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-yellow-500 font-medium">{selectedStudent.points} pts</span>
                      <span className="text-sm text-neutral-400">Level {selectedStudent.level}</span>
                      <span className="text-sm text-orange-400 flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {selectedStudent.stats.streakDays || 0} day streak
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRunAutoChecks}
                    icon={<CheckCircle className="w-4 h-4" />}
                    className="text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                  >
                    Auto-Check
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAwardBonusModal(true)}
                    icon={<Plus className="w-4 h-4" />}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Award Bonus
                  </Button>
                </div>
              </div>

              {/* Available Bonuses */}
              {(() => {
                const available = getAvailableBonuses(selectedStudent);
                if (available.length > 0) {
                  return (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      <h4 className="text-sm font-medium text-yellow-400 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Available Bonuses
                      </h4>
                      <div className="space-y-2">
                        {available.map((bonus, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {getBonusIcon(bonus.type)}
                              <span className="text-neutral-300">{bonus.label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-neutral-500">{bonus.requirement}</span>
                              <Badge variant="success" size="sm">+{bonus.reward} pts</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Bonus History */}
              <div>
                <h4 className="text-sm font-medium text-neutral-400 mb-3">Bonus History</h4>
                {(selectedStudent.stats.bonusHistory || []).length === 0 ? (
                  <div className="text-center py-8 bg-neutral-800/30 rounded-xl">
                    <Gift className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                    <p className="text-neutral-400">No bonuses earned yet</p>
                    <p className="text-sm text-neutral-500 mt-1">Award a bonus or wait for automatic rewards!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {(selectedStudent.stats.bonusHistory || []).slice().reverse().map((bonus) => {
                      const displayInfo = getBonusDisplayInfo(bonus.type);
                      return (
                        <div
                          key={bonus.id}
                          className="p-3 rounded-xl bg-green-500/5 border border-green-500/20"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getBonusIcon(bonus.type)}
                              <Badge variant="success" size="sm">
                                {displayInfo.label}
                              </Badge>
                              <span className="text-xs text-neutral-500">
                                by {bonus.awardedBy}
                              </span>
                            </div>
                            <span className="font-bold text-green-400">
                              +{bonus.pointsAwarded} pts
                            </span>
                          </div>
                          <p className="text-sm text-neutral-400 mt-1">{bonus.reason}</p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {new Date(bonus.awardedAt).toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <Gift className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-500">Select a student to manage their bonuses</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Award Bonus Modal */}
      <Modal
        isOpen={showAwardBonusModal}
        onClose={() => {
          setShowAwardBonusModal(false);
          setBonusType('perfect-session');
          setCustomPoints(0);
          setCustomReason('');
        }}
        title="Award Bonus"
        size="md"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="p-3 bg-neutral-800/50 rounded-xl">
              <p className="text-sm text-neutral-400">Awarding bonus to:</p>
              <div className="flex items-center gap-3 mt-2">
                <Avatar name={selectedStudent.name} size="sm" />
                <div>
                  <p className="font-medium text-neutral-100">{selectedStudent.name}</p>
                  <p className="text-xs text-yellow-500">{selectedStudent.points} points</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Bonus Type</label>
              <div className="grid grid-cols-2 gap-2">
                {bonusTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setBonusType(option.value);
                      setCustomPoints(option.defaultPoints);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      bonusType === option.value
                        ? 'bg-green-500/20 border-green-500/50'
                        : 'bg-neutral-800/50 border-neutral-700 hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <span className={`text-sm font-medium ${bonusType === option.value ? 'text-green-400' : 'text-neutral-300'}`}>
                        {option.label}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">+{option.defaultPoints} pts</p>
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Custom Points (optional)"
              type="number"
              value={customPoints || ''}
              onChange={(e) => setCustomPoints(parseInt(e.target.value) || 0)}
              placeholder={`Default: ${bonusTypeOptions.find(o => o.value === bonusType)?.defaultPoints || 25}`}
            />

            <Textarea
              label="Reason (optional)"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Why is this bonus being awarded?"
              rows={2}
            />

            {/* Bonus Preview */}
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-sm text-neutral-400 mb-1">Bonus to Award</p>
              <p className="text-2xl font-bold text-green-400">
                +{customPoints || bonusTypeOptions.find(o => o.value === bonusType)?.defaultPoints || 25} points
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowAwardBonusModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-green-500 hover:bg-green-600"
                onClick={handleAwardBonus}
                disabled={isAwarding}
                icon={<Gift className="w-4 h-4" />}
              >
                {isAwarding ? 'Awarding...' : 'Award Bonus'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
