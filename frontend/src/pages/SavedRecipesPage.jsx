import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { savedRecipeService, recipeService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';

const SavedRecipesPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [recipeDetails, setRecipeDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingNote, setEditingNote] = useState(null);
    const [noteText, setNoteText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('newest');

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
    }, []);    // Handle removing a saved recipe
    const handleRemoveSaved = async (recipeId) => {
        if (!currentUser) return;

        try {
            await savedRecipeService.removeSavedRecipe(currentUser.user.id, recipeId);
            // Update UI by filtering out the removed recipe
            setRecipeDetails(recipeDetails.filter(recipe => recipe.id !== recipeId));

            // Show success message
            const successToast = document.createElement('div');
            successToast.className = 'fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
            successToast.textContent = 'Recipe removed from saved items';
            document.body.appendChild(successToast);
            setTimeout(() => document.body.removeChild(successToast), 2000);
        } catch (error) {
            console.error('Error removing saved recipe:', error);

            // Show error message to the user
            const errorToast = document.createElement('div');
            errorToast.className = 'fixed top-5 right-5 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
            errorToast.textContent = typeof error === 'string' ? error : 'Failed to remove recipe. Please try again.';
            document.body.appendChild(errorToast);
            setTimeout(() => document.body.removeChild(errorToast), 3000);
        }
    };

    // Start editing a note for a recipe
    const handleEditNoteClick = (recipe) => {
        setEditingNote(recipe.id);
        setNoteText(recipe.note || '');
    };

    // Save the edited note
    const handleSaveNote = async (recipeId) => {
        try {
            await savedRecipeService.updateNote(currentUser.user.id, recipeId, noteText);

            // Update the recipe in the UI with the new note
            setRecipeDetails(recipeDetails.map(recipe =>
                recipe.id === recipeId ? { ...recipe, note: noteText } : recipe
            ));

            setEditingNote(null);
        } catch (error) {
            console.error('Error updating note:', error);
            alert('Failed to update note. Please try again.');
        }
    };

    // Cancel note editing
    const handleCancelNote = () => {
        setEditingNote(null);
        setNoteText('');
    };

    // Handle search input changes
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle sort option changes
    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    // Filter and sort recipes
    const filteredAndSortedRecipes = () => {
        let filtered = recipeDetails;

        // Apply search filter if search term exists
        if (searchTerm) {
            filtered = filtered.filter(recipe =>
                recipe.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                recipe.note?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply sorting
        switch (sortOption) {
            case 'newest':
                return [...filtered].sort((a, b) => new Date(b.savedDate) - new Date(a.savedDate));
            case 'oldest':
                return [...filtered].sort((a, b) => new Date(a.savedDate) - new Date(b.savedDate));
            case 'alphabetical':
                return [...filtered].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
            default:
                return filtered;
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
                        <>
                            {/* Search and Sort Controls */}
                            <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        placeholder="Search saved recipes"
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="absolute left-3 top-2.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <label htmlFor="sort" className="mr-2 text-gray-600">Sort by:</label>
                                    <select
                                        id="sort"
                                        value={sortOption}
                                        onChange={handleSortChange}
                                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="alphabetical">A-Z</option>
                                    </select>
                                </div>
                            </div>

                            {/* Recipe Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {filteredAndSortedRecipes().map(recipe => (
                                    <div key={recipe.id} className="relative bg-white rounded-lg shadow-sm overflow-hidden">
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

                                    {/* Note Section */}
                                    <div className="p-3 border-t border-gray-100">
                                        {editingNote === recipe.id ? (
                                            <div className="mt-2">
                                                <textarea
                                                    value={noteText}
                                                    onChange={(e) => setNoteText(e.target.value)}
                                                    placeholder="Add a note about this recipe..."
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    rows={3}
                                                />
                                                <div className="mt-2 flex justify-end space-x-2">
                                                    <button
                                                        onClick={handleCancelNote}
                                                        className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveNote(recipe.id)}
                                                        className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                                                    >
                                                        Save Note
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className="text-sm font-medium text-gray-700">Notes</h3>
                                                    <button
                                                        onClick={() => handleEditNoteClick(recipe)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                        </svg>
                                                        {recipe.note ? 'Edit' : 'Add Note'}
                                                    </button>
                                                </div>
                                                {recipe.note ? (
                                                    <p className="text-sm text-gray-600">{recipe.note}</p>
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic">No notes yet</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            </div>

                            {/* No Results Message */}
                            {filteredAndSortedRecipes().length === 0 && searchTerm && (
                                <div className="text-center p-8 bg-white rounded-lg shadow-sm mt-4">
                                    <p className="text-gray-600 mb-2">No recipes match your search.</p>
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Clear search
                                    </button>
                                </div>
                            )}
                        </>
                )}
            </div>
        </div>
    );
};

export default SavedRecipesPage;
