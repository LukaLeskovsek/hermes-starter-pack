#!/usr/bin/env node
// Build-time precompute for the "How the brain works" teaching page.
// Fetches REAL embeddings (openai/text-embedding-3-small, 1536-dim) via OpenRouter,
// projects them to 2D with PCA (Gram-matrix + Jacobi eigensolve, zero deps),
// and writes embeddings-data.json. Run ONCE with a key; the HTML bakes the output.
//
//   OPENROUTER_API_KEY=sk-or-... node embed-examples.mjs
//
// The runtime page needs NO key — it uses only the baked JSON. This script is kept
// for transparency ("reveal the plumbing"): re-run it to change the example set.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const MODEL = "openai/text-embedding-3-small";
const KEY = process.env.OPENROUTER_API_KEY;
if (!KEY) { console.error("Set OPENROUTER_API_KEY"); process.exit(1); }

// ── The curated example "company brain", grouped into taxonomy clusters ──────
// Chosen for clean topical separation. The refund/return pair shares NO content
// words yet must land adjacent (the "meaning not words" proof). EU-delivery lines
// are the target of the worked query.
const CLUSTERS = {
  "Delivery & Returns": [
    "Our refund window is 30 days.",
    "Customers can return items within a month.",
    "EU orders ship within 3 business days via DHL.",
    "Delivery to European Union countries takes 3 to 5 days.",
    "We cover return shipping costs for defective products.",
    "Refunds are processed back to the original payment method.",
  ],
  "Pricing": [
    "The Pro plan costs 29 euros per month.",
    "Enterprise pricing is custom and billed annually.",
    "We offer a 20 percent discount for yearly billing.",
    "There is a free tier with limited features.",
  ],
  "People & Team": [
    "Ana leads our customer support team.",
    "Our CTO Marko oversees engineering.",
    "The founder handles all partnership deals.",
    "New hires complete a two-week onboarding.",
  ],
  "Product": [
    "The dashboard shows real-time sales analytics.",
    "Users can export reports as PDF or CSV.",
    "Our mobile app works offline and syncs later.",
    "The API lets developers pull order data.",
    "The analytics view can filter by region and date.",
  ],
  "Brand Voice": [
    "We write in a warm, plain, and direct tone.",
    "Avoid jargon; explain things like to a smart friend.",
    "Always be honest about limitations and trade-offs.",
    "Our emails are short and get to the point.",
  ],
};

// The worked query for the assembly-line stepper (embedded so its pin is real).
const QUERY = "What are our delivery terms for EU orders?";

// Hand-authored graph edges (by sentence text substrings → resolved to ids).
// The graph = links between related pages; mostly intra-cluster relationships.
const EDGE_HINTS = [
  ["refund window", "return items"],
  ["return items", "original payment method"],
  ["EU orders ship", "European Union countries"],
  ["cover return shipping", "return items"],
  ["Pro plan costs", "20 percent discount"],
  ["20 percent discount", "billed annually"],
  ["free tier", "Pro plan costs"],
  ["Ana leads", "two-week onboarding"],
  ["CTO Marko", "two-week onboarding"],
  ["dashboard shows", "export reports"],
  ["dashboard shows", "filter by region"],
  ["API lets developers", "export reports"],
  ["warm, plain", "Avoid jargon"],
  ["Avoid jargon", "emails are short"],
];

// ── Flatten to a point list ─────────────────────────────────────────────────
const points = [];
let id = 0;
for (const [cluster, sents] of Object.entries(CLUSTERS))
  for (const text of sents) points.push({ id: id++, text, cluster });
const queryPoint = { id: id++, text: QUERY, cluster: "__query__", isQuery: true };
const all = [...points, queryPoint];

// ── Fetch real embeddings (single batched request; fall back to per-item) ────
async function embed(inputs) {
  const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, input: inputs }),
  });
  if (!res.ok) throw new Error(`embeddings HTTP ${res.status}: ${await res.text()}`);
  const j = await res.json();
  return j.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}
console.error(`Embedding ${all.length} texts via ${MODEL} …`);
let vecs;
try { vecs = await embed(all.map((p) => p.text)); }
catch (e) {
  console.error("Batch failed, falling back to per-item:", e.message);
  vecs = [];
  for (const p of all) vecs.push((await embed([p.text]))[0]);
}
const D = vecs[0].length;
console.error(`Got ${vecs.length} vectors of dim ${D}.`);

// ── Cosine similarity (for the refund/return sanity check) ──────────────────
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
const norm = (a) => Math.sqrt(dot(a, a));
const cos = (a, b) => dot(a, b) / (norm(a) * norm(b));

// ── PCA via the Gram-matrix trick + Jacobi eigensolver (no deps) ────────────
// Mean-center columns, form G = X Xᵀ (n×n), eigen-decompose G. The top-k
// eigenvectors ARE the sample scores on the top-k principal components.
const n = vecs.length;
const mean = new Array(D).fill(0);
for (const v of vecs) for (let j = 0; j < D; j++) mean[j] += v[j] / n;
const X = vecs.map((v) => v.map((x, j) => x - mean[j]));
const G = Array.from({ length: n }, (_, i) =>
  Array.from({ length: n }, (_, k) => dot(X[i], X[k])));

// Jacobi eigenvalue algorithm for symmetric G → eigenvalues + eigenvectors.
function jacobi(A0, iters = 100) {
  const m = A0.length;
  const A = A0.map((r) => r.slice());
  const V = Array.from({ length: m }, (_, i) =>
    Array.from({ length: m }, (_, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < iters; sweep++) {
    // largest off-diagonal
    let p = 0, q = 1, max = 0;
    for (let i = 0; i < m; i++) for (let j = i + 1; j < m; j++)
      if (Math.abs(A[i][j]) > max) { max = Math.abs(A[i][j]); p = i; q = j; }
    if (max < 1e-9) break;
    const app = A[p][p], aqq = A[q][q], apq = A[p][q];
    const phi = 0.5 * Math.atan2(2 * apq, aqq - app);
    const c = Math.cos(phi), s = Math.sin(phi);
    for (let i = 0; i < m; i++) {
      const aip = A[i][p], aiq = A[i][q];
      A[i][p] = c * aip - s * aiq; A[i][q] = s * aip + c * aiq;
    }
    for (let i = 0; i < m; i++) {
      const api = A[p][i], aqi = A[q][i];
      A[p][i] = c * api - s * aqi; A[q][i] = s * api + c * aqi;
    }
    for (let i = 0; i < m; i++) {
      const vip = V[i][p], viq = V[i][q];
      V[i][p] = c * vip - s * viq; V[i][q] = s * vip + c * viq;
    }
  }
  const evals = A.map((r, i) => r[i]);
  return { evals, V };
}
const { evals, V } = jacobi(G);
const order = evals.map((e, i) => [e, i]).sort((a, b) => b[0] - a[0]);
const [c1, c2] = [order[0][1], order[1][1]];
// score_i on PC_k = V[i][k] * sqrt(eigenvalue_k)  (up to sign)
const sqrt1 = Math.sqrt(Math.max(order[0][0], 0));
const sqrt2 = Math.sqrt(Math.max(order[1][0], 0));
let coords = V.map((row) => [row[c1] * sqrt1, row[c2] * sqrt2]);

// Normalize to a padded [0,1]×[0,1] box for the canvas.
const xs = coords.map((c) => c[0]), ys = coords.map((c) => c[1]);
const rng = (a) => [Math.min(...a), Math.max(...a)];
const [xmin, xmax] = rng(xs), [ymin, ymax] = rng(ys);
const pad = 0.06;
coords = coords.map(([x, y]) => [
  pad + (1 - 2 * pad) * (x - xmin) / (xmax - xmin || 1),
  pad + (1 - 2 * pad) * (y - ymin) / (ymax - ymin || 1),
]);

// ── Attach coords + a short REAL vector preview to each point ───────────────
all.forEach((p, i) => {
  p.x = +coords[i][0].toFixed(4);
  p.y = +coords[i][1].toFixed(4);
  p.vec8 = vecs[i].slice(0, 8).map((v) => +v.toFixed(4)); // first 8 real dims
});

// ── Resolve edges from hints ────────────────────────────────────────────────
const findId = (frag) => points.find((p) => p.text.includes(frag))?.id;
const edges = EDGE_HINTS.map(([a, b]) => [findId(a), findId(b)])
  .filter(([a, b]) => a != null && b != null);

// ── Sanity: the refund/return pair must be close (meaning, not words) ───────
const refund = points.find((p) => p.text.includes("refund window"));
const ret = points.find((p) => p.text.includes("return items"));
const euShip = points.find((p) => p.text.includes("EU orders ship"));
const pairCos = cos(vecs[refund.id], vecs[ret.id]);
const dist2d = Math.hypot(refund.x - ret.x, refund.y - ret.y);
const sharedWords = refund.text.toLowerCase().split(/\W+/)
  .filter((w) => w.length > 3 && ret.text.toLowerCase().split(/\W+/).includes(w));
console.error(`\nrefund↔return  cosine=${pairCos.toFixed(3)}  2D-dist=${dist2d.toFixed(3)}  shared content words: ${sharedWords.length ? sharedWords.join(",") : "none"}`);
// nearest neighbors of the query (by cosine) — for stepper reference
const qsims = points.map((p) => [p.id, cos(vecs[queryPoint.id], vecs[p.id])])
  .sort((a, b) => b[1] - a[1]).slice(0, 4);
console.error("query nearest:", qsims.map(([i, s]) => `#${i} ${points.find(p=>p.id===i).text.slice(0,32)}… ${s.toFixed(2)}`).join(" | "));

// ── Write ───────────────────────────────────────────────────────────────────
const out = {
  meta: {
    model: MODEL, dims: D, generated: "build-time",
    note: "Real embeddings; x/y are true PCA(2) coords. vec8 = first 8 real dims. Positions are genuine — clusters that overlap, overlap for real.",
    clusters: Object.keys(CLUSTERS),
  },
  points: points.map((p) => ({ id: p.id, text: p.text, cluster: p.cluster, x: p.x, y: p.y, vec8: p.vec8 })),
  query: { id: queryPoint.id, text: queryPoint.text, x: queryPoint.x, y: queryPoint.y, vec8: queryPoint.vec8,
           rephrasings: ["EU shipping policy", "delivery times Europe", "how long to ship to the EU"],
           nearest: qsims.map(([i]) => i) },
  edges,
  check: { refundReturnCosine: +pairCos.toFixed(3), refundReturn2Ddist: +dist2d.toFixed(3), sharedContentWords: sharedWords },
};
const outPath = join(dirname(fileURLToPath(import.meta.url)), "embeddings-data.json");
writeFileSync(outPath, JSON.stringify(out, null, 2));
console.error(`\nWrote ${outPath}  (${out.points.length} points, ${out.edges.length} edges)`);
