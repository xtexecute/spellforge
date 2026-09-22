// Build a single HTML file for phone browsers that cannot read sibling files.
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const output = path.join(root, 'Spellforge-Mobile.html');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const requireReplace = (source, original, replacement, label) => {
  if (!source.includes(original)) throw new Error(`Could not find ${label}`);
  return source.replace(original, replacement);
};

const assets = {};
for (const directory of ['assets/images/current', 'assets/images/animated', 'assets/images', 'assets/audio']) {
  const full = path.join(root, directory);
  if (!fs.existsSync(full)) continue;
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const extension = path.extname(entry.name).toLowerCase();
    const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg' }[extension];
    if (!mime) continue;
    const key = `${directory}/${entry.name}`;
    assets[key] = `data:${mime};base64,${fs.readFileSync(path.join(full, entry.name)).toString('base64')}`;
  }
}

let html = read('index.html');
for (const css of ['editor.css', 'journal.css', 'features.css', 'realms.css', 'ui-refresh.css', 'expansion.css']) {
  html = requireReplace(html, `<link rel="stylesheet" href="${css}">`, `<style>\n${read(css)}\n</style>`, css);
}
html = requireReplace(html, 'href="assets/images/favicon.png"', `href="${assets['assets/images/favicon.png']}"`, 'favicon');

const manifest = `<script>window.SpellforgeEmbeddedAssets=${JSON.stringify(assets)};window.SpellAssetURL=path=>window.SpellforgeEmbeddedAssets[path]||path;</script>`;
html = requireReplace(html, '<script src="sound.js"></script>', `${manifest}<script src="sound.js"></script>`, 'asset bootstrap');

for (const js of ['sound.js', 'progression.js', 'editor.js', 'realms.js', 'journal.js', 'game.js', 'features.js', 'expansion.js']) {
  let source = read(js);
  if (js === 'game.js') {
    source = requireReplace(source, 'image.src=`assets/images/current/${name}.png`', 'image.src=window.SpellAssetURL(`assets/images/current/${name}.png`)', 'static sprites');
    source = requireReplace(source, 'image.src=`assets/images/animated/${name}.png`', 'image.src=window.SpellAssetURL(`assets/images/animated/${name}.png`)', 'animated sprites');
  }
  if (js === 'journal.js') {
    source = requireReplace(source, 'src="assets/images/current/${entry.id}.png"', 'src="${window.SpellAssetURL(\'assets/images/current/\'+entry.id+\'.png\')}"', 'journal sprites');
  }
  if (js === 'sound.js') {
    source = source.replace(/'assets\/audio\/([^']+)'/g, (_, name) => `window.SpellAssetURL('assets/audio/${name}')`);
  }
  if (source.includes('</script>')) throw new Error(`${js} contains a closing script tag`);
  html = requireReplace(html, `<script src="${js}"></script>`, `<script>\n${source}\n//# sourceURL=${js}\n</script>`, js);
}

if (/<(?:script|link)\b[^>]+(?:src|href)="(?!data:)/i.test(html)) throw new Error('External script or stylesheet remains');
fs.writeFileSync(output, html);
console.log(`Built ${path.basename(output)} (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MiB, ${Object.keys(assets).length} embedded assets)`);
