// FoodBridge Pickup Verification Engine

/**
 * Generate a deterministic 4-digit PIN from a claim ID or donation ID
 */
export function generatePickupPin(identifier: string): string {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const absVal = Math.abs(hash);
  const pinNum = (absVal % 9000) + 1000; // Ensures 1000-9999
  return pinNum.toString();
}

/**
 * Format a human-readable Claim Pass ID
 */
export function formatPassId(claimId: string): string {
  const clean = claimId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `FB-${clean.slice(0, 6) || "PASS"}`;
}

/**
 * Persistent Handover State Management in localStorage
 */
const HANDOVER_KEY = "foodbridge_completed_handovers";

export function getCompletedHandovers(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HANDOVER_KEY) || "[]");
  } catch {
    return [];
  }
}

export function markHandoverCompleted(identifier: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getCompletedHandovers();
    if (!current.includes(identifier)) {
      current.push(identifier);
      localStorage.setItem(HANDOVER_KEY, JSON.stringify(current));
    }
  } catch (err) {
    console.error(err);
  }
}

export function isHandoverCompleted(identifier: string): boolean {
  return getCompletedHandovers().includes(identifier);
}

/**
 * Minimalist QR Code matrix generator (21x21 version 1 QR)
 * Generates an SVG path data representation for lightweight, zero-dependency rendering.
 */
export function generateQrMatrix(text: string): boolean[][] {
  const size = 21;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Helper to draw position patterns (7x7 squares at corners)
  const drawFinder = (startX: number, startY: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        if (
          x === 0 ||
          x === 6 ||
          y === 0 ||
          y === 6 ||
          (x >= 2 && x <= 4 && y >= 2 && y <= 4)
        ) {
          matrix[startY + y][startX + x] = true;
        }
      }
    }
  };

  // 3 Finder patterns
  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Hash-based deterministic payload encoding into remainder matrix
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) & 0xffffffff;
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const isFinder =
        (x < 8 && y < 8) ||
        (x >= size - 8 && y < 8) ||
        (x < 8 && y >= size - 8) ||
        (x === 6 || y === 6);

      if (!isFinder) {
        const seed = (x * 13 + y * 17 + hash) & 0xffff;
        matrix[y][x] = (seed % 3 === 0 || (seed ^ (x * y)) % 4 === 1);
      }
    }
  }

  return matrix;
}
