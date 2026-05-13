export function createNotImplementedHandler(endpointName) {
  return (_req, res) => {
    res.status(501).json({
      error: "not_implemented",
      message: `${endpointName} is scaffolded but not implemented yet.`,
    });
  };
}
