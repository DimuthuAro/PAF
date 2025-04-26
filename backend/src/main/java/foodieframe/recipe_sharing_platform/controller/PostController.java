package foodieframe.recipe_sharing_platform.controller;

import foodieframe.recipe_sharing_platform.model.Post;
import foodieframe.recipe_sharing_platform.service.PostService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;
    
    // Create
    @PostMapping
    public ResponseEntity<Post> createPost(@Valid @RequestBody Post post) {
        return new ResponseEntity<Post>(postService.savePost(post), HttpStatus.CREATED);
    }
    
    // Read all
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        return new ResponseEntity<List<Post>>(postService.getAllPosts(), HttpStatus.OK);
    }
    
    // Read one
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        return postService.getPostById(id)
                .map(post -> new ResponseEntity<>(post, HttpStatus.OK))
                .orElse(new ResponseEntity<Post>(HttpStatus.NOT_FOUND));
    }
    
    // Update
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @Valid @RequestBody Post post) {
        try {
            return new ResponseEntity<Post>(postService.updatePost(id, post), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        try {
            postService.deletePost(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}