import { useState, useEffect } from 'react';
import { recipeService } from '../services/api';
import RecipeCard from '../components/RecipeCard';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RecipesPage = () => {
  const { currentUser } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await recipeService.getAllRecipes();
        setRecipes(response.data || []);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setError(error.message || 'Failed to load recipes. Please try again later.');
        // Retry up to 3 times with exponential backoff
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, Math.pow(2, retryCount) * 1000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [retryCount]);

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !difficultyFilter || recipe.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const handleRetry = () => {
    setRetryCount(0); // Reset retry count to trigger a new fetch
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Explore Recipes
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Browse through our collection of delicious recipes
          </p>
        </div>

        <div className="mt-10 pb-10 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search recipes..."
                  className="block w-full pr-10 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>

              {currentUser && (
                <Link
                  to="/create-recipe"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create Recipe
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-600 mb-4">{error}</div>
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Try Again
                </button>
              </div>
          ) : (
            <>
              {filteredRecipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900">No recipes found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {searchTerm || difficultyFilter
                      ? "Try adjusting your filters"
                      : "Be the first to add a recipe!"}
                  </p>
                  {currentUser && (
                    <div className="mt-6">
                      <Link
                        to="/create-recipe"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Create Recipe
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipesPage;