import React, { useState, useMemo } from 'react';
import { Subject, YearGroup } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Sparkles, CheckCircle, Star, X, Zap, Target, BookOpen } from 'lucide-react';

// Generate SVG path for multi-pointed star
const generateStarPath = (cx: number, cy: number, outerR: number, innerR: number, points: number): string => {
  const step = Math.PI / points;
  const pathParts: string[] = [];

  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    pathParts.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
  }
  pathParts.push('Z');
  return pathParts.join(' ');
};

// Generate diamond/rhombus path for locked topics
const generateDiamondPath = (cx: number, cy: number, size: number): string => {
  return `M ${cx} ${cy - size} L ${cx + size} ${cy} L ${cx} ${cy + size} L ${cx - size} ${cy} Z`;
};

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

  // Star styling based on mastery level - refined with smaller, sharper stars
  const getStarStyle = (topic: TopicNode) => {
    const isHovered = hoveredTopic === topic.id;
    const isSelected = selectedTopic?.id === topic.id;

    // Locked topics - very dim diamonds (will shine once complete)
    if (!topic.isUnlocked) {
      return {
        outerSize: isHovered ? 1.4 : 1.1,
        innerSize: 0.4,
        points: 4,
        opacity: 0.15, // More dimmed
        fill: '#2a2a2a',
        stroke: '#3a3a3a',
        strokeWidth: 0.08,
        glow: false,
        glowColor: '',
        glowSize: 0,
        animate: false,
        pulseSpeed: 0,
        rays: 0,
        sparkles: 0,
        isLocked: true,
        gradientId: '',
      };
    }

    const hoverBoost = isHovered || isSelected ? 0.5 : 0;

    // Mastered - sharp golden 8-pointed star with rays and sparkles
    if (topic.mastery >= 90) {
      return {
        outerSize: 2.2 + hoverBoost,
        innerSize: 0.75, // ~0.34 ratio for sharp points
        points: 8,
        opacity: 1,
        fill: `url(#masteredStarGradient-${topic.id})`,
        stroke: '#FFC107',
        strokeWidth: 0.1,
        glow: true,
        glowColor: 'rgba(255, 215, 0, 0.4)',
        glowSize: 2.5,
        animate: true,
        pulseSpeed: 2,
        rays: 4,
        sparkles: 4,
        isLocked: false,
        gradientId: `masteredStarGradient-${topic.id}`,
      };
    }

    // Proficient - sharp 6-pointed star with subtle glow
    if (topic.mastery >= 70) {
      return {
        outerSize: 1.9 + hoverBoost,
        innerSize: 0.65, // ~0.34 ratio
        points: 6,
        opacity: 1,
        fill: `url(#proficientStarGradient-${topic.id})`,
        stroke: currentConstellation.color,
        strokeWidth: 0.08,
        glow: true,
        glowColor: currentConstellation.glowColor,
        glowSize: 1.8,
        animate: false,
        pulseSpeed: 0,
        rays: 0,
        sparkles: 2,
        isLocked: false,
        gradientId: `proficientStarGradient-${topic.id}`,
      };
    }

    // Learning - sharp 5-pointed star
    if (topic.mastery >= 40) {
      return {
        outerSize: 1.6 + hoverBoost,
        innerSize: 0.55, // ~0.34 ratio
        points: 5,
        opacity: 0.9,
        fill: `url(#learningStarGradient-${topic.id})`,
        stroke: 'transparent',
        strokeWidth: 0,
        glow: true,
        glowColor: currentConstellation.glowColor,
        glowSize: 1.2,
        animate: false,
        pulseSpeed: 0,
        rays: 0,
        sparkles: 0,
        isLocked: false,
        gradientId: `learningStarGradient-${topic.id}`,
      };
    }

    // Started - small sharp 4-pointed star
    if (topic.mastery > 0) {
      return {
        outerSize: 1.4 + hoverBoost,
        innerSize: 0.45,
        points: 4,
        opacity: 0.75,
        fill: currentConstellation.color,
        stroke: 'transparent',
        strokeWidth: 0,
        glow: true,
        glowColor: currentConstellation.glowColor,
        glowSize: 0.8,
        animate: true,
        pulseSpeed: 3,
        rays: 0,
        sparkles: 0,
        isLocked: false,
        gradientId: '',
      };
    }

    // Available but not started - hollow sharp star
    return {
      outerSize: 1.3 + hoverBoost,
      innerSize: 0.45,
      points: 4,
      opacity: 0.5,
      fill: 'transparent',
      stroke: currentConstellation.color,
      strokeWidth: 0.12,
      glow: true,
      glowColor: currentConstellation.glowColor,
      glowSize: 0.5,
      animate: true,
      pulseSpeed: 2.5,
      rays: 0,
      sparkles: 0,
      isLocked: false,
      gradientId: '',
    };
  };

  // Check if topic is a milestone (last in chain or major checkpoint)
  const isMilestone = (topic: TopicNode) => {
    const dependents = currentConstellation.topics.filter(t =>
      t.prerequisites.includes(topic.id)
    );
    return dependents.length === 0 || dependents.length >= 2;
  };

  // Get recently completed topics for comet trails
  const recentlyCompleted = currentConstellation.topics.filter(
    t => t.isUnlocked && t.mastery >= 70 && t.mastery < 90
  );

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
              <defs>
                {/* Glow filter - subtle */}
                <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="0.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {/* Glow for mastered stars - refined */}
                <filter id="masteredGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="0.8" result="blur" />
                  <feFlood floodColor="#FFD700" floodOpacity="0.35" />
                  <feComposite in2="blur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {/* Nebula gradients */}
                <radialGradient id="nebulaGradient1" cx="30%" cy="40%" r="50%">
                  <stop offset="0%" stopColor={currentConstellation.color} stopOpacity="0.12" />
                  <stop offset="100%" stopColor={currentConstellation.color} stopOpacity="0" />
                </radialGradient>
                <radialGradient id="nebulaGradient2" cx="70%" cy="60%" r="40%">
                  <stop offset="0%" stopColor={currentConstellation.color} stopOpacity="0.08" />
                  <stop offset="100%" stopColor={currentConstellation.color} stopOpacity="0" />
                </radialGradient>
                <radialGradient id="nebulaGradient3" cx="50%" cy="25%" r="35%">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
                </radialGradient>

                {/* Star gradients for depth - generated per topic */}
                {currentConstellation.topics.map((topic) => (
                  <React.Fragment key={`gradients-${topic.id}`}>
                    {/* Mastered star gradient - gold to amber */}
                    <radialGradient id={`masteredStarGradient-${topic.id}`} cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#FFF7CC" />
                      <stop offset="40%" stopColor="#FFD700" />
                      <stop offset="100%" stopColor="#B8860B" />
                    </radialGradient>
                    {/* Proficient star gradient */}
                    <radialGradient id={`proficientStarGradient-${topic.id}`} cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="white" stopOpacity="0.6" />
                      <stop offset="30%" stopColor={currentConstellation.color} />
                      <stop offset="100%" stopColor={currentConstellation.color} stopOpacity="0.7" />
                    </radialGradient>
                    {/* Learning star gradient */}
                    <radialGradient id={`learningStarGradient-${topic.id}`} cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor={currentConstellation.color} stopOpacity="0.9" />
                      <stop offset="100%" stopColor={currentConstellation.color} stopOpacity="0.5" />
                    </radialGradient>
                  </React.Fragment>
                ))}
              </defs>

              {/* Nebula cluster backgrounds */}
              <ellipse cx="30" cy="45" rx="25" ry="20" fill="url(#nebulaGradient1)" className="animate-nebula-drift" />
              <ellipse cx="70" cy="55" rx="20" ry="25" fill="url(#nebulaGradient2)" className="animate-nebula-drift-reverse" />
              <ellipse cx="50" cy="25" rx="22" ry="15" fill="url(#nebulaGradient3)" className="animate-nebula-pulse" />

              {/* Animated energy connection lines */}
              {currentConstellation.topics.map((topic) =>
                topic.prerequisites.map((prereqId) => {
                  const prereq = currentConstellation.topics.find((t) => t.id === prereqId);
                  if (!prereq) return null;
                  const isActive = topic.isUnlocked && prereq.isUnlocked;
                  const isBothMastered = prereq.mastery >= 70 && topic.mastery >= 70;
                  const lineId = `line-${prereqId}-${topic.id}`;

                  return (
                    <g key={lineId}>
                      {/* Base connection line */}
                      <line
                        x1={prereq.x}
                        y1={prereq.y}
                        x2={topic.x}
                        y2={topic.y}
                        stroke={isActive ? currentConstellation.color : '#333'}
                        strokeWidth={isBothMastered ? 0.5 : isActive ? 0.3 : 0.15}
                        strokeOpacity={isBothMastered ? 0.8 : isActive ? 0.5 : 0.2}
                        strokeDasharray={isActive ? 'none' : '0.5,0.5'}
                      />
                      {/* Animated energy particles on active connections */}
                      {isActive && (
                        <>
                          <circle r="0.4" fill={currentConstellation.color} opacity="0.8">
                            <animateMotion
                              dur={`${1.5 + Math.random()}s`}
                              repeatCount="indefinite"
                              path={`M${prereq.x},${prereq.y} L${topic.x},${topic.y}`}
                            />
                          </circle>
                          {isBothMastered && (
                            <circle r="0.3" fill="#FFD700" opacity="0.6">
                              <animateMotion
                                dur={`${2 + Math.random()}s`}
                                repeatCount="indefinite"
                                path={`M${prereq.x},${prereq.y} L${topic.x},${topic.y}`}
                                begin="0.5s"
                              />
                            </circle>
                          )}
                        </>
                      )}
                    </g>
                  );
                })
              )}

              {/* Comet trails for recently completed topics */}
              {recentlyCompleted.slice(0, 3).map((topic, index) => (
                <g key={`comet-${topic.id}`} className="animate-comet-fade">
                  <ellipse
                    cx={topic.x - 4}
                    cy={topic.y}
                    rx="3"
                    ry="0.5"
                    fill={currentConstellation.color}
                    opacity={0.4 - index * 0.1}
                    transform={`rotate(-30 ${topic.x} ${topic.y})`}
                  >
                    <animate attributeName="rx" values="3;2;3" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0.2;0.4" dur="2s" repeatCount="indefinite" />
                  </ellipse>
                  <ellipse
                    cx={topic.x - 6}
                    cy={topic.y}
                    rx="2"
                    ry="0.3"
                    fill={currentConstellation.color}
                    opacity={0.2 - index * 0.05}
                    transform={`rotate(-30 ${topic.x} ${topic.y})`}
                  />
                </g>
              ))}

              {/* Topic stars */}
              {currentConstellation.topics.map((topic, topicIndex) => {
                const style = getStarStyle(topic);
                const showMilestone = isMilestone(topic) && topic.mastery >= 90;
                // Assign different subtle bobbing animations based on topic index
                const bobClass = topic.isUnlocked ? `animate-subtle-bob-${(topicIndex % 4) + 1}` : '';

                return (
                  <g
                    key={topic.id}
                    className={`cursor-pointer ${bobClass}`}
                    style={{ transformOrigin: `${topic.x}px ${topic.y}px` }}
                    onClick={() => topic.isUnlocked && setSelectedTopic(topic)}
                    onMouseEnter={() => setHoveredTopic(topic.id)}
                    onMouseLeave={() => setHoveredTopic(null)}
                  >
                    {/* Outer glow effect */}
                    {style.glow && (
                      <circle
                        cx={topic.x}
                        cy={topic.y}
                        r={style.outerSize + style.glowSize}
                        fill={style.glowColor}
                        opacity={0.3}
                        className={style.animate ? `animate-glow-pulse-${style.pulseSpeed}` : ''}
                      />
                    )}

                    {/* Orbiting satellite for mastered stars */}
                    {style.rays > 0 && (
                      <g>
                        {/* Orbit path (faint) */}
                        <circle
                          cx={topic.x}
                          cy={topic.y}
                          r={style.outerSize + 1.8}
                          fill="none"
                          stroke="#FFD700"
                          strokeWidth="0.08"
                          strokeOpacity="0.2"
                          strokeDasharray="0.3,0.6"
                        />
                        {/* Satellite */}
                        <circle
                          r="0.35"
                          fill="#FFD700"
                        >
                          <animateMotion
                            dur="12s"
                            repeatCount="indefinite"
                            path={`M${topic.x + style.outerSize + 1.8},${topic.y} A${style.outerSize + 1.8},${style.outerSize + 1.8} 0 1,1 ${topic.x + style.outerSize + 1.79},${topic.y} A${style.outerSize + 1.8},${style.outerSize + 1.8} 0 1,1 ${topic.x + style.outerSize + 1.8},${topic.y}`}
                          />
                        </circle>
                        {/* Satellite trail */}
                        <circle
                          r="0.2"
                          fill="#FFD700"
                          opacity="0.4"
                        >
                          <animateMotion
                            dur="12s"
                            repeatCount="indefinite"
                            begin="-0.3s"
                            path={`M${topic.x + style.outerSize + 1.8},${topic.y} A${style.outerSize + 1.8},${style.outerSize + 1.8} 0 1,1 ${topic.x + style.outerSize + 1.79},${topic.y} A${style.outerSize + 1.8},${style.outerSize + 1.8} 0 1,1 ${topic.x + style.outerSize + 1.8},${topic.y}`}
                          />
                        </circle>
                      </g>
                    )}

                    {/* Planet ring for milestones */}
                    {showMilestone && (
                      <ellipse
                        cx={topic.x}
                        cy={topic.y}
                        rx={style.outerSize + 1.2}
                        ry={style.outerSize * 0.35}
                        fill="none"
                        stroke="#FFD700"
                        strokeWidth="0.15"
                        strokeOpacity="0.4"
                        transform={`rotate(-20 ${topic.x} ${topic.y})`}
                      >
                        <animate attributeName="stroke-opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite" />
                      </ellipse>
                    )}

                    {/* The star shape */}
                    <path
                      d={style.isLocked
                        ? generateDiamondPath(topic.x, topic.y, style.outerSize)
                        : generateStarPath(topic.x, topic.y, style.outerSize, style.innerSize, style.points)
                      }
                      fill={style.fill}
                      stroke={style.stroke}
                      strokeWidth={style.strokeWidth}
                      opacity={style.opacity}
                      filter={style.glow ? (topic.mastery >= 90 ? 'url(#masteredGlow)' : 'url(#starGlow)') : 'none'}
                      className={`transition-all duration-200 ${style.animate ? `animate-star-pulse-${style.pulseSpeed}` : ''}`}
                    />

                    {/* Inner sparkle for high mastery */}
                    {topic.mastery >= 70 && topic.isUnlocked && (
                      <circle
                        cx={topic.x}
                        cy={topic.y}
                        r={style.innerSize * 0.25}
                        fill="white"
                        opacity={topic.mastery >= 90 ? 0.95 : 0.7}
                      >
                        {topic.mastery >= 90 && (
                          <animate attributeName="opacity" values="0.95;0.5;0.95" dur="1.5s" repeatCount="indefinite" />
                        )}
                      </circle>
                    )}

                    {/* Sparkle particles around completed stars */}
                    {style.sparkles > 0 && topic.isUnlocked && (
                      <g>
                        {[...Array(style.sparkles)].map((_, i) => {
                          const angle = (i * 360) / style.sparkles + 45;
                          const distance = style.outerSize + 0.8 + (i % 2) * 0.4;
                          const sparkleX = topic.x + Math.cos((angle * Math.PI) / 180) * distance;
                          const sparkleY = topic.y + Math.sin((angle * Math.PI) / 180) * distance;
                          const sparkleSize = 0.15 + (i % 2) * 0.08;
                          return (
                            <circle
                              key={`sparkle-${topic.id}-${i}`}
                              cx={sparkleX}
                              cy={sparkleY}
                              r={sparkleSize}
                              fill={topic.mastery >= 90 ? '#FFF7CC' : 'white'}
                              opacity={0.8}
                              className="animate-sparkle"
                              style={{ animationDelay: `${i * 0.3}s` }}
                            />
                          );
                        })}
                      </g>
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
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <defs>
                        <radialGradient id="legendMasteredGrad" cx="30%" cy="30%" r="70%">
                          <stop offset="0%" stopColor="#FFF7CC" />
                          <stop offset="40%" stopColor="#FFD700" />
                          <stop offset="100%" stopColor="#B8860B" />
                        </radialGradient>
                      </defs>
                      <path d={generateStarPath(8, 8, 5, 1.7, 8)} fill="url(#legendMasteredGrad)" />
                    </svg>
                    <span className="text-xs text-neutral-400">Mastered (90%+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <path d={generateStarPath(8, 8, 4.5, 1.5, 6)} fill={currentConstellation.color} />
                    </svg>
                    <span className="text-xs text-neutral-400">Proficient (70%+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <path d={generateStarPath(8, 8, 4, 1.4, 5)} fill={currentConstellation.color} opacity="0.85" />
                    </svg>
                    <span className="text-xs text-neutral-400">Learning (40%+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <path d={generateStarPath(8, 8, 3.5, 1.2, 4)} fill={currentConstellation.color} opacity="0.6" />
                    </svg>
                    <span className="text-xs text-neutral-400">Started</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <path d={generateDiamondPath(8, 8, 2.5)} fill="#2a2a2a" stroke="#3a3a3a" strokeWidth="0.5" opacity="0.4" />
                    </svg>
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

        /* Nebula animations */
        @keyframes nebula-drift {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
          50% { transform: translate(2px, -1px) scale(1.05); opacity: 1; }
        }
        @keyframes nebula-drift-reverse {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
          50% { transform: translate(-2px, 1px) scale(1.03); opacity: 1; }
        }
        @keyframes nebula-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .animate-nebula-drift { animation: nebula-drift 8s ease-in-out infinite; }
        .animate-nebula-drift-reverse { animation: nebula-drift-reverse 10s ease-in-out infinite; }
        .animate-nebula-pulse { animation: nebula-pulse 6s ease-in-out infinite; }

        /* Star glow pulse animations */
        @keyframes glow-pulse-2 {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes glow-pulse-2-5 {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.08); }
        }
        @keyframes glow-pulse-3 {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.05); }
        }
        .animate-glow-pulse-2 { animation: glow-pulse-2 2s ease-in-out infinite; }
        .animate-glow-pulse-2\\.5 { animation: glow-pulse-2-5 2.5s ease-in-out infinite; }
        .animate-glow-pulse-3 { animation: glow-pulse-3 3s ease-in-out infinite; }

        /* Star shape pulse animations */
        @keyframes star-pulse-2 {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes star-pulse-2-5 {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.7; }
        }
        @keyframes star-pulse-3 {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.03); opacity: 0.85; }
        }
        .animate-star-pulse-2 { animation: star-pulse-2 2s ease-in-out infinite; }
        .animate-star-pulse-2\\.5 { animation: star-pulse-2-5 2.5s ease-in-out infinite; }
        .animate-star-pulse-3 { animation: star-pulse-3 3s ease-in-out infinite; }

        /* Slow spin for mastered star rays */
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; transform-origin: center; }

        /* Comet trail fade */
        @keyframes comet-fade {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-comet-fade { animation: comet-fade 3s ease-in-out infinite; }

        /* Sparkle particles */
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-sparkle { animation: sparkle 1.5s ease-in-out infinite; }

        /* Subtle random bobbing animations - 4 variants for variety */
        @keyframes subtle-bob-1 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(0.15px, -0.2px); }
          50% { transform: translate(-0.1px, 0.15px); }
          75% { transform: translate(0.1px, 0.1px); }
        }
        @keyframes subtle-bob-2 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(-0.12px, 0.18px); }
          66% { transform: translate(0.18px, -0.1px); }
        }
        @keyframes subtle-bob-3 {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(0.1px, 0.15px); }
          40% { transform: translate(-0.15px, -0.08px); }
          60% { transform: translate(0.08px, -0.12px); }
          80% { transform: translate(-0.1px, 0.1px); }
        }
        @keyframes subtle-bob-4 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-0.1px, -0.15px); }
        }
        .animate-subtle-bob-1 { animation: subtle-bob-1 8s ease-in-out infinite; }
        .animate-subtle-bob-2 { animation: subtle-bob-2 10s ease-in-out infinite; }
        .animate-subtle-bob-3 { animation: subtle-bob-3 12s ease-in-out infinite; }
        .animate-subtle-bob-4 { animation: subtle-bob-4 9s ease-in-out infinite; }
      `}</style>
    </Card>
  );
};
