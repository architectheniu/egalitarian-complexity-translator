// High-precision numerical evaluation of Riemann zeta |zeta(sigma + i t)|
// via Borwein (2000) accelerated alternating Dirichlet eta series (n = 38),
// plus real Sieve of Eratosthenes prime-power von Mangoldt centered sums.

export const KNOWN_ZETA_ZEROS: number[] = [
  14.134725,
  21.02204,
  25.010858,
  30.424876,
  32.935062,
  37.586178,
  40.918719,
  43.327073,
];

const BORWEIN_N = 38;
const BORWEIN_C: number[] = (() => {
  let t = 1.0 / BORWEIN_N;
  const terms: number[] = [t];
  for (let k = 0; k < BORWEIN_N; k++) {
    t = (t * (BORWEIN_N + k) * (BORWEIN_N - k) * 4.0) / ((2 * k + 1) * (2 * k + 2));
    terms.push(t);
  }
  const d: number[] = [];
  let acc = 0.0;
  for (const val of terms) {
    acc += val;
    d.push(acc);
  }
  const dn = d[d.length - 1];
  return d.slice(0, -1).map((val) => (val - dn) / dn);
})();

export function evalZetaMagnitude(sigma: number, t: number): number {
  let etaRe = 0.0;
  let etaIm = 0.0;

  for (let k = 0; k < BORWEIN_C.length; k++) {
    const n = k + 1;
    const sign = k % 2 === 0 ? 1.0 : -1.0;
    const mag = sign * BORWEIN_C[k] * Math.pow(n, -sigma);
    const angle = -t * Math.log(n);
    etaRe += mag * Math.cos(angle);
    etaIm += mag * Math.sin(angle);
  }
  etaRe = -etaRe;
  etaIm = -etaIm;

  // 1 - 2^(1 - s) = 1 - 2^(1 - sigma) * exp(-i t ln 2)
  const twoPow = Math.pow(2.0, 1.0 - sigma);
  const ln2t = t * Math.log(2.0);
  const denRe = 1.0 - twoPow * Math.cos(ln2t);
  const denIm = twoPow * Math.sin(ln2t);

  const etaMagSq = etaRe * etaRe + etaIm * etaIm;
  const denMagSq = denRe * denRe + denIm * denIm;
  if (denMagSq < 1e-18) return 99.0;
  return Math.sqrt(etaMagSq / denMagSq);
}

export interface ZetaCurvePoint {
  t: number;
  mag: number;
}

export function sampleZetaCurve(sigma: number, tMin = 10, tMax = 45, steps = 260): ZetaCurvePoint[] {
  const pts: ZetaCurvePoint[] = [];
  const dt = (tMax - tMin) / (steps - 1);
  for (let i = 0; i < steps; i++) {
    const t = tMin + i * dt;
    pts.push({ t, mag: Math.min(4.5, evalZetaMagnitude(sigma, t)) });
  }
  return pts;
}

// Precompute von Mangoldt Lambda(n) via Sieve up to MAX_N = 16000
const MAX_PRIME_N = 16000;
const LAMBDA: Float64Array = (() => {
  const arr = new Float64Array(MAX_PRIME_N + 1);
  const isPrime = new Uint8Array(MAX_PRIME_N + 1);
  isPrime.fill(1);
  isPrime[0] = 0;
  isPrime[1] = 0;
  for (let p = 2; p <= MAX_PRIME_N; p++) {
    if (isPrime[p]) {
      for (let m = p * p; m <= MAX_PRIME_N; m += p) {
        isPrime[m] = 0;
      }
      const lp = Math.log(p);
      let pk = p;
      while (pk <= MAX_PRIME_N) {
        arr[pk] = lp;
        pk *= p;
      }
    }
  }
  return arr;
})();

export interface PrimeWindowPoint {
  y: number;
  realError: number;
  withRogueError: number;
  ceiling: number;
}

/**
 * Evaluates real centered Chebyshev fluctuation psi(y) - y across window [Y, Y^(3/2)]
 * alongside the hypothetical perturbation caused by an off-line zero at Re(rho) = rogueBeta.
 */
export function computePrimeWindowSeries(
  yStart = 80,
  rogueBeta = 0.5,
  thetaCap = 0.62,
  sampleCount = 120
): { points: PrimeWindowPoint[]; yEnd: number; maxBreachRatio: number } {
  const yEnd = Math.min(MAX_PRIME_N, Math.round(Math.pow(yStart, 1.5)));
  const psi = new Float64Array(yEnd + 1);
  let acc = 0.0;
  for (let n = 1; n <= yEnd; n++) {
    acc += LAMBDA[n];
    psi[n] = acc;
  }

  const gamma1 = 14.134725;
  const rogueStrength = Math.max(0, rogueBeta - 0.5) * 4.2;
  const cConst = 1.65;

  const points: PrimeWindowPoint[] = [];
  let maxBreachRatio = 0;

  for (let i = 0; i < sampleCount; i++) {
    const frac = i / (sampleCount - 1);
    const y = Math.max(yStart, Math.min(yEnd, Math.round(yStart + frac * (yEnd - yStart))));
    const realError = psi[y] - y;
    const rogueWave =
      rogueBeta > 0.501
        ? -rogueStrength * Math.pow(y, rogueBeta) * Math.cos(gamma1 * Math.log(y) - 0.45)
        : 0;
    const withRogueError = realError + rogueWave;
    const ceiling = cConst * Math.pow(y, thetaCap);
    const ratio = Math.abs(withRogueError) / ceiling;
    if (ratio > maxBreachRatio) maxBreachRatio = ratio;
    points.push({ y, realError, withRogueError, ceiling });
  }

  return { points, yEnd, maxBreachRatio };
}
