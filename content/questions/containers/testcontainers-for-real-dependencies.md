---
title: "A repeat refund tries to change 2,500 cents to 4,000. What would you check in PostgreSQL?"
topic: containers
roles: [sdet]
level: senior
type: tooling
oneLine: "After the second insert, I read the refund back and check there's one row with the original amount."
looksFor:
  - "Check that PostgreSQL keeps the first amount without adding another row."
  - "Use a cheaper test for error handling if it doesn't depend on how the database works."
  - "Use the temporary database's JDBC address after it starts."
  - "Count database startup costs when several automated jobs run at once."
trap: "Fixing the database address in code or sharing rows any test can change."
followUps:
  - question: "If another method in `RefundInsertTest` needs an empty refunds table, would you start another database?"
    answer: "If the JUnit class runs methods one at a time, I'd use a static `@Container`, which starts once for the class. I'd reset the data between methods so test order doesn't matter."
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

I'd read the refund back after both inserts and expect one row with the original amount. That checks what PostgreSQL does when two rows use the same reference. If I only want to test the checkout service's response to a database error, a mock, a substitute that gives a planned response, costs less.

A shared database may already have a refund with that reference. I'd use Testcontainers to give the test class its own temporary PostgreSQL database. When it starts, I'd connect with its JDBC URL, the Java database address, and the port mapped to the host. I'd measure image downloads, startup time, and memory use during overlapping CI runs. Then I'd decide whether each method needs its own database.

### Example

I'd run the insert rule directly and read the rows it leaves. After trying the same refund reference for 4,000 cents, I'd expect just the original row for 2,500 cents. I'd use a Docker-compatible runtime, the Testcontainers `2.0.5` PostgreSQL and JUnit Jupiter modules, and the PostgreSQL JDBC driver.
