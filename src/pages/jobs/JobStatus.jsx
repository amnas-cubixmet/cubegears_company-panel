
import { Navigate, useParams } from 'react-router-dom';

export const JobStatus = () => {
  const { id } = useParams();
  return <Navigate to={`/jobs/${id}/overview`} replace />;
};

export default JobStatus;
