import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeService, categoryService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiSave, FiX, FiCamera, FiVideo, FiTag, FiBook, FiList, FiFileText, FiGrid, FiUpload, FiPlus } from 'react-icons/fi';
import MediaOptimizer from '../components/MediaOptimizer';

const CreateRecipePage = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate(); const [newRecipe, setNewRecipe] = useState({
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
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');

  const [categories, setCategories] = useState([]);
  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  useEffect(() => {
    console.log("Current User in CreateRecipePage:", currentUser?.user?.id);
    setNewRecipe(prev => ({
      ...prev,
      userID: currentUser?.user?.id ? currentUser.user.id : null
    }));

    if (!loading && !currentUser) {
      navigate('/login', { state: { from: '/create-recipe', message: 'Please login to create a recipe' } });
    }

    // Fetch all categories
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await categoryService.getAllCategories();
        setCategories(response.data);
        console.log('Categories loaded:', response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [currentUser, loading, navigate]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecipe((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match('image.*')) {
      setError("Please select an image file (jpg, png, etc)");
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image file size should be less than 5MB");
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match('video.*')) {
      setError("Please select a video file (mp4, mov, etc)");
      return;
    }

    // Check file size (limit to 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError("Video file size should be less than 50MB");
      return;
    }

    setVideoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoPreview(reader.result);
    };
    reader.readAsDataURL(file);
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
      // If user selected "Other" and entered a new category, create that category first
      if (isOtherCategory && newCategory.trim()) {
        try {
          console.log("Creating new category:", newCategory);
          // Check if the category already exists
          const existingCategories = categories.map(cat => cat.name.toLowerCase());

          if (!existingCategories.includes(newCategory.toLowerCase())) {
            // Create the new category
            const categoryResponse = await categoryService.createCategory({
              name: newCategory,
              description: `Category created from recipe submission by ${currentUser.user.name || 'user'}`
            });

            console.log("New category created:", categoryResponse.data);

            // Add the new category to the local state
            setCategories([...categories, categoryResponse.data]);
          }
        } catch (categoryError) {
          console.error("Error creating new category:", categoryError);
          // Continue with recipe submission even if category creation fails
          // The backend will handle it as a string category
        }
      }

      // Create a FormData object to handle file uploads
      const formData = new FormData();

      // Append all text fields
      Object.keys(newRecipe).forEach(key => {
        formData.append(key, newRecipe[key]);
      });

      // Append the files if they exist
      if (imageFile) {
        formData.append('imageFile', imageFile);
      }

      if (videoFile) {
        formData.append('videoFile', videoFile);
      }

      formData.append('userId', currentUser.user.id);
      formData.append('createdAt', new Date().toISOString());

      console.log("Recipe Data Prepared for Backend");

      const response = await recipeService.createRecipeWithFiles(formData);
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
                    </div>                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center mb-2">
                        <FiGrid className="text-blue-500 mr-2 text-xl" />
                        <label htmlFor="category" className="block text-sm font-medium text-blue-700">
                          Category
                        </label>
                      </div>

                      {loadingCategories ? (
                        <div className="flex items-center justify-center py-2">
                          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-2 text-sm text-blue-700">Loading categories...</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <select
                            id="category"
                            name="category"
                              value={isOtherCategory ? "other" : newRecipe.category}
                              onChange={(e) => {
                                if (e.target.value === "other") {
                                  setIsOtherCategory(true);
                                  // Keep the current category if it's a custom one
                                  setNewCategory(newRecipe.category || "");
                                } else {
                                  setIsOtherCategory(false);
                                  setNewRecipe({
                                    ...newRecipe,
                                    category: e.target.value
                                  });
                                }
                              }}
                              required
                              className="mt-1 block w-full rounded-md border-blue-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                            >
                              <option value="">Select a category</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.name}>
                                  {category.name}
                                </option>
                              ))}
                              <option value="other">Other (Create new category)</option>
                            </select>

                            {isOtherCategory && (
                              <div className="mt-2 relative">
                                <input
                                  type="text"
                                  id="newCategory"
                                  value={newCategory}
                                  onChange={(e) => {
                                    setNewCategory(e.target.value);
                                    setNewRecipe({
                                      ...newRecipe,
                                      category: e.target.value
                                    });
                                  }}
                                  placeholder="Enter new category name"
                                  className="block w-full rounded-md border-blue-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all pr-20"
                                  required={isOtherCategory}
                                />
                              <div className="absolute inset-y-0 right-0 flex items-center">
                                <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mr-2">
                                  <FiPlus className="mr-1" /> New
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div><div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-lg border border-purple-100 shadow-sm transition-all hover:shadow-md">
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
                    </div>                    <div className="bg-gradient-to-r from-pink-50 to-red-50 p-5 rounded-lg border border-pink-100 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center mb-2">
                        <FiCamera className="text-pink-500 mr-2 text-xl" />
                        <label htmlFor="image" className="block text-sm font-medium text-pink-700">
                          Recipe Image
                        </label>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => imageInputRef.current.click()}
                            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-md flex items-center hover:from-pink-600 hover:to-rose-600 transition-all"
                          >
                            <FiUpload className="mr-2" /> Upload Image
                          </button>
                          <span className="text-sm text-gray-500">or</span>
                          <input
                            type="url"
                            id="image"
                            name="image"
                            value={newRecipe.image}
                            onChange={handleInputChange}
                            className="flex-1 rounded-md border-pink-300 bg-white shadow-sm focus:border-red-500 focus:ring-red-500 transition-all"
                            placeholder="Paste image URL"
                          />
                        </div>
                        <input
                          type="file"
                          ref={imageInputRef}
                          onChange={handleImageChange}
                          accept="image/*"
                          className="hidden"
                        />
                        {imagePreview && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                            <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden border border-pink-200">
                              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  setImagePreview('');
                                  setImageFile(null);
                                  imageInputRef.current.value = '';
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <FiX />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {imageFile?.name} ({Math.round(imageFile?.size / 1024)} KB)
                            </p>
                          </div>
                        )}
                      </div>                    </div>

                    {/* Media Optimizer - only displayed when files are selected */}
                    {(imageFile || videoFile) && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100 shadow-sm transition-all hover:shadow-md">
                        <MediaOptimizer
                          imageFile={imageFile}
                          videoFile={videoFile}
                        />
                      </div>
                    )}

                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-lg border border-amber-100 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center mb-2">
                        <FiVideo className="text-amber-500 mr-2 text-xl" />
                        <label htmlFor="video" className="block text-sm font-medium text-amber-700">
                          Recipe Video
                        </label>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => videoInputRef.current.click()}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-md flex items-center hover:from-amber-600 hover:to-orange-600 transition-all"
                          >
                            <FiUpload className="mr-2" /> Upload Video
                          </button>
                          <span className="text-sm text-gray-500">or</span>
                          <input
                            type="url"
                            id="video"
                            name="video"
                            value={newRecipe.video}
                            onChange={handleInputChange}
                            className="flex-1 rounded-md border-amber-300 bg-white shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-all"
                            placeholder="Paste video URL"
                          />
                        </div>
                        <input
                          type="file"
                          ref={videoInputRef}
                          onChange={handleVideoChange}
                          accept="video/*"
                          className="hidden"
                        />
                        {videoPreview && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                            <div className="relative w-full rounded-md overflow-hidden border border-amber-200">
                              <video
                                src={videoPreview}
                                controls
                                className="w-full max-h-48"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setVideoPreview('');
                                  setVideoFile(null);
                                  videoInputRef.current.value = '';
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <FiX />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {videoFile?.name} ({Math.round(videoFile?.size / (1024 * 1024))} MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </div><div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-5 rounded-lg border border-cyan-100 shadow-sm transition-all hover:shadow-md">
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