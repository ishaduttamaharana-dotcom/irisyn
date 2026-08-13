# IRISYN Background Worker Dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/quarkus-app/lib/ /app/lib/ 2>/dev/null || true
COPY --from=builder /app/target/quarkus-app/*.jar /app/ 2>/dev/null || true
ENV WORKER_MODE=true
CMD ["java", "-Dquarkus.profile=worker", "-jar", "/app/quarkus-run.jar"]
