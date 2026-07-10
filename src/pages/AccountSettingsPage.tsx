import { useState } from 'react';
import { Tabs } from '../shared/ui/Tabs';
import { Card } from '../shared/ui/Card';
import { Input } from '../shared/ui/Input';
import { Button } from '../shared/ui/Button';
import { Icon } from '../shared/Icon';
import { Avatar } from '../shared/ui/Avatar';
import { ThemeSelector } from '../components/ThemeSelector';
import { getSession } from '../shared/auth';
import toast from 'react-hot-toast';

export function AccountSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const session = getSession();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <Icon className="size-4" name="user" /> },
    { id: 'security', label: 'Security', icon: <Icon className="size-4" name="lock" /> },
    { id: 'appearance', label: 'Appearance', icon: <Icon className="size-4" name="palette" /> }
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
        <p className="mt-2 text-sm text-slate-500">Manage your account settings and preferences</p>
      </header>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underline" />

      <div className="mt-8">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'appearance' && <AppearanceTab />}
      </div>
    </div>
  );
}

function ProfileTab() {
  const session = getSession();
  const [firstName, setFirstName] = useState(session?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(session?.name?.split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState(session?.email || '');

  const handleSave = () => {
    toast.success('Profile updated successfully');
  };

  return (
    <Card>
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Profile Information</h2>
          <p className="text-sm text-slate-500">Update your personal information and profile picture</p>
        </div>

        <div className="flex items-start gap-6">
          <div className="shrink-0">
            <Avatar
              name={session?.name || 'User'}
              size="xl"
              className="ring-4 ring-slate-100"
            />
          </div>

          <div className="flex-1">
            <button
              type="button"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              <Icon className="size-4 inline mr-2" name="upload" />
              Change Avatar
            </button>
            <p className="mt-2 text-xs text-slate-500">
              JPG, PNG or GIF. Max size 2MB.
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              First Name
            </label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jorge"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Last Name
            </label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Moreno"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" name="envelope" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              placeholder="jorge.moreno@autozone.com"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button variant="ghost">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            <Icon className="size-4" name="save" />
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-indigo-100">
              <Icon className="size-6 text-indigo-600" name="shield" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Secure Password Management</h3>
              <p className="text-sm text-slate-600 mb-4">
                Your password is managed through the ALLDATA central authentication system.
                To reset or change your password, please use the official ALLDATA password recovery portal.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Icon className="size-5 text-green-600" name="check" />
                  <span>Secure password reset via email verification</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Icon className="size-5 text-green-600" name="check" />
                  <span>Centralized account management across all ALLDATA tools</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Icon className="size-5 text-green-600" name="check" />
                  <span>Enhanced security protocols and encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Need to change your password?</h3>
            <p className="text-sm text-slate-500 mb-4">
              Visit the ALLDATA password recovery portal to reset or update your password securely.
            </p>
          </div>

          <Button variant="primary" size="lg">
            <Icon className="size-5" name="external" />
            Reset Password
          </Button>

          <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-200 p-4">
            <Icon className="size-5 text-blue-600 shrink-0 mt-0.5" name="info" />
            <p className="text-sm text-blue-800">
              After resetting your password, you will need to sign in again with your new credentials.
              Your session will remain active until you log out or your password is changed.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AppearanceTab() {
  return (
    <Card>
      <ThemeSelector />
    </Card>
  );
}
