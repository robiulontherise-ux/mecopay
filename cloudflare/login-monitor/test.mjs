import { runMonitor } from "./index.js";
import assert from "node:assert/strict";

function mockEnv() {
  const kv = new Map();
  return {
    env: {
      MONITOR_SHARED_SECRET: "test-only",
      TELEGRAM_BOT_TOKEN: "test-token",
      TELEGRAM_CHAT_ID: "7106830783",
      LOGIN_ALERT_STATE: {
        async get(key) { return kv.get(key) ?? null; },
        async put(key, value) { kv.set(key, value); },
        async delete(key) { kv.delete(key); },
      },
    },
    kv,
  };
}

function response(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

async function main() {
  {
    const { env, kv } = mockEnv();
    const calls = [];
    const fetchImpl = async (url, init) => {
      calls.push(String(url));
      if (String(url).includes("internal/login-monitor")) return response({ pending_events: 0, failed_handoffs_1h: 0, expired_handoffs: 0 });
      return response({ ok: true, result: { message_id: 1 } });
    };
    await runMonitor(env, fetchImpl, 1_000_000);
    assert.equal(calls.filter((u) => u.includes("sendMessage")).length, 0);
    assert.equal(kv.size, 0);
  }
  {
    const { env, kv } = mockEnv();
    let sends = 0;
    const fetchImpl = async (url) => {
      if (String(url).includes("internal/login-monitor")) return response({ pending_events: 25, failed_handoffs_1h: 0, expired_handoffs: 0 });
      sends += 1;
      return response({ ok: true, result: { message_id: 2 } });
    };
    await runMonitor(env, fetchImpl, 2_000_000);
    await runMonitor(env, fetchImpl, 2_100_000);
    assert.equal(sends, 1);
    assert.equal(kv.get("login-alert:pending_events=25"), "2000000");
  }
  {
    const { env, kv } = mockEnv();
    let sends = 0;
    const fetchImpl = async (url) => {
      if (String(url).includes("internal/login-monitor")) return response({ pending_events: 25, failed_handoffs_1h: 0, expired_handoffs: 0 });
      sends += 1;
      return response({ ok: false }, 200);
    };
    await runMonitor(env, fetchImpl, 3_000_000);
    assert.equal(sends, 1);
    assert.equal(kv.has("login-alert:pending_events=25"), false);
  }
  {
    const { env, kv } = mockEnv();
    const fetchImpl = async (url) => {
      if (String(url).includes("internal/login-monitor")) return response({ error: "unavailable" }, 503);
      return response({ ok: true, result: { message_id: 3 } });
    };
    await runMonitor(env, fetchImpl, 4_000_000);
    assert.equal(kv.has("login-alert:metrics-endpoint"), true);
  }
  {
    const { env, kv } = mockEnv();
    let sentText = "";
    await env.LOGIN_ALERT_STATE.put("monitor:telegram-test-request", "requested", { expirationTtl: 3600 });
    const fetchImpl = async (url, init) => {
      if (String(url).includes("internal/login-monitor")) return response({ pending_events: 0, failed_handoffs_1h: 0, expired_handoffs: 0 });
      sentText = JSON.parse(init.body).text;
      return response({ ok: true, result: { message_id: 4 } });
    };
    await runMonitor(env, fetchImpl, 5_000_000);
    assert.match(sentText, /Telegram delivery test/);
    assert.equal(kv.has("monitor:telegram-test-request"), false);
    assert.match(kv.get("monitor:telegram-test-result"), /"ok":true/);
  }
  console.log("login-monitor tests passed");
}

await main();
