import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  Rocket,
  Star,
  Flame,
  Trophy,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
import { Subject, WeeklyProgress, PenaltyRecord } from '../../types';
import { calculateStarBrightness, isLowEngagementWeek } from '../../utils/penaltySystem';
import { getItemById, ItemRarity } from '../../data/spaceShopItems';

interface StellarJourneyProps {
  weeklyData: WeeklyProgress[];
  enrolledSubjects: Subject[];
  currentPoints: number;
  streakDays?: number;
  recentPenalties?: PenaltyRecord[];
  showWarnings?: boolean;
  equippedSpaceship?: string; // Spaceship item ID from Command Center
}

export const StellarJourney: React.FC<StellarJourneyProps> = ({
  weeklyData,
  enrolledSubjects,
  currentPoints,
  streakDays = 0,
  recentPenalties = [],
  showWarnings = true,
  equippedSpaceship = 'ship-starter-shuttle',
}) => {
  // Get spaceship item details
  const spaceshipItem = getItemById(equippedSpaceship);
  const spaceshipIcon = spaceshipItem?.icon || '🚀';
  const spaceshipRarity = spaceshipItem?.rarity || 'common';

  // Get trail color based on rarity
  const getTrailColor = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'legendary': return { primary: '#FFD700', glow: 'rgba(255, 215, 0, 0.6)', trail: 'rgba(255, 215, 0, 0.3)' };
      case 'epic': return { primary: '#A855F7', glow: 'rgba(168, 85, 247, 0.6)', trail: 'rgba(168, 85, 247, 0.3)' };
      case 'rare': return { primary: '#3B82F6', glow: 'rgba(59, 130, 246, 0.6)', trail: 'rgba(59, 130, 246, 0.3)' };
      default: return { primary: '#6366F1', glow: 'rgba(99, 102, 241, 0.6)', trail: 'rgba(99, 102, 241, 0.3)' };
    }
  };
  const trailColors = getTrailColor(spaceshipRarity);
  // Check for recent penalties to show warning
  const hasRecentPenalties = recentPenalties.filter(p => !p.waived).length > 0;
  const totalPenaltyPoints = recentPenalties
    .filter(p => !p.waived)
    .reduce((sum, p) => sum + p.pointsDeducted, 0);
  // Calculate stats
  const stats = useMemo(() => {
    if (weeklyData.length === 0) return { bestWeek: 0, totalPoints: 0, avgProgress: 0 };

    const weekScores = weeklyData.map(week => {
      let total = 0;
      let count = 0;
      enrolledSubjects.forEach(subject => {
        if (subject in week) {
          total += week[subject as keyof WeeklyProgress] as number;
          count++;
        }
      });
      return count > 0 ? total / count : 0;
    });

    const bestWeekIndex = weekScores.indexOf(Math.max(...weekScores));
    const totalPoints = weeklyData.reduce((sum, w) => sum + (w.points || 0), 0);
    const avgProgress = weekScores.reduce((sum, s) => sum + s, 0) / weekScores.length;

    return { bestWeek: bestWeekIndex + 1, totalPoints, avgProgress: Math.round(avgProgress) };
  }, [weeklyData, enrolledSubjects]);

  // Subject colors
  const subjectColors: Record<Subject, { primary: string; glow: string; trail: string }> = {
    mathematics: { primary: '#3B82F6', glow: 'rgba(59, 130, 246, 0.6)', trail: 'rgba(59, 130, 246, 0.3)' },
    physics: { primary: '#A855F7', glow: 'rgba(168, 85, 247, 0.6)', trail: 'rgba(168, 85, 247, 0.3)' },
    economics: { primary: '#22C55E', glow: 'rgba(34, 197, 94, 0.6)', trail: 'rgba(34, 197, 94, 0.3)' },
  };

  // Generate path and node positions
  const pathData = useMemo(() => {
    const width = 800;
    const height = 300;
    const padding = 60;
    const nodeCount = weeklyData.length;

    if (nodeCount === 0) return { nodes: [], pathD: '', width, height };

    const stepX = (width - padding * 2) / Math.max(nodeCount - 1, 1);

    // Create wavy path nodes
    const nodes = weeklyData.map((week, i) => {
      const x = padding + i * stepX;
      // Create a gentle wave pattern
      const waveOffset = Math.sin(i * 0.8) * 30;
      const y = height / 2 + waveOffset;

      // Calculate average score for this week
      let total = 0;
      let count = 0;
      enrolledSubjects.forEach(subject => {
        if (subject in week) {
          total += week[subject as keyof WeeklyProgress] as number;
          count++;
        }
      });
      const avgScore = count > 0 ? total / count : 0;

      // Check if this was a low engagement week
      const isLowEngagement = isLowEngagementWeek(week, enrolledSubjects);
      const starBrightness = calculateStarBrightness(avgScore);

      return {
        x,
        y,
        week: week.week,
        points: week.points || 0,
        avgScore,
        isLowEngagement,
        starBrightness,
        subjects: enrolledSubjects.map(subject => ({
          subject,
          value: (week[subject as keyof WeeklyProgress] as number) || 0,
        })),
      };
    });

    // Generate smooth curved path
    let pathD = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 1; i < nodes.length; i++) {
      const prev = nodes[i - 1];
      const curr = nodes[i];
      const midX = (prev.x + curr.x) / 2;
      pathD += ` Q ${midX} ${prev.y} ${midX} ${(prev.y + curr.y) / 2}`;
      pathD += ` T ${curr.x} ${curr.y}`;
    }

    return { nodes, pathD, width, height };
  }, [weeklyData, enrolledSubjects]);

  // Generate background stars
  const backgroundStars = useMemo(() => {
    const stars = [];
    for (let i = 0; i < 50; i++) {
      stars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        delay: Math.random() * 3,
      });
    }
    return stars;
  }, []);

  // Get milestone badge for performance
  const getMilestoneBadge = (avgScore: number) => {
    if (avgScore >= 90) return { icon: '🌟', label: 'Stellar!' };
    if (avgScore >= 80) return { icon: '⭐', label: 'Great!' };
    if (avgScore >= 70) return { icon: '✨', label: 'Good' };
    return null;
  };

  const currentNodeIndex = pathData.nodes.length - 1;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary-500" />
          Stellar Journey
        </CardTitle>
        <CardDescription>Your progress through the cosmos</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl text-center">
            <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-yellow-500">{currentPoints}</p>
            <p className="text-xs text-neutral-400">Total Points</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl text-center">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-orange-500">{streakDays}</p>
            <p className="text-xs text-neutral-400">Day Streak</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl text-center">
            <Trophy className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-purple-500">Week {stats.bestWeek}</p>
            <p className="text-xs text-neutral-400">Best Week</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-primary-500/10 to-blue-500/10 border border-primary-500/30 rounded-xl text-center">
            <TrendingUp className="w-5 h-5 text-primary-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-primary-500">{stats.avgProgress}%</p>
            <p className="text-xs text-neutral-400">Avg Progress</p>
          </div>
        </div>

        {/* Stellar Journey Visualization */}
        <div className="relative bg-gradient-to-b from-neutral-900 via-neutral-900/95 to-neutral-800 rounded-xl overflow-hidden">
          {/* CSS Animations */}
          <style>{`
            @keyframes twinkle {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 1; }
            }
            @keyframes pulse-glow {
              0%, 100% { filter: drop-shadow(0 0 3px currentColor); }
              50% { filter: drop-shadow(0 0 8px currentColor); }
            }
            @keyframes rocket-bob {
              0%, 100% { transform: translateY(0) rotate(-45deg); }
              50% { transform: translateY(-5px) rotate(-45deg); }
            }
            @keyframes trail-flow {
              0% { stroke-dashoffset: 20; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes comet-trail {
              0% { opacity: 0.8; }
              100% { opacity: 0; }
            }
            .star-twinkle { animation: twinkle 2s ease-in-out infinite; }
            .node-pulse { animation: pulse-glow 2s ease-in-out infinite; }
            .rocket-animate { animation: rocket-bob 2s ease-in-out infinite; }
            .trail-animate { animation: trail-flow 1s linear infinite; }
          `}</style>

          <svg
            viewBox={`0 0 ${pathData.width} ${pathData.height}`}
            className="w-full h-64"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Definitions */}
            <defs>
              {/* Gradients for each subject */}
              {enrolledSubjects.map(subject => (
                <linearGradient key={`grad-${subject}`} id={`grad-${subject}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={subjectColors[subject].primary} stopOpacity="0.2" />
                  <stop offset="50%" stopColor={subjectColors[subject].primary} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={subjectColors[subject].primary} stopOpacity="0.2" />
                </linearGradient>
              ))}

              {/* Glow filter */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Star glow filter */}
              <filter id="starGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Rocket gradient */}
              <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FFA500" />
              </linearGradient>
            </defs>

            {/* Background Stars */}
            {backgroundStars.map(star => (
              <circle
                key={star.id}
                cx={`${star.x}%`}
                cy={`${star.y}%`}
                r={star.size}
                fill="white"
                opacity={star.opacity}
                className="star-twinkle"
                style={{ animationDelay: `${star.delay}s` }}
              />
            ))}

            {/* Main Journey Path - Comet Trail */}
            {pathData.pathD && (
              <>
                {/* Path glow */}
                <path
                  d={pathData.pathD}
                  fill="none"
                  stroke="rgba(99, 102, 241, 0.3)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  filter="url(#glow)"
                />

                {/* Main path */}
                <path
                  d={pathData.pathD}
                  fill="none"
                  stroke="rgba(99, 102, 241, 0.6)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="8 4"
                  className="trail-animate"
                />
              </>
            )}

            {/* Subject Progress Trails */}
            {enrolledSubjects.map((subject, subjectIndex) => {
              if (pathData.nodes.length < 2) return null;

              const offset = (subjectIndex - (enrolledSubjects.length - 1) / 2) * 8;
              let trailPath = `M ${pathData.nodes[0].x} ${pathData.nodes[0].y + offset}`;

              for (let i = 1; i < pathData.nodes.length; i++) {
                const prev = pathData.nodes[i - 1];
                const curr = pathData.nodes[i];
                const midX = (prev.x + curr.x) / 2;
                trailPath += ` Q ${midX} ${prev.y + offset} ${midX} ${(prev.y + curr.y) / 2 + offset}`;
                trailPath += ` T ${curr.x} ${curr.y + offset}`;
              }

              return (
                <path
                  key={subject}
                  d={trailPath}
                  fill="none"
                  stroke={subjectColors[subject].primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              );
            })}

            {/* Week Nodes as Stars */}
            {pathData.nodes.map((node, index) => {
              const isCurrentNode = index === currentNodeIndex;
              const brightness = node.starBrightness;
              const nodeSize = isCurrentNode ? 14 : 8 + (node.avgScore / 100) * 6;
              const milestone = getMilestoneBadge(node.avgScore);
              const isFaded = node.isLowEngagement && !isCurrentNode;

              return (
                <g key={index} className={isFaded ? 'opacity-50' : ''}>
                  {/* Node glow - reduced for faded weeks */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeSize + 8}
                    fill={isFaded
                      ? 'rgba(239, 68, 68, 0.2)' // Red tint for low engagement
                      : `rgba(99, 102, 241, ${brightness * 0.3})`
                    }
                    filter={isFaded ? undefined : "url(#glow)"}
                  />

                  {/* Star shape for high performers, faded star for low engagement */}
                  {node.avgScore >= 70 && !isFaded ? (
                    <g filter="url(#starGlow)">
                      {/* Multi-point star */}
                      <polygon
                        points={generateStarPoints(node.x, node.y, nodeSize, nodeSize * 0.5, isCurrentNode ? 6 : 5)}
                        fill={isCurrentNode ? '#FFD700' : `rgba(255, 255, 255, ${brightness})`}
                        className={isCurrentNode ? 'node-pulse' : ''}
                        style={{ color: '#FFD700' }}
                      />
                    </g>
                  ) : isFaded ? (
                    // Faded/cracked star for low engagement weeks
                    <g>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={nodeSize}
                        fill="rgba(239, 68, 68, 0.3)"
                        stroke="rgba(239, 68, 68, 0.5)"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      {/* X mark to indicate penalty/low engagement */}
                      <line
                        x1={node.x - nodeSize * 0.4}
                        y1={node.y - nodeSize * 0.4}
                        x2={node.x + nodeSize * 0.4}
                        y2={node.y + nodeSize * 0.4}
                        stroke="rgba(239, 68, 68, 0.6)"
                        strokeWidth="2"
                      />
                      <line
                        x1={node.x + nodeSize * 0.4}
                        y1={node.y - nodeSize * 0.4}
                        x2={node.x - nodeSize * 0.4}
                        y2={node.y + nodeSize * 0.4}
                        stroke="rgba(239, 68, 68, 0.6)"
                        strokeWidth="2"
                      />
                    </g>
                  ) : (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={nodeSize}
                      fill={`rgba(255, 255, 255, ${brightness * 0.8})`}
                      className={isCurrentNode ? 'node-pulse' : ''}
                      style={{ color: 'rgba(99, 102, 241, 0.8)' }}
                    />
                  )}

                  {/* Week label */}
                  <text
                    x={node.x}
                    y={node.y + nodeSize + 18}
                    textAnchor="middle"
                    fill="#a3a3a3"
                    fontSize="10"
                    fontWeight="500"
                  >
                    {node.week}
                  </text>

                  {/* Points earned */}
                  {node.points > 0 && (
                    <text
                      x={node.x}
                      y={node.y - nodeSize - 8}
                      textAnchor="middle"
                      fill="#FCD34D"
                      fontSize="9"
                      fontWeight="600"
                    >
                      +{node.points}
                    </text>
                  )}

                  {/* Milestone badge */}
                  {milestone && !isCurrentNode && (
                    <text
                      x={node.x + nodeSize + 5}
                      y={node.y - nodeSize + 5}
                      fontSize="12"
                    >
                      {milestone.icon}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Spaceship at current position with trail */}
            {pathData.nodes.length > 0 && (
              <g
                transform={`translate(${pathData.nodes[currentNodeIndex].x}, ${pathData.nodes[currentNodeIndex].y})`}
              >
                {/* Trail particles behind the ship */}
                <g className="trail-particles">
                  {/* Main engine trail */}
                  <ellipse
                    cx="-25"
                    cy="8"
                    rx="20"
                    ry="4"
                    fill={trailColors.trail}
                    opacity="0.6"
                  >
                    <animate attributeName="rx" values="20;15;20" dur="0.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0.3;0.6" dur="0.5s" repeatCount="indefinite" />
                  </ellipse>
                  <ellipse
                    cx="-40"
                    cy="8"
                    rx="15"
                    ry="3"
                    fill={trailColors.trail}
                    opacity="0.4"
                  >
                    <animate attributeName="rx" values="15;10;15" dur="0.6s" repeatCount="indefinite" />
                  </ellipse>
                  <ellipse
                    cx="-55"
                    cy="8"
                    rx="10"
                    ry="2"
                    fill={trailColors.trail}
                    opacity="0.2"
                  >
                    <animate attributeName="opacity" values="0.2;0.1;0.2" dur="0.7s" repeatCount="indefinite" />
                  </ellipse>

                  {/* Sparkle particles */}
                  {[...Array(5)].map((_, i) => (
                    <circle
                      key={i}
                      cx={-30 - i * 12}
                      cy={8 + Math.sin(i * 1.5) * 4}
                      r={2 - i * 0.3}
                      fill={trailColors.primary}
                      opacity={0.6 - i * 0.1}
                    >
                      <animate
                        attributeName="opacity"
                        values={`${0.6 - i * 0.1};${0.2 - i * 0.02};${0.6 - i * 0.1}`}
                        dur={`${0.3 + i * 0.1}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}
                </g>

                {/* Ship glow effect */}
                <circle
                  cx="0"
                  cy="0"
                  r="18"
                  fill={trailColors.glow}
                  filter="url(#glow)"
                  opacity="0.4"
                >
                  <animate attributeName="r" values="18;22;18" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.6;0.4" dur="1.5s" repeatCount="indefinite" />
                </circle>

                {/* The spaceship icon */}
                <g className="rocket-animate">
                  <text
                    fontSize="28"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ filter: spaceshipRarity === 'legendary' ? 'drop-shadow(0 0 6px gold)' : spaceshipRarity === 'epic' ? 'drop-shadow(0 0 4px purple)' : undefined }}
                  >
                    {spaceshipIcon}
                  </text>
                </g>
              </g>
            )}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-4 bg-neutral-900/80 backdrop-blur-sm rounded-lg px-4 py-2">
            {enrolledSubjects.map(subject => (
              <div key={subject} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: subjectColors[subject].primary }}
                />
                <span className="text-xs text-neutral-400 capitalize">{subject}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-neutral-700">
              <span className="text-xs text-yellow-400">⭐</span>
              <span className="text-xs text-neutral-400">= 70%+ Week</span>
            </div>
            <div className="flex items-center gap-2 pl-4 border-l border-neutral-700">
              <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50" />
              <span className="text-xs text-neutral-400">= Low Engagement</span>
            </div>
          </div>
        </div>

        {/* Penalty Warning Banner */}
        {showWarnings && hasRecentPenalties && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">
                Recent Penalties Applied
              </p>
              <p className="text-xs text-neutral-400">
                You've lost <span className="text-red-400 font-medium">-{totalPenaltyPoints} pts</span> recently. Keep up your engagement to avoid further penalties!
              </p>
            </div>
          </div>
        )}

        {/* Weekly breakdown tooltip hint */}
        <p className="text-xs text-neutral-500 text-center mt-3">
          Each star represents a week of learning. Brighter stars = higher scores!
        </p>
      </CardContent>
    </Card>
  );
};

// Helper function to generate star polygon points
function generateStarPoints(cx: number, cy: number, outerR: number, innerR: number, points: number): string {
  const step = Math.PI / points;
  const starPoints: string[] = [];

  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    starPoints.push(`${x},${y}`);
  }

  return starPoints.join(' ');
}
