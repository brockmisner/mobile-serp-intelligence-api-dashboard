const smokeUrl = process.env.SMOKE_TEST_URL;

if (!smokeUrl) {
  console.log("SMOKE_TEST_URL is not configured; skipping smoke test.");
  process.exit(0);
}

const configuredTimeout = Number.parseInt(
  process.env.SMOKE_TEST_TIMEOUT_MS ?? "15000",
  10
);
const timeoutMs =
  Number.isInteger(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : 15000;

const controller = new AbortController();
const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

let response;
try {
  response = await fetch(smokeUrl, {
    method: "GET",
    headers: { accept: "application/json,text/plain,*/*" },
    signal: controller.signal
  });
} catch (error) {
  const reason = error instanceof Error ? error.message : String(error);
  console.error(`Smoke test request failed: ${reason}`);
  process.exit(1);
} finally {
  clearTimeout(timeoutHandle);
}

if (!response.ok) {
  const body = await response.text();
  console.error(
    `Smoke test failed with HTTP ${response.status}: ${body || "<empty body>"}`
  );
  process.exit(1);
}

const body = await response.text();
const expectedText = process.env.SMOKE_TEST_EXPECTED_TEXT;

if (expectedText && !body.toLowerCase().includes(expectedText.toLowerCase())) {
  console.error(
    `Smoke test response did not include expected text "${expectedText}".`
  );
  process.exit(1);
}

console.log(`Smoke test passed with HTTP ${response.status}.`);
