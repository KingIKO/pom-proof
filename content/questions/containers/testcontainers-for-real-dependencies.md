---
title: A repeated refund tries to replace 2,500 cents with 4,000. Which assertion belongs in PostgreSQL?
topic: containers
roles: [sdet]
level: senior
type: tooling
oneLine: Read back the refund and require one row for the original amount after the second insert.
looksFor:
  - Verifies PostgreSQL keeps the first amount and does not add a second row.
  - Keeps error handling in a cheaper test when it does not depend on database semantics.
  - Connects with the disposable database's JDBC URL after it starts.
  - Factors in the cost of starting databases across concurrent CI jobs.
trap: Hard-coding the database address or reusing the same mutable test rows across CI jobs.
followUps:
  - question: A second method in RefundInsertTest needs an empty refunds table. Would you start another database?
    answer: "For a sequential JUnit class I'd use a static `@Container`, which runs once for the class, and reset data between methods so the tests don't depend on execution order."
sources:
  - label: Testcontainers PostgreSQL module and JDBC driver dependency
    url: https://java.testcontainers.org/modules/databases/postgres/
  - label: Testcontainers PostgreSQL startup and connection implementation
    url: https://raw.githubusercontent.com/testcontainers/testcontainers-java/2.0.5/modules/postgresql/src/main/java/org/testcontainers/postgresql/PostgreSQLContainer.java
  - label: Testcontainers JUnit 5 lifecycle
    url: https://java.testcontainers.org/test_framework_integration/junit_5/
  - label: Testcontainers port mapping
    url: https://java.testcontainers.org/features/networking/
  - label: Testcontainers runtime requirements
    url: https://java.testcontainers.org/supported_docker_environment/
  - label: PostgreSQL official image and tags
    url: https://hub.docker.com/_/postgres
  - label: PostgreSQL table constraints
    url: https://www.postgresql.org/docs/16/sql-createtable.html
  - label: PostgreSQL ON CONFLICT
    url: https://www.postgresql.org/docs/16/sql-insert.html
  - label: PostgreSQL SELECT
    url: https://www.postgresql.org/docs/16/sql-select.html
  - label: PostgreSQL driver connection syntax
    url: https://jdbc.postgresql.org/documentation/use/
  - label: Java 21 JDBC statement methods
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.sql/java/sql/Statement.html
  - label: Java 21 JDBC result sets
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.sql/java/sql/ResultSet.html
  - label: JUnit 5 assertions
    url: https://docs.junit.org/5.14.5/writing-tests/assertions.html
  - label: JUnit 5 test classes and methods
    url: https://docs.junit.org/5.14.5/writing-tests/test-classes-and-methods.html
examples:
  - title: Keep the original amount after a duplicate insert
    variants:
      - lang: java
        label: Testcontainers and JUnit 5 (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import static org.junit.jupiter.api.Assertions.assertFalse;
          import static org.junit.jupiter.api.Assertions.assertTrue;
          import java.sql.DriverManager;
          import java.sql.SQLException;
          import org.junit.jupiter.api.Test;
          import org.testcontainers.junit.jupiter.Container;
          import org.testcontainers.junit.jupiter.Testcontainers;
          import org.testcontainers.postgresql.PostgreSQLContainer;

          @Testcontainers
          class RefundInsertTest {
              @Container
              static final PostgreSQLContainer db = new PostgreSQLContainer("postgres:16.16");

              @Test
              void duplicateReferenceKeepsOriginalRefund() throws SQLException {
                  try (var conn = DriverManager.getConnection(
                          db.getJdbcUrl(), db.getUsername(), db.getPassword());
                       var sql = conn.createStatement()) {
                      sql.executeUpdate("""
                          CREATE TABLE refunds (ref text PRIMARY KEY, cents int NOT NULL)
                          """);
                      sql.executeUpdate("INSERT INTO refunds (ref, cents) VALUES ('refund-42', 2500)");
                      sql.executeUpdate("""
                          INSERT INTO refunds (ref, cents) VALUES ('refund-42', 4000)
                          ON CONFLICT (ref) DO NOTHING
                          """);
                      try (var rows = sql.executeQuery("SELECT cents FROM refunds")) {
                          assertTrue(rows.next());
                          assertEquals(2500, rows.getInt("cents"));
                          assertFalse(rows.next());
                      }
                  }
              }
          }
---

I'd read the refund back after both inserts and expect one row with the original amount. That
checks PostgreSQL's conflict behavior. For the checkout service's response to a database error,
a mock suffices and costs less to run.

A shared database could already contain that refund reference. I'd let the class own a disposable
PostgreSQL instance through Testcontainers. When the instance is ready, I'd connect using its
JDBC URL and mapped port. I'd measure image pulls, startup time, and memory on concurrent CI
runs before deciding whether to use a fresh instance per method.

### Example

A refund with an existing reference should leave one row with the original amount. This test runs the insert rule directly and reads the resulting rows. It expects one refund for 2,500 cents after trying the same reference with 4,000 cents. The runner needs a Docker-compatible runtime, the Testcontainers `2.0.5` PostgreSQL and JUnit Jupiter modules, and the PostgreSQL JDBC driver.
