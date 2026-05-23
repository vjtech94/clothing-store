FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY common-lib/pom.xml common-lib/pom.xml
COPY api-gateway/pom.xml api-gateway/pom.xml
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -pl common-lib,api-gateway -am -B -q 2>/dev/null || true
COPY common-lib/src common-lib/src
COPY api-gateway/src api-gateway/src
RUN --mount=type=cache,target=/root/.m2 \
    mvn package -pl common-lib,api-gateway -am -DskipTests -B -q

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
COPY --from=build /app/api-gateway/target/*.jar app.jar
RUN chown appuser:appgroup app.jar
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-Xmx384m", "-jar", "app.jar", "--spring.profiles.active=docker"]
