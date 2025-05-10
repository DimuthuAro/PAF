package foodieframe.recipe_sharing_platform.service;

import foodieframe.recipe_sharing_platform.model.SavedRecipe;
import foodieframe.recipe_sharing_platform.repository.SavedRecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SavedRecipeService {

    @Autowired
    private SavedRecipeRepository savedRecipeRepository;

    // Save a recipe to a user's saved collection
    public SavedRecipe saveRecipe(SavedRecipe savedRecipe) {
        return savedRecipeRepository.save(savedRecipe);
    }

    // Save a recipe with just the user and post IDs
    public SavedRecipe saveRecipe(Long userId, Long postId) {
        SavedRecipe savedRecipe = new SavedRecipe(userId, postId);
        return savedRecipeRepository.save(savedRecipe);
    }

    // Save a recipe with a note
    public SavedRecipe saveRecipe(Long userId, Long postId, String note) {
        SavedRecipe savedRecipe = new SavedRecipe(userId, postId, note);
        return savedRecipeRepository.save(savedRecipe);
    }

    // Get all saved recipes for a user
    public List<SavedRecipe> getUserSavedRecipes(Long userId) {
        return savedRecipeRepository.findByUserId(userId);
    }

    // Check if a recipe is already saved by a user
    public boolean isRecipeSaved(Long userId, Long postId) {
        return savedRecipeRepository.existsByUserIdAndPostId(userId, postId);
    }

    // Get a specific saved recipe
    public Optional<SavedRecipe> getSavedRecipe(Long userId, Long postId) {
        return savedRecipeRepository.findByUserIdAndPostId(userId, postId);
    }

    // Update the note of a saved recipe
    public SavedRecipe updateSavedRecipeNote(Long userId, Long postId, String newNote) {
        Optional<SavedRecipe> savedRecipeOpt = savedRecipeRepository.findByUserIdAndPostId(userId, postId);
        if (savedRecipeOpt.isPresent()) {
            SavedRecipe savedRecipe = savedRecipeOpt.get();
            savedRecipe.setNote(newNote);
            return savedRecipeRepository.save(savedRecipe);
        } else {
            throw new RuntimeException("Saved recipe not found for user: " + userId + " and post: " + postId);
        }
    } // Remove a recipe from a user's saved collection

    @Transactional
    public void removeSavedRecipe(Long userId, Long postId) {
        savedRecipeRepository.deleteByUserIdAndPostId(userId, postId);
    }

    // Count how many users have saved a recipe
    public long countSavesByRecipe(Long postId) {
        return savedRecipeRepository.countByPostId(postId);
    }
}
