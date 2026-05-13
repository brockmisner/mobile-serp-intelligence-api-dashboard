import { randomUUID } from "node:crypto";

const snapshots = new Map();

export function createSnapshot(input) {
  const timestamp = new Date().toISOString();
  const snapshot = {
    id: randomUUID(),
    ...input,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  snapshots.set(snapshot.id, snapshot);
  return snapshot;
}

export function listSnapshots({ page, pageSize }) {
  const items = Array.from(snapshots.values()).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );

  const total = items.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const data = items.slice(start, start + pageSize);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

export function getSnapshotById(snapshotId) {
  return snapshots.get(snapshotId) ?? null;
}

export function updateSnapshot(snapshotId, changes) {
  const existing = snapshots.get(snapshotId);
  if (!existing) {
    return null;
  }

  const updated = {
    ...existing,
    ...changes,
    updatedAt: new Date().toISOString(),
  };

  snapshots.set(snapshotId, updated);
  return updated;
}

export function deleteSnapshot(snapshotId) {
  return snapshots.delete(snapshotId);
}

export function resetSnapshots() {
  snapshots.clear();
}
