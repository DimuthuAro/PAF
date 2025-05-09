package foodieframe.recipe_sharing_platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.lang.NonNull;

import foodieframe.recipe_sharing_platform.controller.UserController;

@SpringBootApplication
@RestController
public class RecipeSharingPlatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(RecipeSharingPlatformApplication.class, args);
	}

	private final UserController userController = new UserController();

	@GetMapping("/")
	public Object getAllProducts() {
		return userController.getAllUsers();
	}

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(@NonNull CorsRegistry registry) {
				registry.addMapping("/**")
						.allowedOriginPatterns("http://localhost:5173")
						.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
						.allowedHeaders("*")
						.allowCredentials(true);
			}
		};
	}
}

