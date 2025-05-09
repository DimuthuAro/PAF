import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryService, authService } from '../services/api';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const currentUser = authService.getCurrentUser();
    const isAdmin = currentUser?.user?.role === 'ADMIN';

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await categoryService.getAllCategories();
                setCategories(response.data || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('Failed to load categories. Please try again later.');
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            setError("You must be logged in to create a category");
            return;
        }

        try {
            const response = await categoryService.createCategory(formData);

            // Update local state with new category
            setCategories([...categories, response.data]);

            // Reset form
            setFormData({
                name: '',
                description: ''
            });
            setShowCreateForm(false);
        } catch (error) {
            console.error('Error creating category:', error);
            setError('Failed to create category. Please try again later.');
        }
    };

    const handleDelete = async (id) => {
        if (!currentUser || !isAdmin) return;

        try {
            await categoryService.deleteCategory(id);

            // Update state
            const updatedCategories = categories.filter(category => category.id !== id);
            setCategories(updatedCategories);
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Categories</h1>
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Recipe Categories</h1>
                    {isAdmin && (
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            {showCreateForm ? 'Cancel' : 'Create Category'}
                        </button>
                    )}
                </div>

                {error && (
                    <div className="bg-red-100 p-4 rounded-md text-red-700 mb-4">
                        {error}
                    </div>
                )}

                {/* Create Category Form */}
                {showCreateForm && isAdmin && (
                    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                        <h2 className="text-xl font-semibold mb-4">Create New Category</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Category Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-md"
                                    rows="3"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                Create Category
                            </button>
                        </form>
                    </div>
                )}

                {/* Categories List */}
                {categories.length === 0 ? (
                    <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-600">No categories found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categories.map(category => (
                            <div key={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden h-full">
                                <div className={`h-24 ${category.imageUrl ? '' : 'bg-gradient-to-r from-green-400 to-blue-500'} flex items-center justify-center`}>
                                    {category.imageUrl ? (
                                        <img src={category.imageUrl} alt={category.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <h3 className="text-xl font-bold text-white">{category.name}</h3>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold">{category.name}</h3>
                                    {category.description && (
                                        <p className="text-gray-600 text-sm mt-1 mb-3">
                                            {category.description}
                                        </p>
                                    )}
                                    <div className="flex justify-between mt-auto">
                                        <Link to={`/categories/${category.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            Browse Recipes
                                        </Link>
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriesPage;
