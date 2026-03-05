import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutGrid, 
  Bell, 
  FileText, 
  ClipboardList, 
  FileCheck, 
  Users, 
  BarChart3 
} from 'lucide-react';
import '../styles/DesignSystem.css';
import './TabNavigation.css';

/**
 * ═══════════════════════════════════════════════════════
 * PREMIUM TAB NAVIGATION 2025
 * ═══════════════════════════════════════════════════════
 * Horizontal scrollable tabs with smooth indicator animation
 */

const TAB_CONFIG = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'announcements', label: 'Announcements', icon: Bell },
  { id: 'materials', label: 'Materials', icon: FileText },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  { id: 'tests', label: 'Tests', icon: FileCheck },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 }
];

export default function TabNavigation({ activeTab, onTabChange }) {
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabsRef = useRef({});
  const containerRef = useRef(null);

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeTabElement = tabsRef.current[activeTab];
    if (activeTabElement && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();
      
      setIndicatorStyle({
        left: tabRect.left - containerRect.left + containerRef.current.scrollLeft,
        width: tabRect.width
      });
    }
  }, [activeTab]);

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    
    // Scroll tab into view if needed
    const tabElement = tabsRef.current[tabId];
    if (tabElement && containerRef.current) {
      tabElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest', 
        inline: 'center' 
      });
    }
  };

  return (
    <div className="tab-navigation-premium">
      <div className="tab-container" ref={containerRef}>
        <div className="tab-list">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                ref={(el) => (tabsRef.current[tab.id] = el)}
                className={`tab-item ${isActive ? 'tab-active' : ''}`}
                onClick={() => handleTabClick(tab.id)}
                aria-selected={isActive}
                role="tab"
              >
                <Icon 
                  size={18} 
                  strokeWidth={2}
                  className="tab-icon" 
                />
                <span className="tab-label">{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Animated Indicator */}
        <div 
          className="tab-indicator"
          style={{
            transform: `translateX(${indicatorStyle.left}px)`,
            width: indicatorStyle.width
          }}
        />
      </div>
    </div>
  );
}
