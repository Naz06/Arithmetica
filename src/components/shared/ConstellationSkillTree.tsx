import React, { useState, useMemo } from 'react';
import { Subject, YearGroup } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Sparkles, Lock, CheckCircle, Star, X, Zap, Target, BookOpen } from 'lucide-react';

// Topic node in the constellation
interface TopicNode {
  id: string;
  name: string;
  description: string;
  prerequisites: string[];
  x: number;
  y: number;
  mastery: number;
  isUnlocked: boolean;
}

// Constellation for a subject
interface Constellation {
  subject: Subject;
  name: string;
  color: string;
  glowColor: string;
  icon: React.ReactNode;
  topics: TopicNode[];
}

// Topic templates by level and subject
interface TopicTemplate {
  id: string;
  name: string;
  description: string;
  prerequisites: string[];
  x: number;
  y: number;
}

// ============ CURRICULUM DATA ============
const curriculumTopics: Record<string, Record<Subject, TopicTemplate[]>> = {
  // Year 5-6 Topics
  'year5-6': {
    mathematics: [
      { id: 'm1', name: 'Place Value', description: 'Numbers up to millions and decimals', prerequisites: [], x: 50, y: 88 },
      { id: 'm2', name: 'Addition & Subtraction', description: 'Multi-digit mental and written methods', prerequisites: ['m1'], x: 25, y: 68 },
      { id: 'm3', name: 'Multiplication', description: 'Times tables and long multiplication', prerequisites: ['m1'], x: 75, y: 68 },
      { id: 'm4', name: 'Division', description: 'Short and long division methods', prerequisites: ['m3'], x: 85, y: 48 },
      { id: 'm5', name: 'Fractions', description: 'Add, subtract, multiply fractions', prerequisites: ['m2', 'm3'], x: 50, y: 48 },
      { id: 'm6', name: 'Decimals & Percentages', description: 'Converting and calculating', prerequisites: ['m5'], x: 30, y: 28 },
      { id: 'm7', name: 'Ratio', description: 'Understanding proportional relationships', prerequisites: ['m5', 'm4'], x: 70, y: 28 },
      { id: 'm8', name: 'Geometry Basics', description: 'Shapes, angles, and properties', prerequisites: ['m6', 'm7'], x: 50, y: 10 },
    ],
    physics: [
      { id: 'p1', name: 'Forces', description: 'Pushes, pulls, and gravity', prerequisites: [], x: 50, y: 88 },
      { id: 'p2', name: 'Light', description: 'How light travels and shadows', prerequisites: ['p1'], x: 30, y: 65 },
      { id: 'p3', name: 'Sound', description: 'Vibrations and hearing', prerequisites: ['p1'], x: 70, y: 65 },
      { id: 'p4', name: 'Electricity Basics', description: 'Simple circuits and components', prerequisites: ['p2'], x: 20, y: 42 },
      { id: 'p5', name: 'Magnets', description: 'Magnetic forces and poles', prerequisites: ['p3'], x: 80, y: 42 },
      { id: 'p6', name: 'Earth & Space', description: 'Day, night, and seasons', prerequisites: ['p4', 'p5'], x: 50, y: 22 },
      { id: 'p7', name: 'Materials', description: 'Properties and changes', prerequisites: ['p6'], x: 50, y: 8 },
    ],
    economics: [
      { id: 'e1', name: 'Needs vs Wants', description: 'Understanding basic needs', prerequisites: [], x: 50, y: 88 },
      { id: 'e2', name: 'Money Basics', description: 'Coins, notes, and value', prerequisites: ['e1'], x: 30, y: 65 },
      { id: 'e3', name: 'Saving', description: 'Why and how to save', prerequisites: ['e1'], x: 70, y: 65 },
      { id: 'e4', name: 'Earning Money', description: 'Jobs and income', prerequisites: ['e2'], x: 25, y: 42 },
      { id: 'e5', name: 'Spending Wisely', description: 'Making good choices', prerequisites: ['e2', 'e3'], x: 50, y: 42 },
      { id: 'e6', name: 'Budgeting', description: 'Planning your money', prerequisites: ['e4', 'e5'], x: 75, y: 42 },
      { id: 'e7', name: 'Trading', description: 'Buying, selling, exchange', prerequisites: ['e5', 'e6'], x: 50, y: 20 },
    ],
  },
  // GCSE Topics
  gcse: {
    mathematics: [
      { id: 'm1', name: 'Number', description: 'Indices, surds, and standard form', prerequisites: [], x: 50, y: 88 },
      { id: 'm2', name: 'Algebra Fundamentals', description: 'Expressions and simplifying', prerequisites: ['m1'], x: 25, y: 70 },
      { id: 'm3', name: 'Fractions & Percentages', description: 'Complex calculations', prerequisites: ['m1'], x: 75, y: 70 },
      { id: 'm4', name: 'Linear Equations', description: 'Solving and graphing', prerequisites: ['m2'], x: 15, y: 52 },
      { id: 'm5', name: 'Quadratics', description: 'Factorising and solving', prerequisites: ['m2'], x: 40, y: 52 },
      { id: 'm6', name: 'Ratio & Proportion', description: 'Direct and inverse', prerequisites: ['m3'], x: 65, y: 52 },
      { id: 'm7', name: 'Geometry', description: 'Angles, circles, and proofs', prerequisites: ['m4'], x: 20, y: 32 },
      { id: 'm8', name: 'Trigonometry', description: 'Sin, cos, tan applications', prerequisites: ['m5', 'm7'], x: 45, y: 32 },
      { id: 'm9', name: 'Statistics', description: 'Averages and probability', prerequisites: ['m6'], x: 75, y: 32 },
      { id: 'm10', name: 'Further Algebra', description: 'Simultaneous equations', prerequisites: ['m8'], x: 35, y: 12 },
      { id: 'm11', name: 'Vectors & Transformations', description: 'Movement and change', prerequisites: ['m8', 'm9'], x: 65, y: 12 },
    ],
    physics: [
      { id: 'p1', name: 'Energy', description: 'Stores and transfers', prerequisites: [], x: 50, y: 88 },
      { id: 'p2', name: 'Electricity', description: 'Circuits and calculations', prerequisites: ['p1'], x: 25, y: 68 },
      { id: 'p3', name: 'Particle Model', description: 'Density and pressure', prerequisites: ['p1'], x: 75, y: 68 },
      { id: 'p4', name: 'Atomic Structure', description: 'Atoms and radiation', prerequisites: ['p3'], x: 85, y: 48 },
      { id: 'p5', name: 'Forces', description: 'Newton\'s laws and motion', prerequisites: ['p1'], x: 50, y: 48 },
      { id: 'p6', name: 'Waves', description: 'Properties and EM spectrum', prerequisites: ['p5'], x: 25, y: 28 },
      { id: 'p7', name: 'Magnetism', description: 'Fields and electromagnets', prerequisites: ['p2', 'p5'], x: 50, y: 28 },
      { id: 'p8', name: 'Space Physics', description: 'Stars and the universe', prerequisites: ['p4', 'p6'], x: 75, y: 28 },
      { id: 'p9', name: 'Combined Topics', description: 'Integration and applications', prerequisites: ['p7', 'p8'], x: 50, y: 10 },
    ],
    economics: [
      { id: 'e1', name: 'Economic Problem', description: 'Scarcity and choice', prerequisites: [], x: 50, y: 88 },
      { id: 'e2', name: 'Supply & Demand', description: 'Market fundamentals', prerequisites: ['e1'], x: 30, y: 68 },
      { id: 'e3', name: 'Price Mechanism', description: 'How markets work', prerequisites: ['e1'], x: 70, y: 68 },
      { id: 'e4', name: 'Elasticity', description: 'PED and YED', prerequisites: ['e2', 'e3'], x: 50, y: 50 },
      { id: 'e5', name: 'Market Structures', description: 'Competition types', prerequisites: ['e2'], x: 20, y: 50 },
      { id: 'e6', name: 'Market Failure', description: 'Externalities & public goods', prerequisites: ['e3'], x: 80, y: 50 },
      { id: 'e7', name: 'Government Intervention', description: 'Taxes and subsidies', prerequisites: ['e4', 'e6'], x: 65, y: 30 },
      { id: 'e8', name: 'Labour Markets', description: 'Wages and employment', prerequisites: ['e4', 'e5'], x: 35, y: 30 },
      { id: 'e9', name: 'Macro Introduction', description: 'GDP and growth', prerequisites: ['e7', 'e8'], x: 50, y: 10 },
    ],
  },
  // A-Level Topics
  alevel: {
    mathematics: [
      { id: 'm1', name: 'Pure: Algebra', description: 'Advanced algebraic manipulation', prerequisites: [], x: 50, y: 90 },
      { id: 'm2', name: 'Pure: Functions', description: 'Transformations and composition', prerequisites: ['m1'], x: 25, y: 72 },
      { id: 'm3', name: 'Pure: Coordinate Geometry', description: 'Circles and parametric', prerequisites: ['m1'], x: 75, y: 72 },
      { id: 'm4', name: 'Pure: Sequences', description: 'Series and binomial expansion', prerequisites: ['m2'], x: 15, y: 54 },
      { id: 'm5', name: 'Pure: Trigonometry', description: 'Identities and equations', prerequisites: ['m2', 'm3'], x: 45, y: 54 },
      { id: 'm6', name: 'Pure: Exponentials', description: 'Logs and natural functions', prerequisites: ['m3'], x: 75, y: 54 },
      { id: 'm7', name: 'Calculus: Differentiation', description: 'Rules and applications', prerequisites: ['m4', 'm5'], x: 25, y: 36 },
      { id: 'm8', name: 'Calculus: Integration', description: 'Techniques and areas', prerequisites: ['m7'], x: 50, y: 36 },
      { id: 'm9', name: 'Statistics', description: 'Distributions and hypothesis testing', prerequisites: ['m6'], x: 80, y: 36 },
      { id: 'm10', name: 'Mechanics', description: 'Kinematics and forces', prerequisites: ['m7'], x: 25, y: 18 },
      { id: 'm11', name: 'Differential Equations', description: 'First and second order', prerequisites: ['m8'], x: 50, y: 18 },
      { id: 'm12', name: 'Vectors 3D', description: 'Lines, planes, and applications', prerequisites: ['m9', 'm10'], x: 75, y: 18 },
    ],
    physics: [
      { id: 'p1', name: 'Measurements', description: 'Units and uncertainties', prerequisites: [], x: 50, y: 90 },
      { id: 'p2', name: 'Particles & Radiation', description: 'Quantum phenomena', prerequisites: ['p1'], x: 25, y: 72 },
      { id: 'p3', name: 'Waves & Optics', description: 'Interference and diffraction', prerequisites: ['p1'], x: 75, y: 72 },
      { id: 'p4', name: 'Mechanics', description: 'Momentum and energy', prerequisites: ['p1'], x: 50, y: 72 },
      { id: 'p5', name: 'Materials', description: 'Stress, strain, Young\'s modulus', prerequisites: ['p4'], x: 35, y: 52 },
      { id: 'p6', name: 'Electricity', description: 'EMF and internal resistance', prerequisites: ['p3'], x: 65, y: 52 },
      { id: 'p7', name: 'Further Mechanics', description: 'Circular motion and SHM', prerequisites: ['p4', 'p5'], x: 20, y: 32 },
      { id: 'p8', name: 'Thermal Physics', description: 'Ideal gases and thermodynamics', prerequisites: ['p5'], x: 45, y: 32 },
      { id: 'p9', name: 'Fields', description: 'Gravitational and electric', prerequisites: ['p6'], x: 70, y: 32 },
      { id: 'p10', name: 'Nuclear Physics', description: 'Radioactivity and energy', prerequisites: ['p2', 'p8'], x: 35, y: 12 },
      { id: 'p11', name: 'Astrophysics', description: 'Stars and cosmology', prerequisites: ['p9', 'p10'], x: 65, y: 12 },
    ],
    economics: [
      { id: 'e1', name: 'Micro: Markets', description: 'Supply, demand, and equilibrium', prerequisites: [], x: 50, y: 90 },
      { id: 'e2', name: 'Elasticity', description: 'PED, XED, YED, PES', prerequisites: ['e1'], x: 25, y: 72 },
      { id: 'e3', name: 'Market Failure', description: 'Externalities and intervention', prerequisites: ['e1'], x: 75, y: 72 },
      { id: 'e4', name: 'Business Economics', description: 'Costs, revenue, and profit', prerequisites: ['e2'], x: 15, y: 52 },
      { id: 'e5', name: 'Market Structures', description: 'Perfect to monopoly', prerequisites: ['e2', 'e3'], x: 45, y: 52 },
      { id: 'e6', name: 'Labour Market', description: 'Wages and discrimination', prerequisites: ['e3'], x: 75, y: 52 },
      { id: 'e7', name: 'Macro: Indicators', description: 'GDP, inflation, unemployment', prerequisites: ['e4', 'e5'], x: 25, y: 32 },
      { id: 'e8', name: 'Aggregate Demand/Supply', description: 'AD/AS model', prerequisites: ['e5', 'e6'], x: 55, y: 32 },
      { id: 'e9', name: 'Policy', description: 'Fiscal and monetary', prerequisites: ['e7', 'e8'], x: 75, y: 32 },
      { id: 'e10', name: 'International Trade', description: 'Globalisation and trade', prerequisites: ['e8'], x: 35, y: 12 },
      { id: 'e11', name: 'Development', description: 'Economic growth strategies', prerequisites: ['e9', 'e10'], x: 65, y: 12 },
    ],
  },
};

