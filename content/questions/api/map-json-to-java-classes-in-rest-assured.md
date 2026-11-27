---
title: "The label-list test gets untyped maps from REST Assured. How would you make it compare actual labels?"
topic: api
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "I'd tell REST Assured the type of each list item. Then I'd compare the label from creation with the one in the list."
looksFor:
  - "Explain why List.class tells the mapper to make a list but leaves out the type of each item."
  - "Check the HTTP status before turning the body into Java objects."
  - "Send a smaller create request because the service supplies the ID."
  - "Decide whether a new field matters to the client the test represents."
trap: "Reading a JSON array with List.class and assuming every item becomes a Java label record."
followUps:
  - question: "Both reads work, but the list has two labels named Cold shelf. Which one would you use?"
    answer: "I'd find the ID from the create response and compare that record's fields. The name doesn't tell me which label the test created."
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

I'd check that the list contains the label the service created, including its ID. The `List.class` type doesn't say what each item is. That gives me untyped maps, or sets of field names and values without a label type. After checking the response status, I'd use `TypeRef<List<Label>>` for a list of label records. I'd use `Label.class` when the response contains one label.

I'd send a smaller record with only the name when creating the label. I'd set the media type, the format declared in the request, to JSON. In REST Assured I'd use the mapper the suite expects to convert between JSON and Java records. If the service adds a printer hint the client never uses, I'd let the client ignore it. I'd still check all the values the client needs.

### Example

I'd reset the local label service and put Jackson 2.12 or newer on the test classpath so REST Assured can use it. I'd `POST` a label named `Cold shelf`. I'd expect the `GET` response to include the returned label in its JSON array.
