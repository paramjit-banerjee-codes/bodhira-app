import { FileText } from 'lucide-react';
import EmptyState from './EmptyState';

export default function MaterialsTab({ classroom, isTeacher }) {
  return (
    <EmptyState
      icon={FileText}
      title="Materials Coming Soon"
      description="Upload and share study materials, documents, and resources with your students. This feature will be available in a future update."
    />
  );
}
