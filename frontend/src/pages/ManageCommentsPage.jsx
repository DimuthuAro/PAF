import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { interactionService, recipeService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiEdit2, FiTrash2, FiExternalLink, FiMessageCircle } from 'react-icons/fi';

const ManageCommentsPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingComment, setEditingComment] = useState(null);
    const [editedContent, setEditedContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        // Redirect to login if not logged in
        if (!currentUser?.user?.id) {
            navigate('/login', { state: { from: '/my-comments', message: 'Please login to manage your comments' } });
            return;
        }

        fetchComments();
    }, [currentUser, navigate]); const fetchComments = async () => {
        if (!currentUser?.user?.id) return;

        try {
            setLoading(true);
            setError(null);
            // Fetch comments created by the current user
            const response = await interactionService.getUserInteractions(currentUser.user.id, 'COMMENT');

            // Log the response data to debug
            console.log('Comments data received:', response.data);

            if (!response.data || response.data.length === 0) {
                setComments([]);
                return;
            }

            // First process basic user info
            const commentsWithBasicInfo = (response.data || []).map(comment => {
                // Add user info if missing (this page only shows the current user's comments)
                if (!comment.user) {
                    comment.user = {
                        id: currentUser.user.id,
                        username: currentUser.user.username || 'You',
                        name: currentUser.user.name || 'You'
                    };
                }

                return comment;
            });

            // Then fetch recipe details for each comment
            const enhancedComments = await Promise.all(
                commentsWithBasicInfo.map(async (comment) => {
                    // If we don't have complete recipe info, try to fetch it
                    const recipeId = comment.recipe?.id || comment.recipeId;

                    if (recipeId) {
                        try {
                            const recipeResponse = await recipeService.getRecipeById(recipeId);

                            if (recipeResponse && recipeResponse.data) {
                                comment.recipe = recipeResponse.data;
                            }
                        } catch (err) {
                            console.error(`Error fetching recipe ${recipeId} for comment:`, err);
                            // Keep whatever recipe info we already have, or set a default
                            if (!comment.recipe) {
                                comment.recipe = { id: recipeId, title: 'Recipe Not Available' };
                            }
                        }
                    } else if (!comment.recipe) {
                        comment.recipe = { title: 'Unknown Recipe' };
                    }

                    return comment;
                })
            );

            setComments(enhancedComments);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setError('Failed to load your comments. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (comment) => {
        setEditingComment(comment);
        setEditedContent(comment.content);
    };

    const saveEdit = async () => {
        if (!editingComment || !editedContent.trim()) return;

        try {
            setSubmitting(true);
            await interactionService.updateComment(editingComment.id, { content: editedContent });

            // Update the comment in the local state
            setComments(comments.map(comment =>
                comment.id === editingComment.id
                    ? { ...comment, content: editedContent }
                    : comment
            ));

            setEditingComment(null);
            setEditedContent('');
        } catch (error) {
            console.error('Error updating comment:', error);
            alert('Failed to update comment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const cancelEdit = () => {
        setEditingComment(null);
        setEditedContent('');
    };

    const confirmDelete = (commentId) => {
        setDeleteConfirm(commentId);
    };

    const handleDelete = async (commentId) => {
        try {
            setSubmitting(true);
            await interactionService.deleteInteraction(commentId);

            // Remove the comment from the local state
            setComments(comments.filter(comment => comment.id !== commentId));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Failed to delete comment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-white flex items-center">
                                <FiMessageCircle className="mr-2" /> Manage My Comments
                            </h1>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="p-4">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="text-center py-8">
                                <FiMessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-lg font-medium text-gray-900">No comments yet</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    You haven't made any comments yet. Start engaging with recipes and posts!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        {deleteConfirm === comment.id ? (
                                            <div className="bg-red-50 p-4 rounded-md">
                                                <p className="font-medium text-red-800">Are you sure you want to delete this comment?</p>
                                                <p className="text-sm text-gray-700 mt-2 mb-4">This action cannot be undone.</p>
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={cancelDelete}
                                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                                                        disabled={submitting}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(comment.id)}
                                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700"
                                                        disabled={submitting}
                                                    >
                                                        {submitting ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : editingComment?.id === comment.id ? (
                                            <div>
                                                <textarea
                                                    value={editedContent}
                                                    onChange={(e) => setEditedContent(e.target.value)}
                                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    rows="3"
                                                ></textarea>
                                                <div className="mt-3 flex justify-end space-x-2">
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                                                        disabled={submitting}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={saveEdit}
                                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
                                                        disabled={submitting || !editedContent.trim()}
                                                    >
                                                        {submitting ? 'Saving...' : 'Save'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>                                                <div className="flex justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        On{' '}                                                            {comment.recipe?.id ? (
                                                            <Link
                                                                to={`/recipes/${comment.recipe.id}`}
                                                                className="font-medium text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                {comment.recipe.title || 'Unknown Recipe'}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-gray-500">Unknown Recipe</span>
                                                        )}
                                                    </p>
                                                    <div className="flex items-center space-x-1">
                                                        <p className="text-xs text-gray-500">
                                                            {formatDate(comment.createdAt)}
                                                        </p>
                                                        {comment.user ? (
                                                            <p className="text-xs text-gray-500">
                                                                • by {comment.user.username || comment.user.name || 'You'}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(comment)}
                                                        className="text-gray-400 hover:text-indigo-600"
                                                        title="Edit"
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(comment.id)}
                                                        className="text-gray-400 hover:text-red-600"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 />
                                                    </button>                                                        {comment.recipe?.id ? (
                                                        <Link
                                                            to={`/recipes/${comment.recipe.id}`}
                                                            className="text-gray-400 hover:text-green-600"
                                                            title="Go to post"
                                                        >
                                                            <FiExternalLink />
                                                        </Link>
                                                    ) : (
                                                        <span
                                                            className="text-gray-300 cursor-not-allowed"
                                                            title="Recipe not available"
                                                        >
                                                            <FiExternalLink />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                                <p className="mt-2 text-gray-800">{comment.content}</p>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageCommentsPage;
