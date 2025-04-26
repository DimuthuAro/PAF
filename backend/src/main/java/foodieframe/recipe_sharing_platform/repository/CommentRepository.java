package foodieframe.recipe_sharing_platform.repository;

import foodieframe.recipe_sharing_platform.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Comment entity
 * Provides CRUD operations for Comment objects
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    /**
     * Find all comments by user ID
     * @param userId the ID of the user
     * @return list of comments made by the user
     */
    List<Comment> findByUserId(Long userId);
    
    /**
     * Find all comments for a specific post
     * @param postId the ID of the post
     * @return list of comments on the post
     */
    List<Comment> findByPostId(Long postId);
    
    /**
     * Find all comments for a specific event
     * @param eventId the ID of the event
     * @return list of comments on the event
     */
    List<Comment> findByEventId(Long eventId);
}
