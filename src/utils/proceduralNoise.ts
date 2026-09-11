/**
 * High-performance, zero-dependency Procedural Noise Generator for MYRAA
 * Provides smooth 2D and 3D coherent noise for organic membrane deformation,
 * particle turbulence, and energy cloud dynamics.
 */

// Permutation table for gradient noise
const PERM_SIZE = 256;
const p: number[] = new Array(PERM_SIZE * 2);

const permutation = [
  151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69,
  142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219,
  203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
  74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230,
  220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209,
  76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198,
  173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207,
  206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154,
  163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113,
  224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191,
  179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184,
  84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72,
  243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
];

for (let i = 0; i < PERM_SIZE; i++) {
  p[i] = permutation[i];
  p[PERM_SIZE + i] = permutation[i];
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t: number, a: number, b: number): number {
  return a + t * (b - a);
}

function grad3D(hash: number, x: number, y: number, z: number): number {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function grad2D(hash: number, x: number, y: number): number {
  const h = hash & 7;
  const u = h < 4 ? x : y;
  const v = h < 4 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

/**
 * 3D Improved Perlin Noise: returns continuous value in [-1, 1]
 */
export function noise3D(x: number, y: number, z: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;

  const fx = x - Math.floor(x);
  const fy = y - Math.floor(y);
  const fz = z - Math.floor(z);

  const u = fade(fx);
  const v = fade(fy);
  const w = fade(fz);

  const A = p[X] + Y;
  const AA = p[A] + Z;
  const AB = p[A + 1] + Z;
  const B = p[X + 1] + Y;
  const BA = p[B] + Z;
  const BB = p[B + 1] + Z;

  return lerp(
    w,
    lerp(
      v,
      lerp(u, grad3D(p[AA], fx, fy, fz), grad3D(p[BA], fx - 1, fy, fz)),
      lerp(u, grad3D(p[AB], fx, fy - 1, fz), grad3D(p[BB], fx - 1, fy - 1, fz))
    ),
    lerp(
      v,
      lerp(u, grad3D(p[AA + 1], fx, fy, fz - 1), grad3D(p[BA + 1], fx - 1, fy, fz - 1)),
      lerp(u, grad3D(p[AB + 1], fx, fy - 1, fz - 1), grad3D(p[BB + 1], fx - 1, fy - 1, fz - 1))
    )
  );
}

/**
 * 2D Improved Perlin Noise: returns continuous value in [-1, 1]
 */
export function noise2D(x: number, y: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;

  const fx = x - Math.floor(x);
  const fy = y - Math.floor(y);

  const u = fade(fx);
  const v = fade(fy);

  const A = p[X] + Y;
  const B = p[X + 1] + Y;

  return lerp(
    v,
    lerp(u, grad2D(p[A], fx, fy), grad2D(p[B], fx - 1, fy)),
    lerp(u, grad2D(p[A + 1], fx, fy - 1), grad2D(p[B + 1], fx - 1, fy - 1))
  );
}

/**
 * Fractal Brownian Motion (FBM) with multiple octaves for ultra-rich organic textures
 */
export function fbm3D(x: number, y: number, z: number, octaves = 3, lacunarity = 2.0, gain = 0.5): number {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }

  return total / maxValue;
}
