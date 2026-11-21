// Run with: bun test ./tests/conversations.test.js
// Requires PostgreSQL 17 binaries. From the repo root in PowerShell, once:
//   New-Item -ItemType Directory -Force .next/conversation-api-review | Out-Null
//   & 'C:/Program Files/PostgreSQL/17/bin/initdb.exe' -D .next/conversation-api-review/pgdata -U review -A trust --no-locale -E UTF8
// Start before testing (this cluster is separate from any existing PostgreSQL):
//   & 'C:/Program Files/PostgreSQL/17/bin/pg_ctl.exe' -D .next/conversation-api-review/pgdata -l .next/conversation-api-review/postgres.log -o '-h 127.0.0.1 -p 55439' -w start
//   & 'C:/Program Files/PostgreSQL/17/bin/psql.exe' -h 127.0.0.1 -p 55439 -U review -d postgres -c 'CREATE DATABASE conversation_api_review;'
// Stop afterward:
//   & 'C:/Program Files/PostgreSQL/17/bin/pg_ctl.exe' -D .next/conversation-api-review/pgdata -m fast -w stop
// Each run migrates a new random database and drops only that database afterward.
import { afterAll, beforeAll, beforeEach, expect, test } from "bun:test";
import { createHmac, randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

// Deliberately ignore application database URLs, including Bun's auto-loaded .env.
const databaseURL = "postgresql://review@127.0.0.1:55439/conversation_api_review";
const database = `review_${randomUUID().replaceAll("-", "")}`;
const isolatedURL = new URL(databaseURL);
isolatedURL.pathname = `/${database}`;
const secret = "conversation-api-isolated-test-secret-123456789";
process.env.DATABASE_URL = isolatedURL.href;
process.env.DIRECT_URL = process.env.DATABASE_URL;
process.env.BETTER_AUTH_SECRET = secret;
process.env.BETTER_AUTH_URL = "http://localhost:3000";
process.env.GOOGLE_CLIENT_ID = "isolated-test-client";
process.env.GOOGLE_CLIENT_SECRET = "isolated-test-secret";

const admin = new pg.Client({ connectionString: databaseURL });
const sql = new pg.Client({ connectionString: isolatedURL.href });
let prisma;
let collection;
let detail;
let initialized = false;
const owner = "review-owner";
const other = "review-other";

function cookie(token, signingSecret = secret) {
  const signature = createHmac("sha256", signingSecret).update(token).digest("base64");
  return `better-auth.session_token=${encodeURIComponent(`${token}.${signature}`)}`;
}

function request(method = "GET", path = "", sessionCookie = cookie(owner), body) {
  return new Request(`http://localhost:3000/api/conversations${path}`, {
    method,
    headers: sessionCookie ? { cookie: sessionCookie } : {},
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

function context(id) {
  return { params: Promise.resolve({ id }) };
}

async function seed(count, userId = owner, tied = false) {
  const data = Array.from({ length: count }, (_, i) => ({
    id: `${userId}-${String(i).padStart(3, "0")}`,
    userId,
    title: `Chat ${i}`,
    createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, tied ? 0 : i)),
  }));
  if (count) await prisma.conversation.createMany({ data });
  return data.sort((a, b) => b.createdAt - a.createdAt || b.id.localeCompare(a.id));
}

beforeAll(async () => {
  // lib/db.ts can reuse this global even after DATABASE_URL is overridden.
  if (globalThis.prisma) {
    throw new Error("Run this integration test in a fresh process without a cached Prisma client.");
  }
  await admin.connect();
  const { rows } = await admin.query("SHOW data_directory");
  // Refuse even this fixed loopback endpoint unless it is our disposable cluster.
  expect(resolve(rows[0].data_directory).toLowerCase()).toBe(
    resolve(".next/conversation-api-review/pgdata").toLowerCase(),
  );
  await admin.query(`CREATE DATABASE "${database}"`);
  initialized = true;
  await sql.connect();
  for (const name of readdirSync("prisma/migrations").filter((name) => /^\d/.test(name)).sort()) {
    await sql.query(readFileSync(`prisma/migrations/${name}/migration.sql`, "utf8"));
  }
  prisma = (await import("../lib/db.ts")).default;
  const [connection] = await prisma.$queryRaw`SELECT current_database() AS database`;
  expect(connection.database).toBe(database);
  collection = await import("../app/api/conversations/route.ts");
  detail = await import("../app/api/conversations/[id]/route.ts");
  await prisma.user.createMany({
    data: [owner, other].map((id) => ({ id, name: id, email: `${id}@example.invalid` })),
  });
  await prisma.session.createMany({
    data: [owner, other, "expired"].map((id) => ({
      id,
      token: id,
      userId: id === "expired" ? owner : id,
      expiresAt: new Date(Date.now() + (id === "expired" ? -86400000 : 86400000)),
    })),
  });
}, 30000);

beforeEach(async () => {
  // Only this newly generated database is visible to the test Prisma client.
  await prisma.conversation.deleteMany();
});

afterAll(async () => {
  await prisma?.$disconnect();
  await sql.end();
  if (initialized) await admin.query(`DROP DATABASE "${database}"`);
  await admin.end();
});

const handlers = [
  ["POST collection", (c) => collection.POST(request("POST", "", c))],
  ["GET collection", (c) => collection.GET(request("GET", "?cursor=missing", c))],
  ["GET detail", (c) => detail.GET(request("GET", "/missing", c), context("missing"))],
  ["DELETE detail", (c) => detail.DELETE(request("DELETE", "/missing", c), context("missing"))],
];

for (const [name, invoke] of handlers) {
  for (const [label, value] of [
    ["absent", null],
    ["invalid signature", cookie(owner, "wrong-secret")],
    ["unknown session", cookie("unknown")],
    ["expired session", cookie("expired")],
  ]) {
    test(`${name}: ${label} session returns 401 without changing conversations`, async () => {
      await seed(1);
      const response = await invoke(value);
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorised" });
      expect(await prisma.conversation.count()).toBe(1);
    });
  }
}

test("POST returns 201, defaults, and the authenticated owner despite a spoofed body", async () => {
  const response = await collection.POST(request("POST", "", cookie(owner), {
    userId: other, id: "spoofed", title: "spoofed",
  }));
  expect(response.status).toBe(201);
  const { conversation } = await response.json();
  expect(conversation.userId).toBe(owner);
  expect(conversation.title).toBe("New Chat");
  expect(conversation.id).not.toBe("spoofed");
  expect(await prisma.conversation.findUnique({ where: { id: conversation.id } })).not.toBeNull();
  expect(await prisma.conversation.count({ where: { userId: other } })).toBe(0);
});

test("POST accepts an empty body", async () => {
  expect((await collection.POST(request("POST"))).status).toBe(201);
});

for (const count of [0, 1, 19, 20, 21, 40, 41]) {
  test(`GET pagination traverses ${count} rows with no duplicates, omissions, or foreign data`, async () => {
    const expected = await seed(count);
    await seed(3, other);
    const seen = [];
    let cursor = null;
    let pages = 0;
    do {
      const response = await collection.GET(request("GET", cursor ? `?cursor=${cursor}` : ""));
      expect(response.status).toBe(200);
      const body = await response.json();
      const offset = pages * 20;
      expect(body.conversations).toEqual(expected.slice(offset, offset + 20).map(({ id, title }) => ({ id, title })));
      const hasMore = offset + 20 < count;
      expect(body.nextCursor).toBe(hasMore ? expected[offset + 19].id : null);
      seen.push(...body.conversations.map(({ id }) => id));
      cursor = body.nextCursor;
      expect(++pages).toBeLessThan(5);
    } while (cursor);
    expect(seen).toEqual(expected.map(({ id }) => id));
  });
}

test("GET pagination orders equal timestamps by descending id across page boundaries", async () => {
  const expected = await seed(41, owner, true);
  let cursor = null;
  const seen = [];
  for (let i = 0; i < 3; i++) {
    const response = await collection.GET(request("GET", cursor ? `?cursor=${cursor}` : ""));
    const body = await response.json();
    seen.push(...body.conversations.map(({ id }) => id));
    cursor = body.nextCursor;
  }
  expect(cursor).toBeNull();
  expect(seen).toEqual(expected.map(({ id }) => id));
});

for (const target of ["missing", "foreign", "deleted", "malformed"]) {
  test(`GET collection rejects a ${target} cursor with 400`, async () => {
    await seed(1);
    let id = "missing";
    if (target === "foreign") id = (await seed(1, other))[0].id;
    if (target === "deleted") {
      id = "deleted";
      await prisma.conversation.create({ data: { id, userId: owner } });
      await prisma.conversation.delete({ where: { id } });
    }
    if (target === "malformed") id = "%%% invalid cursor";
    expect((await collection.GET(request("GET", `?cursor=${encodeURIComponent(id)}`))).status).toBe(400);
  });
}

test("GET accepts an empty cursor as page one and returns an empty page after the last row", async () => {
  const [last] = await seed(1);
  expect((await (await collection.GET(request("GET", "?cursor="))).json()).conversations).toHaveLength(1);
  expect(await (await collection.GET(request("GET", `?cursor=${last.id}`))).json()).toEqual({ conversations: [], nextCursor: null });
});

test("GET detail returns 200 with the owned conversation and chronological messages", async () => {
  const [conversation] = await seed(1);
  await prisma.message.createMany({ data: [2, 0, 1].map((i) => ({
    id: `message-${i}`, conversationId: conversation.id, role: "USER", content: `${i}`,
    createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, i)),
  })) });
  const response = await detail.GET(request("GET", `/${conversation.id}`), context(conversation.id));
  expect(response).toBeInstanceOf(Response);
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.conversation.id).toBe(conversation.id);
  expect(body.conversation.messages.map(({ content }) => content)).toEqual(["0", "1", "2"]);
});

test("GET detail returns an owned conversation with no messages", async () => {
  const [conversation] = await seed(1);
  const response = await detail.GET(request(), context(conversation.id));
  expect(response).toBeInstanceOf(Response);
  expect((await response.json()).conversation.messages).toEqual([]);
});

for (const target of ["missing", "foreign"]) {
  test(`GET detail returns 404 for a ${target} conversation`, async () => {
    const id = target === "foreign" ? (await seed(1, other))[0].id : "missing";
    const response = await detail.GET(request("GET", `/${id}`), context(id));
    expect(response.status).toBe(404);
  });
}

for (const target of ["missing", "foreign"]) {
  test(`DELETE returns 404 for a ${target} conversation and preserves other users' data`, async () => {
    const [foreign] = await seed(1, other);
    await prisma.message.create({ data: { conversationId: foreign.id, role: "USER", content: "preserve" } });
    const id = target === "foreign" ? foreign.id : "missing";
    expect((await detail.DELETE(request("DELETE", `/${id}`), context(id))).status).toBe(404);
    expect(await prisma.conversation.count()).toBe(1);
    expect(await prisma.message.count()).toBe(1);
  });
}

for (const messageCount of [0, 3]) {
  test(`DELETE returns empty 204 and cascades ${messageCount} messages while preserving unrelated rows`, async () => {
    const [target, survivor] = await seed(2);
    const [foreign] = await seed(1, other);
    for (const conversation of [survivor, foreign]) {
      await prisma.message.create({ data: { conversationId: conversation.id, role: "USER", content: "preserve" } });
    }
    if (messageCount) await prisma.message.createMany({ data: Array.from({ length: messageCount }, () => ({
      conversationId: target.id, role: "USER", content: "delete",
    })) });
    const response = await detail.DELETE(request("DELETE", `/${target.id}`), context(target.id));
    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
    expect(await prisma.conversation.findUnique({ where: { id: target.id } })).toBeNull();
    expect(await prisma.message.count({ where: { conversationId: target.id } })).toBe(0);
    expect(await prisma.conversation.count()).toBe(2);
    expect(await prisma.message.count()).toBe(2);
    expect((await detail.DELETE(request("DELETE", `/${target.id}`), context(target.id))).status).toBe(404);
  });
}
