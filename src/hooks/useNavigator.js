import { useNavigate } from 'react-router-dom';

const useNavigator = () => {
  const navigate = useNavigate();
  return (path) => navigate(path);
};

export default useNavigator;
