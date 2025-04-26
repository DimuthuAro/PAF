# Use OpenJDK as base image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make Maven wrapper executable
RUN chmod +x ./mvnw

# Download dependencies (separate layer for caching)
RUN ./mvnw dependency:go-offline

# Copy source code
COPY src ./src

# Build application
RUN ./mvnw package -DskipTests

# Runtime configuration
EXPOSE 8081

# Run the application
ENTRYPOINT ["java", "-jar", "target/recipe-sharing-platform-0.0.1-SNAPSHOT.jar"]
