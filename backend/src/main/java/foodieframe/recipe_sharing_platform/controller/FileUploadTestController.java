package foodieframe.recipe_sharing_platform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/api/uploads")
public class FileUploadTestController {

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> checkUploadsStatus() {
        Map<String, Object> response = new HashMap<>();

        try {
            // Check if uploads directory exists
            String baseDir = System.getProperty("user.dir") + "/uploads";
            Path basePath = Paths.get(baseDir);
            boolean baseExists = Files.exists(basePath);

            // Check if images and videos directories exist
            Path imagesPath = Paths.get(baseDir + "/images");
            Path videosPath = Paths.get(baseDir + "/videos");
            boolean imagesExists = Files.exists(imagesPath);
            boolean videosExists = Files.exists(videosPath);

            // Get number of files in each directory
            int imageCount = 0;
            int videoCount = 0;

            if (imagesExists) {
                File imagesDir = imagesPath.toFile();
                File[] imageFiles = imagesDir.listFiles();
                imageCount = (imageFiles != null) ? imageFiles.length : 0;
            }

            if (videosExists) {
                File videosDir = videosPath.toFile();
                File[] videoFiles = videosDir.listFiles();
                videoCount = (videoFiles != null) ? videoFiles.length : 0;
            }

            // Add all info to response
            response.put("success", true);
            response.put("uploadsDirectoryExists", baseExists);
            response.put("uploadsPath", basePath.toAbsolutePath().toString());
            response.put("imagesDirectoryExists", imagesExists);
            response.put("imagesPath", imagesPath.toAbsolutePath().toString());
            response.put("videosDirectoryExists", videosExists);
            response.put("videosPath", videosPath.toAbsolutePath().toString());
            response.put("imageFileCount", imageCount);
            response.put("videoFileCount", videoCount);

            // Get a list of example files (up to 5 from each directory)
            List<String> sampleImages = new ArrayList<>();
            List<String> sampleVideos = new ArrayList<>();

            if (imagesExists && imageCount > 0) {
                File imagesDir = imagesPath.toFile();
                File[] imageFiles = imagesDir.listFiles();
                if (imageFiles != null) {
                    int count = 0;
                    for (File file : imageFiles) {
                        if (count >= 5)
                            break;
                        sampleImages.add("/uploads/images/" + file.getName());
                        count++;
                    }
                }
            }

            if (videosExists && videoCount > 0) {
                File videosDir = videosPath.toFile();
                File[] videoFiles = videosDir.listFiles();
                if (videoFiles != null) {
                    int count = 0;
                    for (File file : videoFiles) {
                        if (count >= 5)
                            break;
                        sampleVideos.add("/uploads/videos/" + file.getName());
                        count++;
                    }
                }
            }

            response.put("sampleImageUrls", sampleImages);
            response.put("sampleVideoUrls", sampleVideos);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
