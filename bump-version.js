// bump-version.js
// Usage: node bump-version.js "SMED V03.html"
// Effet: crée "SMED V04.html" + met à jour APP_VERSION à la date du jour et suffix v04

const fs = require('fs');
const path = require('path');

function pad2(n){ return String(n).padStart(2,'0'); }

function nextFileName(current) {
  const m = current.match(/^(.+?\sV)(\d+)(\.html)$/i);
  if (!m) throw new Error('Nom attendu au format "SMED VNN.html"');
  const base = m[1];
  const n = parseInt(m[2],10);
  const ext = m[3];
  const next = pad2(n+1);
  return base + next + ext; // ex: SMED V03.html -> SMED V04.html
}

function makeAppVersionSuffix(nextFile){
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = pad2(today.getMonth()+1);
  const dd = pad2(today.getDate());
  // extraire NN depuis "VNN"
  const m = nextFile.match(/V(\d+)\.html$/i);
  const vnn = m ? 'v' + m[1] : 'vXX';
  return `${yyyy}-${mm}-${dd}_${vnn}`;
}

function replaceAppVersion(content, newVer){
  // remplace la ligne const APP_VERSION = '...';
  const re = /const\s+APP_VERSION\s*=\s*['"][^'"]*['"]\s*;/;
  if (!re.test(content)) {
    throw new Error('APP_VERSION introuvable : ajoute d’abord const APP_VERSION = "..."; dans le HTML');
  }
  return content.replace(re, `const APP_VERSION = '${newVer}';`);
}

(function main(){
  const current = process.argv[2];
  if (!current) throw new Error('Indique le fichier courant: node bump-version.js "SMED V03.html"');

  const currPath = path.resolve(process.cwd(), current);
  if (!fs.existsSync(currPath)) throw new Error('Fichier introuvable: ' + currPath);

  const nextName = nextFileName(path.basename(currPath));
  const nextPath = path.join(path.dirname(currPath), nextName);

  const html = fs.readFileSync(currPath, 'utf8');
  const newVer = makeAppVersionSuffix(nextName);
  const patched = replaceAppVersion(html, newVer);

  fs.writeFileSync(nextPath, patched, 'utf8');

  console.log('OK → Nouveau fichier :', nextName);
  console.log('APP_VERSION =', newVer);
})();
