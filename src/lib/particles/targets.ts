/**
 * Particle target shapes. Every generator returns a Float32Array of
 * length count*3, centered on the origin and normalized into roughly a
 * 10-unit bounding box. All randomness is seeded so reloads are identical.
 */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller, clamped, for jitter that clusters near zero. */
function gaussian(rand: () => number, sigma: number) {
  const u = Math.max(rand(), 1e-6);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * sigma;
}

/** Scale a point cloud so its largest half-extent is `half` units. */
function normalize(out: Float32Array, half = 5) {
  let max = 0;
  for (let i = 0; i < out.length; i++) {
    const v = Math.abs(out[i]);
    if (v > max) max = v;
  }
  if (max === 0 || max <= half) return out;
  const k = half / max;
  for (let i = 0; i < out.length; i++) out[i] *= k;
  return out;
}

/** DNA double helix: two phase-offset strands plus connecting rungs. */
export function helix(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const rand = mulberry32(0x11a5);

  const radius = 2.2;
  const height = 12;
  const turns = 5;
  const rungCount = Math.floor(count * 0.2);
  const strandCount = count - rungCount;
  const rungSteps = 64;

  for (let i = 0; i < strandCount; i++) {
    const t = strandCount > 1 ? i / (strandCount - 1) : 0;
    const strand = i % 2;
    const angle = t * turns * Math.PI * 2 + strand * Math.PI;
    const y = (t - 0.5) * height;
    const jitter = 0.04;

    out[i * 3] = Math.cos(angle) * radius + gaussian(rand, jitter);
    out[i * 3 + 1] = y + gaussian(rand, jitter);
    out[i * 3 + 2] = Math.sin(angle) * radius + gaussian(rand, jitter);
  }

  for (let i = 0; i < rungCount; i++) {
    const index = strandCount + i;
    const step = Math.floor((i / rungCount) * rungSteps);
    const t = rungSteps > 1 ? step / (rungSteps - 1) : 0;
    const angle = t * turns * Math.PI * 2;
    const y = (t - 0.5) * height;

    // position across the rung, between strand A and strand B
    const k = rand();
    const ax = Math.cos(angle) * radius;
    const az = Math.sin(angle) * radius;
    const bx = Math.cos(angle + Math.PI) * radius;
    const bz = Math.sin(angle + Math.PI) * radius;

    out[index * 3] = ax + (bx - ax) * k;
    out[index * 3 + 1] = y + gaussian(rand, 0.03);
    out[index * 3 + 2] = az + (bz - az) * k;
  }

  return normalize(out);
}

function catmullRom(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number,
) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

/** A folded chain: smoothed 3D random walk, particles strung along it. */
export function proteinFold(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const rand = mulberry32(0x2b7c);

  const controlCount = 40;
  const pts: number[][] = [];
  let x = 0;
  let y = 0;
  let z = 0;
  for (let i = 0; i < controlCount; i++) {
    pts.push([x, y, z]);
    // biased walk so the chain wanders but stays compact
    x += (rand() - 0.5) * 3.2 - x * 0.12;
    y += (rand() - 0.5) * 3.2 - y * 0.12;
    z += (rand() - 0.5) * 3.2 - z * 0.12;
  }

  const segments = controlCount - 1;
  for (let i = 0; i < count; i++) {
    const u = (i / count) * segments;
    const seg = Math.min(Math.floor(u), segments - 1);
    const t = u - seg;

    const p0 = pts[Math.max(seg - 1, 0)];
    const p1 = pts[seg];
    const p2 = pts[Math.min(seg + 1, controlCount - 1)];
    const p3 = pts[Math.min(seg + 2, controlCount - 1)];

    out[i * 3] = catmullRom(p0[0], p1[0], p2[0], p3[0], t) + gaussian(rand, 0.18);
    out[i * 3 + 1] =
      catmullRom(p0[1], p1[1], p2[1], p3[1], t) + gaussian(rand, 0.18);
    out[i * 3 + 2] =
      catmullRom(p0[2], p1[2], p2[2], p3[2], t) + gaussian(rand, 0.18);
  }

  // recenter before normalizing — the walk drifts off origin
  let cx = 0;
  let cy = 0;
  let cz = 0;
  for (let i = 0; i < count; i++) {
    cx += out[i * 3];
    cy += out[i * 3 + 1];
    cz += out[i * 3 + 2];
  }
  cx /= count;
  cy /= count;
  cz /= count;
  for (let i = 0; i < count; i++) {
    out[i * 3] -= cx;
    out[i * 3 + 1] -= cy;
    out[i * 3 + 2] -= cz;
  }

  return normalize(out);
}

