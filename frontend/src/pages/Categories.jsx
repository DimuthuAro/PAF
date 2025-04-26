import React from 'react';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const navigate = useNavigate();

  const categories = [
    { id: 1, name: 'Desserts' },
    { id: 2, name: 'Main Course' },
    { id: 3, name: 'Appetizers' },
    { id: 4, name: 'Beverages' },
  ];

  const handleCategoryClick = (categoryName) => {
    navigate(`/categorypage/${categoryName}`);
  };

  return (
    <div className="categories-container">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="category-card p-4 border rounded-lg cursor-pointer hover:shadow-lg"
            onClick={() => handleCategoryClick(category.name)}
          >
            <h2 className="text-lg font-semibold">{category.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;