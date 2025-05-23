import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { recipeService, interactionService, savedRecipeService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import FileUploadTester from '../components/FileUploadTester';

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await recipeService.getRecipeById(id);
        console.log("Recipe fetched successfully:", response.data);
        setRecipe(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recipe:', error);
        if (error.message.includes('CORS') || error.message.includes('Network Error')) {
          setError('Failed to load recipe due to a network or CORS issue. Please try again later.');
        } else {
          setError('Failed to load recipe. Please try again later.');
        }
        setLoading(false);
      }
    };

    const fetchLikeCount = async () => {
      try {
        const response = await interactionService.getInteractionCount(id, 'LIKE');
        setLikeCount(response.data);
      } catch (error) {
        console.error('Error fetching like count:', error);
        if (error.message.includes('CORS') || error.message.includes('Network Error')) {
          alert('Failed to fetch like count due to a network or CORS issue.');
        }
      }
    };

    const checkUserInteractions = async () => {
      if (currentUser) {
        try {
          // Check if user has liked the recipe
          const likeResponse = await interactionService.checkUserInteraction(
            currentUser.user.id,
            id,
            'LIKE'
          );
          setIsLiked(likeResponse.data);

          // Check if user has saved/bookmarked the recipe
          const isSaved = await savedRecipeService.isRecipeSaved(currentUser.user.id, id);
          setIsFavorite(isSaved);
        } catch (error) {
          console.error('Error checking user interactions:', error);
          if (error.message.includes('CORS') || error.message.includes('Network Error')) {
            console.warn('Failed to check user interactions due to a network or CORS issue.');
          }
        }
      }
    };

    fetchRecipe();
    fetchLikeCount();
    checkUserInteractions();
  }, [id, currentUser]);

  const handleLike = async () => {
    if (!currentUser) return;

    try {
      if (isLiked) {
        // Implement unlike functionality
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
        console.log("Like removed");
      } else {
        console.log("Attempting to like recipe with ID:", id);
        console.log("Current user ID:", currentUser.user.id);
        await interactionService.createLike(currentUser.user.id, id);
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        console.log("Like added");
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  const handleFavorite = async () => {
    if (!currentUser?.user?.id) {
      navigate('/login', { state: { from: `/recipes/${id}`, message: 'Please login to save recipes' } });
      return;
    }

    try {
      if (!isFavorite) {
        // Save recipe using savedRecipeService
        await savedRecipeService.saveRecipe(currentUser.user.id, id);
        setIsFavorite(true);

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
        successMessage.textContent = 'Recipe saved successfully!';
        document.body.appendChild(successMessage);

        // Remove message after 3 seconds
        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 3000);
      } else {
        // Remove saved recipe
        await savedRecipeService.removeSavedRecipe(currentUser.user.id, id);
        setIsFavorite(false);

        // Show removal message
        const removedMessage = document.createElement('div');
        removedMessage.className = 'fixed top-5 right-5 bg-gray-500 text-white px-4 py-2 rounded shadow-lg z-50';
        removedMessage.textContent = 'Recipe removed from saved';
        document.body.appendChild(removedMessage);

        // Remove message after 3 seconds
        setTimeout(() => {
          document.body.removeChild(removedMessage);
        }, 3000);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);

      // Create an error message with better feedback
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-5 right-5 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      errorMessage.textContent = typeof error === 'string' ? error : 'Failed to update saved recipe. Please try again.';
      document.body.appendChild(errorMessage);

      // Remove error message after 4 seconds
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 4000);
    }
  };

  const handleDelete = async () => {
    const recipeUserId = recipe.userID || recipe.userId;
    const currentUserId = currentUser?.user?.id;
    if (!currentUser || (recipe && recipeUserId !== currentUserId)) return;

    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await recipeService.deleteRecipe(id);
        navigate('/recipes');
      } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Failed to delete recipe. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-xl text-red-600 mb-4">{error || 'Recipe not found'}</div>
        <Link to="/recipes" className="text-indigo-600 hover:text-indigo-800">
          Back to Recipes
        </Link>
      </div>
    );
  } console.log("Recipe object being rendered:", recipe);

  // Parse the steps field into steps array (handling both uppercase and lowercase field names)
  const stepsContent = recipe.steps || recipe.Steps || '';
  console.log("Steps content:", stepsContent);
  const steps = stepsContent ? stepsContent.split(/\d+\./).filter(Boolean).map(step => step.trim()) : [];
  
  // Parse the tags field into tags array (handling both uppercase and lowercase field names)  
  const tagsContent = recipe.tags || recipe.Tags || '';
  const tags = tagsContent ? tagsContent.split(',').map(tag => tag.trim()) : [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex justify-between items-start">
              <div>                
                <div className="flex items-center mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 mr-3">{recipe.title || recipe.Title || "Untitled Recipe"}</h1>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {recipe.category || recipe.Category || "Uncategorized"}
                  </span>
                </div>
                <p className="text-gray-500">Recipe #{recipe.id}</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <button 
                    onClick={handleLike}
                    className={`mr-1 focus:outline-none ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
                    disabled={!currentUser}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <span className="text-gray-600">{likeCount}</span>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={handleFavorite}
                    className={`focus:outline-none flex items-center ${isFavorite ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-400 transition-colors`}
                    title={isFavorite ? "Remove from saved recipes" : "Save this recipe"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1 text-sm">
                      {isFavorite ? "Saved" : "Save"}
                    </span>
                  </button>
                </div>
              </div>
            </div>            {/* Recipe Media Section */}
            <div className="mt-6 space-y-4">              {/* Image Display */}
              {(recipe.image || recipe.Image) && (
                <div className="media-container">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Recipe Image</h3>
                  <img 
                    src={`http://localhost:8082${recipe.image || recipe.Image}`}
                    alt={recipe.title || recipe.Title || "Recipe Image"} 
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      console.error("Image failed to load:", e);
                      e.target.src = "https://via.placeholder.com/800x400?text=Image+Not+Available";
                      e.target.onerror = null; // Prevent infinite loop
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Source: {recipe.image || recipe.Image}</p>
                </div>
              )}

              {/* Video Display */}
              {(recipe.video || recipe.Video) && (
                <div className="media-container">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Recipe Video</h3>
                  <video
                    src={`http://localhost:8082${recipe.video || recipe.Video}`}
                    controls
                    className="w-full rounded-lg shadow-md"
                    preload="metadata"
                    onError={(e) => {
                      console.error("Video failed to load:", e);
                      e.target.poster = "https://via.placeholder.com/800x400?text=Video+Not+Available";
                      // Hide video controls if it fails to load
                      e.target.controls = false;
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <p className="text-xs text-gray-500 mt-1">Source: {recipe.video || recipe.Video}</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700">{recipe.description || recipe.Description || "No description available."}</p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span key={index} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Instructions</h2>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <ol className="list-decimal pl-5 space-y-2">
                    {steps.map((step, index) => (
                      <li key={index} className="text-gray-700">{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {currentUser && (recipe.userID === currentUser.user.id || recipe.userId === currentUser.user.id) && (
              <div className="mt-8 flex justify-end space-x-4">
                <Link
                  to={`/edit-recipe/${id}`}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Edit Recipe
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete Recipe
                </button>
              </div>
            )}
          </div>        </div>

        <CommentSection recipeId={id} />

        {/* File Upload Tester - Remove this in production */}
        <div className="mt-12 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Debug: File Upload System</h2>
          <FileUploadTester />
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;