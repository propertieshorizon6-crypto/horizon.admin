// 📁 src/features/settings/pages/SettingsPage.jsx

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/useAuthStore';
import { getInitials } from '../../../utils/formatters';
import { fetchMyProfile } from '../api/settingsApi';
import PreferencesTab from '../components/PreferencesTab';
import ActivityTab from '../components/ActivityTab';
import SecurityTab from '../components/SecurityTab';
import EditProfileDrawer from '../components/EditProfileDrawer';
import { Clock, Phone } from 'lucide-react';

const TABS = ['Preferences', 'Activity', 'Security'];

function formatLastLogin(dateVal) {
  if (!dateVal) return 'Never';
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return 'Never';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Preferences');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch fresh profile on mount
  const { data: profileData } = useQuery({
    queryKey: ['my-profile'],
    queryFn: fetchMyProfile,
    staleTime: 5 * 60_000,
  });

  // Sync auth store when profile loads
  useEffect(() => {
    const u = profileData?.user;
    if (!u) return;
    updateUser({
      _id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      name: `${u.firstName} ${u.lastName}`.trim(),
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status,
      avatar: u.avatar,
      lastLoginAt: u.lastLoginAt,
      notificationPreferences: u.notificationPreferences,
    });
  }, [profileData]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayName =
    user?.name ??
    (user?.firstName
      ? `${user.firstName} ${user.lastName ?? ''}`.trim()
      : 'User');

  return (
    <div className="p-4 md:p-8 min-h-full bg-slate-50">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* ── Left Column ── */}
        <div className="flex flex-col gap-5">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-md">
              {getInitials(displayName)}
            </div>

            <h2 className="text-lg font-bold text-slate-900">{displayName}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{user?.email ?? ''}</p>
            <span className="mt-2 inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full capitalize">
              {user?.role ?? ''}
            </span>

            {/* Info rows */}
            <div className="w-full mt-5 space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="text-slate-400">✉</span>
                <span className="truncate">{user?.email ?? ''}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="text-slate-400">
                  <Phone />
                </span>
                <span>{user?.phone ?? '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="text-slate-400">
                  <Clock />
                </span>
                <span>Last login: {formatLastLogin(user?.lastLoginAt)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="text-slate-400">◎</span>
                <span>
                  Status:
                  <span
                    className={`ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      user?.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : user?.status === 'suspended'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {user?.status
                      ? user.status.charAt(0).toUpperCase() +
                        user.status.slice(1)
                      : 'Active'}
                  </span>
                </span>
              </div>
            </div>

            <button
              onClick={() => setDrawerOpen(true)}
              className="mt-5 w-full flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              <span>⚙</span> Edit Profile
            </button>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4">
              Account Info
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Member since</span>
                <span className="text-slate-700 font-medium">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Email verified</span>
                <span
                  className={`font-semibold ${user?.emailVerification ? 'text-green-600' : 'text-amber-500'}`}
                >
                  {user?.emailVerification ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Notifications</span>
                <span className="text-slate-700 font-medium">
                  {[
                    user?.notificationPreferences?.inApp && 'In-App',
                    user?.notificationPreferences?.email && 'Email',
                    user?.notificationPreferences?.push && 'Push',
                  ]
                    .filter(Boolean)
                    .join(', ') || 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Tab Bar */}
          <div className="flex border-b border-slate-100">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
                  activeTab === tab
                    ? 'text-slate-900'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-slate-900 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'Preferences' && <PreferencesTab />}
            {activeTab === 'Activity' && <ActivityTab />}
            {activeTab === 'Security' && <SecurityTab />}
          </div>
        </div>
      </div>

      {/* Edit Profile Drawer */}
      <EditProfileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
