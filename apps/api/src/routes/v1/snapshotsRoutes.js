import { Router } from "express";
import {
  createSnapshot,
  deleteSnapshot,
  getSnapshotById,
  listSnapshots,
  updateSnapshot,
} from "../../controllers/snapshotsController.js";
import {
  validateCreateSnapshotBody,
  validatePaginationQuery,
  validateSnapshotIdParam,
  validateUpdateSnapshotBody,
} from "../../middleware/validation.js";

const snapshotsRouter = Router();

snapshotsRouter.get("/", validatePaginationQuery, listSnapshots);
snapshotsRouter.get("/:snapshotId", validateSnapshotIdParam, getSnapshotById);
snapshotsRouter.post("/", validateCreateSnapshotBody, createSnapshot);
snapshotsRouter.patch(
  "/:snapshotId",
  validateSnapshotIdParam,
  validateUpdateSnapshotBody,
  updateSnapshot,
);
snapshotsRouter.delete("/:snapshotId", validateSnapshotIdParam, deleteSnapshot);

export { snapshotsRouter };
