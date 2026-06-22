// Minimal, dependency-free QR Code encoder (pure — no DOM/network).
// Scope: byte mode, error-correction level L, single data block, versions 1–5
// (up to 108 bytes). That comfortably covers a partner-session join URL such as
// "https://user.github.io/hybrid-warrior/#join=ABC23X". For anything larger we
// return null and the caller falls back to showing the typed code only.
//
// The structural algorithm (finder/timing/alignment/format placement, zig-zag
// data layout, masking + penalty) follows Nayuki's well-known reference design;
// the Reed–Solomon core is verified against the QR spec's V1-M worked example.

const ECC_L = [
  { ec: 7, data: 19, align: [] as number[] },   // v1, 21×21
  { ec: 10, data: 34, align: [6, 18] },          // v2, 25×25
  { ec: 15, data: 55, align: [6, 22] },          // v3, 29×29
  { ec: 20, data: 80, align: [6, 26] },          // v4, 33×33
  { ec: 26, data: 108, align: [6, 30] },         // v5, 37×37
];

/* ---------- GF(256) arithmetic (primitive polynomial 0x11d) ---------- */
const EXP = new Array<number>(512);
const LOG = new Array<number>(256);
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();
const gfMul = (a: number, b: number): number => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]);

/** Reed–Solomon error-correction codewords for `data` (degree `n`). */
export function reedSolomon(data: number[], n: number): number[] {
  // generator polynomial = ∏ (x - α^i), MSB-first, gen[0] = 1
  let gen = [1];
  for (let i = 0; i < n; i++) {
    const next = new Array(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j++) {
      next[j] ^= gen[j];                    // × x
      next[j + 1] ^= gfMul(gen[j], EXP[i]); // × α^i
    }
    gen = next;
  }
  const res = data.concat(new Array(n).fill(0));
  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) for (let j = 1; j < gen.length; j++) res[i + j] ^= gfMul(gen[j], coef);
  }
  return res.slice(data.length);
}

/* ---------- bitstream (byte mode) ---------- */
function utf8(text: string): number[] {
  const out: number[] = [];
  for (const b of new TextEncoder().encode(text)) out.push(b);
  return out;
}

const getBit = (x: number, i: number): boolean => ((x >>> i) & 1) !== 0;

/* ---------- matrix construction ---------- */
type Cell = boolean;

function newGrid(size: number): { mod: Cell[][]; fn: boolean[][] } {
  const mod: Cell[][] = [];
  const fn: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    mod.push(new Array(size).fill(false));
    fn.push(new Array(size).fill(false));
  }
  return { mod, fn };
}

function placeFinder(mod: Cell[][], fn: boolean[][], R: number, C: number, size: number): void {
  for (let dr = -1; dr <= 7; dr++) {
    for (let dc = -1; dc <= 7; dc++) {
      const r = R + dr, c = C + dc;
      if (r < 0 || r >= size || c < 0 || c >= size) continue;
      fn[r][c] = true;
      let dark = false;
      if (dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6) {
        const d = Math.max(Math.abs(dr - 3), Math.abs(dc - 3));
        dark = d === 3 || d <= 1; // outer ring + 3×3 centre, white gap at d==2
      }
      mod[r][c] = dark;
    }
  }
}

function placeAlignment(mod: Cell[][], fn: boolean[][], cr: number, cc: number): void {
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      fn[cr + dr][cc + dc] = true;
      mod[cr + dr][cc + dc] = Math.max(Math.abs(dr), Math.abs(dc)) !== 1; // ring + centre
    }
  }
}

// BCH(15,5) format info for ECC level L (indicator 0b01) and the given mask.
function formatBits(mask: number): number {
  const data = (0b01 << 3) | mask; // 5 bits
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >> 9) * 0x537);
  return ((data << 10) | rem) ^ 0x5412; // 15 bits
}

function reserveFormat(fn: boolean[][], size: number): void {
  for (let i = 0; i < 9; i++) { fn[8][i] = true; fn[i][8] = true; }
  for (let i = 0; i < 8; i++) { fn[8][size - 1 - i] = true; fn[size - 1 - i][8] = true; }
}

function drawFormat(mod: Cell[][], size: number, mask: number): void {
  const bits = formatBits(mask);
  for (let i = 0; i < 6; i++) mod[i][8] = getBit(bits, i);
  mod[7][8] = getBit(bits, 6);
  mod[8][8] = getBit(bits, 7);
  mod[8][7] = getBit(bits, 8);
  for (let i = 9; i < 15; i++) mod[8][14 - i] = getBit(bits, i);
  for (let i = 0; i < 8; i++) mod[8][size - 1 - i] = getBit(bits, i);
  for (let i = 8; i < 15; i++) mod[size - 15 + i][8] = getBit(bits, i);
  mod[size - 8][8] = true; // always-dark module
}

