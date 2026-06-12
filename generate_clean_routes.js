const fs = require('fs');
const path = require('path');
const { allPages } = require('../scratch/config.js');

const root = __dirname;

console.log("Compiling clean routes...");

for (const [file, info] of Object.entries(allPages)) {
  // 1. English Route
  if (info.route !== '') {
    const sourceEn = path.join(root, file);
    if (!fs.existsSync(sourceEn)) {
      console.log(`Skipping English: ${file} (source file does not exist yet)`);
    } else {
      const targetDirEn = path.join(root, info.route);
      const targetEn = path.join(targetDirEn, 'index.html');
      fs.mkdirSync(targetDirEn, { recursive: true });
      fs.copyFileSync(sourceEn, targetEn);
      console.log(`${info.route}/index.html <- ${file}`);
    }
  }

  // 2. Spanish Route
  const sourceEs = path.join(root, info.esFile);
  if (!fs.existsSync(sourceEs)) {
    console.log(`Skipping Spanish: ${info.esFile} (source file does not exist yet)`);
  } else {
    const targetDirEs = path.join(root, info.esRoute);
    const targetEs = path.join(targetDirEs, 'index.html');
    fs.mkdirSync(targetDirEs, { recursive: true });
    fs.copyFileSync(sourceEs, targetEs);
    console.log(`${info.esRoute}/index.html <- ${info.esFile}`);
  }
}

console.log("All clean routes successfully generated!");
