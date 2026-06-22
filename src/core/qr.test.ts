import { describe, it, expect } from "vitest";
import { reedSolomon, qrMatrix, qrSvg } from "./qr";

describe("reedSolomon", () => {
  it("matches the QR spec V1-M worked example", () => {
    // data codewords for "01234567" (numeric, V1-M) → 10 EC codewords, per the spec annex
    const data = [16, 32, 12, 86, 97, 128, 236, 17, 236, 17, 236, 17, 236, 17, 236, 17];
    expect(reedSolomon(data, 10)).toEqual([165, 36, 212, 193, 237, 54, 199, 135, 44, 85]);
  });
});

describe("qrMatrix", () => {
  it("produces a v1 (21×21) symbol for a short string", () => {
    const m = qrMatrix("HELLO")!;
    expect(m.length).toBe(21);
    expect(m.every((row) => row.length === 21)).toBe(true);
  });

  it("places the three finder patterns", () => {
    const m = qrMatrix("HELLO")!;
    const n = m.length;
    // each finder: dark corner, dark centre, white gap ring
    for (const [R, C] of [[0, 0], [0, n - 7], [n - 7, 0]] as const) {
      expect(m[R][C]).toBe(true);        // outer ring corner
      expect(m[R + 3][C + 3]).toBe(true); // centre
      expect(m[R + 1][C + 1]).toBe(false); // white gap (chebyshev dist 2)
    }
  });

  it("lays down a valid timing pattern", () => {
    const m = qrMatrix("HELLO")!;
    expect(m[6][8]).toBe(true);  // even index → dark
    expect(m[6][9]).toBe(false); // odd index → light
    expect(m[8][6]).toBe(true);
  });

  it("scales the version up with payload size and is deterministic", () => {
    const url = "https://davidseamons01-ctrl.github.io/hybrid-warrior/#join=ABC23X";
    const a = qrMatrix(url)!;
    const b = qrMatrix(url)!;
    expect(a.length).toBeGreaterThan(21); // needs more than v1
    expect(a.length % 2).toBe(1);          // size is always odd
    expect(a).toEqual(b);                  // deterministic
  });

  it("returns null when the payload cannot fit (>108 bytes)", () => {
    expect(qrMatrix("x".repeat(200))).toBeNull();
  });
});

describe("qrSvg", () => {
  it("returns a black-on-white svg with a module path", () => {
    const svg = qrSvg("hi")!;
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain('fill="#fff"');
    expect(svg).toContain('fill="#000"');
    expect(svg).toContain("<path");
  });
  it("returns null for oversized payloads", () => {
    expect(qrSvg("x".repeat(200))).toBeNull();
  });
});
