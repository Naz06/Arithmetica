import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import {
  Menu,
  X,
  LogOut,
  User,
  Star,
  BookOpen,
  Users,
  Home,
  Settings,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    // If not on home page, navigate there first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'tutor':
        return '/tutor';
      case 'student':
        return '/student';
      case 'parent':
        return '/parent';
      default:
        return '/';
    }
  };

  const getRoleIcon = () => {
    if (!user) return null;
    switch (user.role) {
      case 'tutor':
        return <BookOpen className="w-4 h-4" />;
      case 'student':
        return <Star className="w-4 h-4" />;
      case 'parent':
        return <Users className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-100 hidden sm:block">
              Arithmetica
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/'
                      ? 'text-primary-500'
                      : 'text-neutral-400 hover:text-neutral-100'
                  }`}
                >
                  Home
                </Link>
                <button
                  onClick={() => scrollToSection('subjects')}
                  className="text-sm font-medium text-neutral-400 hover:text-neutral-100 transition-colors"
                >
                  Subjects
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="text-sm font-medium text-neutral-400 hover:text-neutral-100 transition-colors"
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="text-sm font-medium text-neutral-400 hover:text-neutral-100 transition-colors"
                >
                  Contact
                </button>
                <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
              </>
            ) : (
              <>
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-neutral-100 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Avatar name={user.name} size="sm" />
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium text-neutral-100">{user.name}</p>
                      <p className="text-xs text-neutral-400 flex items-center gap-1">
                        {getRoleIcon()}
                        <span className="capitalize">{user.role}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-neutral-900 border-b border-neutral-800">
          <div className="px-4 py-4 space-y-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="block text-sm font-medium text-neutral-100 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <button
                  onClick={() => scrollToSection('subjects')}
                  className="block text-sm font-medium text-neutral-400 py-2 text-left w-full"
                >
                  Subjects
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="block text-sm font-medium text-neutral-400 py-2 text-left w-full"
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="block text-sm font-medium text-neutral-400 py-2 text-left w-full"
                >
                  Contact
                </button>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Login
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
                  <Avatar name={user.name} size="md" />
                  <div>
                    <p className="font-medium text-neutral-100">{user.name}</p>
                    <p className="text-sm text-neutral-400 capitalize">{user.role}</p>
                  </div>
                </div>
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-3 text-sm font-medium text-neutral-100 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="w-5 h-5" />
                  Dashboard
                </Link>
                <Link
                  to={`${getDashboardLink()}/settings`}
                  className="flex items-center gap-3 text-sm font-medium text-neutral-400 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-sm font-medium text-red-400 py-2 w-full"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
