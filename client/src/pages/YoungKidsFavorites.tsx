import { Navigate } from 'react-router-dom';

const YoungKidsFavorites = () => {
  return <Navigate to="/favorites?audience=young" replace />;
};

export default YoungKidsFavorites;

