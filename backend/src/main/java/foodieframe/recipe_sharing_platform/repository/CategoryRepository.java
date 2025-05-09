package foodieframe.recipe_sharing_platform.repository;

import foodieframe.recipe_sharing_platform.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    // Find a category by name
    Optional<Category> findByNameIgnoreCase(String name);

    // Find categories by name (partial match)
    List<Category> findByNameContainingIgnoreCase(String name);

    // Check if a category with this name exists
    boolean existsByNameIgnoreCase(String name);
}
