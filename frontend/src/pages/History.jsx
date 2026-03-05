import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  FileText,
  CheckCircle,
  Trophy,
  Clock,
  RefreshCw,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';
import StatsCard from '../components/StatsCard';
import TestsCreatedTable from '../components/TestsCreatedTable';
import TestsAttemptedTable from '../components/TestsAttemptedTable';
import './History.css';

export default function History() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [data, setData] = useState({ attemptedTests: null, createdTests: null });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const attemptedTests = data?.attemptedTests || [];
  const createdTests = data?.createdTests || [];

  // Stats calculation
  const stats = {
    totalCreated: createdTests.length,
    totalAttempted: attemptedTests.length,
    averageScore: attemptedTests.length > 0 
      ? Math.round(attemptedTests.reduce((sum, t) => sum + (t.percentage || 0), 0) / attemptedTests.length)
      : 0,
    totalTimeSpent: attemptedTests.length * 30, // Assume 30min per test
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}.${mins}h`;
  };

  const fetchHistory = useCallback(async (signal) => {
    try {
      const response = await profileAPI.getProfile(signal);
      const responseData = response.data?.data;
      
      console.log('📚 History API Response:', response.data);
      console.log('📚 Extracted data:', responseData);
      
      // Handle both response formats
      const attempted = Array.isArray(responseData?.attemptedTests) ? responseData.attemptedTests : [];
      const created = Array.isArray(responseData?.createdTests) ? responseData.createdTests : [];
      
      console.log('📚 Attempted Tests:', attempted);
      console.log('📚 Created Tests:', created);
      
      // Update state - arrays are now loaded (either with data or empty)
      setData({
        attemptedTests: attempted,
        createdTests: created
      });
      setIsRefreshing(false);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Failed to fetch history:', error);
      }
      
      // On error, set empty arrays so skeleton hides and shows empty state
      setData({ attemptedTests: [], createdTests: [] });
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    fetchHistory(abortController.signal);
    
    return () => abortController.abort();
  }, [fetchHistory]);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const refetchHistory = async () => {
    setIsRefreshing(true);
    const abortController = new AbortController();
    await fetchHistory(abortController.signal);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const abortController = new AbortController();
      await profileAPI.deleteAllHistory();
      
      // Clear data immediately
      setData({ attemptedTests: [], createdTests: [] });
      setShowDeleteConfirm(false);
      
      // Wait a moment then refetch fresh data
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsRefreshing(true);
      await fetchHistory(abortController.signal);
      
      console.log('✅ All history deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete history:', error);
      setShowDeleteConfirm(false);
      
      // Still try to refetch to get fresh data
      const abortController = new AbortController();
      setIsRefreshing(true);
      await fetchHistory(abortController.signal);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;

    try {
      // Call API to delete test
      await fetch(`http://localhost:5000/api/history/test/${testId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Update local state
      setData(prev => ({
        ...prev,
        createdTests: prev.createdTests.filter(test => test._id !== testId)
      }));
    } catch (error) {
      console.error('Error deleting test:', error);
      alert('Failed to delete test');
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const getFilteredCreatedTests = () => {
    let filtered = [...createdTests];
    
    if (searchQuery) {
      filtered = filtered.filter(test => 
        test.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.testCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.topic?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getFilteredAttemptedTests = () => {
    let filtered = [...attemptedTests];
    
    if (searchQuery) {
      filtered = filtered.filter(test => 
        test.testCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.topic?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  // Guard: keep skeleton until BOTH arrays are populated (not null)
  // Don't check loading state - only check if data is ready
  if (data?.attemptedTests === null || data?.createdTests === null) {
    return (
      <div className="history-container">
        <div className="loading-state">
          <RefreshCw size={48} strokeWidth={2} className="loading-spinner" />
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      {/* Page Header */}
      <div className="history-header">
        <div className="history-header-left">
          <BookOpen size={40} strokeWidth={2} className="text-purple-400" />
          <h1 className="history-title">History</h1>
        </div>

        <div className="history-header-actions">
          <button 
            className="header-action-button" 
            onClick={refetchHistory}
            disabled={isRefreshing}
          >
            <RefreshCw size={18} strokeWidth={2} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {(attemptedTests.length > 0 || createdTests.length > 0) && (
            <button 
              className="header-action-button delete-all" 
              onClick={handleDeleteClick}
              disabled={deleting}
            >
              <Trash2 size={18} strokeWidth={2} className="text-red-400" />
              <span>{deleting ? 'Deleting...' : 'Delete All History'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <StatsCard
          icon={FileText}
          value={stats.totalCreated}
          label="Tests Created"
          gradient="linear-gradient(135deg, #3B82F6, #60A5FA)"
          change="+5 this week"
          isPositive={true}
        />

        <StatsCard
          icon={CheckCircle}
          value={stats.totalAttempted}
          label="Tests Attempted"
          gradient="linear-gradient(135deg, #10B981, #34D399)"
          change="+3 this week"
          isPositive={true}
        />

        <StatsCard
          icon={Trophy}
          value={`${stats.averageScore}%`}
          label="Average Score"
          gradient="linear-gradient(135deg, #F59E0B, #FBBF24)"
          change="+8% improvement"
          isPositive={true}
        />

        <StatsCard
          icon={Clock}
          value={formatTime(stats.totalTimeSpent)}
          label="Study Time"
          gradient="linear-gradient(135deg, #8B5CF6, #A78BFA)"
          change="+45min this week"
          isPositive={true}
        />
      </div>

      {/* Filters & Search */}
      <div className="filters-container">
        <div className="search-input-container">
          <Search size={20} strokeWidth={2} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search tests by name, code, or topic..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="filter-dropdown-container">
          <button 
            className="filter-button"
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <Filter size={20} strokeWidth={2} />
            <span>
              {filterType === 'all' ? 'All Tests' : 
               filterType === 'created' ? 'Created' : 'Attempted'}
            </span>
            <ChevronDown size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="filter-dropdown-container">
          <button 
            className="filter-button"
            onClick={() => setShowSortDropdown(!showSortDropdown)}
          >
            <ArrowUpDown size={20} strokeWidth={2} />
            <span>
              {sortBy === 'recent' ? 'Most Recent' : 
               sortBy === 'oldest' ? 'Oldest First' : 'Highest Score'}
            </span>
            <ChevronDown size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Tests Created Section */}
      <div className="history-section">
        <div className="section-header">
          <FileText size={28} strokeWidth={2} className="text-blue-400" />
          <h2 className="section-title">Tests Created</h2>
        </div>

        <TestsCreatedTable
          tests={getFilteredCreatedTests()}
          loading={false}
          onDelete={handleDeleteTest}
        />
      </div>

      {/* Tests Attempted Section */}
      <div className="history-section">
        <div className="section-header">
          <CheckCircle size={28} strokeWidth={2} className="text-green-400" />
          <h2 className="section-title">Tests Attempted</h2>
        </div>

        <TestsAttemptedTable
          tests={getFilteredAttemptedTests()}
          loading={false}
        />
      </div>

      {/* Delete All History Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete All History?"
        message="This will permanently delete all your test history including created and attempted tests. This action cannot be undone."
        confirmText="Delete All"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={deleting}
        isDangerous={true}
      />
    </div>
  );
}
