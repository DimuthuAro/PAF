package foodieframe.recipe_sharing_platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import foodieframe.recipe_sharing_platform.model.Post;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // Spring Data JPA will automatically implement CRUD methods
}