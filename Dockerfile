# Stage 1: Build the Spring Boot JAR with Maven and Java 21
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /workspace

COPY backend/pom.xml ./
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal Java 21 JRE runtime for Render
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy compiled JAR
COPY --from=build /workspace/target/acely-backend-1.0.0.jar app.jar

# Expose default port
EXPOSE 8080

# Keep JVM heap within Render's 512MB RAM limit
ENV JAVA_OPTS="-Xmx384m -Xms128m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar"]
