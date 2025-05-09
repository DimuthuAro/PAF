package foodieframe.recipe_sharing_platform.service;

import foodieframe.recipe_sharing_platform.model.Interaction;
import foodieframe.recipe_sharing_platform.model.Interaction.InteractionType;
import foodieframe.recipe_sharing_platform.repository.InteractionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class InteractionService {

    @Autowired
    private InteractionRepository interactionRepository;

    public Interaction createInteraction(Long userId, Long recipeId, InteractionType type, String content) {
        // Check if interaction already exists (for likes and favorites)
        if (type != InteractionType.COMMENT) {
            Optional<Interaction> existingInteraction = interactionRepository
                    .findByUserIdAndRecipeIdAndInteractionType(userId, recipeId, type);

            if (existingInteraction.isPresent()) {
                return existingInteraction.get();
            }
        }

        Interaction interaction = new Interaction();
        interaction.setUserId(userId);
        interaction.setRecipeId(recipeId);
        interaction.setInteractionType(type);
        interaction.setContent(content);

        return interactionRepository.save(interaction);
    }

    public List<Interaction> getRecipeInteractions(Long recipeId) {
        return interactionRepository.findByRecipeId(recipeId);
    }

    public List<Interaction> getRecipeInteractionsByType(Long recipeId, InteractionType type) {
        return interactionRepository.findByRecipeIdAndInteractionType(recipeId, type);
    }

    public List<Interaction> getUserInteractionsByType(Long userId, InteractionType type) {
        return interactionRepository.findByUserIdAndInteractionType(userId, type);
    }

    public Long getInteractionCount(Long recipeId, InteractionType type) {
        return interactionRepository.countByRecipeIdAndInteractionType(recipeId, type);
    }

    public boolean hasUserInteracted(Long userId, Long recipeId, InteractionType type) {
        return interactionRepository.existsByUserIdAndRecipeIdAndInteractionType(userId, recipeId, type);
    }

    public Interaction updateInteraction(Long interactionId, String newContent) {
        Interaction interaction = interactionRepository.findById(interactionId)
                .orElseThrow(() -> new RuntimeException("Interaction not found"));

        interaction.setContent(newContent);
        return interactionRepository.save(interaction);
    }

    @Transactional
    public void deleteInteraction(Long interactionId) {
        interactionRepository.deleteById(interactionId);
    }

    @Transactional
    public void deleteUserInteraction(Long userId, Long recipeId, InteractionType type) {
        interactionRepository.deleteByUserIdAndRecipeIdAndInteractionType(userId, recipeId, type);
    }

    @Transactional
    public void deleteRecipeInteractionsByType(Long recipeId, InteractionType type) {
        interactionRepository.deleteByRecipeIdAndInteractionType(recipeId, type);
    }
}
