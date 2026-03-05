import { ClipboardList } from 'lucide-react';
import EmptyState from './EmptyState';

export default function AssignmentsTab({ classroom, isTeacher }) {
  return (
    <EmptyState
      icon={ClipboardList}
      title="Assignments Coming Soon"
      description="Create and manage assignments for your students. Track submissions and provide feedback. This feature will be available in a future update."
    />
  );
}