// Constellation names by level
const constellationNames: Record<string, Record<Subject, string>> = {
  'year5-6': {
    mathematics: 'Numerica Minor',
    physics: 'Scientia Nova',
    economics: 'Oeconomia Prima',
  },
  gcse: {
    mathematics: 'Numerica Major',
    physics: 'Physica Nebula',
    economics: 'Economia Cluster',
  },
  alevel: {
    mathematics: 'Numerica Suprema',
    physics: 'Cosmos Infinitus',
    economics: 'Economia Maxima',
  },
};

// Map yearGroup to curriculum key
const yearGroupToLevel = (yg: YearGroup): string => {
  if (yg === 'year5' || yg === 'year6') return 'year5-6';
  if (yg === 'gcse') return 'gcse';
  return 'alevel';
};

// Create constellations based on student's year group
const createConstellations = (
  enrolledSubjects: Subject[],
  subjectStats: { subject: Subject; progress: number }[],
  yearGroup: YearGroup
): Constellation[] => {
  const level = yearGroupToLevel(yearGroup);
  const levelTopics = curriculumTopics[level];
  const names = constellationNames[level];

  const colors: Record<Subject, { color: string; glow: string; icon: React.ReactNode }> = {
    mathematics: { color: '#3B82F6', glow: 'rgba(59, 130, 246, 0.6)', icon: <BookOpen className="w-5 h-5" /> },
    physics: { color: '#A855F7', glow: 'rgba(168, 85, 247, 0.6)', icon: <Zap className="w-5 h-5" /> },
    economics: { color: '#22C55E', glow: 'rgba(34, 197, 94, 0.6)', icon: <Target className="w-5 h-5" /> },
  };

  return enrolledSubjects.map((subject) => {
    const templates = levelTopics[subject] || [];
    const baseProgress = subjectStats.find((s) => s.subject === subject)?.progress || 0;
    const { color, glow, icon } = colors[subject];

    // Calculate mastery for each topic based on position in the tree
    const topics: TopicNode[] = templates.map((t, index) => {
      const depth = 1 - t.y / 100; // 0 at bottom, 1 at top
      const hasPrereqs = t.prerequisites.length > 0;

      // Topics unlock based on overall progress
      const unlockThreshold = hasPrereqs ? depth * 60 : 0;
      const isUnlocked = baseProgress >= unlockThreshold;

      // Mastery decreases as you go higher in the tree
      const masteryBase = isUnlocked ? Math.max(0, baseProgress - depth * 40) : 0;
      const mastery = Math.min(100, masteryBase + (index === 0 ? 30 : 0));

      return {
        ...t,
        mastery,
        isUnlocked,
      };
    });

    return {
      subject,
      name: names[subject],
      color,
      glowColor: glow,
      icon,
      topics,
    };
  });
};

