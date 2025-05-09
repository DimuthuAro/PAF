import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { savedRecipeService, recipeService, authService } from '../services/api';
import RecipeCard from '../components/RecipeCard';

const SavedRecipesPage = () => {
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [recipeDetails, setRecipeDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        const fetchSavedRecipes = async () => {
            if (!currentUser) {
                setError("You must be logged in to view saved recipes");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Fetch saved recipe IDs
                const savedResponse = await savedRecipeService.getUserSavedRecipes(currentUser.user.id);
                console.log("Saved Recipes Response:", savedResponse);
                const savedRecipesData = savedResponse.data || [];
                setSavedRecipes(savedRecipesData);

                // Limit the number of API calls for recipe details
                const MAX_BATCH_SIZE = 10;
                const limitedRecipes = savedRecipesData.slice(0, MAX_BATCH_SIZE);

                // Fetch full recipe details for the limited saved recipes
                const detailPromises = limitedRecipes.map(saved =>
                    recipeService.getRecipeById(saved.postId)
                );

                const detailsResponses = await Promise.all(detailPromises);
                const details = detailsResponses.map((res, index) => ({
                    ...res.data,
                    savedId: limitedRecipes[index].id,
                    savedDate: limitedRecipes[index].savedDate,
                    note: limitedRecipes[index].note
                }));

                setRecipeDetails(details);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching saved recipes:', error);
                setError('Failed to load saved recipes. Please try again later.');
                setLoading(false);
            }
        };

        fetchSavedRecipes();
    }, []);

    const handleRemoveSaved = async (recipeId) => {
        if (!currentUser) return;

        try {
            await savedRecipeService.removeSavedRecipe(currentUser.user.id, recipeId);
            // Update UI by filtering out the removed recipe
            setRecipeDetails(recipeDetails.filter(recipe => recipe.id !== recipeId));
        } catch (error) {
            console.error('Error removing saved recipe:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Saved Recipes</h1>
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Saved Recipes</h1>
                    <div className="bg-red-100 p-4 rounded-md text-red-700">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Saved Recipes</h1>

                {recipeDetails.length === 0 ? (
                    <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-600 mb-4">You haven't saved any recipes yet.</p>
                        <Link to="/recipes" className="text-blue-600 hover:text-blue-800 font-medium">
                            Browse Recipes
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {recipeDetails.map(recipe => (
                            <div key={recipe.id} className="relative">
                                <RecipeCard recipe={recipe} />
                                <div className="absolute top-2 right-2">
                                    <button
                                        onClick={() => handleRemoveSaved(recipe.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                                        title="Remove from saved"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                                {recipe.note && (
                                    <div className="mt-2 p-2 bg-yellow-50 rounded-md text-sm text-gray-700">
                                        <p className="font-bold">Note:</p>
                                        <p>{recipe.note}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedRecipesPage;
