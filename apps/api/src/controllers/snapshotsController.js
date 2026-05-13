import {
  createSnapshot as createSnapshotRecord,
  deleteSnapshot as deleteSnapshotRecord,
  getSnapshotById as getSnapshotRecordById,
  listSnapshots as listSnapshotRecords,
  updateSnapshot as updateSnapshotRecord,
} from "../repositories/snapshotsRepository.js";

function sendNotFound(res, snapshotId) {
  return res.status(404).json({
    error: "not_found",
    message: `Snapshot '${snapshotId}' was not found.`,
  });
}

function normalizeCreatePayload(body) {
  return {
    projectId: body.projectId.trim(),
    keyword: body.keyword.trim(),
    capturedAt: new Date(body.capturedAt).toISOString(),
    provider: body.provider.trim(),
    results: body.results,
  };
}

function normalizeUpdatePayload(body) {
  const update = {};

  if (Object.hasOwn(body, "projectId")) {
    update.projectId = body.projectId.trim();
  }

  if (Object.hasOwn(body, "keyword")) {
    update.keyword = body.keyword.trim();
  }

  if (Object.hasOwn(body, "capturedAt")) {
    update.capturedAt = new Date(body.capturedAt).toISOString();
  }

  if (Object.hasOwn(body, "provider")) {
    update.provider = body.provider.trim();
  }

  if (Object.hasOwn(body, "results")) {
    update.results = body.results;
  }

  return update;
}

export function listSnapshots(req, res) {
  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  const pageSize =
    req.query.pageSize === undefined ? 20 : Number(req.query.pageSize);

  const result = listSnapshotRecords({ page, pageSize });
  return res.status(200).json(result);
}

export function getSnapshotById(req, res) {
  const snapshot = getSnapshotRecordById(req.params.snapshotId);
  if (!snapshot) {
    return sendNotFound(res, req.params.snapshotId);
  }

  return res.status(200).json({ data: snapshot });
}

export function createSnapshot(req, res) {
  const snapshot = createSnapshotRecord(normalizeCreatePayload(req.body));
  return res.status(201).json({ data: snapshot });
}

export function updateSnapshot(req, res) {
  const updated = updateSnapshotRecord(
    req.params.snapshotId,
    normalizeUpdatePayload(req.body),
  );
  if (!updated) {
    return sendNotFound(res, req.params.snapshotId);
  }

  return res.status(200).json({ data: updated });
}

export function deleteSnapshot(req, res) {
  const deleted = deleteSnapshotRecord(req.params.snapshotId);
  if (!deleted) {
    return sendNotFound(res, req.params.snapshotId);
  }

  return res.status(204).send();
}
