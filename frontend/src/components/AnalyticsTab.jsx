import ClassroomAnalytics from './ClassroomAnalytics';
import '../pages/GenerateTest.css';

export default function AnalyticsTab({ classroom, isTeacher }) {
  return <ClassroomAnalytics classroom={classroom} isTeacher={isTeacher} />;
}
