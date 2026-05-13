export function getHealth(_req, res) {
  res.status(200).json({
    status: "ok",
    service: "mobile-serp-api",
    timestamp: new Date().toISOString(),
  });
}
