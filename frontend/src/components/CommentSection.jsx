import { useState, useEffect } from 'react';
import { interactionService, userService } from '../services/api';
import { useAuth } from '../context/AuthContext';


const CommentSection = ({ recipeId }) => {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    console.log('Fetching comments for recipeId:', recipeId);
    console.log('Current user:', currentUser);
    fetchComments();
  }, [recipeId]);
  const fetchComments = async () => {
    try {
      const response = await interactionService.getRecipeComments(recipeId);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      if (error.message.includes('CORS') || error.message.includes('Network Error')) {
        console.warn('Failed to fetch comments due to a network or CORS issue. Please try again later.');
      }
    }
  };
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    try {
      // Use currentUser.user.id instead of currentUser.id
      await interactionService.createComment(currentUser.user.id, recipeId, newComment);
      setNewComment('');
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error adding comment:', error);
      if (error.message.includes('CORS') || error.message.includes('Network Error')) {
        alert('Failed to add comment due to a network or CORS issue. Please try again later.');
      } else {
        alert('Failed to add comment. Please try again.');
      }
    }
  };

  const handleEditClick = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleEditSubmit = async (commentId) => {
    if (!editText.trim()) return;

    try {
      await interactionService.updateComment(commentId, editText);
      setEditingId(null);
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await interactionService.deleteInteraction(commentId);
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  const [userNames, setUserNames] = useState({});

  // Use this function to get user name for a comment - it's now async
  useEffect(() => {
    if (!comments.length) return;

    const fetchUserNames = async () => {
      const newUserNames = { ...userNames };

      // First collect all unique user IDs that we don't already have names for
      const userIdsToFetch = comments
        .filter(comment => comment.userId && !userNames[comment.userId])
        .map(comment => comment.userId);

      // Fetch names for each user ID
      for (const userId of userIdsToFetch) {
        try {
          const response = await userService.getUserById(userId);
          if (response && response.data) {
            newUserNames[userId] = response.data.name || response.data.username || 'User';
          }
        } catch (error) {
          console.error(`Error fetching user data for ID ${userId}:`, error);
          newUserNames[userId] = 'Unknown User';
        }
      }

      setUserNames(newUserNames);
    };

    fetchUserNames();
  }, [comments]);

  const getUserNameByComment = (comment) => {
    if (!comment) return 'Unknown User';

    // If we have a user name cached
    if (comment.userId && userNames[comment.userId]) {
      return userNames[comment.userId];
    }

    // If we have a user object in the comment
    if (comment.user && (comment.user.name || comment.user.username)) {
      return comment.user.name || comment.user.username;
    }

    return 'Unknown User';
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Comments</h3>

      {currentUser ? (
        <form onSubmit={handleAddComment} className="mb-6">
          <div className="flex flex-col space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="3"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Post Comment
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="mb-6 text-gray-500 italic">Please log in to leave a comment.</p>
      )}

      <div className="space-y-4">        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <p className="font-semibold text-gray-800">{getUserNameByComment(comment)}</p>
                <p className="text-sm text-gray-500">{formatDate(comment.createdAt)}</p>
              </div>

              {editingId === comment.id ? (
                <div className="mt-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="2"
                  />
                  <div className="mt-2 flex space-x-2 justify-end">
                    <button
                      onClick={handleEditCancel}
                      className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEditSubmit(comment.id)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-gray-700">{comment.content}</p>
              )}              {currentUser && currentUser.user && currentUser.user.id === comment.userId && !editingId && (
                <div className="mt-2 flex space-x-2 justify-end">
                  <button
                    onClick={() => handleEditClick(comment)}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection; 