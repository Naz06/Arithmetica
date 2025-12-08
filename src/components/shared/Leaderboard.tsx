import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import {
  Trophy,
  Medal,
  Star,
  Crown,
  Flame,
  Users,
  Edit2,
  Check,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { StudentProfile, YearGroup } from '../../types';
import { validateUsername, generateAnonymousUsername } from '../../utils/profanityFilter';

interface LeaderboardProps {
  students: StudentProfile[];
  currentStudent?: StudentProfile; // The logged-in student (if viewing as student)
  currentYearGroup?: YearGroup; // Filter to show only this year group
  onUpdateUsername?: (studentId: string, username: string) => void;
  showAllLevels?: boolean; // For tutors to see all levels
}

interface LeaderboardEntry {
  id: string;
  displayName: string;
  username?: string;
  points: number;
  level: number;
  streak: number;
  yearGroup: YearGroup;
  isCurrentUser: boolean;
  rank: number;
}

const getYearGroupLabel = (yg: YearGroup): string => {
  const labels: Record<YearGroup, string> = {
    year5: 'Year 5',
    year6: 'Year 6',
    gcse: 'GCSE',
    alevel: 'A-Level',
  };
  return labels[yg];
};

const getRankBadge = (rank: number) => {
  switch (rank) {
    case 1:
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20">
          <Crown className="w-5 h-5 text-yellow-500" />
        </div>
      );
    case 2:
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-400/20">
          <Medal className="w-5 h-5 text-neutral-400" />
        </div>
      );
    case 3:
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/20">
          <Medal className="w-5 h-5 text-orange-500" />
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-800">
          <span className="text-sm font-bold text-neutral-400">{rank}</span>
        </div>
      );
  }
};

