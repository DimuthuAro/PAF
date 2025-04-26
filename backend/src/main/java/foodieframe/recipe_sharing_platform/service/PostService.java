package foodieframe.recipe_sharing_platform.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import foodieframe.recipe_sharing_platform.model.Post;
import foodieframe.recipe_sharing_platform.repository.PostRepository;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;
    
    // Create
    public Post savePost(Post post) {
        return postRepository.save(post);
    }
    
    // Read all
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }
    
    // Read one
    public Optional<Post> getPostById(Long id) {
        return postRepository.findById(id);
    }
    
    // Update
    public Post updatePost(Long id, Post postDetails) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        post.setTitle(postDetails.getTitle());
        post.setCategory(postDetails.getCategory());
        post.setDescription(postDetails.getDescription());
        post.setImage(postDetails.getImage());
        post.setSteps(postDetails.getSteps());
        post.setTags(postDetails.getTags());
        return postRepository.save(post);
    }
    
    // Delete
    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        postRepository.delete(post);
    }
}
