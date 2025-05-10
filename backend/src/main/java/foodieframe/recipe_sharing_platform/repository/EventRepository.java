package foodieframe.recipe_sharing_platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import foodieframe.recipe_sharing_platform.model.Event;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    // Spring Data JPA will automatically implement CRUD methods
    
    // Find events by title containing the search term (case-insensitive)
    List<Event> findByTitleContainingIgnoreCase(String title);
    
    // Find events by location containing the search term (case-insensitive)
    List<Event> findByLocationContainingIgnoreCase(String location);
    
    // Find events by description containing the search term (case-insensitive)
    List<Event> findByDescriptionContainingIgnoreCase(String description);
    
    // Find events by user ID
    List<Event> findByUserId(Long userId);
    
    // Custom query to search across multiple fields
    @Query("SELECT e FROM Event e WHERE " +
           "LOWER(e.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.location) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Event> searchEvents(@Param("searchTerm") String searchTerm);
}