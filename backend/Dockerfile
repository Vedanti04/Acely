# Stage 1: Build the Spring Boot JAR with Maven and Java 21
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /workspace

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source and build executable JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal Java 21 JRE runtime for Render
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root user
RUN addgroup -S acely && adduser -S acely -G acely
USER acely

# Copy compiled JAR
COPY --from=build /workspace/target/acely-backend-1.0.0.jar app.jar

# Expose default port
EXPOSE 8080

# Keep JVM heap within Render's 512MB RAM limit
ENV JAVA_OPTS="-Xmx384m -Xms128m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
