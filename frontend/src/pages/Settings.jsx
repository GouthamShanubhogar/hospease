import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const Settings = () => {
  const { user, token } = useAuth();
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'en',
    notify_email: true,
    notify_sms: true,
    notify_inapp: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch user settings
  const fetchSettings = useCallback(async () => {
    if (!user?.user_id || !token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5002/api/settings/${user.user_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data.preferences) {
          setSettings(prevSettings => ({
            ...prevSettings,
            ...data.data.preferences,
            ...data.data.notifications
          }));
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to load settings');
      }
    } catch (err) {
      setError('Error loading settings');
      console.error('Settings fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.user_id, token]);

  // Save settings
  const saveSettings = async (updatedSettings) => {
    if (!user?.user_id || !token) return;

    try {
      setSaving(true);
      const response = await fetch(`http://localhost:5002/api/settings/${user.user_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save settings');
      }
    } catch (err) {
      setError('Error saving settings');
      console.error('Settings save error:', err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user, token]);

  const handleSettingChange = (key, value) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    setSettings(newSettings);
  };

  const handleSave = () => {
    saveSettings(settings);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">Loading settings...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-700">{success}</p>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Preferences</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                disabled={saving}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Language</label>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                disabled={saving}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Notification Preferences</h3>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notify_email}
                  onChange={(e) => handleSettingChange('notify_email', e.target.checked)}
                  className="mr-2"
                  disabled={saving}
                />
                <span className="text-sm font-medium text-gray-600">Email Notifications</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notify_sms}
                  onChange={(e) => handleSettingChange('notify_sms', e.target.checked)}
                  className="mr-2"
                  disabled={saving}
                />
                <span className="text-sm font-medium text-gray-600">SMS Notifications</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notify_inapp}
                  onChange={(e) => handleSettingChange('notify_inapp', e.target.checked)}
                  className="mr-2"
                  disabled={saving}
                />
                <span className="text-sm font-medium text-gray-600">In-App Notifications</span>
              </label>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;