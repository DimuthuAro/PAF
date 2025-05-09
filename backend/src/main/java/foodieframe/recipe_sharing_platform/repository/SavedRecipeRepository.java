package foodieframe.recipe_sharing_platform.repository;

import foodieframe.recipe_sharing_platform.model.SavedRecipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedRecipeRepository extends JpaRepository<SavedRecipe, Long> {
    // Find all recipes saved by a specific user
    List<SavedRecipe> findByUserId(Long userId);

    // Check if a recipe is saved by a specific user
    boolean existsByUserIdAndPostId(Long userId, Long postId);

    // Find a specific saved recipe entry
    Optional<SavedRecipe> findByUserIdAndPostId(Long userId, Long postId);

    // Delete a saved recipe entry
    void deleteByUserIdAndPostId(Long userId, Long postId);

    // Count how many users have saved a recipe
    long countByPostId(Long postId);
}
