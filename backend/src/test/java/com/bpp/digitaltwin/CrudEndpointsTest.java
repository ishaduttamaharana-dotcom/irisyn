package com.bpp.digitaltwin;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class CrudEndpointsTest {

    @Test
    void testServerCrudOperations() {
        // 1. Create a server
        String serverJson = """
            {
                "hostname": "test-node-99",
                "rack": "Rack C",
                "status": "HEALTHY",
                "cpuUsage": 10.5,
                "ramUsage": 20.0,
                "diskUsage": 15.0,
                "temperatureC": 35.0,
                "uptimeHours": 10
            }
            """;

        String createdServerId = given()
            .contentType(ContentType.JSON)
            .body(serverJson)
            .when().post("/api/servers")
            .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("hostname", is("test-node-99"))
            .extract().path("id");

        // 2. Fetch the created server
        given()
            .when().get("/api/servers/" + createdServerId)
            .then()
            .statusCode(200)
            .body("hostname", is("test-node-99"))
            .body("rack", is("Rack C"));

        // 3. Update the server status
        String updatedServerJson = """
            {
                "hostname": "test-node-99",
                "rack": "Rack C",
                "status": "WARNING",
                "cpuUsage": 92.5,
                "ramUsage": 20.0,
                "diskUsage": 15.0,
                "temperatureC": 35.0,
                "uptimeHours": 11
            }
            """;

        given()
            .contentType(ContentType.JSON)
            .body(updatedServerJson)
            .when().put("/api/servers/" + createdServerId)
            .then()
            .statusCode(200)
            .body("status", is("WARNING"))
            .body("cpuUsage", is(92.5F));

        // 4. Delete the server
        given()
            .when().delete("/api/servers/" + createdServerId)
            .then()
            .statusCode(204);

        // 5. Confirm deletion
        given()
            .when().get("/api/servers/" + createdServerId)
            .then()
            .statusCode(404);
    }

    @Test
    void testVmListEndpoint() {
        given()
            .when().get("/api/vms")
            .then()
            .statusCode(200)
            .body("$", is(notNullValue()));
    }

    @Test
    void testContainerListEndpoint() {
        given()
            .when().get("/api/containers")
            .then()
            .statusCode(200)
            .body("$", is(notNullValue()));
    }
}
