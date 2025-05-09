package foodieframe.recipe_sharing_platform.controller;

import foodieframe.recipe_sharing_platform.model.SavedRecipe;
import foodieframe.recipe_sharing_platform.service.SavedRecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/api/saved-recipes")
public class SavedRecipeController {

    @Autowired
    private SavedRecipeService savedRecipeService;

    // Save a recipe
    @PostMapping
    public ResponseEntity<SavedRecipe> saveRecipe(@RequestBody SavedRecipe savedRecipe) {
        return new ResponseEntity<>(savedRecipeService.saveRecipe(savedRecipe), HttpStatus.CREATED);
    }

    // Save a recipe with user and recipe IDs
    @PostMapping("/users/{userId}/recipes/{recipeId}")
    public ResponseEntity<SavedRecipe> saveRecipe(
            @PathVariable Long userId,
            @PathVariable Long recipeId,
            @RequestBody(required = false) Map<String, String> body) {

        if (body != null && body.containsKey("note")) {
            return new ResponseEntity<>(
                    savedRecipeService.saveRecipe(userId, recipeId, body.get("note")),
                    HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>(
                    savedRecipeService.saveRecipe(userId, recipeId),
                    HttpStatus.CREATED);
        }
    }

    // Get all saved recipes for a user
    @GetMapping("/users/{userId}")
    public ResponseEntity<List<SavedRecipe>> getUserSavedRecipes(@PathVariable Long userId) {
        return new ResponseEntity<>(savedRecipeService.getUserSavedRecipes(userId), HttpStatus.OK);
    }

    // Check if a recipe is saved by a user
    @GetMapping("/users/{userId}/recipes/{recipeId}/check")
    public ResponseEntity<Map<String, Boolean>> isRecipeSaved(
            @PathVariable Long userId,
            @PathVariable Long recipeId) {

        boolean isSaved = savedRecipeService.isRecipeSaved(userId, recipeId);
        return new ResponseEntity<>(Map.of("saved", isSaved), HttpStatus.OK);
    }

    // Get a specific saved recipe
    @GetMapping("/users/{userId}/recipes/{recipeId}")
    public ResponseEntity<SavedRecipe> getSavedRecipe(
            @PathVariable Long userId,
            @PathVariable Long recipeId) {

        return savedRecipeService.getSavedRecipe(userId, recipeId)
                .map(savedRecipe -> new ResponseEntity<>(savedRecipe, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Update the note of a saved recipe
    @PutMapping("/users/{userId}/recipes/{recipeId}")
    public ResponseEntity<SavedRecipe> updateSavedRecipeNote(
            @PathVariable Long userId,
            @PathVariable Long recipeId,
            @RequestBody Map<String, String> body) {

        try {
            SavedRecipe updatedRecipe = savedRecipeService.updateSavedRecipeNote(
                    userId, recipeId, body.get("note"));
            return new ResponseEntity<>(updatedRecipe, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Remove a saved recipe
    @DeleteMapping("/users/{userId}/recipes/{recipeId}")
    public ResponseEntity<Void> removeSavedRecipe(
            @PathVariable Long userId,
            @PathVariable Long recipeId) {

        savedRecipeService.removeSavedRecipe(userId, recipeId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Count how many users have saved a recipe
    @GetMapping("/recipes/{recipeId}/count")
    public ResponseEntity<Map<String, Long>> countSavesByRecipe(@PathVariable Long recipeId) {
        long count = savedRecipeService.countSavesByRecipe(recipeId);
        return new ResponseEntity<>(Map.of("count", count), HttpStatus.OK);
    }
}
