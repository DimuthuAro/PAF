import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RecipeForm from '../components/RecipeForm';
import { useAuth } from '../context/AuthContext';
import { recipeService } from '../services/api';
import { FiSave, FiX, FiCamera, FiVideo, FiTag, FiBook, FiList, FiFileText, FiGrid } from 'react-icons/fi';

const EditRecipePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await recipeService.getRecipeById(id);
        setRecipe(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recipe:', error);
        setError('Failed to load recipe. Please try again later.');
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  useEffect(() => {
    // Check if the user is not the owner of the recipe
    if (!authLoading && !loading && currentUser && recipe && recipe.user?.id !== currentUser.id) {
      navigate(`/recipes/${id}`, { state: { message: 'You can only edit your own recipes' } });
    }

    // Redirect to login if not authenticated
    if (!authLoading && !currentUser) {
      navigate('/login', { state: { from: `/edit-recipe/${id}`, message: 'Please login to edit a recipe' } });
    }
  }, [authLoading, currentUser, loading, recipe, id, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-xl text-red-600 mb-4">{error}</div>
        <button
          onClick={() => navigate('/recipes')}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Back to Recipes
        </button>
      </div>
    );
  }

  if (!recipe || !currentUser) {
    return null; // Will redirect due to useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="overflow-hidden shadow-xl rounded-lg border border-indigo-100">
            <div className="relative">
              <div className="absolute inset-0 h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              <div className="relative px-6 pt-32 pb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Fabulous Recipe</h1>
                <p className="text-gray-500 mb-6">Share your culinary masterpiece with the world</p>
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}
                <RecipeForm recipe={recipe} isEditing={true} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRecipePage;