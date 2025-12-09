import { useState, useEffect } from 'react';
import { getCurrentUserProfile } from '@/utils/buddypress/api';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';

const BuddyPressSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    activityNotifications: true,
    friendRequestNotifications: true,
    messageNotifications: true,
    groupNotifications: true,
  });

  useEffect(() => {
    // In a real implementation, you would fetch user settings from BuddyPress
    // For now, we'll just load the profile to ensure the user is authenticated
    const loadSettings = async () => {
      try {
        await getCurrentUserProfile();
        // Load saved settings from localStorage or API
        const savedSettings = localStorage.getItem('buddypress-settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      // In a real implementation, you would save settings via BuddyPress API
      // For now, we'll save to localStorage
      localStorage.setItem('buddypress-settings', JSON.stringify(settings));
      alert('Settings saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="woocommerce-MyAccount-content">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-6">BuddyPress Account Settings</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <div>
                  <span className="font-medium text-gray-900">Activity Updates</span>
                  <p className="text-sm text-gray-600">Receive email notifications for activity updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.activityNotifications}
                  onChange={(e) =>
                    setSettings({ ...settings, activityNotifications: e.target.checked })
                  }
                  className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <div>
                  <span className="font-medium text-gray-900">Friend Requests</span>
                  <p className="text-sm text-gray-600">Receive email notifications for friend requests</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.friendRequestNotifications}
                  onChange={(e) =>
                    setSettings({ ...settings, friendRequestNotifications: e.target.checked })
                  }
                  className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <div>
                  <span className="font-medium text-gray-900">Private Messages</span>
                  <p className="text-sm text-gray-600">Receive email notifications for new messages</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.messageNotifications}
                  onChange={(e) =>
                    setSettings({ ...settings, messageNotifications: e.target.checked })
                  }
                  className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <div>
                  <span className="font-medium text-gray-900">Group Updates</span>
                  <p className="text-sm text-gray-600">Receive email notifications for group activities</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.groupNotifications}
                  onChange={(e) =>
                    setSettings({ ...settings, groupNotifications: e.target.checked })
                  }
                  className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> These settings control your BuddyPress notification preferences. 
          Some settings may also be managed from your WordPress profile settings.
        </p>
      </div>
    </div>
  );
};

export default BuddyPressSettings;


