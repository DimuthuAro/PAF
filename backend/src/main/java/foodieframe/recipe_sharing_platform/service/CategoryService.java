package foodieframe.recipe_sharing_platform.service;

import foodieframe.recipe_sharing_platform.model.Category;
import foodieframe.recipe_sharing_platform.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    // Create a new category
    public Category createCategory(Category category) {
        // Check if a category with this name already exists
        if (categoryRepository.existsByNameIgnoreCase(category.getName())) {
            throw new RuntimeException("A category with this name already exists");
        }
        return categoryRepository.save(category);
    }

    // Get all categories
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // Get a category by ID
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    // Get a category by name
    public Optional<Category> getCategoryByName(String name) {
        return categoryRepository.findByNameIgnoreCase(name);
    }

    // Search categories by name
    public List<Category> searchCategoriesByName(String name) {
        return categoryRepository.findByNameContainingIgnoreCase(name);
    }

    // Update a category
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        // Check if name is being changed and if new name is unique
        if (!category.getName().equalsIgnoreCase(categoryDetails.getName()) &&
                categoryRepository.existsByNameIgnoreCase(categoryDetails.getName())) {
            throw new RuntimeException("A category with this name already exists");
        }

        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        category.setImageUrl(categoryDetails.getImageUrl());

        return categoryRepository.save(category);
    }

    // Delete a category
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}