interface ConstellationSkillTreeProps {
  enrolledSubjects: Subject[];
  subjectStats: { subject: Subject; progress: number; topicsCompleted: number; totalTopics: number; grade: string }[];
  yearGroup: YearGroup;
}

export const ConstellationSkillTree: React.FC<ConstellationSkillTreeProps> = ({
  enrolledSubjects,
  subjectStats,
  yearGroup,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject>(enrolledSubjects[0] || 'mathematics');
  const [selectedTopic, setSelectedTopic] = useState<TopicNode | null>(null);
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  const constellations = useMemo(
    () => createConstellations(enrolledSubjects, subjectStats, yearGroup),
    [enrolledSubjects, subjectStats, yearGroup]
  );

  const currentConstellation = constellations.find((c) => c.subject === selectedSubject);

  if (!currentConstellation) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-neutral-500">No subjects enrolled</p>
        </CardContent>
      </Card>
    );
  }

  const getMasteryLevel = (mastery: number, isUnlocked: boolean) => {
    if (!isUnlocked) return { label: 'Locked', color: 'text-neutral-600', bgColor: 'bg-neutral-800' };
    if (mastery >= 90) return { label: 'Mastered', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
    if (mastery >= 70) return { label: 'Proficient', color: 'text-green-400', bgColor: 'bg-green-500/20' };
    if (mastery >= 40) return { label: 'Learning', color: 'text-blue-400', bgColor: 'bg-blue-500/20' };
    if (mastery > 0) return { label: 'Started', color: 'text-purple-400', bgColor: 'bg-purple-500/20' };
    return { label: 'New', color: 'text-neutral-400', bgColor: 'bg-neutral-700' };
  };

  const getStarStyle = (topic: TopicNode) => {
    const isHovered = hoveredTopic === topic.id;
    const isSelected = selectedTopic?.id === topic.id;

    if (!topic.isUnlocked) {
      return { size: isHovered ? 14 : 10, opacity: 0.3, glow: 'none', fill: '#525252', animate: '' };
    }

    const baseSize = topic.mastery >= 90 ? 18 : topic.mastery >= 70 ? 16 : topic.mastery >= 40 ? 14 : 12;
    const size = isHovered || isSelected ? baseSize + 4 : baseSize;

    if (topic.mastery >= 90) {
      return {
        size,
        opacity: 1,
        glow: `0 0 20px ${currentConstellation.glowColor}, 0 0 40px ${currentConstellation.glowColor}`,
        fill: currentConstellation.color,
        animate: 'animate-pulse',
      };
    }
    if (topic.mastery >= 70) {
      return { size, opacity: 1, glow: `0 0 12px ${currentConstellation.glowColor}`, fill: currentConstellation.color, animate: '' };
    }
    if (topic.mastery >= 40) {
      return { size, opacity: 0.85, glow: `0 0 8px ${currentConstellation.glowColor}`, fill: currentConstellation.color, animate: '' };
    }
    if (topic.mastery > 0) {
      return { size, opacity: 0.6, glow: 'none', fill: currentConstellation.color, animate: 'animate-[pulse_3s_ease-in-out_infinite]' };
    }
    return { size, opacity: 0.5, glow: 'none', fill: '#737373', animate: '' };
  };

  const completedStars = currentConstellation.topics.filter((t) => t.mastery >= 70).length;
  const totalStars = currentConstellation.topics.length;
  const overallProgress = subjectStats.find((s) => s.subject === selectedSubject)?.progress || 0;

  const levelLabel = yearGroupToLevel(yearGroup) === 'year5-6' ? 'Year 5-6' : yearGroupToLevel(yearGroup).toUpperCase();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Constellation Map
            </CardTitle>
            <CardDescription>
              {levelLabel} curriculum • Chart your path through knowledge
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400">{completedStars}/{totalStars} stars mastered</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {constellations.map((constellation) => (
            <button
              key={constellation.subject}
              onClick={() => {
                setSelectedSubject(constellation.subject);
                setSelectedTopic(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                selectedSubject === constellation.subject
                  ? 'bg-neutral-800 border border-neutral-700'
                  : 'bg-neutral-900/50 border border-transparent hover:bg-neutral-800/50'
              }`}
              style={{ color: selectedSubject === constellation.subject ? constellation.color : '#a3a3a3' }}
            >
              {constellation.icon}
              <span className="text-sm font-medium capitalize">{constellation.subject}</span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid lg:grid-cols-3 gap-0">
          {/* Constellation Visualization */}
          <div className="lg:col-span-2 relative bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 overflow-hidden">
            {/* Star background */}
            <div className="absolute inset-0 opacity-30">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-px h-px bg-white rounded-full animate-twinkle"
                  style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }}
                />
              ))}
            </div>

            {/* Constellation name */}
            <div className="absolute top-4 left-4 z-10">
              <h3 className="text-lg font-bold" style={{ color: currentConstellation.color }}>
                {currentConstellation.name}
              </h3>
              <p className="text-xs text-neutral-500">{overallProgress}% explored</p>
            </div>

            {/* SVG Constellation */}
            <svg viewBox="0 0 100 100" className="w-full h-80 lg:h-96" preserveAspectRatio="xMidYMid meet">
              {/* Connection lines */}
              {currentConstellation.topics.map((topic) =>
                topic.prerequisites.map((prereqId) => {
                  const prereq = currentConstellation.topics.find((t) => t.id === prereqId);
                  if (!prereq) return null;
                  const isActive = topic.isUnlocked && prereq.isUnlocked;
                  return (
                    <line
                      key={`${prereqId}-${topic.id}`}
                      x1={prereq.x}
                      y1={prereq.y}
                      x2={topic.x}
                      y2={topic.y}
                      stroke={isActive ? currentConstellation.color : '#404040'}
                      strokeWidth={isActive ? 0.4 : 0.2}
                      strokeOpacity={isActive ? 0.6 : 0.3}
                      strokeDasharray={isActive ? 'none' : '1,1'}
                    />
                  );
                })
              )}

              {/* Topic stars */}
              {currentConstellation.topics.map((topic) => {
                const style = getStarStyle(topic);
                return (
                  <g key={topic.id}>
                    {style.glow !== 'none' && (
                      <circle cx={topic.x} cy={topic.y} r={style.size / 2 + 2} fill={currentConstellation.color} opacity={0.3} className={style.animate} />
                    )}
                    <circle
                      cx={topic.x}
                      cy={topic.y}
                      r={style.size / 2}
                      fill={style.fill}
                      opacity={style.opacity}
                      className={`cursor-pointer transition-all duration-200 ${style.animate}`}
                      onClick={() => topic.isUnlocked && setSelectedTopic(topic)}
                      onMouseEnter={() => setHoveredTopic(topic.id)}
                      onMouseLeave={() => setHoveredTopic(null)}
                      style={{ filter: style.glow !== 'none' ? `drop-shadow(${style.glow})` : 'none' }}
                    />
                    {!topic.isUnlocked && (
                      <text x={topic.x} y={topic.y} textAnchor="middle" dominantBaseline="central" fontSize="4" fill="#525252">
                        🔒
                      </text>
                    )}
                    {topic.isUnlocked && topic.mastery >= 90 && (
                      <text x={topic.x} y={topic.y} textAnchor="middle" dominantBaseline="central" fontSize="5" fill="#FFF">
                        ✓
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover tooltip */}
            {hoveredTopic && !selectedTopic && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-neutral-900/95 border border-neutral-700 rounded-lg px-4 py-2 z-20">
                <p className="text-sm font-medium text-neutral-100">
                  {currentConstellation.topics.find((t) => t.id === hoveredTopic)?.name}
                </p>
                <p className="text-xs text-neutral-500">Click to view details</p>
              </div>
            )}
          </div>

          {/* Topic Details Panel */}
          <div className="bg-neutral-900/50 border-l border-neutral-800 p-4">
            {selectedTopic ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-neutral-100">{selectedTopic.name}</h4>
                    <p className="text-sm text-neutral-400 mt-1">{selectedTopic.description}</p>
                  </div>
                  <button onClick={() => setSelectedTopic(null)} className="p-1 hover:bg-neutral-800 rounded">
                    <X className="w-4 h-4 text-neutral-500" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-400">Mastery</span>
                    <Badge variant={selectedTopic.mastery >= 70 ? 'success' : selectedTopic.mastery >= 40 ? 'info' : 'default'} size="sm">
                      {getMasteryLevel(selectedTopic.mastery, selectedTopic.isUnlocked).label}
                    </Badge>
                  </div>
                  <ProgressBar value={Math.max(0, selectedTopic.mastery)} variant="gradient" size="md" />
                  <p className="text-xs text-neutral-500 mt-1 text-right">{Math.max(0, selectedTopic.mastery)}% complete</p>
                </div>

                {selectedTopic.prerequisites.length > 0 && (
                  <div>
                    <p className="text-sm text-neutral-400 mb-2">Prerequisites</p>
                    <div className="space-y-1">
                      {selectedTopic.prerequisites.map((prereqId) => {
                        const prereq = currentConstellation.topics.find((t) => t.id === prereqId);
                        if (!prereq) return null;
                        const prereqMastery = getMasteryLevel(prereq.mastery, prereq.isUnlocked);
                        return (
                          <div key={prereqId} className={`flex items-center gap-2 p-2 rounded-lg ${prereqMastery.bgColor}`}>
                            {prereq.mastery >= 70 ? (
                              <CheckCircle className={`w-4 h-4 ${prereqMastery.color}`} />
                            ) : (
                              <Star className={`w-4 h-4 ${prereqMastery.color}`} />
                            )}
                            <span className={`text-sm ${prereqMastery.color}`}>{prereq.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-neutral-800">
                  {selectedTopic.mastery >= 90 ? (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm">You've mastered this topic!</span>
                    </div>
                  ) : selectedTopic.mastery >= 70 ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Great progress! Almost mastered.</span>
                    </div>
                  ) : selectedTopic.mastery >= 40 ? (
                    <p className="text-sm text-neutral-400">Keep practicing to reach mastery!</p>
                  ) : (
                    <p className="text-sm text-neutral-500">Begin your journey with this topic.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${currentConstellation.color}20` }}>
                  <Star className="w-8 h-8" style={{ color: currentConstellation.color }} />
                </div>
                <h4 className="font-medium text-neutral-100 mb-2">Select a Star</h4>
                <p className="text-sm text-neutral-500 max-w-[200px]">
                  Click on any star to view topic details and track your progress
                </p>

                <div className="mt-6 space-y-2 text-left w-full">
                  <p className="text-xs text-neutral-600 uppercase tracking-wide">Legend</p>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                    <span className="text-xs text-neutral-400">Mastered (90%+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentConstellation.color }} />
                    <span className="text-xs text-neutral-400">In Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                    <span className="text-xs text-neutral-400">Locked</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </Card>
  );
};
