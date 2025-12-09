import React, { useState, useMemo } from 'react';
import { Subject, YearGroup } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Sparkles, CheckCircle, Star, X, Zap, Target, BookOpen } from 'lucide-react';

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

  // FFX-inspired node styling - gem-like spheres
  const getNodeStyle = (topic: TopicNode) => {
    const isHovered = hoveredTopic === topic.id;
    const isSelected = selectedTopic?.id === topic.id;
    const hoverScale = isHovered || isSelected ? 1.15 : 1;

    // Locked nodes - dark metallic empty sockets
    if (!topic.isUnlocked) {
      return {
        radius: 2.2,
        fillColor: '#1a1a2e',
        strokeColor: '#2d2d44',
        strokeWidth: 0.15,
        glowColor: 'transparent',
        glowRadius: 0,
        innerGlow: false,
        iconScale: 0.6,
        opacity: 0.4,
        scale: hoverScale,
      };
    }

    // Mastered - golden/amber gem with bright glow
    if (topic.mastery >= 90) {
      return {
        radius: 2.8,
        fillColor: '#FFD700',
        strokeColor: '#FFA500',
        strokeWidth: 0.2,
        glowColor: 'rgba(255, 215, 0, 0.8)',
        glowRadius: 4,
        innerGlow: true,
        iconScale: 1,
        opacity: 1,
        scale: hoverScale,
      };
    }

    // Proficient - bright colored gem
    if (topic.mastery >= 70) {
      return {
        radius: 2.5,
        fillColor: currentConstellation.color,
        strokeColor: '#fff',
        strokeWidth: 0.12,
        glowColor: currentConstellation.glowColor,
        glowRadius: 3,
        innerGlow: true,
        iconScale: 0.9,
        opacity: 1,
        scale: hoverScale,
      };
    }

    // Learning - semi-bright gem
    if (topic.mastery >= 40) {
      return {
        radius: 2.3,
        fillColor: currentConstellation.color,
        strokeColor: 'rgba(255,255,255,0.5)',
        strokeWidth: 0.1,
        glowColor: currentConstellation.glowColor,
        glowRadius: 2,
        innerGlow: false,
        iconScale: 0.85,
        opacity: 0.85,
        scale: hoverScale,
      };
    }

    // Started - dim gem
    if (topic.mastery > 0) {
      return {
        radius: 2.1,
        fillColor: currentConstellation.color,
        strokeColor: 'rgba(255,255,255,0.3)',
        strokeWidth: 0.08,
        glowColor: currentConstellation.glowColor,
        glowRadius: 1.5,
        innerGlow: false,
        iconScale: 0.8,
        opacity: 0.7,
        scale: hoverScale,
      };
    }

    // Available but not started - empty socket with faint color
    return {
      radius: 2,
      fillColor: '#2a2a4a',
      strokeColor: currentConstellation.color,
      strokeWidth: 0.12,
      glowColor: 'transparent',
      glowRadius: 0,
      innerGlow: false,
      iconScale: 0.75,
      opacity: 0.6,
      scale: hoverScale,
    };
  };

  // Get icon for node based on mastery
  const getNodeIcon = (topic: TopicNode) => {
    if (!topic.isUnlocked) return '🔒';
    if (topic.mastery >= 90) return '⭐';
    if (topic.mastery >= 70) return '◆';
    if (topic.mastery >= 40) return '●';
    if (topic.mastery > 0) return '○';
    return '◇';
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
              Sphere Grid
            </CardTitle>
            <CardDescription>
              {levelLabel} curriculum • Navigate your path to mastery
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400">{completedStars}/{totalStars} nodes activated</span>
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
          {/* Sphere Grid Visualization */}
          <div className="lg:col-span-2 relative bg-gradient-to-b from-[#0a0a1a] via-[#0f0f2a] to-[#0a0a1a] overflow-hidden">
            {/* Ancient texture overlay */}
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                  <pattern id="runicPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(100,100,150,0.1)" strokeWidth="0.5" />
                    <circle cx="20" cy="20" r="10" fill="none" stroke="rgba(100,100,150,0.08)" strokeWidth="0.3" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#runicPattern)" />
              </svg>
            </div>

            {/* Grid name */}
            <div className="absolute top-4 left-4 z-10">
              <h3 className="text-lg font-bold" style={{ color: currentConstellation.color }}>
                {currentConstellation.name}
              </h3>
              <p className="text-xs text-neutral-500">{overallProgress}% traversed</p>
            </div>

            {/* SVG Sphere Grid */}
            <svg viewBox="0 0 100 100" className="w-full h-80 lg:h-96" preserveAspectRatio="xMidYMid meet">
              <defs>
                {/* Glow filters for different levels */}
                <filter id="nodeGlowMastered" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="1" result="blur" />
                  <feFlood floodColor="#FFD700" floodOpacity="0.6" />
                  <feComposite in2="blur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="nodeGlowActive" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="0.6" result="blur" />
                  <feFlood floodColor={currentConstellation.color} floodOpacity="0.5" />
                  <feComposite in2="blur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="selectedPulse" x="-150%" y="-150%" width="400%" height="400%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feFlood floodColor="#fff" floodOpacity="0.4" />
                  <feComposite in2="blur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Gradients for gem-like nodes */}
                <radialGradient id="masteredGem" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FFFACD" />
                  <stop offset="30%" stopColor="#FFD700" />
                  <stop offset="70%" stopColor="#DAA520" />
                  <stop offset="100%" stopColor="#B8860B" />
                </radialGradient>
                <radialGradient id="activeGem" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                  <stop offset="30%" stopColor={currentConstellation.color} />
                  <stop offset="100%" stopColor={currentConstellation.color} stopOpacity="0.6" />
                </radialGradient>
                <radialGradient id="lockedSocket" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#2a2a3a" />
                  <stop offset="100%" stopColor="#1a1a2a" />
                </radialGradient>
                <radialGradient id="emptySocket" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3a3a5a" />
                  <stop offset="100%" stopColor="#2a2a4a" />
                </radialGradient>
              </defs>

              {/* Connection lines - FFX circuit-style tracks */}
              {currentConstellation.topics.map((topic) =>
                topic.prerequisites.map((prereqId) => {
                  const prereq = currentConstellation.topics.find((t) => t.id === prereqId);
                  if (!prereq) return null;
                  const isActive = topic.isUnlocked && prereq.isUnlocked;
                  const isBothMastered = prereq.mastery >= 70 && topic.mastery >= 70;
                  const lineId = `line-${prereqId}-${topic.id}`;

                  // Calculate offset for parallel tracks
                  const dx = topic.x - prereq.x;
                  const dy = topic.y - prereq.y;
                  const len = Math.sqrt(dx * dx + dy * dy);
                  const nx = -dy / len * 0.3; // Normal offset
                  const ny = dx / len * 0.3;

                  return (
                    <g key={lineId}>
                      {/* Outer track line */}
                      <line
                        x1={prereq.x + nx}
                        y1={prereq.y + ny}
                        x2={topic.x + nx}
                        y2={topic.y + ny}
                        stroke={isActive ? currentConstellation.color : '#2a2a3a'}
                        strokeWidth={0.25}
                        strokeOpacity={isBothMastered ? 0.9 : isActive ? 0.5 : 0.2}
                      />
                      {/* Inner track line */}
                      <line
                        x1={prereq.x - nx}
                        y1={prereq.y - ny}
                        x2={topic.x - nx}
                        y2={topic.y - ny}
                        stroke={isActive ? currentConstellation.color : '#2a2a3a'}
                        strokeWidth={0.25}
                        strokeOpacity={isBothMastered ? 0.9 : isActive ? 0.5 : 0.2}
                      />
                      {/* Center energy line */}
                      <line
                        x1={prereq.x}
                        y1={prereq.y}
                        x2={topic.x}
                        y2={topic.y}
                        stroke={isBothMastered ? '#00ffff' : isActive ? currentConstellation.color : '#1a1a2a'}
                        strokeWidth={isBothMastered ? 0.4 : 0.2}
                        strokeOpacity={isBothMastered ? 0.8 : isActive ? 0.4 : 0.15}
                        className={isBothMastered ? 'animate-energy-flow' : ''}
                      />
                      {/* Animated particle on active paths */}
                      {isActive && isBothMastered && (
                        <circle r="0.4" fill="#00ffff" opacity="0.9">
                          <animateMotion
                            dur={`${2 + Math.random()}s`}
                            repeatCount="indefinite"
                            path={`M${prereq.x},${prereq.y} L${topic.x},${topic.y}`}
                          />
                        </circle>
                      )}
                    </g>
                  );
                })
              )}

              {/* Sphere nodes */}
              {currentConstellation.topics.map((topic) => {
                const style = getNodeStyle(topic);
                const isSelected = selectedTopic?.id === topic.id;
                const isHovered = hoveredTopic === topic.id;

                return (
                  <g
                    key={topic.id}
                    className="cursor-pointer transition-transform"
                    style={{
                      transform: `translate(${topic.x}px, ${topic.y}px) scale(${style.scale})`,
                      transformOrigin: `${topic.x}px ${topic.y}px`
                    }}
                    onClick={() => topic.isUnlocked && setSelectedTopic(topic)}
                    onMouseEnter={() => setHoveredTopic(topic.id)}
                    onMouseLeave={() => setHoveredTopic(null)}
                  >
                    {/* Selection/hover pulse ring */}
                    {(isSelected || isHovered) && topic.isUnlocked && (
                      <circle
                        cx={0}
                        cy={0}
                        r={style.radius + 1}
                        fill="none"
                        stroke="#fff"
                        strokeWidth="0.15"
                        opacity="0.6"
                        className="animate-pulse-ring"
                      />
                    )}

                    {/* Outer glow */}
                    {style.glowRadius > 0 && (
                      <circle
                        cx={0}
                        cy={0}
                        r={style.radius + style.glowRadius * 0.3}
                        fill={style.glowColor}
                        opacity={0.4}
                        filter={topic.mastery >= 90 ? 'url(#nodeGlowMastered)' : 'url(#nodeGlowActive)'}
                      />
                    )}

                    {/* Socket ring (outer metallic border) */}
                    <circle
                      cx={0}
                      cy={0}
                      r={style.radius + 0.3}
                      fill="none"
                      stroke="#4a4a6a"
                      strokeWidth="0.3"
                      opacity={0.6}
                    />

                    {/* Main sphere/gem */}
                    <circle
                      cx={0}
                      cy={0}
                      r={style.radius}
                      fill={
                        topic.mastery >= 90 ? 'url(#masteredGem)' :
                        topic.mastery >= 40 ? 'url(#activeGem)' :
                        topic.isUnlocked ? 'url(#emptySocket)' : 'url(#lockedSocket)'
                      }
                      stroke={style.strokeColor}
                      strokeWidth={style.strokeWidth}
                      opacity={style.opacity}
                      filter={isSelected ? 'url(#selectedPulse)' : undefined}
                    />

                    {/* Inner highlight (gem shine) */}
                    {style.innerGlow && (
                      <ellipse
                        cx={-style.radius * 0.3}
                        cy={-style.radius * 0.3}
                        rx={style.radius * 0.35}
                        ry={style.radius * 0.25}
                        fill="white"
                        opacity={0.5}
                      />
                    )}

                    {/* Center icon */}
                    <text
                      x={0}
                      y={0}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={style.radius * 0.8}
                      fill={topic.mastery >= 90 ? '#fff' : topic.isUnlocked ? '#fff' : '#666'}
                      opacity={style.opacity}
                    >
                      {getNodeIcon(topic)}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover tooltip */}
            {hoveredTopic && !selectedTopic && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#1a1a2e]/95 border border-[#3a3a5a] rounded-lg px-4 py-2 z-20 backdrop-blur-sm">
                <p className="text-sm font-medium text-neutral-100">
                  {currentConstellation.topics.find((t) => t.id === hoveredTopic)?.name}
                </p>
                <p className="text-xs text-neutral-500">Click to view details</p>
              </div>
            )}
          </div>

          {/* Topic Details Panel */}
          <div className="bg-[#0f0f2a]/80 border-l border-[#2a2a4a] p-4">
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

                <div className="pt-4 border-t border-[#2a2a4a]">
                  {selectedTopic.mastery >= 90 ? (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm">Node fully activated!</span>
                    </div>
                  ) : selectedTopic.mastery >= 70 ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Great progress! Almost mastered.</span>
                    </div>
                  ) : selectedTopic.mastery >= 40 ? (
                    <p className="text-sm text-neutral-400">Keep practicing to fully activate!</p>
                  ) : (
                    <p className="text-sm text-neutral-500">Begin your journey with this node.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${currentConstellation.color}20`, border: `2px solid ${currentConstellation.color}40` }}>
                  <Star className="w-8 h-8" style={{ color: currentConstellation.color }} />
                </div>
                <h4 className="font-medium text-neutral-100 mb-2">Select a Node</h4>
                <p className="text-sm text-neutral-500 max-w-[200px]">
                  Click on any sphere to view details and track your progress
                </p>

                <div className="mt-6 space-y-2 text-left w-full">
                  <p className="text-xs text-neutral-600 uppercase tracking-wide">Legend</p>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-700 border border-yellow-500" />
                    <span className="text-xs text-neutral-400">Mastered (90%+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2" style={{ backgroundColor: currentConstellation.color, borderColor: 'white' }} />
                    <span className="text-xs text-neutral-400">Proficient (70%+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full opacity-80" style={{ backgroundColor: currentConstellation.color }} />
                    <span className="text-xs text-neutral-400">Learning (40%+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full opacity-60" style={{ backgroundColor: currentConstellation.color }} />
                    <span className="text-xs text-neutral-400">Started</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#2a2a4a] border border-[#4a4a6a]" />
                    <span className="text-xs text-neutral-400">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#1a1a2e] border border-[#2d2d44] opacity-50" />
                    <span className="text-xs text-neutral-400">Locked</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <style>{`
        /* Energy flow animation on mastered paths */
        @keyframes energy-flow {
          0%, 100% { stroke-opacity: 0.6; }
          50% { stroke-opacity: 1; }
        }
        .animate-energy-flow { animation: energy-flow 2s ease-in-out infinite; }

        /* Pulse ring for selected/hovered nodes */
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-pulse-ring { animation: pulse-ring 1.5s ease-in-out infinite; }
      `}</style>
    </Card>
  );
};