const MASK_FN: ((r: number, c: number) => boolean)[] = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function penalty(mod: Cell[][], size: number): number {
  let p = 0;
  // Rule 1: runs of 5+ same colour in each row and column
  for (let i = 0; i < size; i++) {
    let runR = 1, runC = 1;
    for (let j = 1; j < size; j++) {
      if (mod[i][j] === mod[i][j - 1]) { runR++; if (runR === 5) p += 3; else if (runR > 5) p++; } else runR = 1;
      if (mod[j][i] === mod[j - 1][i]) { runC++; if (runC === 5) p += 3; else if (runC > 5) p++; } else runC = 1;
    }
  }
  // Rule 2: 2×2 blocks of one colour
  for (let r = 0; r < size - 1; r++)
    for (let c = 0; c < size - 1; c++)
      if (mod[r][c] === mod[r][c + 1] && mod[r][c] === mod[r + 1][c] && mod[r][c] === mod[r + 1][c + 1]) p += 3;
  // Rule 3: finder-like 1:1:3:1:1 patterns with 4-module light run
  const A = [true, false, true, true, true, false, true, false, false, false, false];
  const B = [false, false, false, false, true, false, true, true, true, false, true];
  const matches = (get: (k: number) => boolean, start: number) => {
    for (let pat = 0; pat < 11; pat++) if (get(start + pat) !== A[pat]) return matchB(get, start);
    return true;
  };
  const matchB = (get: (k: number) => boolean, start: number) => {
    for (let pat = 0; pat < 11; pat++) if (get(start + pat) !== B[pat]) return false;
    return true;
  };
  for (let i = 0; i < size; i++)
    for (let j = 0; j <= size - 11; j++) {
      if (matches((k) => mod[i][k], j)) p += 40;
      if (matches((k) => mod[k][i], j)) p += 40;
    }
  // Rule 4: overall dark-module balance
  let dark = 0;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (mod[r][c]) dark++;
  const ratio = (dark * 100) / (size * size);
  p += Math.floor(Math.abs(ratio - 50) / 5) * 10;
  return p;
}

/** Build the QR module matrix (true = dark) for `text`, or null if it won't fit. */
export function qrMatrix(text: string): boolean[][] | null {
  const bytes = utf8(text);
  // pick smallest version whose data capacity holds mode(4) + length(8) + data
  const need = 4 + 8 + bytes.length * 8;
  let vi = -1;
  for (let i = 0; i < ECC_L.length; i++) if (ECC_L[i].data * 8 >= need) { vi = i; break; }
  if (vi < 0) return null;
  const spec = ECC_L[vi];
  const size = 17 + 4 * (vi + 1);

  // --- data bitstream ---
  const bits: boolean[] = [];
  const push = (val: number, len: number) => { for (let i = len - 1; i >= 0; i--) bits.push(getBit(val, i)); };
  push(0b0100, 4);           // byte mode
  push(bytes.length, 8);     // char count (8-bit for v1–9)
  for (const b of bytes) push(b, 8);
  const cap = spec.data * 8;
  for (let i = 0; i < 4 && bits.length < cap; i++) bits.push(false); // terminator
  while (bits.length % 8 !== 0) bits.push(false);
  const padBytes = [0xec, 0x11];
  for (let i = 0; bits.length < cap; i++) push(padBytes[i % 2], 8);

  // --- codewords + ECC (single block) ---
  const dataCw: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | (bits[i + j] ? 1 : 0);
    dataCw.push(b);
  }
  const all = dataCw.concat(reedSolomon(dataCw, spec.ec));

  // --- function patterns ---
  const { mod, fn } = newGrid(size);
  placeFinder(mod, fn, 0, 0, size);
  placeFinder(mod, fn, 0, size - 7, size);
  placeFinder(mod, fn, size - 7, 0, size);
  for (let i = 8; i < size - 8; i++) { // timing patterns (before format reserve)
    const v = i % 2 === 0;
    if (!fn[6][i]) { mod[6][i] = v; fn[6][i] = true; }
    if (!fn[i][6]) { mod[i][6] = v; fn[i][6] = true; }
  }
  if (spec.align.length) {
    const first = spec.align[0], last = spec.align[spec.align.length - 1];
    for (const r of spec.align) for (const c of spec.align) {
      if ((r === first && c === first) || (r === first && c === last) || (r === last && c === first)) continue;
      placeAlignment(mod, fn, r, c);
    }
  }
  reserveFormat(fn, size);
  fn[size - 8][8] = true; // dark module is a function module

  // --- data placement (zig-zag, upward/downward) ---
  let bi = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5; // skip vertical timing column
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const col = right - j;
        const upward = ((right + 1) & 2) === 0;
        const row = upward ? size - 1 - vert : vert;
        if (!fn[row][col] && bi < all.length * 8) {
          mod[row][col] = getBit(all[bi >> 3], 7 - (bi & 7));
          bi++;
        }
      }
    }
  }

  // --- pick the lowest-penalty mask, then write its format info ---
  let best = -1, bestPenalty = Infinity;
  for (let m = 0; m < 8; m++) {
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!fn[r][c] && MASK_FN[m](r, c)) mod[r][c] = !mod[r][c];
    drawFormat(mod, size, m);
    const pen = penalty(mod, size);
    if (pen < bestPenalty) { bestPenalty = pen; best = m; }
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!fn[r][c] && MASK_FN[m](r, c)) mod[r][c] = !mod[r][c]; // undo
  }
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!fn[r][c] && MASK_FN[best](r, c)) mod[r][c] = !mod[r][c];
  drawFormat(mod, size, best);
  return mod;
}

export interface QrSvgOpts { margin?: number }
/** Render `text` as a scannable QR `<svg>` string (black on white), or null. */
export function qrSvg(text: string, opts: QrSvgOpts = {}): string | null {
  const m = qrMatrix(text);
  if (!m) return null;
  const margin = opts.margin ?? 4;
  const n = m.length;
  const dim = n + margin * 2;
  let path = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (m[r][c]) path += `M${c + margin} ${r + margin}h1v1h-1z`;
  return `<svg viewBox="0 0 ${dim} ${dim}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><rect width="${dim}" height="${dim}" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
}
