package foodieframe.recipe_sharing_platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

import foodieframe.recipe_sharing_platform.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Find a user by their email address
    User findByEmail(String email);
    
    // Find a user by their username
    Optional<User> findByUsername(String username);
    
    // Check if a username exists
    boolean existsByUsername(String username);
    
    // Check if an email exists
    boolean existsByEmail(String email);
    
    // Find users by name (partial match)
    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<User> findByNameContainingIgnoreCase(@Param("name") String name);
    
    // Find users by username (partial match)
    List<User> findByUsernameContainingIgnoreCase(String username);
    
    // Custom query to find users with matching bio keywords
    @Query("SELECT u FROM User u WHERE u.bio LIKE %:keyword%")
    List<User> findUsersByBioKeyword(@Param("keyword") String keyword);
    
    // Find users who registered most recently
    List<User> findTop10ByOrderByIdDesc();
}