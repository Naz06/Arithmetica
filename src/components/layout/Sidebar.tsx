import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  MessageCircle,
  FileText,
  BarChart3,
  Settings,
  Star,
  ShoppingBag,
  Trophy,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Bell,
  Shield,
  Send,
} from 'lucide-react';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tutorItems: SidebarItem[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/tutor' },
    { icon: <Bell className="w-5 h-5" />, label: 'Notifications', path: '/tutor/notifications' },
    { icon: <Users className="w-5 h-5" />, label: 'Students', path: '/tutor/students' },
    { icon: <BookOpen className="w-5 h-5" />, label: 'Resources', path: '/tutor/resources' },
    { icon: <FileText className="w-5 h-5" />, label: 'Assessments', path: '/tutor/assessments' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Schedule', path: '/tutor/schedule' },
    { icon: <MessageCircle className="w-5 h-5" />, label: 'Messages', path: '/tutor/messages' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics', path: '/tutor/analytics' },
    { icon: <Shield className="w-5 h-5" />, label: 'Admin', path: '/tutor/admin' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/tutor/settings' },
  ];

  const studentItems: SidebarItem[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/student' },
    { icon: <Star className="w-5 h-5" />, label: 'My Stats', path: '/student/stats' },
    { icon: <Trophy className="w-5 h-5" />, label: 'Achievements', path: '/student/achievements' },
    { icon: <BookOpen className="w-5 h-5" />, label: 'Resources', path: '/student/resources' },
    { icon: <Send className="w-5 h-5" />, label: 'Quick Message', path: '/student/quick-message' },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Shop', path: '/student/shop' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Schedule', path: '/student/schedule' },
    { icon: <MessageCircle className="w-5 h-5" />, label: 'Messages', path: '/student/messages' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/student/settings' },
  ];

  const parentItems: SidebarItem[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/parent' },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Progress', path: '/parent/progress' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Reports', path: '/parent/reports' },
    { icon: <Send className="w-5 h-5" />, label: 'Request Feedback', path: '/parent/feedback-request' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Schedule', path: '/parent/schedule' },
    { icon: <MessageCircle className="w-5 h-5" />, label: 'Messages', path: '/parent/messages' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/parent/settings' },
  ];

  const getMenuItems = (): SidebarItem[] => {
    switch (user?.role) {
      case 'tutor':
        return tutorItems;
      case 'student':
        return studentItems;
      case 'parent':
        return parentItems;
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-neutral-900 border-r border-neutral-800 transition-all duration-300 z-40 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-500/20 text-primary-500'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className={isActive ? 'text-primary-500' : 'text-neutral-400 group-hover:text-neutral-100'}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-xl transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
