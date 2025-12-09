import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input, Textarea, Select } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { ProgressBar } from '../ui/ProgressBar';
import {
  Sparkles,
  Star,
  BookOpen,
  Zap,
  Target,
  CheckCircle,
  Save,
  User,
  TrendingUp,
} from 'lucide-react';
import {
  StudentProfile,
  Subject,
  YearGroup,
  TopicMastery,
} from '../../types';

// Import curriculum data
const curriculumTopics: Record<string, Record<Subject, { id: string; name: string; description: string }[]>> = {
  'year5-6': {
    mathematics: [
      { id: 'm1', name: 'Place Value', description: 'Read, write, order numbers to 10 million' },
      { id: 'm2', name: 'Four Operations', description: 'Mental & written methods; multi-step problems' },
      { id: 'm3', name: 'Factors & Multiples', description: 'Identify factors, multiples, primes' },
      { id: 'm4', name: 'Fractions', description: 'Equivalent fractions; add, subtract, multiply, divide' },
      { id: 'm5', name: 'Decimals', description: 'Decimal place value; multiply/divide by 10, 100, 1000' },
      { id: 'm6', name: 'Percentages', description: 'Percentage of amounts; equivalence' },
      { id: 'm7', name: 'Ratio', description: 'Relative sizes; scale factors' },
      { id: 'm8', name: 'Algebra', description: 'Simple formulae; linear sequences' },
      { id: 'm9', name: 'Measurement', description: 'Convert units; perimeter, area, volume' },
      { id: 'm10', name: 'Properties of Shapes', description: 'Angles; 2D & 3D shapes' },
      { id: 'm11', name: 'Position & Direction', description: 'Coordinates; reflection; translation' },
      { id: 'm12', name: 'Statistics', description: 'Tables, line graphs, pie charts' },
    ],
    physics: [
      { id: 'p1', name: 'Forces & Motion', description: 'Gravity, air resistance, friction' },
      { id: 'p2', name: 'Earth & Space', description: 'Solar system; Earth rotation' },
      { id: 'p3', name: 'Light', description: 'Light travels in straight lines' },
      { id: 'p4', name: 'Sound', description: 'Vibrations; how sounds travel' },
      { id: 'p5', name: 'Electricity', description: 'Series circuits; circuit symbols' },
      { id: 'p6', name: 'Magnets', description: 'Magnetic poles; attraction/repulsion' },
      { id: 'p7', name: 'States of Matter', description: 'Solids, liquids, gases' },
      { id: 'p8', name: 'Properties of Materials', description: 'Comparing materials; dissolving' },
      { id: 'p9', name: 'Living Things', description: 'Life cycles; reproduction' },
    ],
    economics: [
      { id: 'e1', name: 'Needs vs Wants', description: 'Distinguishing essential needs from desires' },
      { id: 'e2', name: 'Money & Value', description: 'Understanding coins, notes, and value' },
      { id: 'e3', name: 'Earning Money', description: 'Jobs, wages, and income' },
      { id: 'e4', name: 'Saving & Goals', description: 'Why save; setting financial goals' },
      { id: 'e5', name: 'Spending Choices', description: 'Value for money; comparing prices' },
      { id: 'e6', name: 'Budgeting Basics', description: 'Planning income and expenses' },
      { id: 'e7', name: 'Banks & Accounts', description: 'What banks do; types of accounts' },
      { id: 'e8', name: 'Borrowing & Debt', description: 'What is borrowing; interest on loans' },
      { id: 'e9', name: 'Enterprise', description: 'Starting a business; profit and loss' },
      { id: 'e10', name: 'Giving & Charity', description: 'Philanthropy; helping others' },
    ],
  },
  gcse: {
    mathematics: [
      { id: 'm1', name: 'Structure of Number', description: 'Integers, decimals, place value' },
      { id: 'm2', name: 'Fractions & Percentages', description: 'Operations with fractions' },
      { id: 'm3', name: 'Indices & Roots', description: 'Laws of indices; surds' },
      { id: 'm4', name: 'Algebraic Expressions', description: 'Simplifying; expanding brackets' },
      { id: 'm5', name: 'Linear Equations', description: 'Solving equations; rearranging' },
      { id: 'm6', name: 'Linear Graphs', description: 'Plotting; gradient; y = mx + c' },
      { id: 'm7', name: 'Quadratics', description: 'Factorising; quadratic formula' },
      { id: 'm8', name: 'Simultaneous Equations', description: 'Linear & quadratic solutions' },
      { id: 'm9', name: 'Inequalities', description: 'Solving; representing on graphs' },
      { id: 'm10', name: 'Sequences', description: 'nth term; arithmetic & geometric' },
      { id: 'm11', name: 'Ratio & Proportion', description: 'Sharing in ratio; compound measures' },
      { id: 'm12', name: 'Angles & Polygons', description: 'Angle rules; bearings' },
      { id: 'm13', name: 'Congruence & Similarity', description: 'Congruent shapes; similar triangles' },
      { id: 'm14', name: 'Trigonometry', description: 'SOHCAHTOA; sine/cosine rules' },
      { id: 'm15', name: 'Circle Theorems', description: 'Arc, sector, segment' },
      { id: 'm16', name: 'Transformations', description: 'Rotation, reflection, translation' },
      { id: 'm17', name: 'Area & Volume', description: 'Compound shapes; prisms, pyramids' },
      { id: 'm18', name: 'Probability', description: 'Tree diagrams; conditional probability' },
      { id: 'm19', name: 'Statistics', description: 'Averages; cumulative frequency' },
    ],
    physics: [
      { id: 'p1', name: 'Energy Stores', description: 'Kinetic, gravitational, elastic energy' },
      { id: 'p2', name: 'Energy Transfers', description: 'Work done; power; efficiency' },
      { id: 'p3', name: 'Energy Resources', description: 'Renewable vs non-renewable' },
      { id: 'p4', name: 'Electric Circuits', description: 'Current, voltage, resistance; V=IR' },
      { id: 'p5', name: 'Domestic Electricity', description: 'AC/DC; mains electricity; safety' },
      { id: 'p6', name: 'Particle Model', description: 'Density; states of matter' },
      { id: 'p7', name: 'Atomic Structure', description: 'Atoms & isotopes; radioactive decay' },
      { id: 'p8', name: 'Forces in Balance', description: 'Scalars & vectors; equilibrium' },
      { id: 'p9', name: 'Motion', description: 'Distance-time; velocity-time graphs' },
      { id: 'p10', name: "Newton's Laws", description: 'Inertia; F=ma; action-reaction' },
      { id: 'p11', name: 'Forces & Pressure', description: 'Moments; levers; pressure in fluids' },
      { id: 'p12', name: 'Wave Properties', description: 'Transverse & longitudinal waves' },
      { id: 'p13', name: 'EM Spectrum', description: 'Radio to gamma; uses and hazards' },
      { id: 'p14', name: 'Magnetism', description: 'Magnetic fields; electromagnets' },
      { id: 'p15', name: 'Electromagnetism', description: 'Motor effect; generators' },
      { id: 'p16', name: 'Space Physics', description: 'Solar system; life cycle of stars' },
      { id: 'p17', name: 'Nuclear Radiation', description: 'Uses of radiation; fission & fusion' },
    ],
    economics: [
      { id: 'e1', name: 'Economic Problem', description: 'Scarcity, choice, opportunity cost' },
      { id: 'e2', name: 'Demand', description: 'Law of demand; demand curves' },
      { id: 'e3', name: 'Supply', description: 'Law of supply; supply curves' },
      { id: 'e4', name: 'Price Determination', description: 'Market equilibrium; price mechanism' },
      { id: 'e5', name: 'Price Elasticity', description: 'PED calculation; elastic vs inelastic' },
      { id: 'e6', name: 'Market Failure', description: 'Externalities; public goods' },
      { id: 'e7', name: 'Government Intervention', description: 'Indirect taxes; subsidies' },
      { id: 'e8', name: 'Market Structures', description: 'Competition; monopoly; oligopoly' },
      { id: 'e9', name: 'Labour Market', description: 'Wage determination; minimum wage' },
      { id: 'e10', name: 'Economic Objectives', description: 'Growth, inflation, unemployment' },
      { id: 'e11', name: 'Fiscal Policy', description: 'Government spending; taxation' },
      { id: 'e12', name: 'Monetary Policy', description: 'Interest rates; money supply' },
      { id: 'e13', name: 'International Trade', description: 'Exports & imports; exchange rates' },
      { id: 'e14', name: 'Economic Growth', description: 'GDP; living standards' },
    ],
  },
  alevel: {
    mathematics: [
      { id: 'm1', name: 'Proof', description: 'Proof by deduction, exhaustion, contradiction' },
      { id: 'm2', name: 'Algebra & Functions', description: 'Indices; surds; quadratics' },
      { id: 'm3', name: 'Coordinate Geometry', description: 'Straight lines; circles' },
      { id: 'm4', name: 'Sequences & Series', description: 'Arithmetic & geometric; sigma notation' },
      { id: 'm5', name: 'Trigonometry', description: 'Identities; equations; radians' },
      { id: 'm6', name: 'Exponentials & Logs', description: 'Laws of logarithms; natural log' },
      { id: 'm7', name: 'Functions', description: 'Domain, range, inverse; modulus' },
      { id: 'm8', name: 'Differentiation', description: 'First principles; chain, product, quotient' },
      { id: 'm9', name: 'Integration', description: 'Definite & indefinite; by substitution' },
      { id: 'm10', name: 'Numerical Methods', description: 'Iteration; Newton-Raphson' },
      { id: 'm11', name: 'Vectors', description: '2D & 3D vectors; scalar product' },
      { id: 'm12', name: 'Differential Equations', description: 'Forming & solving; separation of variables' },
      { id: 'm13', name: 'Statistical Sampling', description: 'Types of sampling; large data set' },
      { id: 'm14', name: 'Probability', description: 'Conditional probability; Venn diagrams' },
      { id: 'm15', name: 'Statistical Distributions', description: 'Binomial; Normal distribution' },
      { id: 'm16', name: 'Hypothesis Testing', description: 'One & two tailed tests; correlation' },
      { id: 'm17', name: 'Kinematics', description: 'SUVAT; velocity-time graphs' },
      { id: 'm18', name: "Forces & Newton's Laws", description: 'Equilibrium; F=ma; connected particles' },
      { id: 'm19', name: 'Moments', description: 'Moments; equilibrium of rigid bodies' },
      { id: 'm20', name: 'Projectiles', description: 'Motion under gravity in 2D' },
      { id: 'm21', name: 'Application of Forces', description: 'Friction; inclined planes; pulleys' },
    ],
    physics: [
      { id: 'p1', name: 'Measurements & Errors', description: 'SI units; uncertainty' },
      { id: 'p2', name: 'Particles & Antiparticles', description: 'Quarks, leptons; particle interactions' },
      { id: 'p3', name: 'EM Radiation', description: 'Photoelectric effect; photon energy' },
      { id: 'p4', name: 'Waves', description: 'Progressive waves; superposition' },
      { id: 'p5', name: 'Optics', description: 'Refraction; total internal reflection' },
      { id: 'p6', name: 'Materials', description: "Bulk properties; Young's modulus" },
      { id: 'p7', name: 'Mechanics', description: "Vectors; moments; projectiles; Newton's laws" },
      { id: 'p8', name: 'Energy & Power', description: 'Work, energy, power; conservation' },
      { id: 'p9', name: 'Electricity Fundamentals', description: "Charge; current; Ohm's law" },
      { id: 'p10', name: 'DC Circuits', description: "Kirchhoff's laws; potential dividers" },
      { id: 'p11', name: 'Circular Motion', description: 'Angular velocity; centripetal force' },
      { id: 'p12', name: 'Simple Harmonic Motion', description: 'Oscillations; resonance; damping' },
      { id: 'p13', name: 'Thermal Physics', description: 'Thermal energy; ideal gases' },
      { id: 'p14', name: 'Gravitational Fields', description: "Newton's law of gravitation; orbits" },
      { id: 'p15', name: 'Electric Fields', description: "Coulomb's law; field strength" },
      { id: 'p16', name: 'Capacitance', description: 'Capacitors; charging/discharging' },
      { id: 'p17', name: 'Magnetic Fields', description: 'Magnetic flux; motor effect' },
      { id: 'p18', name: 'Nuclear Physics', description: 'Radioactivity; binding energy' },
      { id: 'p19', name: 'Astrophysics', description: 'Telescopes; stellar classification' },
      { id: 'p20', name: 'Medical Physics', description: 'X-rays; CAT scans; ultrasound' },
    ],
    economics: [
      { id: 'e1', name: 'Nature of Economics', description: 'Scarcity, opportunity cost, PPF' },
      { id: 'e2', name: 'Demand & Supply', description: 'Market equilibrium; consumer & producer surplus' },
      { id: 'e3', name: 'Elasticity', description: 'PED, YED, XED, PES' },
      { id: 'e4', name: 'Market Failure', description: 'Externalities; public goods; information gaps' },
      { id: 'e5', name: 'Government Intervention', description: 'Taxes, subsidies, regulation' },
      { id: 'e6', name: 'Economic Growth', description: 'GDP; real vs nominal; PPP' },
      { id: 'e7', name: 'Inflation & Deflation', description: 'CPI, RPI; causes; costs' },
      { id: 'e8', name: 'Employment & Unemployment', description: 'Types of unemployment; natural rate' },
      { id: 'e9', name: 'Balance of Payments', description: 'Current account; capital flows' },
      { id: 'e10', name: 'Fiscal Policy', description: 'Government budget; national debt' },
      { id: 'e11', name: 'Monetary Policy', description: 'Interest rates; quantitative easing' },
      { id: 'e12', name: 'Supply-Side Policies', description: 'Labour market flexibility' },
      { id: 'e13', name: 'Business Objectives', description: 'Profit max; revenue max; satisficing' },
      { id: 'e14', name: 'Costs & Revenue', description: 'Fixed, variable, marginal' },
      { id: 'e15', name: 'Market Structures', description: 'Perfect competition; monopoly' },
      { id: 'e16', name: 'Labour Market', description: 'MRP theory; wage differentials' },
      { id: 'e17', name: 'International Trade', description: 'Comparative advantage; protectionism' },
      { id: 'e18', name: 'Exchange Rates', description: 'Floating, fixed, managed' },
      { id: 'e19', name: 'Globalisation', description: 'TNCs; FDI; global inequality' },
      { id: 'e20', name: 'Development Economics', description: 'HDI; barriers to development' },
    ],
  },
};

