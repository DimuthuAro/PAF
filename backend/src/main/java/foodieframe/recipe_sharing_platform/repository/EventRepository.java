package foodieframe.recipe_sharing_platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import foodieframe.recipe_sharing_platform.model.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    // Spring Data JPA will automatically implement CRUD methods
}