/** Node graph: 60 nodes in a sphere, each wired to its 3 nearest neighbors. */
export function network(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const rand = mulberry32(0x3f01);

  const nodeCount = 60;
  const nodes: number[][] = [];
  for (let i = 0; i < nodeCount; i++) {
    // rejection-free uniform point in a sphere of radius 5
    const u = rand();
    const r = 5 * Math.cbrt(u);
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    nodes.push([
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    ]);
  }

  const edges: [number, number][] = [];
  const seen = new Set<string>();
  for (let i = 0; i < nodeCount; i++) {
    const ranked = nodes
      .map((n, j) => ({
        j,
        d:
          (n[0] - nodes[i][0]) ** 2 +
          (n[1] - nodes[i][1]) ** 2 +
          (n[2] - nodes[i][2]) ** 2,
      }))
      .filter((entry) => entry.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);

    for (const { j } of ranked) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([i, j]);
    }
  }

  const edgeCount = Math.floor(count * 0.7);
  for (let i = 0; i < edgeCount; i++) {
    const [a, b] = edges[Math.floor(rand() * edges.length)];
    const t = rand();
    out[i * 3] =
      nodes[a][0] + (nodes[b][0] - nodes[a][0]) * t + gaussian(rand, 0.05);
    out[i * 3 + 1] =
      nodes[a][1] + (nodes[b][1] - nodes[a][1]) * t + gaussian(rand, 0.05);
    out[i * 3 + 2] =
      nodes[a][2] + (nodes[b][2] - nodes[a][2]) * t + gaussian(rand, 0.05);
  }

  for (let i = edgeCount; i < count; i++) {
    const n = nodes[Math.floor(rand() * nodeCount)];
    out[i * 3] = n[0] + gaussian(rand, 0.12);
    out[i * 3 + 1] = n[1] + gaussian(rand, 0.12);
    out[i * 3 + 2] = n[2] + gaussian(rand, 0.12);
  }

  return normalize(out);
}

/** Seven overlapping cell membranes, fibonacci-distributed on each surface. */
export function cellCluster(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const rand = mulberry32(0x4c1d);

  const sphereCount = 7;
  const spheres = Array.from({ length: sphereCount }, () => ({
    r: 1.2 + rand() * 1.6,
    o: [
      (rand() - 0.5) * 5.5,
      (rand() - 0.5) * 5.5,
      (rand() - 0.5) * 5.5,
    ] as const,
  }));

  const per = Math.ceil(count / sphereCount);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const s = Math.min(Math.floor(i / per), sphereCount - 1);
    const k = i % per;
    const y = 1 - (k / Math.max(per - 1, 1)) * 2;
    const radius = Math.sqrt(Math.max(1 - y * y, 0));
    const theta = golden * k;
    const sphere = spheres[s];

    out[i * 3] =
      sphere.o[0] + Math.cos(theta) * radius * sphere.r + gaussian(rand, 0.03);
    out[i * 3 + 1] = sphere.o[1] + y * sphere.r + gaussian(rand, 0.03);
    out[i * 3 + 2] =
      sphere.o[2] + Math.sin(theta) * radius * sphere.r + gaussian(rand, 0.03);
  }

  return normalize(out);
}

/** A shallow slab of loosely gridded points — a star field seen edge-on. */
export function constellation(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const rand = mulberry32(0x5e2a);

  const cols = Math.ceil(Math.sqrt(count * (14 / 8)));
  const rows = Math.ceil(count / cols);

  for (let i = 0; i < count; i++) {
    const cx = i % cols;
    const cy = Math.floor(i / cols);
    const gx = (cx / Math.max(cols - 1, 1) - 0.5) * 14;
    const gy = (cy / Math.max(rows - 1, 1) - 0.5) * 8;

    out[i * 3] = gx + gaussian(rand, 0.35);
    out[i * 3 + 1] = gy + gaussian(rand, 0.22);
    out[i * 3 + 2] = (rand() - 0.5) * 1.5;
  }

  return normalize(out, 7);
}

/** Everything collapsed into a dense point at origin. */
export function singularity(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const rand = mulberry32(0x6b33);

  for (let i = 0; i < count; i++) {
    const r = 0.35 * Math.cbrt(rand());
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    out[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    out[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    out[i * 3 + 2] = r * Math.cos(phi);
  }

  return out;
}

/** Morph order: one target per page section. */
export const TARGET_BUILDERS = [
  helix,
  proteinFold,
  network,
  cellCluster,
  constellation,
  singularity,
] as const;

export const TARGET_COUNT = TARGET_BUILDERS.length;
