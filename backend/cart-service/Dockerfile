FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY common-lib/pom.xml common-lib/pom.xml
COPY cart-service/pom.xml cart-service/pom.xml
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -pl common-lib,cart-service -am -B -q 2>/dev/null || true
COPY common-lib/src common-lib/src
COPY cart-service/src cart-service/src
RUN --mount=type=cache,target=/root/.m2 \
    mvn package -pl common-lib,cart-service -am -DskipTests -B -q

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
COPY --from=build /app/cart-service/target/*.jar app.jar
RUN chown appuser:appgroup app.jar
USER appuser
EXPOSE 8083
ENTRYPOINT ["java", "-Xmx384m", "-jar", "app.jar", "--spring.profiles.active=docker"]
