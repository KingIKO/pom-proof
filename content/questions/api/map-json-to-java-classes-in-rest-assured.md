---
title: "The label-list test gets untyped maps back. How would you make it compare actual labels?"
topic: api
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "Give REST Assured the list's element type so the create and read checks can compare the same kind of label."
looksFor:
  - "Explains why List.class cannot tell the mapper to produce Label records."
  - "Checks the HTTP status before reading a response model."
  - "Uses a smaller create model because the service supplies the ID."
  - "Decides whether an added field should affect this client test."
trap: "Reading a JSON array into List.class and assuming the elements will be typed label records."
followUps:
  - question: "Both reads map successfully, but the list contains two labels named Cold shelf. Which one counts?"
    answer: "I'd look for the ID returned by the create and compare that record's fields. The name alone doesn't tell me the list contains the label this test created."
sources:
  - label: REST Assured object mapping and mapper configuration
    url: https://rest-assured.io/docs/usage/object-mapping/
  - label: REST Assured, generic deserialization
    url: https://rest-assured.io/docs/usage/examples/
  - label: REST Assured 7, TypeRef package declaration
    url: https://raw.githubusercontent.com/rest-assured/rest-assured/rest-assured-7.0.0/rest-assured-common/src/main/java/io/restassured/common/mapper/TypeRef.java
  - label: Jackson 2.12, record support
    url: https://github.com/FasterXML/jackson/wiki/Jackson-Release-2.12
  - label: Jackson annotation, ignoreUnknown
    url: https://javadoc.io/static/com.fasterxml.jackson.core/jackson-annotations/2.20/com/fasterxml/jackson/annotation/JsonIgnoreProperties.html
examples:
  - title: Create a label and read typed records back
    variants:
      - lang: java
        label: REST Assured and JUnit 5 (Java)
        code: |
          import static io.restassured.RestAssured.given;
          import static io.restassured.config.ObjectMapperConfig.objectMapperConfig;
          import static io.restassured.config.RestAssuredConfig.config;
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import static org.junit.jupiter.api.Assertions.assertTrue;
          import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
          import io.restassured.common.mapper.TypeRef;
          import io.restassured.mapper.ObjectMapperType;
          import java.util.List;
          import org.junit.jupiter.api.Test;

          class LabelMappingTest {
            private static final String LABELS = "http://localhost:3000/warehouse/labels";
            public record NewLabel(String name) {}

            @JsonIgnoreProperties(ignoreUnknown = true)
            public record Label(String id, String name) {}

            @Test
            void readsLabelRecords() {
              var mapper = config().objectMapperConfig(
                  objectMapperConfig().defaultObjectMapperType(ObjectMapperType.JACKSON_2));
              var input = new NewLabel("Cold shelf");
              Label created = given().config(mapper).contentType("application/json")
                  .body(input).post(LABELS).then().statusCode(201).extract().as(Label.class);
              List<Label> labels = given().config(mapper).get(LABELS).then().statusCode(200)
                  .extract().as(new TypeRef<List<Label>>() {});
              assertEquals(input.name(), created.name());
              assertTrue(labels.contains(created), "Created label is missing from the read");
            }
          }
---

The check I want is that the list contains the label returned by create, including its ID. `List.class` leaves the element type unspecified. After checking the response status, I'd pass `TypeRef<List<Label>>` for the list and `Label.class` for the single response.

For the create request I'd send a smaller record with only the name. Set the media type to JSON and choose the mapper the suite expects. If the service adds a printer hint, a client that never reads it can ignore the extra field. The test still asserts the values it depends on.

### Example

Use a reset local label service and REST Assured with Jackson 2.12 or newer on the test classpath. `POST` should create `Cold shelf` and `GET` should include that returned label in its JSON array.
