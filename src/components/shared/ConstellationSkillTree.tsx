import React, { useState, useMemo } from 'react';
import { Subject, YearGroup, TopicMastery } from '../../types';
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

// ============ UK NATIONAL CURRICULUM DATA ============
const curriculumTopics: Record<string, Record<Subject, TopicTemplate[]>> = {
  // Year 5-6 Topics (Key Stage 2 National Curriculum)
  'year5-6': {
    mathematics: [
      // Number - Place Value & Operations
      { id: 'm1', name: 'Place Value', description: 'Read, write, order numbers to 10 million; round; negative numbers', prerequisites: [], x: 50, y: 92 },
      { id: 'm2', name: 'Four Operations', description: 'Mental & written methods; multi-step problems; order of operations', prerequisites: ['m1'], x: 30, y: 78 },
      { id: 'm3', name: 'Factors & Multiples', description: 'Identify factors, multiples, primes; squares & cubes', prerequisites: ['m1'], x: 70, y: 78 },
      // Fractions, Decimals, Percentages
      { id: 'm4', name: 'Fractions', description: 'Equivalent fractions; add, subtract, multiply, divide fractions', prerequisites: ['m2'], x: 20, y: 62 },
      { id: 'm5', name: 'Decimals', description: 'Decimal place value; multiply/divide by 10, 100, 1000', prerequisites: ['m2', 'm3'], x: 50, y: 62 },
      { id: 'm6', name: 'Percentages', description: 'Percentage of amounts; equivalence with fractions & decimals', prerequisites: ['m4', 'm5'], x: 80, y: 62 },
      // Ratio & Proportion
      { id: 'm7', name: 'Ratio', description: 'Relative sizes; scale factors; unequal sharing', prerequisites: ['m5', 'm6'], x: 35, y: 46 },
      // Algebra
      { id: 'm8', name: 'Algebra', description: 'Simple formulae; linear sequences; unknowns', prerequisites: ['m3'], x: 65, y: 46 },
      // Measurement
      { id: 'm9', name: 'Measurement', description: 'Convert units; perimeter, area, volume; time problems', prerequisites: ['m5'], x: 20, y: 30 },
      // Geometry
      { id: 'm10', name: 'Properties of Shapes', description: 'Angles; 2D & 3D shapes; circles; nets', prerequisites: ['m9'], x: 50, y: 30 },
      { id: 'm11', name: 'Position & Direction', description: 'Coordinates; reflection; translation', prerequisites: ['m10'], x: 80, y: 30 },
      // Statistics
      { id: 'm12', name: 'Statistics', description: 'Tables, line graphs, pie charts; calculate mean', prerequisites: ['m6', 'm7'], x: 50, y: 12 },
    ],
    physics: [
      // KS2 Science - Physics topics (called "Science" at this level)
      { id: 'p1', name: 'Forces & Motion', description: 'Gravity, air resistance, friction; mechanisms (levers, pulleys, gears)', prerequisites: [], x: 50, y: 92 },
      { id: 'p2', name: 'Earth & Space', description: 'Solar system; Earth rotation (day/night); Moon phases', prerequisites: ['p1'], x: 25, y: 75 },
      { id: 'p3', name: 'Light', description: 'Light travels in straight lines; shadows; reflection; how we see', prerequisites: ['p1'], x: 75, y: 75 },
      { id: 'p4', name: 'Sound', description: 'Vibrations; how sounds travel; pitch and volume', prerequisites: ['p1'], x: 50, y: 58 },
      { id: 'p5', name: 'Electricity', description: 'Series circuits; circuit symbols; voltage variation effects', prerequisites: ['p4'], x: 25, y: 42 },
      { id: 'p6', name: 'Magnets', description: 'Magnetic poles; attraction/repulsion; magnetic fields', prerequisites: ['p5'], x: 75, y: 42 },
      { id: 'p7', name: 'States of Matter', description: 'Solids, liquids, gases; changes of state; water cycle', prerequisites: ['p2'], x: 35, y: 25 },
      { id: 'p8', name: 'Properties of Materials', description: 'Comparing materials; dissolving; separating mixtures; reversible changes', prerequisites: ['p7'], x: 65, y: 25 },
      { id: 'p9', name: 'Living Things', description: 'Life cycles; reproduction; classification of organisms', prerequisites: ['p8'], x: 50, y: 10 },
    ],
    economics: [
      // Financial Literacy / PSHE Money Topics (no formal economics at KS2)
      { id: 'e1', name: 'Needs vs Wants', description: 'Distinguishing essential needs from desires', prerequisites: [], x: 50, y: 92 },
      { id: 'e2', name: 'Money & Value', description: 'Understanding coins, notes, and value of money', prerequisites: ['e1'], x: 30, y: 75 },
      { id: 'e3', name: 'Earning Money', description: 'Jobs, wages, and different ways people earn income', prerequisites: ['e1'], x: 70, y: 75 },
      { id: 'e4', name: 'Saving & Goals', description: 'Why save; setting financial goals; interest basics', prerequisites: ['e2'], x: 20, y: 55 },
      { id: 'e5', name: 'Spending Choices', description: 'Value for money; comparing prices; making decisions', prerequisites: ['e2', 'e3'], x: 50, y: 55 },
      { id: 'e6', name: 'Budgeting Basics', description: 'Planning income and expenses; keeping track of money', prerequisites: ['e4', 'e5'], x: 80, y: 55 },
      { id: 'e7', name: 'Banks & Accounts', description: 'What banks do; types of accounts; keeping money safe', prerequisites: ['e4'], x: 30, y: 35 },
      { id: 'e8', name: 'Borrowing & Debt', description: 'What is borrowing; interest on loans; responsible borrowing', prerequisites: ['e6', 'e7'], x: 70, y: 35 },
      { id: 'e9', name: 'Enterprise', description: 'Starting a business; profit and loss; being an entrepreneur', prerequisites: ['e5', 'e6'], x: 50, y: 18 },
      { id: 'e10', name: 'Giving & Charity', description: 'Philanthropy; helping others; community responsibility', prerequisites: ['e9'], x: 50, y: 6 },
    ],
  },
  // GCSE Topics (Key Stage 4 - based on AQA/Edexcel specifications)
  gcse: {
    mathematics: [
      // Number
      { id: 'm1', name: 'Structure of Number', description: 'Integers, decimals, place value; ordering & rounding', prerequisites: [], x: 50, y: 94 },
      { id: 'm2', name: 'Fractions & Percentages', description: 'Operations with fractions; percentage change; reverse percentages', prerequisites: ['m1'], x: 25, y: 82 },
      { id: 'm3', name: 'Indices & Roots', description: 'Laws of indices; surds; standard form', prerequisites: ['m1'], x: 75, y: 82 },
      // Algebra
      { id: 'm4', name: 'Algebraic Expressions', description: 'Simplifying; expanding brackets; factorising', prerequisites: ['m2'], x: 15, y: 68 },
      { id: 'm5', name: 'Linear Equations', description: 'Solving equations; rearranging formulae', prerequisites: ['m4'], x: 40, y: 68 },
      { id: 'm6', name: 'Linear Graphs', description: 'Plotting; gradient; y = mx + c; parallel/perpendicular lines', prerequisites: ['m5'], x: 65, y: 68 },
      { id: 'm7', name: 'Quadratics', description: 'Factorising; quadratic formula; completing the square', prerequisites: ['m4', 'm3'], x: 85, y: 68 },
      { id: 'm8', name: 'Simultaneous Equations', description: 'Linear & quadratic; graphical solutions', prerequisites: ['m5', 'm7'], x: 25, y: 52 },
      { id: 'm9', name: 'Inequalities', description: 'Solving; representing on number line & graphs', prerequisites: ['m5', 'm6'], x: 50, y: 52 },
      { id: 'm10', name: 'Sequences', description: 'nth term; arithmetic & geometric; quadratic sequences', prerequisites: ['m7'], x: 75, y: 52 },
      // Ratio & Proportion
      { id: 'm11', name: 'Ratio & Proportion', description: 'Sharing in ratio; direct & inverse proportion; compound measures', prerequisites: ['m2'], x: 15, y: 38 },
      // Geometry
      { id: 'm12', name: 'Angles & Polygons', description: 'Angle rules; interior/exterior angles; bearings', prerequisites: ['m6'], x: 40, y: 38 },
      { id: 'm13', name: 'Congruence & Similarity', description: 'Congruent shapes; similar triangles; scale factors', prerequisites: ['m11', 'm12'], x: 65, y: 38 },
      { id: 'm14', name: 'Trigonometry', description: 'SOHCAHTOA; sine/cosine rules; 3D trigonometry', prerequisites: ['m12', 'm7'], x: 85, y: 38 },
      { id: 'm15', name: 'Circle Theorems', description: 'Arc, sector, segment; circle theorems', prerequisites: ['m12'], x: 25, y: 22 },
      { id: 'm16', name: 'Transformations', description: 'Rotation, reflection, translation, enlargement; vectors', prerequisites: ['m13'], x: 50, y: 22 },
      { id: 'm17', name: 'Area & Volume', description: 'Compound shapes; prisms, pyramids, cones, spheres', prerequisites: ['m14', 'm15'], x: 75, y: 22 },
      // Statistics & Probability
      { id: 'm18', name: 'Probability', description: 'Single/combined events; tree diagrams; conditional probability', prerequisites: ['m2'], x: 35, y: 8 },
      { id: 'm19', name: 'Statistics', description: 'Averages; cumulative frequency; histograms; scatter graphs', prerequisites: ['m18'], x: 65, y: 8 },
    ],
    physics: [
      // AQA GCSE Physics specification
      { id: 'p1', name: 'Energy Stores', description: 'Kinetic, gravitational, elastic, thermal energy; conservation', prerequisites: [], x: 50, y: 94 },
      { id: 'p2', name: 'Energy Transfers', description: 'Work done; power; efficiency; reducing dissipation', prerequisites: ['p1'], x: 25, y: 80 },
      { id: 'p3', name: 'Energy Resources', description: 'Renewable vs non-renewable; environmental impact', prerequisites: ['p1'], x: 75, y: 80 },
      { id: 'p4', name: 'Electric Circuits', description: 'Current, voltage, resistance; series & parallel; V=IR', prerequisites: ['p2'], x: 20, y: 66 },
      { id: 'p5', name: 'Domestic Electricity', description: 'AC/DC; mains electricity; power & energy transfer; safety', prerequisites: ['p4'], x: 45, y: 66 },
      { id: 'p6', name: 'Particle Model', description: 'Density; states of matter; internal energy; specific heat', prerequisites: ['p1'], x: 75, y: 66 },
      { id: 'p7', name: 'Atomic Structure', description: 'Atoms & isotopes; radioactive decay; half-life', prerequisites: ['p6'], x: 90, y: 52 },
      { id: 'p8', name: 'Forces in Balance', description: 'Scalars & vectors; resultant forces; equilibrium', prerequisites: ['p2'], x: 15, y: 52 },
      { id: 'p9', name: 'Motion', description: 'Distance-time; velocity-time graphs; acceleration equations', prerequisites: ['p8'], x: 40, y: 52 },
      { id: 'p10', name: "Newton's Laws", description: 'Inertia; F=ma; action-reaction pairs', prerequisites: ['p9'], x: 65, y: 52 },
      { id: 'p11', name: 'Forces & Pressure', description: 'Moments; levers; gears; pressure in fluids', prerequisites: ['p8', 'p6'], x: 25, y: 38 },
      { id: 'p12', name: 'Wave Properties', description: 'Transverse & longitudinal; frequency; wavelength; wave speed', prerequisites: ['p9'], x: 50, y: 38 },
      { id: 'p13', name: 'EM Spectrum', description: 'Radio to gamma; uses and hazards of each type', prerequisites: ['p12'], x: 75, y: 38 },
      { id: 'p14', name: 'Magnetism', description: 'Magnetic fields; electromagnets; Fleming\'s left hand rule', prerequisites: ['p4'], x: 20, y: 22 },
      { id: 'p15', name: 'Electromagnetism', description: 'Motor effect; generators; transformers', prerequisites: ['p14', 'p5'], x: 45, y: 22 },
      { id: 'p16', name: 'Space Physics', description: 'Solar system; life cycle of stars; red shift; Big Bang', prerequisites: ['p7', 'p13'], x: 75, y: 22 },
      { id: 'p17', name: 'Nuclear Radiation', description: 'Uses of radiation; nuclear fission & fusion', prerequisites: ['p7'], x: 50, y: 8 },
    ],
    economics: [
      // GCSE Economics (Edexcel/AQA specification)
      { id: 'e1', name: 'Economic Problem', description: 'Scarcity, choice, opportunity cost; economic agents', prerequisites: [], x: 50, y: 94 },
      { id: 'e2', name: 'Demand', description: 'Law of demand; demand curves; factors affecting demand', prerequisites: ['e1'], x: 25, y: 80 },
      { id: 'e3', name: 'Supply', description: 'Law of supply; supply curves; factors affecting supply', prerequisites: ['e1'], x: 75, y: 80 },
      { id: 'e4', name: 'Price Determination', description: 'Market equilibrium; price mechanism; shifts in D&S', prerequisites: ['e2', 'e3'], x: 50, y: 66 },
      { id: 'e5', name: 'Price Elasticity', description: 'PED calculation; elastic vs inelastic; factors affecting', prerequisites: ['e4'], x: 20, y: 52 },
      { id: 'e6', name: 'Market Failure', description: 'Externalities; public goods; merit/demerit goods', prerequisites: ['e4'], x: 50, y: 52 },
      { id: 'e7', name: 'Government Intervention', description: 'Indirect taxes; subsidies; price controls; regulation', prerequisites: ['e5', 'e6'], x: 80, y: 52 },
      { id: 'e8', name: 'Market Structures', description: 'Competition; monopoly; oligopoly; barriers to entry', prerequisites: ['e4'], x: 25, y: 38 },
      { id: 'e9', name: 'Labour Market', description: 'Wage determination; minimum wage; trade unions', prerequisites: ['e5', 'e8'], x: 55, y: 38 },
      { id: 'e10', name: 'Economic Objectives', description: 'Growth, inflation, unemployment, balance of payments', prerequisites: ['e6'], x: 85, y: 38 },
      { id: 'e11', name: 'Fiscal Policy', description: 'Government spending; taxation; budget deficit/surplus', prerequisites: ['e7', 'e10'], x: 30, y: 22 },
      { id: 'e12', name: 'Monetary Policy', description: 'Interest rates; money supply; Bank of England', prerequisites: ['e10'], x: 60, y: 22 },
      { id: 'e13', name: 'International Trade', description: 'Exports & imports; exchange rates; globalisation', prerequisites: ['e10'], x: 85, y: 22 },
      { id: 'e14', name: 'Economic Growth', description: 'GDP; living standards; sustainability', prerequisites: ['e11', 'e12', 'e13'], x: 50, y: 8 },
    ],
  },
  // A-Level Topics (based on Edexcel/AQA specifications)
  alevel: {
    mathematics: [
      // Pure Mathematics
      { id: 'm1', name: 'Proof', description: 'Proof by deduction, exhaustion, contradiction', prerequisites: [], x: 50, y: 95 },
      { id: 'm2', name: 'Algebra & Functions', description: 'Indices; surds; quadratics; simultaneous equations; inequalities', prerequisites: ['m1'], x: 25, y: 84 },
      { id: 'm3', name: 'Coordinate Geometry', description: 'Straight lines; circles; parametric equations', prerequisites: ['m1'], x: 75, y: 84 },
      { id: 'm4', name: 'Sequences & Series', description: 'Arithmetic & geometric; sigma notation; binomial expansion', prerequisites: ['m2'], x: 12, y: 72 },
      { id: 'm5', name: 'Trigonometry', description: 'Identities; equations; radians; small angle approximations', prerequisites: ['m2', 'm3'], x: 38, y: 72 },
      { id: 'm6', name: 'Exponentials & Logs', description: 'Laws of logarithms; natural log; exponential modelling', prerequisites: ['m2'], x: 62, y: 72 },
      { id: 'm7', name: 'Functions', description: 'Domain, range, inverse; modulus; transformations; composite', prerequisites: ['m3', 'm6'], x: 88, y: 72 },
      { id: 'm8', name: 'Differentiation', description: 'First principles; chain, product, quotient rules; applications', prerequisites: ['m4', 'm5'], x: 20, y: 58 },
      { id: 'm9', name: 'Integration', description: 'Definite & indefinite; by substitution; by parts; areas', prerequisites: ['m8'], x: 45, y: 58 },
      { id: 'm10', name: 'Numerical Methods', description: 'Iteration; Newton-Raphson; trapezium rule', prerequisites: ['m8', 'm9'], x: 70, y: 58 },
      { id: 'm11', name: 'Vectors', description: '2D & 3D vectors; position vectors; scalar product', prerequisites: ['m3'], x: 90, y: 58 },
      { id: 'm12', name: 'Differential Equations', description: 'Forming & solving; separation of variables', prerequisites: ['m9'], x: 35, y: 44 },
      // Statistics
      { id: 'm13', name: 'Statistical Sampling', description: 'Types of sampling; large data set interpretation', prerequisites: ['m6'], x: 65, y: 44 },
      { id: 'm14', name: 'Probability', description: 'Conditional probability; Venn diagrams; tree diagrams', prerequisites: ['m13'], x: 88, y: 44 },
      { id: 'm15', name: 'Statistical Distributions', description: 'Binomial; Normal distribution; hypothesis testing', prerequisites: ['m14'], x: 75, y: 28 },
      { id: 'm16', name: 'Statistical Hypothesis Testing', description: 'One & two tailed tests; correlation', prerequisites: ['m15'], x: 55, y: 28 },
      // Mechanics
      { id: 'm17', name: 'Kinematics', description: 'SUVAT; velocity-time graphs; variable acceleration', prerequisites: ['m8'], x: 12, y: 28 },
      { id: 'm18', name: 'Forces & Newton\'s Laws', description: 'Equilibrium; F=ma; connected particles', prerequisites: ['m17', 'm11'], x: 32, y: 28 },
      { id: 'm19', name: 'Moments', description: 'Moments; equilibrium of rigid bodies', prerequisites: ['m18'], x: 22, y: 12 },
      { id: 'm20', name: 'Projectiles', description: 'Motion under gravity in 2D', prerequisites: ['m17', 'm5'], x: 45, y: 12 },
      { id: 'm21', name: 'Application of Forces', description: 'Friction; inclined planes; pulleys', prerequisites: ['m18', 'm19'], x: 70, y: 12 },
    ],
    physics: [
      // AQA A-Level Physics specification
      { id: 'p1', name: 'Measurements & Errors', description: 'SI units; uncertainty; significant figures', prerequisites: [], x: 50, y: 95 },
      { id: 'p2', name: 'Particles & Antiparticles', description: 'Quarks, leptons; particle interactions; conservation laws', prerequisites: ['p1'], x: 20, y: 82 },
      { id: 'p3', name: 'Electromagnetic Radiation', description: 'Photoelectric effect; photon energy; wave-particle duality', prerequisites: ['p1'], x: 50, y: 82 },
      { id: 'p4', name: 'Waves', description: 'Progressive waves; superposition; stationary waves; diffraction', prerequisites: ['p1'], x: 80, y: 82 },
      { id: 'p5', name: 'Optics', description: 'Refraction; total internal reflection; interference; diffraction gratings', prerequisites: ['p4'], x: 90, y: 68 },
      { id: 'p6', name: 'Materials', description: 'Bulk properties; Young\'s modulus; stress-strain curves', prerequisites: ['p1'], x: 15, y: 68 },
      { id: 'p7', name: 'Mechanics', description: 'Vectors; moments; projectiles; Newton\'s laws', prerequisites: ['p6'], x: 38, y: 68 },
      { id: 'p8', name: 'Energy & Power', description: 'Work, energy, power; conservation of energy; efficiency', prerequisites: ['p7'], x: 62, y: 68 },
      { id: 'p9', name: 'Electricity Fundamentals', description: 'Charge; current; resistance; Ohm\'s law; resistivity', prerequisites: ['p3'], x: 25, y: 52 },
      { id: 'p10', name: 'DC Circuits', description: 'Kirchhoff\'s laws; potential dividers; EMF & internal resistance', prerequisites: ['p9'], x: 50, y: 52 },
      { id: 'p11', name: 'Circular Motion', description: 'Angular velocity; centripetal force; banked tracks', prerequisites: ['p7', 'p8'], x: 75, y: 52 },
      { id: 'p12', name: 'Simple Harmonic Motion', description: 'Oscillations; resonance; damping', prerequisites: ['p11'], x: 90, y: 38 },
      { id: 'p13', name: 'Thermal Physics', description: 'Thermal energy; ideal gases; molecular kinetic theory', prerequisites: ['p8'], x: 15, y: 38 },
      { id: 'p14', name: 'Gravitational Fields', description: 'Newton\'s law of gravitation; orbits; satellites', prerequisites: ['p11'], x: 38, y: 38 },
      { id: 'p15', name: 'Electric Fields', description: 'Coulomb\'s law; field strength; potential; capacitors', prerequisites: ['p10', 'p14'], x: 62, y: 38 },
      { id: 'p16', name: 'Capacitance', description: 'Capacitors; charging/discharging; time constant', prerequisites: ['p15'], x: 75, y: 22 },
      { id: 'p17', name: 'Magnetic Fields', description: 'Magnetic flux; motor effect; electromagnetic induction', prerequisites: ['p10'], x: 25, y: 22 },
      { id: 'p18', name: 'Nuclear Physics', description: 'Radioactivity; decay equations; binding energy; fission & fusion', prerequisites: ['p2', 'p3'], x: 50, y: 22 },
      { id: 'p19', name: 'Astrophysics', description: 'Telescopes; stellar classification; Hertzsprung-Russell; cosmology', prerequisites: ['p14', 'p18'], x: 38, y: 8 },
      { id: 'p20', name: 'Medical Physics', description: 'X-rays; CAT scans; ultrasound; PET scans', prerequisites: ['p4', 'p18'], x: 62, y: 8 },
    ],
    economics: [
      // A-Level Economics (Edexcel specification - Theme 1-4)
      // Theme 1: Markets & Market Failure
      { id: 'e1', name: 'Nature of Economics', description: 'Scarcity, opportunity cost, PPF, specialisation', prerequisites: [], x: 50, y: 95 },
      { id: 'e2', name: 'Demand & Supply', description: 'Market equilibrium; consumer & producer surplus; price mechanism', prerequisites: ['e1'], x: 25, y: 82 },
      { id: 'e3', name: 'Elasticity', description: 'PED, YED, XED, PES; calculations and applications', prerequisites: ['e2'], x: 75, y: 82 },
      { id: 'e4', name: 'Market Failure', description: 'Externalities; public goods; information gaps; inequality', prerequisites: ['e2'], x: 50, y: 68 },
      { id: 'e5', name: 'Government Intervention', description: 'Taxes, subsidies, regulation; government failure', prerequisites: ['e3', 'e4'], x: 25, y: 68 },
      // Theme 2: The UK Economy
      { id: 'e6', name: 'Economic Growth', description: 'GDP; real vs nominal; PPP; limitations of GDP', prerequisites: ['e1'], x: 75, y: 68 },
      { id: 'e7', name: 'Inflation & Deflation', description: 'CPI, RPI; causes; costs; expectations', prerequisites: ['e6'], x: 15, y: 52 },
      { id: 'e8', name: 'Employment & Unemployment', description: 'Types of unemployment; natural rate; Phillips curve', prerequisites: ['e6'], x: 42, y: 52 },
      { id: 'e9', name: 'Balance of Payments', description: 'Current account; capital flows; exchange rate impacts', prerequisites: ['e6'], x: 68, y: 52 },
      { id: 'e10', name: 'Fiscal Policy', description: 'Government budget; national debt; automatic stabilisers', prerequisites: ['e7', 'e8'], x: 88, y: 52 },
      { id: 'e11', name: 'Monetary Policy', description: 'Interest rates; quantitative easing; MPC; inflation targeting', prerequisites: ['e7'], x: 28, y: 36 },
      { id: 'e12', name: 'Supply-Side Policies', description: 'Labour market flexibility; infrastructure; deregulation', prerequisites: ['e8', 'e11'], x: 55, y: 36 },
      // Theme 3: Business Behaviour
      { id: 'e13', name: 'Business Objectives', description: 'Profit max; revenue max; sales max; satisficing', prerequisites: ['e3'], x: 82, y: 36 },
      { id: 'e14', name: 'Costs & Revenue', description: 'Fixed, variable, marginal; economies of scale; MR, AR', prerequisites: ['e13'], x: 15, y: 22 },
      { id: 'e15', name: 'Market Structures', description: 'Perfect competition; monopoly; oligopoly; contestability', prerequisites: ['e14'], x: 40, y: 22 },
      { id: 'e16', name: 'Labour Market', description: 'MRP theory; wage differentials; discrimination; trade unions', prerequisites: ['e8', 'e14'], x: 65, y: 22 },
      // Theme 4: Global Economy
      { id: 'e17', name: 'International Trade', description: 'Comparative advantage; terms of trade; protectionism', prerequisites: ['e9'], x: 88, y: 22 },
      { id: 'e18', name: 'Exchange Rates', description: 'Floating, fixed, managed; competitiveness; hot money', prerequisites: ['e9', 'e17'], x: 30, y: 8 },
      { id: 'e19', name: 'Globalisation', description: 'TNCs; FDI; global inequality; emerging economies', prerequisites: ['e17'], x: 55, y: 8 },
      { id: 'e20', name: 'Development Economics', description: 'HDI; barriers to development; aid; debt relief', prerequisites: ['e18', 'e19'], x: 80, y: 8 },
    ],
  },
};

