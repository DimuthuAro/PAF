package foodieframe.recipe_sharing_platform.repository;

import foodieframe.recipe_sharing_platform.model.Interaction;
import foodieframe.recipe_sharing_platform.model.Interaction.InteractionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InteractionRepository extends JpaRepository<Interaction, Long> {

    List<Interaction> findByRecipeId(Long recipeId);

    List<Interaction> findByUserId(Long userId);

    List<Interaction> findByRecipeIdAndInteractionType(Long recipeId, InteractionType interactionType);

    List<Interaction> findByUserIdAndInteractionType(Long userId, InteractionType interactionType);

    Optional<Interaction> findByUserIdAndRecipeIdAndInteractionType(Long userId, Long recipeId,
            InteractionType interactionType);

    @Query("SELECT COUNT(i) FROM Interaction i WHERE i.recipeId = :recipeId AND i.interactionType = :interactionType")
    Long countByRecipeIdAndInteractionType(@Param("recipeId") Long recipeId,
            @Param("interactionType") InteractionType interactionType);

    boolean existsByUserIdAndRecipeIdAndInteractionType(Long userId, Long recipeId, InteractionType interactionType);

    void deleteByUserIdAndRecipeIdAndInteractionType(Long userId, Long recipeId, InteractionType interactionType);

    void deleteByRecipeIdAndInteractionType(Long recipeId, InteractionType interactionType);
}
