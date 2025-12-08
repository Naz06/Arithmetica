import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input, Textarea, Select } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import {
  AlertTriangle,
  Shield,
  Trash2,
  Plus,
  CheckCircle,
  X,
  TrendingDown,
  Flame,
  Clock,
  FileX,
  Calendar,
  Star,
} from 'lucide-react';
import {
  StudentProfile,
  PenaltyType,
  PenaltyRecord,
  DEFAULT_PENALTY_CONFIG,
} from '../../types';
import {
  calculatePenalty,
  getPenaltyDisplayInfo,
  getTotalPenaltiesInPeriod,
  isStudentAtRisk,
  applyPenalty,
  waivePenalty,
} from '../../utils/penaltySystem';

interface PenaltyManagementProps {
  students: StudentProfile[];
  onUpdateStudent: (student: StudentProfile) => void;
}

export const PenaltyManagement: React.FC<PenaltyManagementProps> = ({
  students,
  onUpdateStudent,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [showApplyPenaltyModal, setShowApplyPenaltyModal] = useState(false);
  const [showWaivePenaltyModal, setShowWaivePenaltyModal] = useState(false);
  const [selectedPenalty, setSelectedPenalty] = useState<PenaltyRecord | null>(null);

  // Apply penalty form state
  const [penaltyType, setPenaltyType] = useState<PenaltyType>('missed-session');
  const [customReason, setCustomReason] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // Waive penalty form state
  const [waiveReason, setWaiveReason] = useState('');
  const [isWaiving, setIsWaiving] = useState(false);

  // Success states
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const penaltyTypeOptions = [
    { value: 'missed-session', label: 'Missed Session', icon: Calendar },
    { value: 'late-homework', label: 'Late Homework', icon: Clock },
    { value: 'no-homework', label: 'No Homework', icon: FileX },
    { value: 'low-engagement', label: 'Low Engagement', icon: TrendingDown },
    { value: 'streak-break', label: 'Streak Break', icon: Flame },
    { value: 'constellation-decay', label: 'Skill Decay', icon: Star },
  ];

  const handleApplyPenalty = async () => {
    if (!selectedStudent) return;

    setIsApplying(true);

    const { updatedStudent, penalty } = applyPenalty(
      selectedStudent,
      penaltyType,
      'tutor',
      customReason || undefined
    );

    onUpdateStudent(updatedStudent);
    setSelectedStudent(updatedStudent);

    setActionSuccess(`Penalty applied: -${penalty.pointsDeducted} points`);
    setShowApplyPenaltyModal(false);
    setPenaltyType('missed-session');
    setCustomReason('');
    setIsApplying(false);

    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleWaivePenalty = async () => {
    if (!selectedStudent || !selectedPenalty) return;

    setIsWaiving(true);

    const updatedStudent = waivePenalty(
      selectedStudent,
      selectedPenalty.id,
      'tutor',
      waiveReason
    );

    onUpdateStudent(updatedStudent);
    setSelectedStudent(updatedStudent);

    setActionSuccess(`Penalty waived: +${selectedPenalty.pointsDeducted} points restored`);
    setShowWaivePenaltyModal(false);
    setSelectedPenalty(null);
    setWaiveReason('');
    setIsWaiving(false);

    setTimeout(() => setActionSuccess(null), 3000);
  };

  // Calculate preview of penalty amount
  const previewPenalty = selectedStudent
    ? calculatePenalty(
        selectedStudent.points,
        penaltyType,
        (selectedStudent.stats.penaltyHistory || []).filter(p => p.type === penaltyType && !p.waived).length + 1
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {actionSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">{actionSuccess}</span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4 h-[500px]">
        {/* Student List */}
        <div className="md:col-span-1 overflow-y-auto space-y-2">
          <p className="text-sm text-neutral-400 mb-3">Select a student to manage penalties</p>
          {students.map(student => {
            const risk = isStudentAtRisk(student);
            const { count } = getTotalPenaltiesInPeriod(student.stats.penaltyHistory || [], 30);
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
                    {risk.atRisk && (
                      <AlertTriangle className={`w-3 h-3 ${risk.riskLevel === 'high' ? 'text-red-400' : 'text-orange-400'}`} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-neutral-500">{student.points} pts</span>
                    {count > 0 && (
                      <Badge variant="error" size="sm">{count} penalties</Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Penalty Details */}
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
                    </div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowApplyPenaltyModal(true)}
                  icon={<Plus className="w-4 h-4" />}
                  className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                >
                  Apply Penalty
                </Button>
              </div>

              {/* Risk Status */}
              {(() => {
                const risk = isStudentAtRisk(selectedStudent);
                if (risk.atRisk) {
                  return (
                    <div className={`p-3 rounded-xl border ${
                      risk.riskLevel === 'high'
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-orange-500/10 border-orange-500/30'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className={`w-4 h-4 ${risk.riskLevel === 'high' ? 'text-red-400' : 'text-orange-400'}`} />
                        <span className={`font-medium ${risk.riskLevel === 'high' ? 'text-red-400' : 'text-orange-400'}`}>
                          {risk.riskLevel === 'high' ? 'High Risk' : 'At Risk'}
                        </span>
                      </div>
                      <ul className="text-sm text-neutral-400 space-y-1">
                        {risk.reasons.map((reason, i) => (
                          <li key={i}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Penalty History */}
              <div>
                <h4 className="text-sm font-medium text-neutral-400 mb-3">Penalty History</h4>
                {(selectedStudent.stats.penaltyHistory || []).length === 0 ? (
                  <div className="text-center py-8 bg-neutral-800/30 rounded-xl">
                    <Shield className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-neutral-400">No penalties recorded</p>
                    <p className="text-sm text-neutral-500 mt-1">This student has a clean record!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {(selectedStudent.stats.penaltyHistory || []).slice().reverse().map((penalty) => {
                      const displayInfo = getPenaltyDisplayInfo(penalty.type);
                      return (
                        <div
                          key={penalty.id}
                          className={`p-3 rounded-xl border ${
                            penalty.waived
                              ? 'bg-neutral-800/30 border-neutral-700'
                              : 'bg-red-500/5 border-red-500/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={penalty.waived ? 'default' : 'error'} size="sm">
                                {displayInfo.label}
                              </Badge>
                              {penalty.waived && (
                                <Badge variant="success" size="sm">Waived</Badge>
                              )}
                              <span className="text-xs text-neutral-500">
                                by {penalty.appliedBy}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${penalty.waived ? 'text-neutral-500 line-through' : 'text-red-400'}`}>
                                -{penalty.pointsDeducted} pts
                              </span>
                              {!penalty.waived && (
                                <button
                                  onClick={() => {
                                    setSelectedPenalty(penalty);
                                    setShowWaivePenaltyModal(true);
                                  }}
                                  className="p-1 text-neutral-400 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
                                  title="Waive Penalty"
                                >
                                  <Shield className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-neutral-400 mt-1">{penalty.reason}</p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {new Date(penalty.appliedAt).toLocaleString()}
                            {penalty.waived && (
                              <span className="ml-2 text-green-400">
                                • Waived: {penalty.waivedReason}
                              </span>
                            )}
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
                <AlertTriangle className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-500">Select a student to manage their penalties</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Apply Penalty Modal */}
      <Modal
        isOpen={showApplyPenaltyModal}
        onClose={() => {
          setShowApplyPenaltyModal(false);
          setPenaltyType('missed-session');
          setCustomReason('');
        }}
        title="Apply Penalty"
        size="md"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="p-3 bg-neutral-800/50 rounded-xl">
              <p className="text-sm text-neutral-400">Applying penalty to:</p>
              <div className="flex items-center gap-3 mt-2">
                <Avatar name={selectedStudent.name} size="sm" />
                <div>
                  <p className="font-medium text-neutral-100">{selectedStudent.name}</p>
                  <p className="text-xs text-yellow-500">{selectedStudent.points} points</p>
                </div>
              </div>
            </div>

            <Select
              label="Penalty Type"
              value={penaltyType}
              onChange={(e) => setPenaltyType(e.target.value as PenaltyType)}
              options={penaltyTypeOptions.map(opt => ({ value: opt.value, label: opt.label }))}
            />

            <Textarea
              label="Reason (Optional - will use default if empty)"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Explain why this penalty is being applied..."
              rows={3}
            />

            {/* Penalty Preview */}
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-sm text-neutral-400 mb-1">Estimated Penalty</p>
              <p className="text-2xl font-bold text-red-400">-{previewPenalty} points</p>
              <p className="text-xs text-neutral-500 mt-1">
                Based on current points and offense history
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowApplyPenaltyModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={handleApplyPenalty}
                disabled={isApplying}
                icon={<AlertTriangle className="w-4 h-4" />}
              >
                {isApplying ? 'Applying...' : 'Apply Penalty'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Waive Penalty Modal */}
      <Modal
        isOpen={showWaivePenaltyModal}
        onClose={() => {
          setShowWaivePenaltyModal(false);
          setSelectedPenalty(null);
          setWaiveReason('');
        }}
        title="Waive Penalty"
        size="md"
      >
        {selectedStudent && selectedPenalty && (
          <div className="space-y-4">
            <div className="p-3 bg-neutral-800/50 rounded-xl">
              <p className="text-sm text-neutral-400">Waiving penalty for:</p>
              <div className="flex items-center gap-3 mt-2">
                <Avatar name={selectedStudent.name} size="sm" />
                <div>
                  <p className="font-medium text-neutral-100">{selectedStudent.name}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="error" size="sm">
                  {getPenaltyDisplayInfo(selectedPenalty.type).label}
                </Badge>
                <span className="font-bold text-red-400">-{selectedPenalty.pointsDeducted} pts</span>
              </div>
              <p className="text-sm text-neutral-400">{selectedPenalty.reason}</p>
            </div>

            <Textarea
              label="Reason for Waiving"
              value={waiveReason}
              onChange={(e) => setWaiveReason(e.target.value)}
              placeholder="Explain why this penalty is being waived..."
              rows={3}
            />

            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-sm text-green-400">
                Points will be restored: +{selectedPenalty.pointsDeducted} points
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowWaivePenaltyModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleWaivePenalty}
                disabled={isWaiving || !waiveReason.trim()}
                icon={<Shield className="w-4 h-4" />}
              >
                {isWaiving ? 'Waiving...' : 'Waive Penalty'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
