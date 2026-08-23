const fs = require('fs');
const files = fs.readdirSync('.', { recursive: true })
  .map(String)
  .filter(f => /\.tsx?$/.test(f) && !f.includes('node_modules') && !f.includes('.next'));
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  const bad = s.match(/[\u00C2\u00C3][\u0080-\u00BF\u00A8\u00A7]/g);
  if (bad) {
    const lines = s.split('\n');
    lines.forEach((ln, i) => {
      if (/[\u00C2\u00C3][\u0080-\u00BF]/.test(ln)) console.log(f + ':' + (i + 1), JSON.stringify(ln.trim().slice(0, 120)));
    });
  }
}
console.log('scan complete');
