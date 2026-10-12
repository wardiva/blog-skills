import sharp from 'sharp';
const [a, b] = process.argv.slice(2);
async function fp(p, w, h) {
  const g = await sharp(p).greyscale().resize(w, h, { fit: 'fill' }).blur(1.2).raw().toBuffer();
  const v = Float64Array.from(g); const m = v.reduce((x, y) => x + y) / v.length; let s = 0; for (const x of v) s += (x - m) ** 2; s = Math.sqrt(s / v.length) || 1; return v.map((x) => (x - m) / s);
}
for (const [w, h] of [[32, 18], [16, 9], [64, 36]]) { const A = await fp(a, w, h), B = await fp(b, w, h); console.log(w, (A.reduce((t, x, i) => t + x * B[i], 0) / A.length).toFixed(3)); }
