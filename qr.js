// Tạo mã QR (chế độ byte, phiên bản 1–10) — viết theo thuật toán của Project Nayuki "QR Code generator" (MIT).
// Dùng: const m = QR.tao("https://...", "Q"); // trả về mảng 2 chiều true = ô đen
(function (global) {
  "use strict";
  const ECC = { L: [1, 0], M: [0, 1], Q: [3, 2], H: [2, 3] };   // [formatBits, thứ tự]
  const ECC_CW = [
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18],
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26],
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24],
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28]];
  const NUM_BLK = [
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4],
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5],
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8],
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8]];
  const N1 = 3, N2 = 3, N3 = 40, N4 = 10;
  const bit = (x, i) => ((x >>> i) & 1) !== 0;

  function rawModules(ver) {
    let r = (16 * ver + 128) * ver + 64;
    if (ver >= 2) { const na = Math.floor(ver / 7) + 2; r -= (25 * na - 10) * na - 55; if (ver >= 7) r -= 36; }
    return r;
  }
  const numDataCw = (ver, o) => Math.floor(rawModules(ver) / 8) - ECC_CW[o][ver] * NUM_BLK[o][ver];

  function rsMul(x, y) { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z; }
  function rsDivisor(deg) {
    const r = []; for (let i = 0; i < deg - 1; i++) r.push(0); r.push(1);
    let root = 1;
    for (let i = 0; i < deg; i++) {
      for (let j = 0; j < r.length; j++) { r[j] = rsMul(r[j], root); if (j + 1 < r.length) r[j] ^= r[j + 1]; }
      root = rsMul(root, 0x02);
    }
    return r;
  }
  function rsRemainder(data, div) {
    const r = div.map(() => 0);
    for (const b of data) { const f = b ^ r.shift(); r.push(0); div.forEach((c, i) => r[i] ^= rsMul(c, f)); }
    return r;
  }

  function tao(text, mucEcc) {
    const [fmt, o] = ECC[mucEcc || "Q"];
    const bytes = Array.from(new TextEncoder().encode(text));
    let ver = 1;
    for (; ver <= 10; ver++) { if (4 + (ver < 10 ? 8 : 16) + bytes.length * 8 <= numDataCw(ver, o) * 8) break; }
    if (ver > 10) throw new Error("Nội dung quá dài");
    const size = ver * 4 + 17;

    // Chuỗi bit dữ liệu
    const bb = [];
    const add = (v, n) => { for (let i = n - 1; i >= 0; i--) bb.push((v >>> i) & 1); };
    add(4, 4); add(bytes.length, ver < 10 ? 8 : 16); bytes.forEach(b => add(b, 8));
    const cap = numDataCw(ver, o) * 8;
    add(0, Math.min(4, cap - bb.length)); add(0, (8 - bb.length % 8) % 8);
    for (let p = 0xEC; bb.length < cap; p ^= 0xEC ^ 0x11) add(p, 8);
    const data = []; while (data.length * 8 < bb.length) data.push(0);
    bb.forEach((b, i) => data[i >>> 3] |= b << (7 - (i & 7)));

    // Mã sửa lỗi + xen kẽ khối
    const nb = NUM_BLK[o][ver], el = ECC_CW[o][ver], raw = Math.floor(rawModules(ver) / 8);
    const nShort = nb - raw % nb, shortLen = Math.floor(raw / nb), div = rsDivisor(el), blocks = [];
    for (let i = 0, k = 0; i < nb; i++) {
      const dat = data.slice(k, k + shortLen - el + (i < nShort ? 0 : 1)); k += dat.length;
      const ecc = rsRemainder(dat, div); if (i < nShort) dat.push(0); blocks.push(dat.concat(ecc));
    }
    const all = [];
    for (let i = 0; i < blocks[0].length; i++) blocks.forEach((blk, j) => { if (i !== shortLen - el || j >= nShort) all.push(blk[i]); });

    // Ma trận
    const M = Array.from({ length: size }, () => Array(size).fill(false));
    const F = Array.from({ length: size }, () => Array(size).fill(false));
    const set = (x, y, d) => { M[y][x] = d; F[y][x] = true; };
    for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    const finder = (x, y) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const d = Math.max(Math.abs(dx), Math.abs(dy)), xx = x + dx, yy = y + dy;
      if (xx >= 0 && xx < size && yy >= 0 && yy < size) set(xx, yy, d !== 2 && d !== 4); } };
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    const align = [];
    if (ver > 1) { const na = Math.floor(ver / 7) + 2, step = Math.ceil((ver * 4 + 4) / (na * 2 - 2)) * 2;
      align.push(6); for (let p = size - 7; align.length < na; p -= step) align.splice(1, 0, p); }
    for (let i = 0; i < align.length; i++) for (let j = 0; j < align.length; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === align.length - 1) || (i === align.length - 1 && j === 0)) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(align[i] + dx, align[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
    const formatBits = mask => {
      const d = fmt << 3 | mask; let rem = d;
      for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      const b = (d << 10 | rem) ^ 0x5412;
      for (let i = 0; i <= 5; i++) set(8, i, bit(b, i));
      set(8, 7, bit(b, 6)); set(8, 8, bit(b, 7)); set(7, 8, bit(b, 8));
      for (let i = 9; i < 15; i++) set(14 - i, 8, bit(b, i));
      for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(b, i));
      for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(b, i));
      set(8, size - 8, true);
    };
    formatBits(0);
    if (ver >= 7) { let rem = ver; for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
      const b = ver << 12 | rem; for (let i = 0; i < 18; i++) { const c = bit(b, i), a = size - 11 + i % 3, bb2 = Math.floor(i / 3); set(a, bb2, c); set(bb2, a, c); } }

    // Đặt dữ liệu theo đường zigzag
    let idx = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let v = 0; v < size; v++) for (let j = 0; j < 2; j++) {
        const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - v : v;
        if (!F[y][x] && idx < all.length * 8) { M[y][x] = bit(all[idx >>> 3], 7 - (idx & 7)); idx++; }
      }
    }

    const applyMask = mask => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      let inv;
      switch (mask) {
        case 0: inv = (x + y) % 2 === 0; break;
        case 1: inv = y % 2 === 0; break;
        case 2: inv = x % 3 === 0; break;
        case 3: inv = (x + y) % 3 === 0; break;
        case 4: inv = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
        case 5: inv = x * y % 2 + x * y % 3 === 0; break;
        case 6: inv = (x * y % 2 + x * y % 3) % 2 === 0; break;
        default: inv = ((x + y) % 2 + x * y % 3) % 2 === 0;
      }
      if (!F[y][x] && inv) M[y][x] = !M[y][x];
    } };
    const addHist = (len, h) => { if (h[0] === 0) len += size; h.pop(); h.unshift(len); };
    const countPat = h => { const n = h[1]; const core = n > 0 && h[2] === n && h[3] === n * 3 && h[4] === n && h[5] === n;
      return (core && h[0] >= n * 4 && h[6] >= n ? 1 : 0) + (core && h[6] >= n * 4 && h[0] >= n ? 1 : 0); };
    const termCount = (color, len, h) => { if (color) { addHist(len, h); len = 0; } len += size; addHist(len, h); return countPat(h); };
    const penalty = () => {
      let r = 0;
      for (let pass = 0; pass < 2; pass++) for (let a = 0; a < size; a++) {
        let color = false, run = 0; const h = [0, 0, 0, 0, 0, 0, 0];
        for (let b = 0; b < size; b++) {
          const c = pass === 0 ? M[a][b] : M[b][a];
          if (c === color) { run++; if (run === 5) r += N1; else if (run > 5) r++; }
          else { addHist(run, h); if (!color) r += countPat(h) * N3; color = c; run = 1; }
        }
        r += termCount(color, run, h) * N3;
      }
      for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) {
        const c = M[y][x]; if (c === M[y][x + 1] && c === M[y + 1][x] && c === M[y + 1][x + 1]) r += N2; }
      let dark = 0; M.forEach(row => row.forEach(c => { if (c) dark++; }));
      const total = size * size; r += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * N4;
      return r;
    };
    let best = 0, min = Infinity;
    for (let i = 0; i < 8; i++) { applyMask(i); formatBits(i); const p = penalty(); if (p < min) { min = p; best = i; } applyMask(i); }
    applyMask(best); formatBits(best);
    return { modules: M, size, version: ver, mask: best, ecc: mucEcc || "Q" };
  }

  // Vẽ thành SVG (lề trắng 4 ô theo chuẩn)
  function svg(qr, opt) {
    opt = opt || {}; const q = 4, n = qr.size + q * 2, mau = opt.mau || "#000";
    let d = "";
    qr.modules.forEach((row, y) => row.forEach((c, x) => { if (c) d += `M${x + q},${y + q}h1v1h-1z`; }));
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"${opt.w ? ` width="${opt.w}" height="${opt.w}"` : ""}><rect width="${n}" height="${n}" fill="#fff"/><path d="${d}" fill="${mau}"/></svg>`;
  }
  global.QR = { tao, svg };
})(typeof window !== "undefined" ? window : this);
