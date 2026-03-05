import { Bell } from 'lucide-react';
import EmptyState from './EmptyState';

export default function AnnouncementsTab({ classroom, isTeacher }) {
  return (
    <EmptyState
      icon={Bell}
      title="Announcements Coming Soon"
      description="Share important updates and announcements with your class. This feature will be available in a future update."
    />
  );
}
