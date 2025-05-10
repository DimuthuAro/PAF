import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { interactionService, savedRecipeService, recipeService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RecipeCard = ({ recipe }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchLikeCount = async () => {
      try {
        const response = await interactionService.getInteractionCount(recipe.id, 'LIKE');
        setLikeCount(response.data);
      } catch (error) {
        console.error('Error fetching like count:', error);
        if (error.message.includes('CORS') || error.message.includes('Network Error')) {
          console.warn('Failed to fetch like count due to a network or CORS issue.');
        }
      }
    }; const checkUserInteractions = async () => {
    if (currentUser?.user?.id && recipe?.id) {
        try {
          // Check likes through interaction service
          const likeResponse = await interactionService.checkUserInteraction(
            currentUser.user.id,
            recipe.id,
            'LIKE'
          );
          setIsLiked(likeResponse.data);

          // Check if recipe is saved using savedRecipeService
          const isSaved = await savedRecipeService.isRecipeSaved(
            currentUser.user.id,
            recipe.id
          );
          setIsFavorite(isSaved);
        } catch (error) {
          console.error('Error checking user interactions:', error);
          if (error.message.includes('CORS') || error.message.includes('Network Error')) {
            console.warn('Failed to check user interactions due to a network or CORS issue.');
          }
          // Reset interaction states on error
          setIsLiked(false);
          setIsFavorite(false);
        }
      }
    };

    fetchLikeCount();
    if (currentUser) {
      checkUserInteractions();
    }
  }, [recipe.id, currentUser]);

  const handleLike = async () => {
    if (!currentUser?.user?.id) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    try {
      if (isLiked) {
        await interactionService.deleteTypeInteractions(recipe.id, 'LIKE');
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await interactionService.createLike(currentUser.user.id, recipe.id);
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Show error feedback to user
      alert('Failed to update like. Please try again.');
    }
  };
  const handleFavorite = async () => {
    if (!currentUser?.user?.id) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    try {
      if (!isFavorite) {
        // Save the recipe
        await savedRecipeService.saveRecipe(currentUser.user.id, recipe.id);
        setIsFavorite(true);

        // Show brief success message
        const successToast = document.createElement('div');
        successToast.className = 'fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
        successToast.textContent = 'Recipe saved!';
        document.body.appendChild(successToast);
        setTimeout(() => document.body.removeChild(successToast), 2000);
      } else {
        // Remove the recipe from saved collection
        await savedRecipeService.removeSavedRecipe(currentUser.user.id, recipe.id);
        setIsFavorite(false);

        // Show brief unsave message
        const successToast = document.createElement('div');
        successToast.className = 'fixed top-5 right-5 bg-gray-500 text-white px-4 py-2 rounded shadow-lg z-50';
        successToast.textContent = 'Recipe removed from saved';
        document.body.appendChild(successToast);
        setTimeout(() => document.body.removeChild(successToast), 2000);
      }
    } catch (error) {
      console.error('Error toggling saved recipe:', error);

      // Create an error toast
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed top-5 right-5 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      errorToast.textContent = typeof error === 'string' ? error : 'Failed to update saved status. Please try again.';
      document.body.appendChild(errorToast);
      setTimeout(() => document.body.removeChild(errorToast), 3000);
    }
  };

  const handleEditClick = () => {
    if (!currentUser?.user?.id) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    navigate(`/edit-recipe/${recipe.id}`, { state: { recipe } });
  };

  const handleDeleteComment = async (recipeId) => {
    if (!currentUser?.user?.id) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    await recipeService.deleteRecipe(recipeId)
    .then((response) => {
      console.log('Recipe deleted successfully:', response);
      alert('Recipe deleted successfully');
      window.location.reload();
    })  
  }

  const difficultyColor = {
    'EASY': 'bg-green-100 text-green-800',
    'MEDIUM': 'bg-yellow-100 text-yellow-800',
    'HARD': 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              <Link to={`/recipes/${recipe.id}`} className="hover:text-indigo-600">
                {recipe.title}
              </Link>
            </h2>
            {recipe.image && (
                              <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                            )}
            <p className="text-gray-500 text-sm mb-2">By {recipe.user?.name || 'Unknown'}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${difficultyColor[recipe.difficulty]}`}>
            {recipe.difficulty}
          </span>
        </div>
        
        <p className="text-gray-700 mb-4 line-clamp-2">{recipe.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <button 
                onClick={handleLike}
                className={`mr-1 focus:outline-none ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
                disabled={!currentUser}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="text-gray-600 text-sm">{likeCount}</span>
            </div>
            
            <button 
              onClick={handleFavorite}
              className={`focus:outline-none ${isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
              disabled={!currentUser}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
          <div className="mt-2 flex space-x-2 justify-end">
                  <button
                    onClick={() => handleEditClick(recipe.id)}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteComment(recipe.id)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;