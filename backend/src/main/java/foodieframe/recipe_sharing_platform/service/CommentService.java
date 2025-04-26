package foodieframe.recipe_sharing_platform.service;

import foodieframe.recipe_sharing_platform.model.Comment;
import foodieframe.recipe_sharing_platform.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service class for Comment-related operations
 * Implements business logic for CRUD operations on Comment entity
 */
@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    /**
     * Retrieves all comments
     * @return List of all comments in the system
     */
    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }

    /**
     * Retrieves a specific comment by its ID
     * @param id The ID of the comment to retrieve
     * @return The comment if found, otherwise null
     */
    public Comment getCommentById(Long id) {
        return commentRepository.findById(id).orElse(null);
    }

    /**
     * Retrieves all comments by a specific user
     * @param userId The ID of the user whose comments to retrieve
     * @return List of comments made by the specified user
     */
    public List<Comment> getCommentsByUserId(Long userId) {
        return commentRepository.findByUserId(userId);
    }

    /**
     * Retrieves all comments for a specific post
     * @param postId The ID of the post to get comments for
     * @return List of comments on the specified post
     */
    public List<Comment> getCommentsByPostId(Long postId) {
        return commentRepository.findByPostId(postId);
    }

    /**
     * Retrieves all comments for a specific event
     * @param eventId The ID of the event to get comments for
     * @return List of comments on the specified event
     */
    public List<Comment> getCommentsByEventId(Long eventId) {
        return commentRepository.findByEventId(eventId);
    }

    /**
     * Creates a new comment
     * @param comment The comment to create
     * @return The created comment with generated ID
     */
    public Comment createComment(Comment comment) {
        // Set current timestamp
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        comment.setCreatedAt(LocalDateTime.now().format(formatter));
        
        return commentRepository.save(comment);
    }

    /**
     * Updates an existing comment
     * @param id The ID of the comment to update
     * @param commentDetails The updated comment details
     * @return The updated comment, or null if comment not found
     */
    public Comment updateComment(Long id, Comment commentDetails) {
        Comment comment = commentRepository.findById(id).orElse(null);
        
        if (comment != null) {
            comment.setContent(commentDetails.getContent());
            // Don't update userId, postId, eventId or timestamps on updates
            return commentRepository.save(comment);
        }
        
        return null;
    }

    /**
     * Deletes a comment
     * @param id The ID of the comment to delete
     * @return true if deleted successfully, false if comment not found
     */
    public boolean deleteComment(Long id) {
        if (commentRepository.existsById(id)) {
            commentRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
