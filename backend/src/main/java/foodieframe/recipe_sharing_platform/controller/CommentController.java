package foodieframe.recipe_sharing_platform.controller;

import foodieframe.recipe_sharing_platform.model.Comment;
import foodieframe.recipe_sharing_platform.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for handling Comment-related HTTP requests
 * Provides endpoints for CRUD operations on Comment resources
 */
@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
public class CommentController {

    @Autowired
    private CommentService commentService;

    /**
     * Get all comments
     * @return List of all comments
     */
    @GetMapping
    public ResponseEntity<List<Comment>> getAllComments() {
        List<Comment> comments = commentService.getAllComments();
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

    /**
     * Get a specific comment by ID
     * @param id The ID of the comment to retrieve
     * @return The comment if found, 404 otherwise
     */
    @GetMapping("/{id}")
    public ResponseEntity<Comment> getCommentById(@PathVariable Long id) {
        Comment comment = commentService.getCommentById(id);
        if (comment != null) {
            return new ResponseEntity<>(comment, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    /**
     * Get all comments by a specific user
     * @param userId The ID of the user
     * @return List of comments by the user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Comment>> getCommentsByUserId(@PathVariable Long userId) {
        List<Comment> comments = commentService.getCommentsByUserId(userId);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

    /**
     * Get all comments for a specific post
     * @param postId The ID of the post
     * @return List of comments on the post
     */
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Comment>> getCommentsByPostId(@PathVariable Long postId) {
        List<Comment> comments = commentService.getCommentsByPostId(postId);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

    /**
     * Get all comments for a specific event
     * @param eventId The ID of the event
     * @return List of comments on the event
     */
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Comment>> getCommentsByEventId(@PathVariable Long eventId) {
        List<Comment> comments = commentService.getCommentsByEventId(eventId);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

    /**
     * Create a new comment
     * @param comment The comment to create
     * @return The created comment with 201 status
     */
    @PostMapping
    public ResponseEntity<Comment> createComment(@RequestBody Comment comment) {
        Comment newComment = commentService.createComment(comment);
        return new ResponseEntity<>(newComment, HttpStatus.CREATED);
    }

    /**
     * Update an existing comment
     * @param id The ID of the comment to update
     * @param commentDetails The updated comment details
     * @return The updated comment if found, 404 otherwise
     */
    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateComment(@PathVariable Long id, @RequestBody Comment commentDetails) {
        Comment updatedComment = commentService.updateComment(id, commentDetails);
        if (updatedComment != null) {
            return new ResponseEntity<>(updatedComment, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    /**
     * Delete a comment
     * @param id The ID of the comment to delete
     * @return 204 if deleted, 404 if not found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteComment(@PathVariable Long id) {
        if (commentService.deleteComment(id)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
