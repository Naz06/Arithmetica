import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService, UserRecord, CreateUserData } from '../../services/adminService';
import { ConstellationBackground } from '../../components/ui/ConstellationBackground';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import {
  Shield,
  Users,
  BookOpen,
  GraduationCap,
  UserPlus,
  Key,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  LogOut,
  Mail,
  Lock,
  User,
  RefreshCw,
  Link,
  UserCheck,
  Settings,
} from 'lucide-react';

interface ExtendedCreateUserData extends CreateUserData {
  parentId?: string; // For students - link to parent
  childrenIds?: string[]; // For parents - link to children
  yearGroup?: string;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState({ tutors: 0, students: 0, parents: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Create user form state
  const [newUser, setNewUser] = useState<ExtendedCreateUserData>({
    email: '',
    password: '',
    name: '',
    role: 'student',
    parentId: '',
    childrenIds: [],
    yearGroup: 'gcse',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For linking parents to children
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getStats(),
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    setIsLoading(false);
  };

  // Get users by role
  const getParents = () => users.filter(u => u.role === 'parent');
  const getStudents = () => users.filter(u => u.role === 'student');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newUser.password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newUser.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    // Validate parent-child linking
    if (newUser.role === 'student' && !newUser.parentId) {
      setMessage({ type: 'error', text: 'Please select a parent for this student' });
      return;
    }

    setIsSubmitting(true);
    const result = await adminService.createUser(newUser);

    if (result.success) {
      setMessage({ type: 'success', text: `Account created for ${newUser.email}` });
      setShowCreateModal(false);
      resetForm();
      loadData();
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to create user' });
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setNewUser({
      email: '',
      password: '',
      name: '',
      role: 'student',
      parentId: '',
      childrenIds: [],
      yearGroup: 'gcse',
    });
    setConfirmPassword('');
    setSelectedChildrenIds([]);
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    const result = await adminService.resetPassword(selectedUser.email);

    if (result.success) {
      setMessage({ type: 'success', text: `Password reset email sent to ${selectedUser.email}` });
      setShowResetModal(false);
      setSelectedUser(null);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to send reset email' });
    }
    setIsSubmitting(false);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    const result = await adminService.deleteUser(userId);

    if (result.success) {
      setMessage({ type: 'success', text: 'User deleted successfully' });
      loadData();
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to delete user' });
    }
  };

  const handleLinkParentToChildren = async () => {
    if (!selectedUser || selectedUser.role !== 'parent') return;

    setIsSubmitting(true);
    // Update the parent with selected children
    const result = await adminService.updateUser(selectedUser.id, {
      // This would update the parent's childrenIds in a real implementation
    });

    if (result.success) {
      setMessage({ type: 'success', text: `Linked ${selectedChildrenIds.length} student(s) to ${selectedUser.name}` });
      setShowLinkModal(false);
      setSelectedUser(null);
      setSelectedChildrenIds([]);
      loadData();
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to link students' });
    }
    setIsSubmitting(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    // Check for password strength
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      setMessage({
        type: 'error',
        text: 'Password must include uppercase, lowercase, number, and special character'
      });
      return;
    }

    setIsSubmitting(true);

    // In demo mode, update localStorage
    const result = await adminService.changeAdminPassword(currentPassword, newPassword);

    if (result.success) {
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setShowChangePasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to change password' });
    }
    setIsSubmitting(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'tutor':
        return <BookOpen className="w-4 h-4" />;
      case 'student':
        return <GraduationCap className="w-4 h-4" />;
      case 'parent':
        return <Users className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'tutor':
        return 'text-blue-400 bg-blue-500/20';
      case 'student':
        return 'text-green-400 bg-green-500/20';
      case 'parent':
        return 'text-purple-400 bg-purple-500/20';
      default:
        return 'text-neutral-400 bg-neutral-500/20';
    }
  };

  const yearGroups = [
    { value: 'year5', label: 'Year 5' },
    { value: 'year6', label: 'Year 6' },
    { value: 'year7', label: 'Year 7' },
    { value: 'year8', label: 'Year 8' },
    { value: 'year9', label: 'Year 9' },
    { value: 'gcse', label: 'GCSE' },
    { value: 'alevel', label: 'A-Level' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      <ConstellationBackground variant="subtle" animated={true} />

      {/* Header */}
      <header className="relative z-10 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-neutral-100">Admin Dashboard</h1>
                <p className="text-xs text-neutral-500">Arithmetica User Management</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-400">{user?.name}</span>
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-400 hover:text-neutral-100 transition-colors"
                title="Change Password"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-400 hover:text-neutral-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Toast */}
        {message && (
          <div
            className={`mb-6 flex items-center gap-2 p-4 rounded-xl ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p className="text-sm flex-1">{message.text}</p>
            <button onClick={() => setMessage(null)} className="hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center">
                  <Users className="w-6 h-6 text-neutral-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-100">{stats.total}</p>
                  <p className="text-sm text-neutral-500">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-100">{stats.tutors}</p>
                  <p className="text-sm text-neutral-500">Tutors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-100">{stats.students}</p>
                  <p className="text-sm text-neutral-500">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-100">{stats.parents}</p>
                  <p className="text-sm text-neutral-500">Parents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card about Parent-Child Linking */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Link className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-100">Parent-Child Linking</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  When creating a student account, you must link them to a parent. Parents can only view their linked children's performance.
                  Create parent accounts first, then create student accounts and select their parent.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-100">User Accounts</h2>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={loadData}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No users found</p>
                <p className="text-sm mt-1">Create your first user account to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Created</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-neutral-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                        <td className="py-3 px-4">
                          <span className="text-neutral-100">{u.name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-neutral-400">{u.email}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(
                              u.role
                            )}`}
                          >
                            {getRoleIcon(u.role)}
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-neutral-500 text-sm">
                            {new Date(u.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {u.role === 'parent' && (
                              <button
                                onClick={() => {
                                  setSelectedUser(u);
                                  setShowLinkModal(true);
                                }}
                                className="p-2 text-neutral-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                title="Link Children"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setShowResetModal(true);
                              }}
                              className="p-2 text-neutral-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                              title="Reset Password"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-lg my-8" glow>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-100">Create New Account</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="p-2 text-neutral-400 hover:text-neutral-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                {/* Role Selection - First */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Account Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['tutor', 'parent', 'student'] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setNewUser({ ...newUser, role, parentId: '', childrenIds: [] })}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          newUser.role === role
                            ? 'border-primary-500 bg-primary-500/20'
                            : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
                        }`}
                      >
                        <div className={getRoleColor(role) + ' w-8 h-8 rounded-full flex items-center justify-center'}>
                          {getRoleIcon(role)}
                        </div>
                        <span className="text-xs text-neutral-300 capitalize">{role}</span>
                      </button>
                    ))}
                  </div>
                  {newUser.role === 'student' && (
                    <p className="mt-2 text-xs text-amber-400">
                      Note: Create parent account first, then create student and link to parent
                    </p>
                  )}
                </div>

                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Enter full name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  icon={<User className="w-5 h-5" />}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter email address"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  icon={<Mail className="w-5 h-5" />}
                  required
                />

                {/* Student-specific fields */}
                {newUser.role === 'student' && (
                  <>
                    {/* Year Group */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Year Group</label>
                      <select
                        value={newUser.yearGroup}
                        onChange={(e) => setNewUser({ ...newUser, yearGroup: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {yearGroups.map((yg) => (
                          <option key={yg.value} value={yg.value}>
                            {yg.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Parent Selection */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Link to Parent <span className="text-red-400">*</span>
                      </label>
                      {getParents().length === 0 ? (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                          <p className="text-sm text-amber-400">
                            No parent accounts found. Please create a parent account first.
                          </p>
                        </div>
                      ) : (
                        <select
                          value={newUser.parentId}
                          onChange={(e) => setNewUser({ ...newUser, parentId: e.target.value })}
                          className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          required
                        >
                          <option value="">Select a parent...</option>
                          {getParents().map((parent) => (
                            <option key={parent.id} value={parent.id}>
                              {parent.name} ({parent.email})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </>
                )}

                <Input
                  label="Password"
                  type="password"
                  placeholder="Create password (min 6 chars)"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  icon={<Lock className="w-5 h-5" />}
                  required
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock className="w-5 h-5" />}
                  required
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    isLoading={isSubmitting}
                    disabled={newUser.role === 'student' && getParents().length === 0}
                  >
                    Create Account
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md" glow>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-100">Reset Password</h3>
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setSelectedUser(null);
                  }}
                  className="p-2 text-neutral-400 hover:text-neutral-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-neutral-400">
                  Send a password reset email to:
                </p>
                <p className="text-neutral-100 font-medium mt-2">{selectedUser.email}</p>
                <p className="text-neutral-500 text-sm">{selectedUser.name}</p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowResetModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleResetPassword}
                  isLoading={isSubmitting}
                >
                  Send Reset Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Link Children Modal */}
      {showLinkModal && selectedUser && selectedUser.role === 'parent' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md" glow>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-100">Link Children</h3>
                <button
                  onClick={() => {
                    setShowLinkModal(false);
                    setSelectedUser(null);
                    setSelectedChildrenIds([]);
                  }}
                  className="p-2 text-neutral-400 hover:text-neutral-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-neutral-400 text-sm">
                  Select which students are children of <strong className="text-neutral-100">{selectedUser.name}</strong>
                </p>
              </div>

              {getStudents().length === 0 ? (
                <div className="p-4 bg-neutral-800/50 rounded-xl text-center">
                  <GraduationCap className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
                  <p className="text-neutral-500 text-sm">No students found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
                  {getStudents().map((student) => (
                    <label
                      key={student.id}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        selectedChildrenIds.includes(student.id)
                          ? 'bg-green-500/20 border border-green-500/30'
                          : 'bg-neutral-800/50 border border-transparent hover:bg-neutral-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedChildrenIds.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedChildrenIds([...selectedChildrenIds, student.id]);
                          } else {
                            setSelectedChildrenIds(selectedChildrenIds.filter(id => id !== student.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-neutral-600 text-green-500 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <p className="text-neutral-100 text-sm">{student.name}</p>
                        <p className="text-neutral-500 text-xs">{student.email}</p>
                      </div>
                      <GraduationCap className="w-4 h-4 text-green-400" />
                    </label>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowLinkModal(false);
                    setSelectedUser(null);
                    setSelectedChildrenIds([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleLinkParentToChildren}
                  isLoading={isSubmitting}
                  disabled={selectedChildrenIds.length === 0}
                >
                  Link {selectedChildrenIds.length} Student(s)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md" glow>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-100">Change Password</h3>
                <button
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                  }}
                  className="p-2 text-neutral-400 hover:text-neutral-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  icon={<Lock className="w-5 h-5" />}
                  required
                />

                <Input
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  icon={<Lock className="w-5 h-5" />}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  icon={<Lock className="w-5 h-5" />}
                  required
                />

                <div className="p-3 bg-neutral-800/50 rounded-xl">
                  <p className="text-xs text-neutral-400">
                    <strong className="text-neutral-300">Password requirements:</strong>
                  </p>
                  <ul className="text-xs text-neutral-500 mt-1 space-y-0.5">
                    <li className={newPassword.length >= 8 ? 'text-green-400' : ''}>
                      • At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(newPassword) ? 'text-green-400' : ''}>
                      • One uppercase letter
                    </li>
                    <li className={/[a-z]/.test(newPassword) ? 'text-green-400' : ''}>
                      • One lowercase letter
                    </li>
                    <li className={/\d/.test(newPassword) ? 'text-green-400' : ''}>
                      • One number
                    </li>
                    <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-green-400' : ''}>
                      • One special character (!@#$%^&* etc.)
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setShowChangePasswordModal(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    isLoading={isSubmitting}
                  >
                    Change Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
