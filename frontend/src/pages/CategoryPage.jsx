import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get(`/posts?category=${categoryName}`);
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [categoryName]);

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="category-page-container">
      <h1 className="text-2xl font-bold mb-4">Posts in {categoryName}</h1>
      <input
        type="text"
        placeholder="Search by title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="post-card p-4 border rounded-lg">
            <h2 className="text-lg font-semibold">{post.title}</h2>
            <p className="text-sm text-gray-600">{post.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;