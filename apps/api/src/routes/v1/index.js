import { Router } from "express";
import { coverageRouter } from "./coverageRoutes.js";
import { featuresRouter } from "./featuresRoutes.js";
import { snapshotsRouter } from "./snapshotsRoutes.js";

const apiV1Router = Router();

apiV1Router.use("/snapshots", snapshotsRouter);
apiV1Router.use("/features", featuresRouter);
apiV1Router.use("/coverage", coverageRouter);

export { apiV1Router };
