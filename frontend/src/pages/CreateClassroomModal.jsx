import { useState } from 'react';
import { X } from 'lucide-react';
import './CreateClassroomModal.css';

export default function CreateClassroomModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: '',
    subject: 'Programming',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Classroom name is required';
    }
    if (formData.name.trim().length < 3) {
      newErrors.name = 'Classroom name must be at least 3 characters';
    }
    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate(formData);
      setFormData({
        name: '',
        subject: 'Programming',
        description: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="create-modal card">
        {/* Header */}
        <div className="modal-header">
          <h2>Create New Classroom</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="modal-close"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Classroom Name */}
          <div className="input-group">
            <label>Classroom Name *</label>
            <input
              type="text"
              name="name"
              disabled={isSubmitting}
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Advanced JavaScript"
              className={errors.name ? 'input-error' : ''}
            />
            <small>Enter a descriptive name for your classroom</small>
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>

          {/* Subject */}
          <div className="input-group">
            <label>Subject</label>
            <select
              name="subject"
              disabled={isSubmitting}
              value={formData.subject}
              onChange={handleChange}
              className={errors.subject ? 'input-error' : ''}
            >
              <option value="Programming">Programming</option>
              <option value="Web Development">Web Development</option>
              <option value="Data Science">Data Science</option>
              <option value="Machine Learning">Machine Learning</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="DevOps">DevOps</option>
              <option value="Other">Other</option>
            </select>
            {errors.subject && <p className="error-text">{errors.subject}</p>}
          </div>

          {/* Description */}
          <div className="input-group">
            <label>Description *</label>
            <textarea
              name="description"
              disabled={isSubmitting}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the classroom purpose, topics, and content..."
              rows="4"
              className={errors.description ? 'input-error' : ''}
            />
            <small>Minimum 10 characters to help students understand the classroom</small>
            {errors.description && <p className="error-text">{errors.description}</p>}
          </div>

          {/* Buttons */}
          <div className="modal-buttons">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? '⏳ Creating...' : '✨ Create Classroom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
