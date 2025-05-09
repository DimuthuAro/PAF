import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiSave, FiX, FiCamera, FiVideo, FiTag, FiBook, FiList, FiFileText, FiGrid } from 'react-icons/fi';

const CreateRecipePage = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    description: '',
    category: '',
    steps: '',
    image: '',
    video: '',
    tags: '',
    userID: currentUser.user.id ? currentUser.user.id : null
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Current User in CreateRecipePage:", currentUser.user.id);
    setNewRecipe
      (prev => ({
        ...prev,
        userID: currentUser.user.id ? currentUser.user.id : null
      }));
    if (!loading && !currentUser) {
      navigate('/login', { state: { from: '/create-recipe', message: 'Please login to create a recipe' } });
    }
  }, [currentUser, loading, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecipe((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Added validation for description length in handleSubmit
    if (newRecipe.description.length < 10) {
      setError("Description must be at least 10 characters long.");
      setSubmitting(false);
      return;
    }

    try {
      const recipeData = {
        ...newRecipe,
        userId: currentUser.id,
        createdAt: new Date().toISOString()
      };

      console.log("Recipe Data Sent to Backend:", recipeData);

      const response = await recipeService.createRecipe(recipeData);
      navigate('/'); // Navigate back to homepage after creating recipe
    } catch (error) {
      console.error("Error creating recipe:", error);
      setError("Failed to create recipe. Please try again.");
      setSubmitting(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex justify-center items-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-300 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-b-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
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
                <div className="absolute top-0 transform -translate-y-1/2">

                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Fabulous Recipe</h1>
                <p className="text-gray-500 mb-6">Share your culinary masterpiece with the world</p>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="space-y-8">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-lg border border-indigo-100 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center mb-2">
                        <FiFileText className="text-indigo-500 mr-2 text-xl" />
                        <label htmlFor="title" className="block text-sm font-medium text-indigo-700">
                          Recipe Title
                        </label>
                      </div>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={newRecipe.title}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-indigo-300 bg-white shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-all"
                        placeholder="Give your recipe a title"
                      />
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center mb-2">
                        <FiGrid className="text-blue-500 mr-2 text-xl" />
                        <label htmlFor="category" className="block text-sm font-medium text-blue-700">
                          Category
                        </label>
                      </div>
                      <input
                        type="text"
                        id="category"
                        name="category"
                        value={newRecipe.category}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-blue-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                        placeholder="e.g., Italian, Asian, Dessert"
                      />
                    </div>                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-lg border border-purple-100 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center mb-2">
                        <FiFileText className="text-purple-500 mr-2 text-xl" />
                        <label htmlFor="description" className="block text-sm font-medium text-purple-700">
                          Description
                        </label>
                      </div>
                      <textarea
                        id="description"
                        name="description"
                        value={newRecipe.description}
                        onChange={handleInputChange}
                        rows={6}
                        required
                        className="mt-1 block w-full rounded-md border-purple-300 bg-white shadow-sm focus:border-pink-500 focus:ring-pink-500 transition-all"
                        placeholder="Write your recipe description here..."
                      />
                    </div>

                    <div className="bg-gradient-to-r from-teal-50 to-green-50 p-5 rounded-lg border border-teal-100 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center mb-2">
                        <FiList className="text-teal-500 mr-2 text-xl" />
                        <label htmlFor="steps" className="block text-sm font-medium text-teal-700">
                          Steps
                        </label>
                      </div>
                      <textarea
                        id="steps"
                        name="steps"
                        value={newRecipe.steps}
                        onChange={handleInputChange}
                        rows={6}
                        required
                        className="mt-1 block w-full rounded-md border-teal-300 bg-white shadow-sm focus:border-green-500 focus:ring-green-500 transition-all"
                        placeholder="Write the steps for your recipe here..."
                      />
                    </div>
                    <div className="bg-gradient-to-r from-pink-50 to-red-50 p-5 rounded-lg border border-pink-100 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center mb-2">
                        <FiCamera className="text-pink-500 mr-2 text-xl" />
                        <label htmlFor="image" className="block text-sm font-medium text-pink-700">
                          Image URL (optional)
                        </label>
                      </div>
                      <input
                        type="url"
                        id="image"
                        name="image"
                        value={newRecipe.image}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-pink-300 bg-white shadow-sm focus:border-red-500 focus:ring-red-500 transition-all"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-lg border border-amber-100 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center mb-2">
                        <FiVideo className="text-amber-500 mr-2 text-xl" />
                        <label htmlFor="video" className="block text-sm font-medium text-amber-700">
                          Video URL (optional)
                        </label>
                      </div>
                      <input
                        type="text"
                        id="video"
                        name="video"
                        value={newRecipe.video}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-amber-300 bg-white shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-all"
                        placeholder="https://example.com/video.mp4"
                      />
                    </div>                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-5 rounded-lg border border-cyan-100 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center mb-2">
                        <FiTag className="text-cyan-500 mr-2 text-xl" />
                        <label htmlFor="tags" className="block text-sm font-medium text-cyan-700">
                          Tags (optional, comma-separated)
                        </label>
                      </div>
                      <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={newRecipe.tags}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-cyan-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                        placeholder="e.g., healthy, quick, vegetarian"
                      />
                    </div>

                    <div className="flex justify-end space-x-4 mt-8">
                      <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="flex items-center px-6 py-3 border border-red-300 shadow-sm text-base font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                      >
                        <FiX className="mr-2 text-red-500" /> Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className={`flex items-center px-6 py-3 border border-transparent shadow-md text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                      >
                        <FiSave className="mr-2" /> {submitting ? 'Creating...' : 'Create Recipe'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRecipePage;