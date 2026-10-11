import { DurableObject } from "cloudflare:workers";
import { DISPLAY_COUNTRIES, emptyCounts, isAllowedOrigin, normalizeCountry } from "./counter-data.js";

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  });
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Accept, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export class VisitCounter extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS country_counts (
        country TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0)
      )
    `);
  }

  readCounts() {
    const counts = emptyCounts();
    for (const row of this.ctx.storage.sql.exec("SELECT country, count FROM country_counts")) {
      if (Object.hasOwn(counts, row.country)) counts[row.country] = Number(row.count);
    }
    return counts;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/visit" && request.method === "POST") {
      const country = normalizeCountry(request.headers.get("X-Visitor-Country"));
      this.ctx.storage.sql.exec(
        `INSERT INTO country_counts (country, count) VALUES (?, 1)
         ON CONFLICT(country) DO UPDATE SET count = count + 1`,
        country,
      );
      const counts = this.readCounts();
      return json({ counts, total: Object.values(counts).reduce((sum, value) => sum + value, 0) });
    }

    if (url.pathname === "/stats" && request.method === "GET") {
      const counts = this.readCounts();
      return json({ counts, total: Object.values(counts).reduce((sum, value) => sum + value, 0) });
    }

    return json({ error: "Not found" }, 404);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (!isAllowedOrigin(origin, env.ALLOWED_ORIGINS || "")) {
      return json({ error: "Origin not allowed" }, 403);
    }

    const cors = corsHeaders(origin);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    if (url.pathname !== "/api/visit" && url.pathname !== "/api/stats") {
      return json({ error: "Not found" }, 404, cors);
    }

    const country = normalizeCountry(request.cf?.country);
    const counterId = env.VISIT_COUNTER.idFromName("portfolio-production-counter-v1");
    const counter = env.VISIT_COUNTER.get(counterId);
    const internalPath = url.pathname === "/api/visit" ? "/visit" : "/stats";
    const internalRequest = new Request(`https://counter.internal${internalPath}`, {
      method: request.method,
      headers: { "X-Visitor-Country": country },
    });
    const response = await counter.fetch(internalRequest);
    return new Response(response.body, {
      status: response.status,
      headers: { ...Object.fromEntries(response.headers), ...cors },
    });
  },
};

export { DISPLAY_COUNTRIES };
