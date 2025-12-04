import { useParams } from 'react-router-dom';
import GenerateTest from './GenerateTest';

const ClassroomGenerateTest = () => {
  const { id: classroomId } = useParams();
  
  console.log('ClassroomGenerateTest: classroomId from URL =', classroomId);

  return <GenerateTest classroomId={classroomId} />;
};

export default ClassroomGenerateTest;
