package foodieframe.recipe_sharing_platform.controller;

import foodieframe.recipe_sharing_platform.model.Interaction;
import foodieframe.recipe_sharing_platform.model.Interaction.InteractionType;
import foodieframe.recipe_sharing_platform.service.InteractionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/api/interactions")
public class InteractionController {

    @Autowired
    private InteractionService interactionService;

    // Create an interaction (like, favorite, comment)
    @PostMapping("/users/{userId}/recipes/{recipeId}")
    public ResponseEntity<Interaction> createInteraction(
            @PathVariable Long userId,
            @PathVariable Long recipeId,
            @RequestParam InteractionType type,
            @RequestBody(required = false) String content) {

        Interaction interaction = interactionService.createInteraction(userId, recipeId, type, content);
        return new ResponseEntity<>(interaction, HttpStatus.CREATED);
    }

    // Get all interactions for a recipe
    @GetMapping("/recipes/{recipeId}")
    public ResponseEntity<List<Interaction>> getRecipeInteractions(@PathVariable Long recipeId) {
        return new ResponseEntity<>(
                interactionService.getRecipeInteractions(recipeId),
                HttpStatus.OK);
    }

    // Get recipe interactions by type
    @GetMapping("/recipes/{recipeId}/type/{type}")
    public ResponseEntity<List<Interaction>> getRecipeInteractionsByType(
            @PathVariable Long recipeId,
            @PathVariable InteractionType type) {

        return new ResponseEntity<>(
                interactionService.getRecipeInteractionsByType(recipeId, type),
                HttpStatus.OK);
    }

    // Get interaction count by type
    @GetMapping("/recipes/{recipeId}/type/{type}/count")
    public ResponseEntity<Long> getInteractionCount(
            @PathVariable Long recipeId,
            @PathVariable InteractionType type) {

        return new ResponseEntity<>(
                interactionService.getInteractionCount(recipeId, type),
                HttpStatus.OK);
    }

    // Get user's interactions by type
    @GetMapping("/users/{userId}/type/{type}")
    public ResponseEntity<List<Interaction>> getUserInteractionsByType(
            @PathVariable Long userId,
            @PathVariable InteractionType type) {

        return new ResponseEntity<>(
                interactionService.getUserInteractionsByType(userId, type),
                HttpStatus.OK);
    }

    // Check if user has made a specific interaction
    @GetMapping("/users/{userId}/recipes/{recipeId}/type/{type}/check")
    public ResponseEntity<Boolean> checkUserInteraction(
            @PathVariable Long userId,
            @PathVariable Long recipeId,
            @PathVariable InteractionType type) {

        boolean hasInteracted = interactionService.hasUserInteracted(userId, recipeId, type);
        return new ResponseEntity<>(hasInteracted, HttpStatus.OK);
    }

    // Update an interaction (primarily for comments)
    @PutMapping("/{interactionId}")
    public ResponseEntity<Interaction> updateInteraction(
            @PathVariable Long interactionId,
            @RequestBody String content) {

        try {
            Interaction updatedInteraction = interactionService.updateInteraction(interactionId, content);
            return new ResponseEntity<>(updatedInteraction, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a specific interaction
    @DeleteMapping("/{interactionId}")
    public ResponseEntity<Void> deleteInteraction(@PathVariable Long interactionId) {
        try {
            interactionService.deleteInteraction(interactionId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete user interaction of specific type
    @DeleteMapping("/users/{userId}/recipes/{recipeId}/type/{type}")
    public ResponseEntity<Void> deleteUserInteraction(
            @PathVariable Long userId,
            @PathVariable Long recipeId,
            @PathVariable InteractionType type) {

        interactionService.deleteUserInteraction(userId, recipeId, type);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Delete all interactions of a type for a recipe
    @DeleteMapping("/recipes/{recipeId}/type/{type}")
    public ResponseEntity<Void> deleteRecipeInteractionsByType(
            @PathVariable Long recipeId,
            @PathVariable InteractionType type) {

        interactionService.deleteRecipeInteractionsByType(recipeId, type);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
