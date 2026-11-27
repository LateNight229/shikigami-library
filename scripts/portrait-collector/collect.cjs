const fs = require('node:fs/promises');
const path = require('node:path');

async function main() {
  const [listFile, outputDir] = process.argv.slice(2);
  if (!listFile || !outputDir) throw new Error('Dùng: node collect.cjs --range <thu-muc-anh> hoặc node collect.cjs <danh-sach.json> <thu-muc-anh>');
  const entries = listFile === '--range' ? Array.from({length: 413}, (_, i) => ({id: String(i + 200), url: `https://thucthanluc.io.vn/portraits/${i + 200}.png`})) : JSON.parse(await fs.readFile(listFile, 'utf8'));
  if (!Array.isArray(entries)) throw new Error('Danh sách phải là mảng JSON gồm id và url.');
  await fs.mkdir(outputDir, { recursive: true });
  const report = [];
  for (const item of entries) {
    const id = String(item.id ?? '');
    if (!/^\d+$/.test(id)) throw new Error('ID phải chỉ gồm chữ số.');
    const url = new URL(item.url);
    if (url.protocol !== 'https:') throw new Error('Chỉ chấp nhận URL HTTPS.');
    const target = path.join(outputDir, id + '.png');
    try {
      try { await fs.access(target); report.push({ id, status: 'existing' }); continue; } catch (e) { if (e.code !== 'ENOENT') throw e; }
      const response = await fetch(url, { signal: AbortSignal.timeout(30000), redirect: 'error' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length > 20 * 1024 * 1024 || bytes.length < 8 || !bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new Error('Không phải PNG hợp lệ hoặc vượt 20 MiB.');
      await fs.writeFile(target, bytes, { flag: 'wx' });
      report.push({ id, status: 'downloaded', bytes: bytes.length });
      console.log(`${id}: đã tải (${bytes.length} byte)`);
    } catch (error) {
      report.push({ id, status: 'error', error: error.message });
      console.error(`${id}: ${error.message}`);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  await fs.writeFile(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
  console.log(`Báo cáo: ${path.join(outputDir, 'report.json')}`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
