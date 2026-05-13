const webhookUrl = process.env.DEPLOY_WEBHOOK_URL;

if (!webhookUrl) {
  console.log(
    "DEPLOY_WEBHOOK_URL is not configured; skipping deployment."
  );
  process.exit(0);
}

const payload = {
  environment: process.env.DEPLOY_ENVIRONMENT ?? "production",
  sha: process.env.DEPLOY_SHA ?? null,
  ref: process.env.DEPLOY_REF ?? null,
  reason: process.env.DEPLOY_REASON ?? null,
  actor: process.env.DEPLOY_ACTOR ?? null,
  repository: process.env.DEPLOY_REPOSITORY ?? null,
  triggeredAt: new Date().toISOString()
};

const headers = {
  "content-type": "application/json"
};

if (process.env.DEPLOY_AUTH_TOKEN) {
  headers.authorization = `Bearer ${process.env.DEPLOY_AUTH_TOKEN}`;
}

const response = await fetch(webhookUrl, {
  method: "POST",
  headers,
  body: JSON.stringify(payload)
});

if (!response.ok) {
  const body = await response.text();
  console.error(
    `Deployment webhook failed with HTTP ${response.status}: ${body || "<empty body>"}`
  );
  process.exit(1);
}

const responseText = await response.text();
console.log(`Deployment webhook succeeded with HTTP ${response.status}.`);
if (responseText) {
  console.log(responseText.slice(0, 500));
}
