import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeForm from '../components/RecipeForm';
import { useAuth } from '../context/AuthContext';

const CreateRecipePage = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login', { state: { from: '/create-recipe', message: 'Please login to create a recipe' } });
    }
  }, [currentUser, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect due to useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="px-6 py-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Recipe</h1>
              <RecipeForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRecipePage; 