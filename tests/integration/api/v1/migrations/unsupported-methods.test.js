import database from "infra/database.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await database.query("drop schema public cascade; create schema public;");
});
describe("DELETE, PUT, PATCH /api/v1/migrations", () => {
  describe("anonymous user", () => {
    test("Running pending migrations", async () => {
      const methods = ["DELETE", "PUT", "PATCH"];
      for (const method of methods) {
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: method,
          },
        );
        expect(response.status).toBe(405);
      }
      const databaseName = process.env.POSTGRES_DB;
      const databaseOpenedConnectionsResult = await database.query({
        text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
        values: [databaseName],
      });
      const databaseOpenedConnectionsValue =
        databaseOpenedConnectionsResult.rows[0].count;
      expect(databaseOpenedConnectionsValue).toBe(1);
    });
  });
});
