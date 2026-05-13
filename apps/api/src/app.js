import express from "express";
import { healthRouter } from "./routes/healthRoutes.js";
import { apiV1Router } from "./routes/v1/index.js";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/api/v1", apiV1Router);

  app.use((req, res) => {
    res.status(404).json({
      error: "not_found",
      message: `No route found for ${req.method} ${req.originalUrl}`,
    });
  });

  return app;
}
