import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recipeService, eventService, userService, categoryService } from '../services/api';
import RecipeCard from '../components/RecipeCard';

const HomePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [events, setEvents] = useState([]);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventsError, setEventsError] = useState(null);
  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState([]);

  // Recipe modal states
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    description: '',
    steps: '',
    category: '',
    tags: ''
  });
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submittingRecipe, setSubmittingRecipe] = useState(false);
  const [recipeError, setRecipeError] = useState(null);

  const handlePostSubmit = () => {
    if (postContent.trim()) {
      setPosts([{ content: postContent, id: Date.now(), likes: 0, comments: [] }, ...posts]);
      setPostContent('');
    }
  };

  const handleLike = (postId) => {
    setPosts(
      posts.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  // Fetch categories for recipe creation
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoryService.getAllCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setRecipeError('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Handle recipe input changes
  const handleRecipeInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecipe(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle recipe form submission
  const handleRecipeSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!newRecipe.title.trim() || !newRecipe.description.trim() || !newRecipe.steps.trim()) {
      setRecipeError('Please fill in all required fields');
      return;
    }

    try {
      setSubmittingRecipe(true);
      setRecipeError(null);

      // Create FormData for the recipe
      const formData = new FormData();
      Object.keys(newRecipe).forEach(key => {
        formData.append(key, newRecipe[key]);
      });

      // Submit the recipe
      const response = await recipeService.createRecipeWithFiles(formData);

      // Reset form and close modal
      setNewRecipe({
        title: '',
        description: '',
        steps: '',
        category: '',
        tags: ''
      });

      // Add the new recipe to the recipes list if it was returned
      if (response.data) {
        setRecipes(prevRecipes => [response.data, ...prevRecipes]);
      }

      // Close the modal
      setShowRecipeModal(false);

      // Create a post about the new recipe
      setPosts([{
        id: Date.now(),
        content: `I just created a new recipe: ${newRecipe.title}!`,
        likes: 0,
        comments: []
      }, ...posts]);

    } catch (error) {
      console.error('Error creating recipe:', error);
      setRecipeError('Failed to create recipe. Please try again.');
    } finally {
      setSubmittingRecipe(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recipes
        setLoading(true);
        const recipesResponse = await recipeService.getAllRecipes();
        setRecipes(recipesResponse.data?.slice(0, 6) || []);
        console.log('Fetched recipes:', recipesResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setError('Failed to load recipes. Please try again later.');
        setLoading(false);
      }

      try {
        // Fetch events
        setEventsLoading(true);
        const eventsResponse = await eventService.getAllEvents();
        setEvents(eventsResponse.data?.slice(0, 3) || []);
        setEventsLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEventsError('Failed to load events. Please try again later.');
        setEventsLoading(false);
      }

      // Note: In a real application, you would have an API endpoint for suggested groups
      // For now, we'll use placeholder data but structure it like it came from an API
      setSuggestedGroups([
        { id: 1, name: 'Italian Cooking Group', mutualFriends: 12 },
        { id: 2, name: 'Healthy Cooking Tips', mutualFriends: 8 },
        { id: 3, name: 'Desserts & Baking', mutualFriends: 5 }
      ]);
    };

    fetchData();
  }, []);

  // Effect to fetch categories when recipe modal opens
  useEffect(() => {
    if (showRecipeModal) {
      fetchCategories();
    }
  }, [showRecipeModal]);

  // Format date for display
  const formatEventDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    
    const options = { weekday: 'short', hour: 'numeric', minute: 'numeric' };
    return date.toLocaleString('en-US', options);
  };

  return (
    <div className="min-h-screen ">
      {/* Top Navigation Bar - Facebook-like */}
      <nav className="bg-white bg-opacity-40 backdrop-blur-sm shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="ml-4 bg-gray-100 rounded-full px-4 py-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search RecipeShare" className="ml-2 bg-transparent outline-none" />
              </div>
            </div>
            <div className="flex space-x-4">
              <Link to="/profile" className="p-2 rounded-full hover:bg-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
              <Link to="/messages" className="p-2 rounded-full hover:bg-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </Link>
              <Link to="/notifications" className="p-2 rounded-full hover:bg-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="bg-white bg-opacity-10 backdrop-blur-sm shadow-md max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Navigation Links */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-4 sticky top-20">
              <ul className="space-y-2">
                <li>
                  <Link to="/profile" className="flex items-center p-2 hover:bg-gray-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-gray-800">My Profile</span>
                  </Link>
                </li>
                {/* Create Post Button */}
                <li>
                  <Link to="/create-recipe" className="flex items-center p-2 bg-blue-50 hover:bg-blue-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="font-medium text-blue-700">Create Recipe</span>
                  </Link>
                </li>
                {/* Create Event Button */}
                <li>
                  <Link to="/events/create" className="flex items-center p-2 bg-blue-50 hover:bg-blue-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-blue-700">Create Event</span>
                  </Link>
                </li>
                <li>
                  <Link to="/recipes" className="flex items-center p-2 hover:bg-gray-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-gray-800">All Recipes</span>
                  </Link>
                </li>
                <li>
                  <Link to="/favorites" className="flex items-center p-2 hover:bg-gray-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-gray-800">Saved Recipes</span>
                  </Link>
                </li>
                <li>
                  <Link to="/friends" className="flex items-center p-2 hover:bg-gray-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-gray-800">Friends</span>
                  </Link>
                </li>
                <li>
                  <Link to="/groups" className="flex items-center p-2 hover:bg-gray-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-gray-800">Recipe Groups</span>
                  </Link>
                </li>
                <li>
                  <Link to="/categories" className="flex items-center p-2 hover:bg-gray-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h11M9 21V3m0 18l-6-6m6 6l6-6" />
                    </svg>
                    <span className="text-gray-800">Categories</span>
                  </Link>
                </li>
                <li>
                  <Link to="/events" className="flex items-center p-2 hover:bg-gray-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-800">Events</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Center Feed - Posts and Recipes */}
          <div className="w-full lg:w-2/4">            {/* Create Post */}
                  <div className="bg-white shadow rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <textarea
                  className="w-full border border-gray-200 rounded-full px-4 py-2 text-gray-700 placeholder-gray-500"
                  rows="1"
                  placeholder="What's on your mind?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                ></textarea>
                    </div>
                    <div className="border-t border-gray-200 mt-4 pt-3">
                <div className="flex justify-between items-center">
                  <button className="flex items-center text-gray-600 hover:bg-gray-100 rounded-md px-3 py-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Photo
                  </button>
                  <button
                    onClick={() => setShowRecipeModal(true)}
                    className="flex items-center text-gray-600 hover:bg-gray-100 rounded-md px-3 py-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recipe
                  </button>
                  <button
                    onClick={async () => {
                      if (postContent.trim()) {
                        try {
                          const response = await recipeService.createRecipe({ content: postContent });
                          setPosts([{ ...response.data, likes: 0, comments: [] }, ...posts]);
                          setPostContent('');
                        } catch (error) {
                          console.error('Error creating post:', error);
                        }
                      }
                    }}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Post
                  </button>
                </div>
                    </div>
                  </div>

                  {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow">test
                  <div className="p-4">test
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">You</h3>
                        <p className="text-xs text-gray-500">Just now</p>
                      </div>
                    </div>
                    <p className="mt-3 text-gray-800">{post.content}</p>
                  </div>
                  <div className="px-4 py-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className="flex items-center text-gray-600 hover:text-blue-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        Like {post.likes > 0 && `(${post.likes})`}
                      </button>
                      <button className="flex items-center text-gray-600 hover:text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                        Comment
                      </button>
                      <button className="flex items-center text-gray-600 hover:text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Featured Recipes in Feed */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Featured Recipes</h2>
                </div>
                
                {loading ? (
                  <div className="flex justify-center p-6">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : error ? (
                  <div className="text-center text-red-700 py-6 font-medium">{error}</div>
                ) : (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recipes.length > 0 ? (
                      recipes.slice(0, 4).map((recipe) => (
                        <Link to={`/recipes/${recipe.id}`} key={recipe.id} className="block hover:bg-gray-50 rounded-lg p-2 transition-colors">
                          <div className="h-32 bg-gray-200 rounded-lg mb-2 overflow-hidden">                            {recipe.image && (
                              <img 
                                alt={recipe.title} 
                                className="w-full h-32 object-cover rounded-lg shadow-md" 
                                src={recipe.image.startsWith('/uploads/') 
                                  ? `http://localhost:8082${recipe.image}` 
                                  : recipe.image}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/400x200?text=Recipe';
                                }}
                              />
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900 truncate">{recipe.title}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2">{recipe.description}</p>
                        </Link>
                      ))
                    ) : (
                      <div className="col-span-full text-center text-gray-700 py-8 font-medium">
                        No recipes found. Create one now!
                      </div>
                    )}
                  </div>
                )}
                
                <div className="p-4 border-t border-gray-200">
                  <Link
                    to="/recipes"
                    className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800"
                  >
                    See More Recipes
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Events, Trending */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg shadow p-4 mb-6 sticky top-20">
              <h3 className="font-semibold text-black mb-4">Suggested for You</h3>
              <div className="space-y-4">
                {suggestedGroups.map((group) => (
                  <div key={group.id} className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{group.name}</p>
                      <p className="text-xs text-gray-500">{group.mutualFriends} mutual friends</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm shadow rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Upcoming Cooking Events</h3>
              <div className="space-y-4">
                {eventsLoading ? (
                  <div className="flex justify-center p-6">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : eventsError ? (
                  <div className="text-center text-red-700 py-6 font-medium">{eventsError}</div>
                ) : (
                  events.map((event) => (
                    <div key={event.id}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{event.name}</p>
                        <p className="text-xs text-black0">{formatEventDate(event.date)}</p>
                      </div>
                      <p className="text-xs text-black-1">{event.attendees} people going</p>
                    </div>
                  ))
                )}
              </div>
              <Link to="/events" className="w-full block mt-4 text-blue-600 text-sm font-medium hover:bg-gray-100 py-2 rounded-md text-center">
                See All Events
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Creation Modal */}
      {showRecipeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="border-b p-4 flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-xl">
              <h3 className="text-xl font-semibold">Create Quick Recipe</h3>
              <button
                onClick={() => setShowRecipeModal(false)}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleRecipeSubmit} className="p-4 space-y-4">
              {recipeError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <p className="text-red-700 text-sm">{recipeError}</p>
                </div>
              )}

              {/* Recipe Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Recipe Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newRecipe.title}
                  onChange={handleRecipeInputChange}
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Delicious recipe name"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={newRecipe.category}
                  onChange={handleRecipeInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select a category</option>
                  {loadingCategories ? (
                    <option disabled>Loading categories...</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newRecipe.description}
                  onChange={handleRecipeInputChange}
                  rows={3}
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Brief description of your recipe"
                ></textarea>
              </div>

              {/* Steps */}
              <div>
                <label htmlFor="steps" className="block text-sm font-medium text-gray-700 mb-1">
                  Steps*
                </label>
                <textarea
                  id="steps"
                  name="steps"
                  value={newRecipe.steps}
                  onChange={handleRecipeInputChange}
                  rows={5}
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="1. Mix ingredients
2. Cook for 20 mins
3. Serve hot"
                ></textarea>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={newRecipe.tags}
                  onChange={handleRecipeInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="quick, easy, vegetarian"
                />
              </div>

              <div className="flex justify-end space-x-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowRecipeModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRecipe}
                  className={`px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-md ${submittingRecipe ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                  {submittingRecipe ? 'Creating...' : 'Create Recipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;