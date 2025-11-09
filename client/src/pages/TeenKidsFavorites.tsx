import { Navigate } from 'react-router-dom';

const TeenKidsFavorites = () => {
  return <Navigate to="/favorites?audience=teen" replace />;
};

export default TeenKidsFavorites;