// Constellation names by level
const constellationNames: Record<string, Record<Subject, string>> = {
  'year5-6': {
    mathematics: 'KS2 Mathematics',
    physics: 'KS2 Science',
    economics: 'Financial Literacy',
  },
  gcse: {
    mathematics: 'GCSE Mathematics',
    physics: 'GCSE Physics',
    economics: 'GCSE Economics',
  },
  alevel: {
    mathematics: 'A-Level Mathematics',
    physics: 'A-Level Physics',
    economics: 'A-Level Economics',
  },
};

// Map yearGroup to curriculum key
const yearGroupToLevel = (yg: YearGroup): string => {
  if (yg === 'year5' || yg === 'year6') return 'year5-6';
  if (yg === 'gcse') return 'gcse';
  return 'alevel';
};

// Create constellations based on student's year group and real mastery data
const createConstellations = (
  enrolledSubjects: Subject[],
  subjectStats: { subject: Subject; progress: number }[],
  yearGroup: YearGroup,
  topicMastery?: TopicMastery[]
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

    // Get topic mastery records for this subject
    const subjectMastery = topicMastery?.filter(tm => tm.subject === subject) || [];

    // Calculate mastery for each topic - use real data if available
    const topics: TopicNode[] = templates.map((t, index) => {
      // Check if we have real mastery data for this topic
      const realMastery = subjectMastery.find(tm => tm.topicId === t.id);

      const depth = 1 - t.y / 100; // 0 at bottom, 1 at top
      const hasPrereqs = t.prerequisites.length > 0;

      // Check if prerequisites are met (all prereqs have mastery >= 50%)
      const prereqsMet = t.prerequisites.every(prereqId => {
        const prereqMastery = subjectMastery.find(tm => tm.topicId === prereqId);
        return prereqMastery ? prereqMastery.mastery >= 50 : baseProgress >= depth * 40;
      });

      // Topics unlock if no prereqs OR if all prereqs are sufficiently mastered
      const isUnlocked = !hasPrereqs || prereqsMet || baseProgress >= depth * 60;

      // Use real mastery if available, otherwise fall back to calculated
      let mastery: number;
      if (realMastery) {
        mastery = realMastery.mastery;
      } else {
        // Fallback: calculate based on overall progress (legacy behavior)
        const masteryBase = isUnlocked ? Math.max(0, baseProgress - depth * 40) : 0;
        mastery = Math.min(100, masteryBase + (index === 0 ? 30 : 0));
      }

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
  topicMastery?: TopicMastery[]; // Real mastery data from tutor updates
}

export const ConstellationSkillTree: React.FC<ConstellationSkillTreeProps> = ({
  enrolledSubjects,
  subjectStats,
  yearGroup,
  topicMastery,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject>(enrolledSubjects[0] || 'mathematics');
  const [selectedTopic, setSelectedTopic] = useState<TopicNode | null>(null);
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  const constellations = useMemo(
    () => createConstellations(enrolledSubjects, subjectStats, yearGroup, topicMastery),
    [enrolledSubjects, subjectStats, yearGroup, topicMastery]
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

  // FFX-inspired node styling - gem-like stars
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
              Constellation Skill Tree
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
          {/* Star Grid Visualization */}
          <div className="lg:col-span-2 relative bg-gradient-to-b from-[#0a0a1a] via-[#0f0f2a] to-[#0a0a1a] overflow-hidden">
            {/* Twinkling star background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 50 }, (_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white animate-twinkle-star"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${1 + Math.random() * 2}px`,
                    height: `${1 + Math.random() * 2}px`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>

            {/* Ancient texture overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
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
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <h3 className="text-lg font-bold" style={{ color: currentConstellation.color }}>
                {currentConstellation.name}
              </h3>
              <p className="text-xs text-neutral-500">{overallProgress}% traversed</p>
            </div>

            {/* SVG Star Grid */}
            <svg viewBox="0 0 100 105" className="w-full h-[420px] lg:h-[520px] relative z-20" preserveAspectRatio="xMidYMid meet" style={{ pointerEvents: 'auto' }}>
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

              {/* Expansion sockets - blank slots for tutor-added custom topics */}
              {(() => {
                // Generate expansion socket positions around the edges of the grid
                const expansionSockets = [
                  { x: 10, y: 35, connectTo: currentConstellation.topics[1]?.id },
                  { x: 90, y: 35, connectTo: currentConstellation.topics[2]?.id },
                  { x: 8, y: 60, connectTo: currentConstellation.topics[3]?.id },
                  { x: 92, y: 60, connectTo: currentConstellation.topics[4]?.id },
                  { x: 12, y: 85, connectTo: currentConstellation.topics[0]?.id },
                  { x: 88, y: 85, connectTo: currentConstellation.topics[0]?.id },
                ];

                return expansionSockets.map((socket, idx) => {
                  const targetTopic = currentConstellation.topics.find(t => t.id === socket.connectTo);

                  return (
                    <g key={`expansion-${idx}`} opacity={0.3}>
                      {/* Faint connection line to nearest topic */}
                      {targetTopic && (
                        <line
                          x1={socket.x}
                          y1={socket.y}
                          x2={targetTopic.x}
                          y2={targetTopic.y}
                          stroke="#3a3a5a"
                          strokeWidth={0.15}
                          strokeDasharray="0.5 0.5"
                          opacity={0.4}
                        />
                      )}
                      {/* Empty socket ring */}
                      <circle
                        cx={socket.x}
                        cy={socket.y}
                        r={2}
                        fill="none"
                        stroke="#3a3a5a"
                        strokeWidth={0.2}
                        strokeDasharray="0.8 0.4"
                      />
                      {/* Inner empty socket */}
                      <circle
                        cx={socket.x}
                        cy={socket.y}
                        r={1.2}
                        fill="#1a1a2a"
                        stroke="#2a2a4a"
                        strokeWidth={0.1}
                      />
                      {/* Plus indicator */}
                      <text
                        x={socket.x}
                        y={socket.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={1.2}
                        fill="#4a4a6a"
                      >
                        +
                      </text>
                    </g>
                  );
                });
              })()}

              {/* Star nodes */}
              {currentConstellation.topics.map((topic) => {
                const style = getNodeStyle(topic);
                const isSelected = selectedTopic?.id === topic.id;
                const isHovered = hoveredTopic === topic.id;
                const scaledRadius = style.radius * style.scale;

                const handleClick = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (topic.isUnlocked) {
                    setSelectedTopic(selectedTopic?.id === topic.id ? null : topic);
                  }
                };

                return (
                  <g
                    key={topic.id}
                    onClick={handleClick}
                    onMouseEnter={() => setHoveredTopic(topic.id)}
                    onMouseLeave={() => setHoveredTopic(null)}
                    style={{ cursor: topic.isUnlocked ? 'pointer' : 'not-allowed' }}
                  >
                    {/* Clickable hit area - larger invisible circle */}
                    <circle
                      cx={topic.x}
                      cy={topic.y}
                      r={scaledRadius + 5}
                      fill="transparent"
                      pointerEvents="all"
                    />
                    {/* Selection/hover glow ring */}
                    {(isSelected || isHovered) && topic.isUnlocked && (
                      <>
                        <circle
                          cx={topic.x}
                          cy={topic.y}
                          r={scaledRadius + 1.5}
                          fill="none"
                          stroke={currentConstellation.color}
                          strokeWidth="0.4"
                          opacity="0.6"
                          pointerEvents="none"
                        >
                          <animate
                            attributeName="opacity"
                            values="0.6;0.3;0.6"
                            dur="1.5s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="stroke-width"
                            values="0.4;0.6;0.4"
                            dur="1.5s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        <circle
                          cx={topic.x}
                          cy={topic.y}
                          r={scaledRadius + 2.5}
                          fill="none"
                          stroke={currentConstellation.color}
                          strokeWidth="0.2"
                          opacity="0.3"
                          pointerEvents="none"
                        >
                          <animate
                            attributeName="opacity"
                            values="0.3;0.1;0.3"
                            dur="1.5s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </>
                    )}

                    {/* Outer glow */}
                    {style.glowRadius > 0 && (
                      <circle
                        cx={topic.x}
                        cy={topic.y}
                        r={scaledRadius + style.glowRadius * 0.3}
                        fill={style.glowColor}
                        opacity={0.4}
                        filter={topic.mastery >= 90 ? 'url(#nodeGlowMastered)' : 'url(#nodeGlowActive)'}
                        pointerEvents="none"
                      />
                    )}

                    {/* Mastered pulsing glow ring */}
                    {topic.mastery >= 90 && (
                      <>
                        <circle
                          cx={topic.x}
                          cy={topic.y}
                          r={scaledRadius + 1}
                          fill="none"
                          stroke="#FFD700"
                          strokeWidth={0.4}
                          opacity={0.8}
                          className="animate-mastered-pulse pointer-events-none"
                        />
                        <circle
                          cx={topic.x}
                          cy={topic.y}
                          r={scaledRadius + 1.8}
                          fill="none"
                          stroke="#FFD700"
                          strokeWidth={0.2}
                          opacity={0.4}
                          className="animate-mastered-pulse-outer pointer-events-none"
                        />
                      </>
                    )}

                    {/* Socket ring (outer metallic border) */}
                    <circle
                      cx={topic.x}
                      cy={topic.y}
                      r={scaledRadius + 0.3}
                      fill="none"
                      stroke="#4a4a6a"
                      strokeWidth="0.3"
                      opacity={0.6}
                      pointerEvents="none"
                    />

                    {/* Main star/gem */}
                    <circle
                      cx={topic.x}
                      cy={topic.y}
                      r={scaledRadius}
                      fill={
                        topic.mastery >= 90 ? 'url(#masteredGem)' :
                        topic.mastery >= 40 ? 'url(#activeGem)' :
                        topic.isUnlocked ? 'url(#emptySocket)' : 'url(#lockedSocket)'
                      }
                      stroke={style.strokeColor}
                      strokeWidth={style.strokeWidth}
                      opacity={style.opacity}
                      filter={isSelected ? 'url(#selectedPulse)' : undefined}
                      pointerEvents="none"
                    />

                    {/* Inner highlight (gem shine) */}
                    {style.innerGlow && (
                      <ellipse
                        cx={topic.x - scaledRadius * 0.3}
                        cy={topic.y - scaledRadius * 0.3}
                        rx={scaledRadius * 0.35}
                        ry={scaledRadius * 0.25}
                        fill="white"
                        opacity={0.5}
                        pointerEvents="none"
                      />
                    )}

                    {/* Center icon */}
                    <text
                      x={topic.x}
                      y={topic.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={scaledRadius * 0.8}
                      fill={topic.mastery >= 90 ? '#fff' : topic.isUnlocked ? '#fff' : '#666'}
                      opacity={style.opacity}
                      pointerEvents="none"
                    >
                      {getNodeIcon(topic)}
                    </text>

                    {/* Topic name label */}
                    <text
                      x={topic.x}
                      y={topic.y + scaledRadius + 2.2}
                      textAnchor="middle"
                      dominantBaseline="hanging"
                      fontSize={1.4}
                      fill={topic.mastery >= 90 ? '#FFD700' : topic.isUnlocked ? '#e5e5e5' : '#666'}
                      opacity={topic.isUnlocked ? 0.9 : 0.5}
                      pointerEvents="none"
                      style={{
                        textShadow: '0 0 3px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.5)',
                        fontWeight: topic.mastery >= 70 ? 600 : 400,
                      }}
                    >
                      {topic.name.length > 14 ? topic.name.slice(0, 12) + '…' : topic.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover tooltip */}
            {hoveredTopic && !selectedTopic && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#1a1a2e]/95 border border-[#3a3a5a] rounded-lg px-4 py-2 z-30 backdrop-blur-sm pointer-events-none">
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
                  Click on any star to view details and track your progress
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
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#1a1a2a] border border-dashed border-[#3a3a5a] opacity-40 flex items-center justify-center text-[8px] text-[#4a4a6a]">+</div>
                    <span className="text-xs text-neutral-500">Custom Topic Slot</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <style>{`
        /* Twinkling star background animation */
        @keyframes twinkle-star {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.9; }
        }
        .animate-twinkle-star { animation: twinkle-star 3s ease-in-out infinite; }

        /* Energy flow animation on mastered paths */
        @keyframes energy-flow {
          0%, 100% { stroke-opacity: 0.6; }
          50% { stroke-opacity: 1; }
        }
        .animate-energy-flow { animation: energy-flow 2s ease-in-out infinite; }

        /* Mastered node glow animations */
        @keyframes mastered-pulse {
          0%, 100% { opacity: 0.8; stroke-width: 0.4; }
          50% { opacity: 0.4; stroke-width: 0.6; }
        }
        @keyframes mastered-pulse-outer {
          0%, 100% { opacity: 0.4; r: calc(100% + 1.8); }
          50% { opacity: 0.2; r: calc(100% + 2.5); }
        }
        .animate-mastered-pulse { animation: mastered-pulse 2s ease-in-out infinite; }
        .animate-mastered-pulse-outer { animation: mastered-pulse 2s ease-in-out infinite 0.5s; }
      `}</style>
    </Card>
  );
};
