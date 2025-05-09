import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recipeGroupService, authService } from '../services/api';

const RecipeGroupsPage = () => {
    const [groups, setGroups] = useState([]);
    const [userGroups, setUserGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        privacy: 'PUBLIC'
    });
    const [activeTab, setActiveTab] = useState('all');

    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch all public groups
                const groupsResponse = await recipeGroupService.getAllGroups();
                const publicGroups = groupsResponse.data.filter(group => group.privacy === 'PUBLIC');
                setGroups(publicGroups);

                // If user is logged in, fetch their groups
                if (currentUser) {
                    const userGroupsResponse = await recipeGroupService.getGroupsByCreator(currentUser.user.id);
                    setUserGroups(userGroupsResponse.data);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching recipe groups:', error);
                setError('Failed to load recipe groups. Please try again later.');
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

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
            setError("You must be logged in to create a group");
            return;
        }

        try {
            const newGroup = {
                ...formData,
                creatorId: currentUser.user.id
            };

            const response = await recipeGroupService.createGroup(newGroup);

            // Update local state with new group
            setUserGroups([...userGroups, response.data]);
            if (response.data.privacy === 'PUBLIC') {
                setGroups([...groups, response.data]);
            }

            // Reset form
            setFormData({
                name: '',
                description: '',
                privacy: 'PUBLIC'
            });
            setShowCreateForm(false);
        } catch (error) {
            console.error('Error creating group:', error);
            setError('Failed to create group. Please try again later.');
        }
    };

    const handleDelete = async (groupId) => {
        if (!currentUser) return;

        try {
            await recipeGroupService.deleteGroup(groupId);

            // Update state
            const updatedUserGroups = userGroups.filter(group => group.id !== groupId);
            setUserGroups(updatedUserGroups);

            const updatedGroups = groups.filter(group => group.id !== groupId);
            setGroups(updatedGroups);
        } catch (error) {
            console.error('Error deleting group:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Recipe Groups</h1>
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
                    <h1 className="text-3xl font-bold text-gray-800">Recipe Groups</h1>
                    {currentUser && (
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            {showCreateForm ? 'Cancel' : 'Create Group'}
                        </button>
                    )}
                </div>

                {error && (
                    <div className="bg-red-100 p-4 rounded-md text-red-700 mb-4">
                        {error}
                    </div>
                )}

                {/* Create Group Form */}
                {showCreateForm && (
                    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                        <h2 className="text-xl font-semibold mb-4">Create New Group</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Group Name</label>
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

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Privacy</label>
                                <select
                                    name="privacy"
                                    value={formData.privacy}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="PUBLIC">Public</option>
                                    <option value="PRIVATE">Private</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                Create Group
                            </button>
                        </form>
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-4 border-b">
                    <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                        <li className="mr-2">
                            <button
                                className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'all'
                                    ? 'text-blue-600 border-blue-600'
                                    : 'hover:text-gray-600 hover:border-gray-300 border-transparent'}`}
                                onClick={() => setActiveTab('all')}
                            >
                                All Groups
                            </button>
                        </li>
                        {currentUser && (
                            <li className="mr-2">
                                <button
                                    className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'my'
                                        ? 'text-blue-600 border-blue-600'
                                        : 'hover:text-gray-600 hover:border-gray-300 border-transparent'}`}
                                    onClick={() => setActiveTab('my')}
                                >
                                    My Groups
                                </button>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Group List */}
                {activeTab === 'all' && (
                    <div>
                        {groups.length === 0 ? (
                            <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                                <p className="text-gray-600">No recipe groups found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {groups.map(group => (
                                    <div key={group.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                                            <h3 className="text-xl font-bold text-white">{group.name}</h3>
                                        </div>
                                        <div className="p-4">
                                            <p className="text-gray-600 mb-4">
                                                {group.description || 'No description provided.'}
                                            </p>
                                            <Link to={`/groups/${group.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                                                View Group
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* My Groups */}
                {activeTab === 'my' && (
                    <div>
                        {userGroups.length === 0 ? (
                            <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                                <p className="text-gray-600">You haven't created any groups yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userGroups.map(group => (
                                    <div key={group.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                                            <h3 className="text-xl font-bold text-white">{group.name}</h3>
                                        </div>
                                        <div className="p-4">
                                            <p className="text-gray-600 mb-4">
                                                {group.description || 'No description provided.'}
                                            </p>
                                            <div className="flex justify-between">
                                                <Link to={`/groups/${group.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                                                    View Group
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(group.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeGroupsPage;
