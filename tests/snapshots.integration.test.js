import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../apps/api/src/app.js";
import { resetSnapshots } from "../apps/api/src/repositories/snapshotsRepository.js";

describe("snapshots CRUD API", () => {
  const app = createApp();

  beforeEach(() => {
    resetSnapshots();
  });

  it("creates and retrieves a snapshot", async () => {
    const createResponse = await request(app).post("/api/v1/snapshots").send({
      projectId: "project-123",
      keyword: "best pizza brooklyn",
      capturedAt: "2026-05-13T12:00:00Z",
      provider: "dataforseo",
      results: [{ rank: 3, domain: "example.com" }],
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.id).toBeTypeOf("string");
    expect(createResponse.body.data.keyword).toBe("best pizza brooklyn");
    expect(createResponse.body.data.provider).toBe("dataforseo");

    const getResponse = await request(app).get(
      `/api/v1/snapshots/${createResponse.body.data.id}`,
    );

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data.projectId).toBe("project-123");
    expect(getResponse.body.data.results).toHaveLength(1);
  });

  it("lists snapshots with pagination", async () => {
    const first = await request(app).post("/api/v1/snapshots").send({
      projectId: "project-a",
      keyword: "dentist austin",
      capturedAt: "2026-05-13T11:00:00Z",
      provider: "dataforseo",
      results: [{ rank: 4, domain: "dentist-austin.example" }],
    });

    expect(first.status).toBe(201);

    const second = await request(app).post("/api/v1/snapshots").send({
      projectId: "project-a",
      keyword: "pizza chicago",
      capturedAt: "2026-05-13T11:30:00Z",
      provider: "dataforseo",
      results: [{ rank: 2, domain: "pizza-chicago.example" }],
    });

    expect(second.status).toBe(201);

    const listResponse = await request(app)
      .get("/api/v1/snapshots")
      .query({ page: 2, pageSize: 1 });

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.pagination).toEqual({
      page: 2,
      pageSize: 1,
      total: 2,
      totalPages: 2,
    });
  });

  it("updates and deletes an existing snapshot", async () => {
    const createResponse = await request(app).post("/api/v1/snapshots").send({
      projectId: "project-xyz",
      keyword: "plumber miami",
      capturedAt: "2026-05-13T14:00:00Z",
      provider: "dataforseo",
      results: [{ rank: 8, domain: "plumber-miami.example" }],
    });

    expect(createResponse.status).toBe(201);
    const snapshotId = createResponse.body.data.id;

    const updateResponse = await request(app)
      .patch(`/api/v1/snapshots/${snapshotId}`)
      .send({
        provider: "manual",
        capturedAt: "2026-05-13T14:30:00Z",
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.provider).toBe("manual");
    expect(updateResponse.body.data.capturedAt).toBe("2026-05-13T14:30:00.000Z");

    const deleteResponse = await request(app).delete(`/api/v1/snapshots/${snapshotId}`);

    expect(deleteResponse.status).toBe(204);

    const getResponse = await request(app).get(`/api/v1/snapshots/${snapshotId}`);
    expect(getResponse.status).toBe(404);
    expect(getResponse.body.error).toBe("not_found");
  });

  it("returns 422 for invalid create and list inputs", async () => {
    const invalidCreate = await request(app).post("/api/v1/snapshots").send({
      projectId: "project-1",
      keyword: "",
      capturedAt: "not-a-date",
      provider: "",
      results: "bad-results",
    });

    expect(invalidCreate.status).toBe(422);
    expect(invalidCreate.body.error).toBe("validation_error");

    const invalidList = await request(app)
      .get("/api/v1/snapshots")
      .query({ page: 0, pageSize: 101 });

    expect(invalidList.status).toBe(422);
    expect(invalidList.body.error).toBe("validation_error");
    expect(invalidList.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "page" }),
        expect.objectContaining({ field: "pageSize" }),
      ]),
    );
  });

  it("returns 404 for unknown snapshot ids on update and delete", async () => {
    const unknownId = "11111111-1111-4111-8111-111111111111";
    const updateResponse = await request(app)
      .patch(`/api/v1/snapshots/${unknownId}`)
      .send({ provider: "manual" });

    expect(updateResponse.status).toBe(404);
    expect(updateResponse.body.error).toBe("not_found");

    const deleteResponse = await request(app).delete(`/api/v1/snapshots/${unknownId}`);

    expect(deleteResponse.status).toBe(404);
    expect(deleteResponse.body.error).toBe("not_found");
  });
});
