const COOLDOWN_MS = 15 * 60 * 1000;
const ALERT_THRESHOLDS = Object.freeze({
  pending_events: 25,
  failed_handoffs_1h: 1,
  expired_handoffs: 10,
});
const TEST_REQUEST_KEY = "monitor:telegram-test-request";
const TEST_RESULT_KEY = "monitor:telegram-test-result";
const METRICS_URL = "https://mecopay.space/internal/login-monitor";

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runMonitor(env));
  },
  async fetch(_request, env, ctx) {
    ctx.waitUntil(runMonitor(env));
    return new Response("ok");
  },
};

export async function runMonitor(env, fetchImpl = fetch, now = Date.now()) {
  await runTelegramTestIfRequested(env, fetchImpl, now);

  let metrics;
  try {
    const response = await fetchWithTimeout(fetchImpl, METRICS_URL, {
      headers: {
        "x-monitor-secret": env.MONITOR_SHARED_SECRET,
        accept: "application/json",
      },
    });
    if (!response.ok) throw new Error(`METRICS_HTTP_${response.status}`);
    metrics = await response.json();
    if (!metrics || typeof metrics !== "object") throw new Error("METRICS_INVALID_BODY");
  } catch (error) {
    const reason = `metrics_endpoint_unavailable=${safeError(error)}`;
    await alertOnce(env, fetchImpl, "login-alert:metrics-endpoint", reason, now);
    return;
  }

  const reasons = Object.keys(ALERT_THRESHOLDS)
    .filter((key) => Number(metrics[key] ?? 0) >= ALERT_THRESHOLDS[key])
    .map((key) => `${key}=${Number(metrics[key] ?? 0)}`);
  if (!reasons.length) return;
  const key = `login-alert:${reasons.join("|")}`;
  await alertOnce(env, fetchImpl, key, reasons.join("\n"), now);
}

async function runTelegramTestIfRequested(env, fetchImpl, now) {
  if (!env.LOGIN_ALERT_STATE) return;
  const request = await env.LOGIN_ALERT_STATE.get(TEST_REQUEST_KEY);
  if (!request) return;
  try {
    await sendTelegram(
      env,
      fetchImpl,
      `[MecoPay login monitor] Telegram delivery test\nUTC ${new Date(now).toISOString()}`,
    );
    await env.LOGIN_ALERT_STATE.delete(TEST_REQUEST_KEY);
    await env.LOGIN_ALERT_STATE.put(
      TEST_RESULT_KEY,
      JSON.stringify({ ok: true, completed_at: new Date(now).toISOString() }),
      { expirationTtl: 86400 },
    );
  } catch (error) {
    await env.LOGIN_ALERT_STATE.put(
      TEST_RESULT_KEY,
      JSON.stringify({ ok: false, error: safeError(error), attempted_at: new Date(now).toISOString() }),
      { expirationTtl: 86400 },
    );
    // Keep the request key so the next scheduled run retries the test.
  }
}

async function alertOnce(env, fetchImpl, stateKey, reason, now) {
  const previous = await env.LOGIN_ALERT_STATE.get(stateKey);
  if (previous && now - Number(previous) < COOLDOWN_MS) return;
  try {
    await sendTelegram(
      env,
      fetchImpl,
      `[MecoPay login monitor]\n${reason}\nUTC ${new Date(now).toISOString()}`,
    );
    await env.LOGIN_ALERT_STATE.put(stateKey, String(now), { expirationTtl: 86400 });
  } catch (error) {
    console.error("[login-monitor] Telegram delivery failed", safeError(error));
  }
}

async function sendTelegram(env, fetchImpl, text) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) throw new Error("TELEGRAM_CONFIG_MISSING");
  const response = await fetchWithTimeout(
    fetchImpl,
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
    },
  );
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.ok !== true) {
    throw new Error(`TELEGRAM_SEND_FAILED_${response.status}`);
  }
}

async function fetchWithTimeout(fetchImpl, input, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    return await fetchImpl(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function safeError(error) {
  if (error instanceof Error) return error.message.slice(0, 120);
  return "UNKNOWN";
}
