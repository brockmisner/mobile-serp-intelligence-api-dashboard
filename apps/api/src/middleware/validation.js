function sendValidationError(res, details) {
  return res.status(422).json({
    error: "validation_error",
    message: "Request validation failed",
    details,
  });
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoDateString(value) {
  if (typeof value !== "string") {
    return false;
  }
  return !Number.isNaN(Date.parse(value));
}

function isUuid(value) {
  if (typeof value !== "string") {
    return false;
  }
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function validatePaginationQuery(req, res, next) {
  const details = [];
  const { page, pageSize } = req.query ?? {};

  if (
    page !== undefined &&
    (!Number.isInteger(Number(page)) || Number(page) < 1)
  ) {
    details.push({
      field: "page",
      message: "page must be an integer greater than or equal to 1",
    });
  }

  if (
    pageSize !== undefined &&
    (!Number.isInteger(Number(pageSize)) ||
      Number(pageSize) < 1 ||
      Number(pageSize) > 100)
  ) {
    details.push({
      field: "pageSize",
      message: "pageSize must be an integer between 1 and 100",
    });
  }

  if (details.length > 0) {
    return sendValidationError(res, details);
  }

  return next();
}

export function validateSnapshotIdParam(req, res, next) {
  const { snapshotId } = req.params ?? {};

  if (!isUuid(snapshotId)) {
    return sendValidationError(res, [
      { field: "snapshotId", message: "snapshotId must be a valid UUID" },
    ]);
  }

  return next();
}

export function validateCreateSnapshotBody(req, res, next) {
  const body = req.body ?? {};
  const details = [];

  if (!isNonEmptyString(body.projectId)) {
    details.push({
      field: "projectId",
      message: "projectId is required and must be a non-empty string",
    });
  }

  if (!isNonEmptyString(body.keyword)) {
    details.push({
      field: "keyword",
      message: "keyword is required and must be a non-empty string",
    });
  }

  if (!isIsoDateString(body.capturedAt)) {
    details.push({
      field: "capturedAt",
      message: "capturedAt is required and must be a valid ISO date string",
    });
  }

  if (!isNonEmptyString(body.provider)) {
    details.push({
      field: "provider",
      message: "provider is required and must be a non-empty string",
    });
  }

  if (!Array.isArray(body.results)) {
    details.push({
      field: "results",
      message: "results is required and must be an array",
    });
  }

  if (details.length > 0) {
    return sendValidationError(res, details);
  }

  return next();
}

export function validateUpdateSnapshotBody(req, res, next) {
  const body = req.body ?? {};
  const details = [];
  const allowedFields = new Set([
    "projectId",
    "keyword",
    "capturedAt",
    "provider",
    "results",
  ]);

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body) ||
    Object.keys(body).length === 0
  ) {
    return sendValidationError(res, [
      {
        field: "body",
        message: "Request body must be a non-empty object",
      },
    ]);
  }

  Object.keys(body).forEach((key) => {
    if (!allowedFields.has(key)) {
      details.push({
        field: key,
        message: "Field is not allowed for snapshot updates",
      });
    }
  });

  if (
    Object.hasOwn(body, "projectId") &&
    !isNonEmptyString(body.projectId)
  ) {
    details.push({
      field: "projectId",
      message: "projectId must be a non-empty string",
    });
  }

  if (Object.hasOwn(body, "keyword") && !isNonEmptyString(body.keyword)) {
    details.push({
      field: "keyword",
      message: "keyword must be a non-empty string",
    });
  }

  if (Object.hasOwn(body, "capturedAt") && !isIsoDateString(body.capturedAt)) {
    details.push({
      field: "capturedAt",
      message: "capturedAt must be a valid ISO date string",
    });
  }

  if (Object.hasOwn(body, "provider") && !isNonEmptyString(body.provider)) {
    details.push({
      field: "provider",
      message: "provider must be a non-empty string",
    });
  }

  if (Object.hasOwn(body, "results") && !Array.isArray(body.results)) {
    details.push({
      field: "results",
      message: "results must be an array",
    });
  }

  if (details.length > 0) {
    return sendValidationError(res, details);
  }

  return next();
}