export const Leaderboard: React.FC<LeaderboardProps> = ({
  students,
  currentStudent,
  currentYearGroup,
  onUpdateUsername,
  showAllLevels = false,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<YearGroup | 'all'>(
    currentYearGroup || 'all'
  );
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Filter and rank students
  const leaderboardData = useMemo((): LeaderboardEntry[] => {
    // Filter by year group if not showing all levels
    let filteredStudents = students;
    if (!showAllLevels && selectedLevel !== 'all') {
      filteredStudents = students.filter(s => s.yearGroup === selectedLevel);
    }

    // Sort by points (descending)
    const sorted = [...filteredStudents].sort((a, b) => b.points - a.points);

    // Create leaderboard entries with ranks
    return sorted.map((student, index) => ({
      id: student.id,
      displayName: student.username || generateAnonymousUsername(),
      username: student.username,
      points: student.points,
      level: student.level,
      streak: student.stats.streakDays || 0,
      yearGroup: student.yearGroup,
      isCurrentUser: currentStudent?.id === student.id,
      rank: index + 1,
    }));
  }, [students, selectedLevel, showAllLevels, currentStudent]);

  // Find current user's rank
  const currentUserRank = currentStudent
    ? leaderboardData.find(e => e.id === currentStudent.id)?.rank
    : undefined;

  const handleSetUsername = () => {
    const validation = validateUsername(newUsername);
    if (!validation.isValid) {
      setUsernameError(validation.error || 'Invalid username');
      return;
    }

    // Check if username is already taken
    const isTaken = students.some(
      s => s.id !== currentStudent?.id &&
           s.username?.toLowerCase() === newUsername.toLowerCase()
    );
    if (isTaken) {
      setUsernameError('This username is already taken. Please choose another.');
      return;
    }

    if (onUpdateUsername && currentStudent) {
      onUpdateUsername(currentStudent.id, newUsername);
      setShowUsernameModal(false);
      setNewUsername('');
      setUsernameError(null);
    }
  };

  const yearGroupOptions: YearGroup[] = ['year5', 'year6', 'gcse', 'alevel'];

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Leaderboard
            </CardTitle>
            <CardDescription>
              {showAllLevels
                ? 'Student rankings by constellation points'
                : `Rankings for ${getYearGroupLabel(selectedLevel as YearGroup)}`}
            </CardDescription>
          </div>
          {currentStudent && onUpdateUsername && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setNewUsername(currentStudent.username || '');
                setShowUsernameModal(true);
              }}
              icon={<Edit2 className="w-4 h-4" />}
            >
              Set Display Name
            </Button>
          )}
        </div>

        {/* Level Filter - Only show if viewing all levels is allowed */}
        {showAllLevels && (
          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={() => setSelectedLevel('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedLevel === 'all'
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
                  : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800 border border-transparent'
              }`}
            >
              All Levels
            </button>
            {yearGroupOptions.map(yg => (
              <button
                key={yg}
                onClick={() => setSelectedLevel(yg)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedLevel === yg
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
                    : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800 border border-transparent'
                }`}
              >
                {getYearGroupLabel(yg)}
              </button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Current User Position */}
        {currentStudent && currentUserRank && (
          <div className="mb-4 p-3 bg-primary-500/10 border border-primary-500/30 rounded-xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-400">Your Position</span>
                <Badge variant="info" size="sm">
                  #{currentUserRank} of {leaderboardData.length}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-400">Display Name:</span>
                <span className="text-sm font-medium text-primary-400">
                  {currentStudent.username || 'Not set'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Notice for Students */}
        {currentStudent && !showAllLevels && (
          <div className="mb-4 flex items-center gap-2 p-2 bg-neutral-800/50 rounded-lg text-xs text-neutral-500">
            <Lock className="w-3 h-3" />
            <span>You can only see students at your level. Real names are hidden for privacy.</span>
          </div>
        )}

        {/* Leaderboard List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {leaderboardData.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-500">No students in this category yet</p>
            </div>
          ) : (
            leaderboardData.map(entry => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                  entry.isCurrentUser
                    ? 'bg-primary-500/10 border border-primary-500/30'
                    : 'bg-neutral-800/50 hover:bg-neutral-800'
                }`}
              >
                {/* Rank Badge */}
                {getRankBadge(entry.rank)}

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium truncate ${
                      entry.isCurrentUser ? 'text-primary-400' : 'text-neutral-100'
                    }`}>
                      {entry.displayName}
                    </span>
                    {entry.isCurrentUser && (
                      <Badge variant="info" size="sm">You</Badge>
                    )}
                    {showAllLevels && (
                      <Badge variant="default" size="sm">
                        {getYearGroupLabel(entry.yearGroup)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-purple-400" />
                      Level {entry.level}
                    </span>
                    {entry.streak > 0 && (
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" />
                        {entry.streak} day streak
                      </span>
                    )}
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className="font-bold text-yellow-500">{entry.points.toLocaleString()}</p>
                  <p className="text-xs text-neutral-500">points</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Top 3 Podium (if enough students) */}
        {leaderboardData.length >= 3 && (
          <div className="mt-6 pt-4 border-t border-neutral-800">
            <h4 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Top 3
            </h4>
            <div className="flex items-end justify-center gap-4">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-neutral-400/20 flex items-center justify-center mb-2">
                  <Medal className="w-7 h-7 text-neutral-400" />
                </div>
                <p className="text-xs font-medium text-neutral-300 truncate max-w-16 text-center">
                  {leaderboardData[1]?.displayName}
                </p>
                <p className="text-xs text-neutral-500">{leaderboardData[1]?.points.toLocaleString()}</p>
                <div className="w-14 h-10 bg-neutral-400/20 rounded-t-lg mt-2" />
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mb-2">
                  <Crown className="w-8 h-8 text-yellow-500" />
                </div>
                <p className="text-xs font-medium text-yellow-400 truncate max-w-20 text-center">
                  {leaderboardData[0]?.displayName}
                </p>
                <p className="text-xs text-yellow-500">{leaderboardData[0]?.points.toLocaleString()}</p>
                <div className="w-16 h-16 bg-yellow-500/20 rounded-t-lg mt-2" />
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center mb-2">
                  <Medal className="w-7 h-7 text-orange-500" />
                </div>
                <p className="text-xs font-medium text-orange-400 truncate max-w-16 text-center">
                  {leaderboardData[2]?.displayName}
                </p>
                <p className="text-xs text-neutral-500">{leaderboardData[2]?.points.toLocaleString()}</p>
                <div className="w-14 h-6 bg-orange-500/20 rounded-t-lg mt-2" />
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Set Username Modal - Only for leaderboard display */}
      <Modal
        isOpen={showUsernameModal}
        onClose={() => {
          setShowUsernameModal(false);
          setNewUsername('');
          setUsernameError(null);
        }}
        title="Set Leaderboard Display Name"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-400">
            Choose a display name for the leaderboard. This keeps your real name private and is only used on the leaderboard.
          </p>

          <Input
            label="Display Name"
            value={newUsername}
            onChange={(e) => {
              setNewUsername(e.target.value);
              setUsernameError(null);
            }}
            placeholder="Enter your display name"
            maxLength={20}
          />

          <div className="text-xs text-neutral-500 space-y-1">
            <p>• 3-20 characters</p>
            <p>• Letters, numbers, underscores, and hyphens only</p>
            <p>• No inappropriate language</p>
          </div>

          {usernameError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{usernameError}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowUsernameModal(false);
                setNewUsername('');
                setUsernameError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSetUsername}
              disabled={!newUsername.trim()}
              icon={<Check className="w-4 h-4" />}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

// Compact version for dashboard sidebar
export const LeaderboardPreview: React.FC<{
  students: StudentProfile[];
  currentStudent?: StudentProfile;
  currentYearGroup?: YearGroup;
}> = ({ students, currentStudent, currentYearGroup }) => {
  // Filter by year group
  const filteredStudents = currentYearGroup
    ? students.filter(s => s.yearGroup === currentYearGroup)
    : students;

  // Sort and get top 5
  const topStudents = [...filteredStudents]
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)
    .map((student, index) => ({
      id: student.id,
      displayName: student.username || generateAnonymousUsername(),
      points: student.points,
      isCurrentUser: currentStudent?.id === student.id,
      rank: index + 1,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {topStudents.map(entry => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                entry.isCurrentUser
                  ? 'bg-primary-500/10 border border-primary-500/30'
                  : 'bg-neutral-800/30'
              }`}
            >
              {getRankBadge(entry.rank)}
              <span className={`flex-1 text-sm truncate ${
                entry.isCurrentUser ? 'text-primary-400 font-medium' : 'text-neutral-300'
              }`}>
                {entry.displayName}
                {entry.isCurrentUser && ' (You)'}
              </span>
              <span className="text-sm font-medium text-yellow-500">
                {entry.points.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
