FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY common-lib/pom.xml common-lib/pom.xml
COPY product-service/pom.xml product-service/pom.xml
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -pl common-lib,product-service -am -B -q 2>/dev/null || true
COPY common-lib/src common-lib/src
COPY product-service/src product-service/src
RUN --mount=type=cache,target=/root/.m2 \
    mvn package -pl common-lib,product-service -am -DskipTests -B -q

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
COPY --from=build /app/product-service/target/*.jar app.jar
RUN chown appuser:appgroup app.jar
USER appuser
EXPOSE 8082
ENTRYPOINT ["java", "-Xmx768m", "-jar", "app.jar", "--spring.profiles.active=docker"]
