import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreatePostPage = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    image: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login', { state: { from: '/create-post', message: 'Please login to create a post' } });
    }
  }, [currentUser, loading, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost({
      ...newPost,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const postData = {
        ...newPost,
        userId: currentUser.id,
        createdAt: new Date().toISOString()
      };
      
      const response = await postService.createPost(postData);
      navigate('/'); // Navigate back to homepage after creating post
    } catch (error) {
      console.error("Error creating post:", error);
      setError("Failed to create post. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect due to useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="px-6 py-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Post</h1>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Post Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={newPost.title}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Give your post a title"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                      Post Content
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      value={newPost.content}
                      onChange={handleInputChange}
                      rows={6}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Write your post content here..."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                      Image URL (optional)
                    </label>
                    <input
                      type="url"
                      id="image"
                      name="image"
                      value={newPost.image}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => navigate('/')}
                      className="px-6 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`px-6 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      {submitting ? 'Creating...' : 'Create Post'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;