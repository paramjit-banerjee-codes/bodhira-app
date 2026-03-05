import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <SettingsIcon size={32} strokeWidth={2} />
          <div>
            <h1>Settings</h1>
            <p>Manage your account preferences and settings</p>
          </div>
        </div>

        <div className="settings-sections">
          <div className="settings-card">
            <div className="settings-card-header">
              <User size={24} />
              <h2>Account Settings</h2>
            </div>
            <p>Update your profile information and preferences</p>
          </div>

          <div className="settings-card">
            <div className="settings-card-header">
              <Bell size={24} />
              <h2>Notifications</h2>
            </div>
            <p>Manage your notification preferences</p>
          </div>

          <div className="settings-card">
            <div className="settings-card-header">
              <Shield size={24} />
              <h2>Privacy & Security</h2>
            </div>
            <p>Control your privacy settings and security options</p>
          </div>

          <div className="settings-card">
            <div className="settings-card-header">
              <CreditCard size={24} />
              <h2>Billing & Subscription</h2>
            </div>
            <p>Manage your subscription and payment methods</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