const yearGroupToLevel = (yg: YearGroup): string => {
  if (yg === 'year5' || yg === 'year6') return 'year5-6';
  if (yg === 'gcse') return 'gcse';
  return 'alevel';
};

const subjectColors: Record<Subject, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  mathematics: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: <BookOpen className="w-4 h-4" /> },
  physics: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', icon: <Zap className="w-4 h-4" /> },
  economics: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: <Target className="w-4 h-4" /> },
};

interface TopicMasteryManagementProps {
  students: StudentProfile[];
  tutorId: string;
  onUpdateStudent: (student: StudentProfile) => void;
}

export const TopicMasteryManagement: React.FC<TopicMasteryManagementProps> = ({
  students,
  tutorId,
  onUpdateStudent,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject>('mathematics');
  const [showEditModal, setShowEditModal] = useState(false);
  const [masteryValues, setMasteryValues] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Get topics for selected student's year group
  const getTopicsForStudent = (student: StudentProfile, subject: Subject) => {
    const level = yearGroupToLevel(student.yearGroup);
    return curriculumTopics[level]?.[subject] || [];
  };

  // Initialize mastery values when selecting a student
  const handleSelectStudent = (student: StudentProfile) => {
    setSelectedStudent(student);
    const existingMastery = student.stats.topicMastery || [];
    const values: Record<string, number> = {};
    const noteValues: Record<string, string> = {};

    existingMastery.forEach(tm => {
      values[`${tm.subject}-${tm.topicId}`] = tm.mastery;
      if (tm.notes) noteValues[`${tm.subject}-${tm.topicId}`] = tm.notes;
    });

    setMasteryValues(values);
    setNotes(noteValues);
    setShowEditModal(true);
  };

  // Handle mastery slider change
  const handleMasteryChange = (topicId: string, value: number) => {
    setMasteryValues(prev => ({
      ...prev,
      [`${selectedSubject}-${topicId}`]: value,
    }));
  };

  // Handle notes change
  const handleNotesChange = (topicId: string, value: string) => {
    setNotes(prev => ({
      ...prev,
      [`${selectedSubject}-${topicId}`]: value,
    }));
  };

  // Save mastery updates
  const handleSave = () => {
    if (!selectedStudent) return;

    setIsSaving(true);

    const now = new Date().toISOString();
    const existingMastery = selectedStudent.stats.topicMastery || [];
    const updatedMastery: TopicMastery[] = [...existingMastery];

    // Update or add mastery records
    Object.entries(masteryValues).forEach(([key, mastery]) => {
      const [subject, topicId] = key.split('-') as [Subject, string];
      const existingIndex = updatedMastery.findIndex(
        tm => tm.subject === subject && tm.topicId === topicId
      );

      const record: TopicMastery = {
        topicId,
        subject,
        mastery,
        lastUpdated: now,
        updatedBy: tutorId,
        notes: notes[key] || undefined,
      };

      if (existingIndex >= 0) {
        updatedMastery[existingIndex] = record;
      } else if (mastery > 0) {
        updatedMastery.push(record);
      }
    });

    const updatedStudent: StudentProfile = {
      ...selectedStudent,
      stats: {
        ...selectedStudent.stats,
        topicMastery: updatedMastery,
      },
    };

    onUpdateStudent(updatedStudent);
    setSelectedStudent(updatedStudent);
    setIsSaving(false);
    setSaveSuccess(true);

    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Get mastery level badge
  const getMasteryBadge = (mastery: number) => {
    if (mastery >= 90) return <Badge variant="success" size="sm">Mastered</Badge>;
    if (mastery >= 70) return <Badge variant="info" size="sm">Proficient</Badge>;
    if (mastery >= 50) return <Badge variant="warning" size="sm">Developing</Badge>;
    if (mastery > 0) return <Badge variant="default" size="sm">Beginner</Badge>;
    return <Badge variant="default" size="sm">Not Started</Badge>;
  };

  // Calculate overall subject mastery
  const getSubjectMastery = (student: StudentProfile, subject: Subject): number => {
    const topics = getTopicsForStudent(student, subject);
    if (topics.length === 0) return 0;

    const subjectMastery = student.stats.topicMastery?.filter(tm => tm.subject === subject) || [];
    const totalMastery = subjectMastery.reduce((sum, tm) => sum + tm.mastery, 0);
    return Math.round(totalMastery / topics.length);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Topic Mastery Management
        </CardTitle>
        <CardDescription>
          Update individual topic mastery for each student's Constellation Skill Tree
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {students.map(student => {
            const enrolledSubjects = student.subjects;

            return (
              <div
                key={student.id}
                className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-700 hover:border-neutral-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={student.name} size="md" />
                    <div>
                      <h4 className="font-medium text-neutral-100">{student.name}</h4>
                      <p className="text-sm text-neutral-400">
                        {student.yearGroup === 'year5' ? 'Year 5' :
                         student.yearGroup === 'year6' ? 'Year 6' :
                         student.yearGroup.toUpperCase()} • Level {student.level}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSelectStudent(student)}
                    icon={<TrendingUp className="w-4 h-4" />}
                  >
                    Update Mastery
                  </Button>
                </div>

                {/* Subject mastery overview */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {enrolledSubjects.map(subject => {
                    const colors = subjectColors[subject];
                    const mastery = getSubjectMastery(student, subject);

                    return (
                      <div
                        key={subject}
                        className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          {colors.icon}
                          <span className={`text-xs font-medium ${colors.text} capitalize`}>
                            {subject}
                          </span>
                        </div>
                        <ProgressBar value={mastery} size="sm" />
                        <p className="text-xs text-neutral-400 mt-1">{mastery}% mastery</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {students.length === 0 && (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-500">No students to manage</p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Edit Mastery Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSaveSuccess(false);
        }}
        title={`Update Topic Mastery - ${selectedStudent?.name}`}
        size="lg"
      >
        {selectedStudent && (
          <div className="space-y-4">
            {/* Subject tabs */}
            <div className="flex gap-2 border-b border-neutral-700 pb-2">
              {selectedStudent.subjects.map(subject => {
                const colors = subjectColors[subject];
                const isSelected = selectedSubject === subject;

                return (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      isSelected
                        ? `${colors.bg} ${colors.border} border ${colors.text}`
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {colors.icon}
                    <span className="capitalize">{subject}</span>
                  </button>
                );
              })}
            </div>

            {/* Topic list */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {getTopicsForStudent(selectedStudent, selectedSubject).map(topic => {
                const key = `${selectedSubject}-${topic.id}`;
                const currentMastery = masteryValues[key] ?? 0;

                return (
                  <div
                    key={topic.id}
                    className="p-3 bg-neutral-800/50 rounded-lg border border-neutral-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-medium text-neutral-100">{topic.name}</h5>
                        <p className="text-xs text-neutral-500">{topic.description}</p>
                      </div>
                      {getMasteryBadge(currentMastery)}
                    </div>

                    {/* Mastery slider */}
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={currentMastery}
                        onChange={(e) => handleMasteryChange(topic.id, parseInt(e.target.value))}
                        className="flex-1 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                      <span className="text-sm font-medium text-neutral-300 w-12 text-right">
                        {currentMastery}%
                      </span>
                    </div>

                    {/* Optional notes */}
                    <input
                      type="text"
                      placeholder="Add notes (optional)..."
                      value={notes[key] || ''}
                      onChange={(e) => handleNotesChange(topic.id, e.target.value)}
                      className="mt-2 w-full px-3 py-1.5 text-sm bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
                    />
                  </div>
                );
              })}
            </div>

            {/* Save button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-700">
              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-400 mr-auto">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Saved successfully!</span>
                </div>
              )}
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                isLoading={isSaving}
                icon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
};
