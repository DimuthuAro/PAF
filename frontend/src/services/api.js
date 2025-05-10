import axios from 'axios';

const API_URL = 'http://localhost:8082/api';

// Configure axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Set this to true to include credentials for CORS requests
});

// Authentication services
export const authService = {
  login: async (credentials) => {
    try {
      // Send login request to the backend - fix the endpoint path
      const response = await axiosInstance.post('/login', credentials);
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
        // Set auth header for future requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error?.response?.data || error.message || 'Login failed';
    }
  },
  logout: () => {
    localStorage.removeItem('user');
    delete axiosInstance.defaults.headers.common['Authorization'];
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('user');
  }
};

// Recipe services - now mapped to post endpoints with enhanced error handling
export const recipeService = {
  getAllRecipes: async () => {
    try {
      const response = await axiosInstance.get('/posts');
      return response;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  },

  createRecipeWithFiles: async (formData) => {
    try {
      // Use a different axios instance for file uploads with multipart/form-data
      const fileUploadInstance = axios.create({
        baseURL: API_URL,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      // Set auth header if available
      const user = authService.getCurrentUser();
      if (user && user.token) {
        fileUploadInstance.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
      }

      const response = await fileUploadInstance.post('/posts/upload', formData);
      return response;
    } catch (error) {
      console.error('Error creating recipe with files:', error);
      throw error;
    }
  },
  getRecipeById: async (id) => {
    try {
      console.log(`Fetching recipe with ID: ${id}`);
      const response = await axiosInstance.get(`/posts/${id}`);
      console.log('Recipe data received:', response.data);
      return response;
    } catch (error) {
      console.error(`Error fetching recipe with ID ${id}:`, error);
      throw error;
    }
  },
  createRecipe: (recipe) => axiosInstance.post('/posts', recipe),
  updateRecipe: (id, recipe) => axiosInstance.put(`/posts/${id}`, recipe),
  deleteRecipe: (id) => axiosInstance.delete(`/posts/${id}`),
  getUserRecipes: (userId) => axiosInstance.get(`/posts/user/${userId}`),
};

// Add a response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response || error);

    // Handle 401 Unauthorized globally
    if (error.response?.status === 401) {
      authService.logout(); // Clear user data
      // Redirect to login preserving the current location
      window.location.href = `/login?redirect=${window.location.pathname}`;
      return Promise.reject(new Error('Please log in to continue.'));
    }

    // Handle specific database constraint violations
    if (error.response && error.response.status === 500) {
      // Check if error.response.data is a string before using includes
      const errorMessage = typeof error.response.data === 'string' ? error.response.data : '';

      if (errorMessage.includes('UK_6DOTKOTT2KJSP8VW4D0M25FB7')) {
        return Promise.reject(new Error('Email address already exists. Please use a different email.'));
      }
      if (errorMessage.includes('UK_R43AF9AP4EDM43MMTQ01ODDJ6')) {
        return Promise.reject(new Error('Username already exists. Please choose a different username.'));
      }
    }

    // Get detailed error message from response if available
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

// Post services
export const postService = {
  getAllPosts: () => axiosInstance.get('/posts'),
  getPostById: (id) => axiosInstance.get(`/posts/${id}`),
  createPost: (post) => axiosInstance.post('/posts', post),
  updatePost: (id, post) => axiosInstance.put(`/posts/${id}`, post),
  deletePost: (id) => axiosInstance.delete(`/posts/${id}`),
};

// User services
export const userService = {
  createUser: (user) => axiosInstance.post('/users', user),
  getUserById: (id) => axiosInstance.get(`/users/${id}`),
  updateUser: (id, user) => axiosInstance.put(`/users/${id}`, user),
  deleteUser: (id) => axiosInstance.delete(`/users/${id}`),
  registerUser: async (userData) => {
    try {
      const response = await axiosInstance.post('/register', userData);
      return response.data;
    } catch (error) {
      if (error.message && error.message.includes('already exists')) {
        throw error;  // Use our custom error message
      }
      throw error?.response?.data || error.message || 'Registration failed';
    }
  },
};

// Enhanced Event services with better error handling
export const eventService = {
  getAllEvents: async () => {
    try {
      const response = await axiosInstance.get('/events');
      return response;
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error?.response?.data || error.message || 'Failed to fetch events';
    }
  },

  getEventById: async (id) => {
    try {
      const response = await axiosInstance.get(`/events/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching event with ID ${id}:`, error);
      throw error?.response?.data || error.message || 'Failed to fetch event';
    }
  },
  createEvent: async (event) => {
    try {
      console.log("Sending event data to backend:", event);
      
      // Check if event data contains a file or a URL
      if (event.imageFile) {
        // Create a FormData object for file upload
        const formData = new FormData();
        Object.keys(event).forEach(key => {
          if (key === 'imageFile') {
            formData.append('imageFile', event.imageFile);
          } else {
            formData.append(key, event[key]);
          }
        });
        
        // Use a different axios instance for file uploads with multipart/form-data
        const fileUploadInstance = axios.create({
          baseURL: API_URL,
          withCredentials: true
        });
        
        // Add auth token if available
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user && user.token) {
          fileUploadInstance.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
        }
        
        const response = await fileUploadInstance.post('/events/upload', formData);
        console.log("Event created successfully with image upload:", response.data);
        return response;
      } else {
        // Regular JSON request for URL-based images
        const response = await axiosInstance.post('/events', event);
        console.log("Event created successfully:", response.data);
        return response;
      }
    } catch (error) {
      console.error("Error creating event:", error);
      console.error("Response data:", error?.response?.data);
      throw error?.response?.data || error.message || 'Failed to create event';
    }
  },

  updateEvent: async (id, event) => {
    try {
      console.log(`Updating event with ID ${id}:`, event);
      const response = await axiosInstance.put(`/events/${id}`, event);
      return response;
    } catch (error) {
      console.error(`Error updating event with ID ${id}:`, error);
      throw error?.response?.data || error.message || 'Failed to update event';
    }
  },
  deleteEvent: async (id) => {
    try {
      const response = await axiosInstance.delete(`/events/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting event with ID ${id}:`, error);
      throw error?.response?.data || error.message || 'Failed to delete event';
    }
  },
  
  searchEvents: async (searchTerm) => {
    try {
      const response = await axiosInstance.get(`/events/search?term=${encodeURIComponent(searchTerm)}`);
      return response;
    } catch (error) {
      console.error(`Error searching events with term "${searchTerm}":`, error);
      throw error?.response?.data || error.message || 'Failed to search events';
    }
  },
    getUserEvents: async (userId) => {
    try {
      const response = await axiosInstance.get(`/events/user/${userId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching events for user ID ${userId}:`, error);
      throw error?.response?.data || error.message || 'Failed to fetch user events';
    }
  },
};

// Interaction services
export const interactionService = {
  createLike: (userId, recipeId) => 
    axiosInstance.post(`/interactions/users/${userId}/recipes/${recipeId}?type=LIKE`),
  createFavorite: (userId, recipeId) => 
    axiosInstance.post(`/interactions/users/${userId}/recipes/${recipeId}?type=FAVORITE`),
  createComment: (userId, recipeId, comment) => 
    axiosInstance.post(`/interactions/users/${userId}/recipes/${recipeId}?type=COMMENT`, comment),
  getRecipeInteractions: (recipeId) => 
    axiosInstance.get(`/interactions/recipes/${recipeId}`),
  getRecipeComments: (recipeId) => 
    axiosInstance.get(`/interactions/recipes/${recipeId}/type/COMMENT`),
  getUserFavorites: (userId) => 
    axiosInstance.get(`/interactions/users/${userId}/type/FAVORITE`),
  getUserInteractions: async (userId, type) => {
    try {
      const response = await axiosInstance.get(`/interactions/users/${userId}/type/${type}`);
      return response;
    } catch (error) {
      console.error(`Error fetching user interactions for type ${type}:`, error);
      throw error?.response?.data || error.message || `Failed to fetch user ${type} interactions`;
    }
  },
  getInteractionCount: (recipeId, type) => 
    axiosInstance.get(`/interactions/recipes/${recipeId}/type/${type}/count`),
  updateComment: (interactionId, comment) => 
    axiosInstance.put(`/interactions/${interactionId}`, comment),
  deleteInteraction: (interactionId) => 
    axiosInstance.delete(`/interactions/${interactionId}`),
  checkUserInteraction: (userId, recipeId, type) => 
    axiosInstance.get(`/interactions/users/${userId}/recipes/${recipeId}/type/${type}/check`),
  deleteTypeInteractions: (recipeId, type) => 
    axiosInstance.delete(`/interactions/recipes/${recipeId}/type/${type}`),
};

// Set authorization header if user is logged in
const user = authService.getCurrentUser();
if (user && user.token) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
}

// Saved Recipes service
export const savedRecipeService = {
  // Save a recipe to user's collection
  saveRecipe: async (userId, recipeId, note = null) => {
    try {
      const payload = note ? { note } : {};
      const response = await axiosInstance.post(`/saved-recipes/users/${userId}/recipes/${recipeId}`, payload);
      return response;
    } catch (error) {
      console.error(`Error saving recipe ${recipeId} for user ${userId}:`, error);
      throw error?.response?.data || error.message || 'Failed to save recipe';
    }
  },

  // Get all saved recipes for a user
  getUserSavedRecipes: async (userId) => {
    try {
      const response = await axiosInstance.get(`/saved-recipes/users/${userId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching saved recipes for user ${userId}:`, error);
      throw error?.response?.data || error.message || 'Failed to fetch saved recipes';
    }
  },

  // Check if a recipe is saved
  isRecipeSaved: async (userId, recipeId) => {
    try {
      const response = await axiosInstance.get(`/saved-recipes/users/${userId}/recipes/${recipeId}/check`);
      return response.data.saved;
    } catch (error) {
      console.error(`Error checking if recipe ${recipeId} is saved by user ${userId}:`, error);
      return false; // Default to false on error
    }
  },

  // Get a specific saved recipe
  getSavedRecipe: async (userId, recipeId) => {
    try {
      const response = await axiosInstance.get(`/saved-recipes/users/${userId}/recipes/${recipeId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching saved recipe ${recipeId} for user ${userId}:`, error);
      throw error?.response?.data || error.message || 'Failed to fetch saved recipe';
    }
  },

  // Update note for a saved recipe
  updateNote: async (userId, recipeId, note) => {
    try {
      const response = await axiosInstance.put(`/saved-recipes/users/${userId}/recipes/${recipeId}`, { note });
      return response;
    } catch (error) {
      console.error(`Error updating note for recipe ${recipeId}:`, error);
      throw error?.response?.data || error.message || 'Failed to update note';
    }
  },
  // Remove a saved recipe
  removeSavedRecipe: async (userId, recipeId) => {
    try {
      const response = await axiosInstance.delete(`/saved-recipes/users/${userId}/recipes/${recipeId}`);
      return response;
    } catch (error) {
      console.error(`Error removing saved recipe ${recipeId} for user ${userId}:`, error);
      // Get proper error message based on the type of error response
      let errorMessage = 'Failed to remove saved recipe';

      if (error.response) {
        // Handle different types of response data
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw errorMessage;
    }
  },

  // Count saves for a recipe
  getRecipeSaveCount: async (recipeId) => {
    try {
      const response = await axiosInstance.get(`/saved-recipes/recipes/${recipeId}/count`);
      return response.data.count;
    } catch (error) {
      console.error(`Error counting saves for recipe ${recipeId}:`, error);
      return 0; // Default to 0 on error
    }
  }
};

// Friends service
export const friendService = {
  // Send a friend request
  sendFriendRequest: async (userId, friendId) => {
    try {
      const response = await axiosInstance.post('/friends/request', { userId, friendId });
      return response;
    } catch (error) {
      console.error(`Error sending friend request from ${userId} to ${friendId}:`, error);
      throw error?.response?.data || error.message || 'Failed to send friend request';
    }
  },

  // Accept a friend request
  acceptFriendRequest: async (userId, friendId) => {
    try {
      const response = await axiosInstance.put(`/friends/users/${userId}/accept/${friendId}`);
      return response;
    } catch (error) {
      console.error(`Error accepting friend request from ${friendId}:`, error);
      throw error?.response?.data || error.message || 'Failed to accept friend request';
    }
  },

  // Reject a friend request
  rejectFriendRequest: async (userId, friendId) => {
    try {
      const response = await axiosInstance.delete(`/friends/users/${userId}/reject/${friendId}`);
      return response;
    } catch (error) {
      console.error(`Error rejecting friend request from ${friendId}:`, error);
      throw error?.response?.data || error.message || 'Failed to reject friend request';
    }
  },

  // Remove a friend
  removeFriend: async (userId, friendId) => {
    try {
      const response = await axiosInstance.delete(`/friends/users/${userId}/remove/${friendId}`);
      return response;
    } catch (error) {
      console.error(`Error removing friend ${friendId}:`, error);
      throw error?.response?.data || error.message || 'Failed to remove friend';
    }
  },

  // Get all friends of a user
  getUserFriends: async (userId) => {
    try {
      const response = await axiosInstance.get(`/friends/users/${userId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching friends for user ${userId}:`, error);
      throw error?.response?.data || error.message || 'Failed to fetch friends';
    }
  },

  // Get pending friend requests
  getPendingRequests: async (userId) => {
    try {
      const response = await axiosInstance.get(`/friends/users/${userId}/pending`);
      return response;
    } catch (error) {
      console.error(`Error fetching pending friend requests for user ${userId}:`, error);
      throw error?.response?.data || error.message || 'Failed to fetch pending requests';
    }
  },

  // Check if users are friends
  areFriends: async (userId1, userId2) => {
    try {
      const response = await axiosInstance.get(`/friends/users/${userId1}/is-friend/${userId2}`);
      return response.data.areFriends;
    } catch (error) {
      console.error(`Error checking friendship between ${userId1} and ${userId2}:`, error);
      return false; // Default to false on error
    }
  }
};

// Recipe Groups service
export const recipeGroupService = {
  // Create a new recipe group
  createGroup: async (group) => {
    try {
      const response = await axiosInstance.post('/recipe-groups', group);
      return response;
    } catch (error) {
      console.error('Error creating recipe group:', error);
      throw error?.response?.data || error.message || 'Failed to create group';
    }
  },

  // Get all recipe groups
  getAllGroups: async () => {
    try {
      const response = await axiosInstance.get('/recipe-groups');
      return response;
    } catch (error) {
      console.error('Error fetching recipe groups:', error);
      throw error?.response?.data || error.message || 'Failed to fetch groups';
    }
  },

  // Get a group by ID
  getGroupById: async (groupId) => {
    try {
      const response = await axiosInstance.get(`/recipe-groups/${groupId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching recipe group ${groupId}:`, error);
      throw error?.response?.data || error.message || 'Failed to fetch group';
    }
  },

  // Get groups created by a user
  getGroupsByCreator: async (creatorId) => {
    try {
      const response = await axiosInstance.get(`/recipe-groups/creator/${creatorId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching groups for creator ${creatorId}:`, error);
      throw error?.response?.data || error.message || 'Failed to fetch groups';
    }
  },

  // Search groups by name
  searchGroups: async (name) => {
    try {
      const response = await axiosInstance.get(`/recipe-groups/search?name=${encodeURIComponent(name)}`);
      return response;
    } catch (error) {
      console.error(`Error searching for groups with name ${name}:`, error);
      throw error?.response?.data || error.message || 'Failed to search groups';
    }
  },

  // Update a group
  updateGroup: async (groupId, group) => {
    try {
      const response = await axiosInstance.put(`/recipe-groups/${groupId}`, group);
      return response;
    } catch (error) {
      console.error(`Error updating group ${groupId}:`, error);
      throw error?.response?.data || error.message || 'Failed to update group';
    }
  },

  // Delete a group
  deleteGroup: async (groupId) => {
    try {
      const response = await axiosInstance.delete(`/recipe-groups/${groupId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting group ${groupId}:`, error);
      throw error?.response?.data || error.message || 'Failed to delete group';
    }
  },

  // Add a member to a group
  addMember: async (groupId, userId, role = 'MEMBER') => {
    try {
      const response = await axiosInstance.post(`/recipe-groups/${groupId}/members`, { userId, role });
      return response;
    } catch (error) {
      console.error(`Error adding member ${userId} to group ${groupId}:`, error);
      throw error?.response?.data || error.message || 'Failed to add member to group';
    }
  },

  // Get group members
  getGroupMembers: async (groupId) => {
    try {
      const response = await axiosInstance.get(`/recipe-groups/${groupId}/members`);
      return response;
    } catch (error) {
      console.error(`Error fetching members for group ${groupId}:`, error);
      throw error?.response?.data || error.message || 'Failed to fetch group members';
    }
  },

  // Check if user is member of a group
  isUserMember: async (groupId, userId) => {
    try {
      const response = await axiosInstance.get(`/recipe-groups/${groupId}/members/${userId}/check`);
      return response.data.isMember;
    } catch (error) {
      console.error(`Error checking if user ${userId} is member of group ${groupId}:`, error);
      return false; // Default to false on error
    }
  }
};

// Categories service
export const categoryService = {
  // Create a new category
  createCategory: async (category) => {
    try {
      const response = await axiosInstance.post('/categories', category);
      return response;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error?.response?.data || error.message || 'Failed to create category';
    }
  },

  // Get all categories
  getAllCategories: async () => {
    try {
      const response = await axiosInstance.get('/categories');
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error?.response?.data || error.message || 'Failed to fetch categories';
    }
  },

  // Get a category by ID
  getCategoryById: async (id) => {
    try {
      const response = await axiosInstance.get(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error?.response?.data || error.message || 'Failed to fetch category';
    }
  },

  // Search categories by name
  searchCategories: async (name) => {
    try {
      const response = await axiosInstance.get(`/categories/search?name=${encodeURIComponent(name)}`);
      return response;
    } catch (error) {
      console.error(`Error searching for categories with name ${name}:`, error);
      throw error?.response?.data || error.message || 'Failed to search categories';
    }
  },

  // Update a category
  updateCategory: async (id, category) => {
    try {
      const response = await axiosInstance.put(`/categories/${id}`, category);
      return response;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error?.response?.data || error.message || 'Failed to update category';
    }
  },

  // Delete a category
  deleteCategory: async (id) => {
    try {
      const response = await axiosInstance.delete(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error?.response?.data || error.message || 'Failed to delete category';
    }
  }
};

export default axiosInstance;