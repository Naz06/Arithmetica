import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { ConstellationBackground } from '../components/ui/ConstellationBackground';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import {
  Star,
  BookOpen,
  Trophy,
  Users,
  Calculator,
  LineChart,
  Atom,
  GraduationCap,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const subjects = [
    {
      name: 'Mathematics',
      icon: <Calculator className="w-8 h-8" />,
      description: 'From Year 5 foundations to A-Level calculus and beyond',
      topics: ['Algebra', 'Geometry', 'Calculus', 'Statistics'],
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    },
    {
      name: 'Economics',
      icon: <LineChart className="w-8 h-8" />,
      description: 'Understanding markets, economics principles and analysis',
      topics: ['Microeconomics', 'Macroeconomics', 'Market Structures', 'Trade'],
      color: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    },
    {
      name: 'Physics',
      icon: <Atom className="w-8 h-8" />,
      description: 'Exploring the fundamental laws of the universe',
      topics: ['Mechanics', 'Waves', 'Electricity', 'Quantum Physics'],
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    },
  ];

  const yearGroups = [
    { name: 'Year 5-6', description: 'Building strong foundations for secondary education' },
    { name: 'GCSE', description: 'Comprehensive exam preparation and skill development' },
    { name: 'A-Level', description: 'Advanced study for university preparation' },
  ];

  const features = [
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Personalised Learning',
      description: 'Tailored lessons designed around each student\'s unique needs and learning style',
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'Gamified Progress',
      description: 'Engaging point systems, achievements, and rewards to keep students motivated',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Parent Involvement',
      description: 'Real-time progress tracking and direct communication with parents',
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Quality Resources',
      description: 'Custom worksheets, video tutorials, and interactive learning materials',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      <ConstellationBackground variant="default" animated={true} />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 rounded-full border border-primary-500/30 mb-8">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm text-primary-400">Expert Private Tuition</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-neutral-100 font-['Space_Grotesk'] leading-tight">
            Unlock Your Universe
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-400">
              of Knowledge
            </span>
          </h1>

          <p className="mt-6 text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Expert one-on-one tuition in Mathematics, Economics, and Physics.
            Personalised learning journeys from Year 5 through A-Level,
            delivered in the comfort of your home.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate('/login')}
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Start Your Journey
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get in Touch
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '15+', label: 'Years Experience' },
              { value: '100%', label: 'Home-Based Learning' },
              { value: '3', label: 'Core Subjects' },
              { value: '5', label: 'Year Groups' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-primary-500 font-['Space_Grotesk']">{stat.value}</p>
                <p className="mt-1 text-sm text-neutral-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section id="subjects" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-100 font-['Space_Grotesk']">
              Subjects We Teach
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              Comprehensive coverage across the National Curriculum
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {subjects.map((subject, index) => (
              <Card
                key={index}
                className={`bg-gradient-to-br ${subject.color} border hover:-translate-y-2 transition-all duration-300`}
                interactive
              >
                <CardContent className="p-8">
                  <div className="text-primary-400 mb-4">{subject.icon}</div>
                  <h3 className="text-2xl font-bold text-neutral-100 mb-2">{subject.name}</h3>
                  <p className="text-neutral-400 mb-4">{subject.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {subject.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-neutral-900/50 text-neutral-300 text-sm rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Year Groups */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-100 font-['Space_Grotesk']">
              Year Groups
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              Supporting students at every stage of their academic journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {yearGroups.map((group, index) => (
              <Card key={index} className="text-center" interactive glow>
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-primary-500" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-100 mb-2">{group.name}</h3>
                  <p className="text-neutral-400">{group.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-100 font-['Space_Grotesk']">
              Why Choose Arithmetica?
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              A unique approach to private education
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} interactive>
                <CardContent className="p-6">
                  <div className="w-12 h-12 mb-4 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-neutral-100 mb-2">{feature.title}</h3>
                  <p className="text-sm text-neutral-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About the Tutor */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-neutral-100 font-['Space_Grotesk'] mb-6">
                Meet Your Tutor
              </h2>
              <p className="text-lg text-neutral-400 mb-6 leading-relaxed">
                With over 15 years of experience in education, I am passionate about helping students
                unlock their full potential. My approach combines rigorous academic standards with
                personalised attention, ensuring each student receives the support they need to excel.
              </p>
              <ul className="space-y-3">
                {[
                  'MSc Economics - London School of Economics',
                  'BSc Mathematics - University College London',
                  'PGCE Secondary Education',
                  'Qualified Teacher Status (QTS)',
                ].map((qual, index) => (
                  <li key={index} className="flex items-center gap-3 text-neutral-300">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {qual}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 border border-primary-500/30 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-4xl font-bold text-white">
                    SM
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-neutral-100">Sarah Mitchell</h3>
                  <p className="text-neutral-400 mt-2">Private Tutor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-100 font-['Space_Grotesk']">
              Get in Touch
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              Ready to start your learning journey? Contact me to discuss your needs
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card glow>
              <CardContent className="p-8">
                <div className="grid gap-6">
                  <div className="flex items-center gap-4 p-4 bg-neutral-800/50 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-500">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400">Phone</p>
                      <p className="text-lg text-neutral-100">+44 7700 900123</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-neutral-800/50 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-500">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400">Email</p>
                      <p className="text-lg text-neutral-100">contact@arithmetica.co.uk</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-neutral-800/50 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-500">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400">Location</p>
                      <p className="text-lg text-neutral-100">Home visits in London & surrounding areas</p>
                    </div>
                  </div>
                </div>

                <p className="mt-8 text-center text-neutral-400">
                  All lessons are conducted at the student's home or a comfortable location of their choice.
                  Payment arrangements are discussed in person or over the phone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-neutral-800 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-neutral-100">Arithmetica</span>
            </div>
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} Arithmetica. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
