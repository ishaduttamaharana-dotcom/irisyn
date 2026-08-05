package com.bpp.digitaltwin;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.is;

@QuarkusTest
class HealthCheckTest {

    @Test
    void healthEndpointReportsUp() {
        given()
            .when().get("/api/health")
            .then()
            .statusCode(200)
            .body("status", is("UP"));
    }
}
