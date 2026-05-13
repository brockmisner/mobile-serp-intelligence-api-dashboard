import { Router } from "express";
import { listFeatureVectors } from "../../controllers/featuresController.js";

const featuresRouter = Router();

featuresRouter.get("/", listFeatureVectors);

export { featuresRouter };
