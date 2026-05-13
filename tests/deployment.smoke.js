const deploymentUrl = process.env.DEPLOYMENT_URL;

function fail(message) {
  console.error(`[deployment-smoke] ${message}`);
  process.exit(1);
}

function assertCondition(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function normalizeBaseUrl(value) {
  const trimmed = value.trim();

  if (!trimmed) {
    fail('DEPLOYMENT_URL is set but empty.');
  }

  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

async function fetchJson(url, expectedStatus) {
  let response;

  try {
    response = await fetch(url, {
      headers: {
        accept: 'application/json',
      },
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(`request failed for ${url}: ${message}`);
  }

  if (response.status !== expectedStatus) {
    fail(`expected ${url} to return ${expectedStatus}, received ${response.status}`);
  }

  let body;
  try {
    body = await response.json();
  } catch {
    fail(`expected JSON response from ${url}`);
  }

  return body;
}

async function runLegacyChecks(baseUrl) {
  const serpUrl = `${baseUrl}/serp`;
  const serpBody = await fetchJson(serpUrl, 401);

  assertCondition(
    serpBody?.error === 'unauthenticated',
    `expected ${serpUrl} to include error="unauthenticated"`,
  );
}

async function runApiScaffoldChecks(baseUrl) {
  const featuresUrl = `${baseUrl}/api/v1/features`;
  const featuresBody = await fetchJson(featuresUrl, 501);

  assertCondition(
    featuresBody?.error === 'not_implemented',
    `expected ${featuresUrl} to include error="not_implemented"`,
  );
}

async function main() {
  if (!deploymentUrl) {
    fail('DEPLOYMENT_URL is required. Example: DEPLOYMENT_URL=https://api.example.com npm run test:smoke:deployment');
  }

  const baseUrl = normalizeBaseUrl(deploymentUrl);
  const healthUrl = `${baseUrl}/health`;
  const healthBody = await fetchJson(healthUrl, 200);

  if (healthBody?.ok === true) {
    await runLegacyChecks(baseUrl);
  } else if (healthBody?.status === 'ok') {
    await runApiScaffoldChecks(baseUrl);
  } else {
    fail(
      `unexpected /health payload from ${healthUrl}: ${JSON.stringify(healthBody)}`,
    );
  }

  console.log(`[deployment-smoke] PASS ${baseUrl}`);
}

main();
