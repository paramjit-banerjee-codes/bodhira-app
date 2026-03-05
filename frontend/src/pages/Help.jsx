import React from 'react';
import { HelpCircle, MessageCircle, BookOpen, Mail, ExternalLink } from 'lucide-react';
import './Help.css';

const Help = () => {
  return (
    <div className="help-page">
      <div className="help-container">
        <div className="help-header">
          <HelpCircle size={32} strokeWidth={2} />
          <div>
            <h1>Help & Support</h1>
            <p>Get help with using Bodhira AI</p>
          </div>
        </div>

        <div className="help-sections">
          <a href="mailto:support@bodhira.ai" className="help-card">
            <div className="help-card-header">
              <Mail size={24} />
              <h2>Email Support</h2>
            </div>
            <p>Get in touch with our support team</p>
            <span className="help-link">
              support@bodhira.ai
              <ExternalLink size={16} />
            </span>
          </a>

          <div className="help-card">
            <div className="help-card-header">
              <BookOpen size={24} />
              <h2>Documentation</h2>
            </div>
            <p>Browse our comprehensive guides and tutorials</p>
            <span className="help-link">
              View Docs
              <ExternalLink size={16} />
            </span>
          </div>

          <div className="help-card">
            <div className="help-card-header">
              <MessageCircle size={24} />
              <h2>Community Forum</h2>
            </div>
            <p>Join discussions with other educators and students</p>
            <span className="help-link">
              Visit Forum
              <ExternalLink size={16} />
            </span>
          </div>
        </div>

        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3>How do I create a test?</h3>
              <p>Navigate to "Generate Test" from the sidebar and follow the step-by-step wizard to create your test.</p>
            </div>
            <div className="faq-item">
              <h3>How do students join my test?</h3>
              <p>Share the unique test code with your students. They can enter it in the "Take Test" section.</p>
            </div>
            <div className="faq-item">
              <h3>Can I edit a test after publishing?</h3>
              <p>Currently, published tests cannot be edited. You can create a new version if changes are needed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
