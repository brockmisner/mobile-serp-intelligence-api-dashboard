import { Router } from "express";
import { listCoverage } from "../../controllers/coverageController.js";

const coverageRouter = Router();

coverageRouter.get("/", listCoverage);

export { coverageRouter };
