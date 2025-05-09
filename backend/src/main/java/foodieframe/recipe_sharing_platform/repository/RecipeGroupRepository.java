package foodieframe.recipe_sharing_platform.repository;

import foodieframe.recipe_sharing_platform.model.RecipeGroup;
import foodieframe.recipe_sharing_platform.model.RecipeGroup.GroupPrivacy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeGroupRepository extends JpaRepository<RecipeGroup, Long> {
    // Find all groups created by a specific user
    List<RecipeGroup> findByCreatorId(Long creatorId);

    // Find groups by name (partial match)
    List<RecipeGroup> findByNameContainingIgnoreCase(String name);

    // Find public groups
    List<RecipeGroup> findByPrivacy(GroupPrivacy privacy);

    // Check if a group with this name exists
    boolean existsByNameIgnoreCase(String name);
}
