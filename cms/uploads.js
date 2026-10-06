'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { pipeline } = require('stream/promises');
const busboy = require('busboy');

const TYPES = Object.freeze({
  'image/jpeg': { extension: '.jpg', publicType: 'image/jpeg' },
  'image/png': { extension: '.png', publicType: 'image/png' },
  'image/webp': { extension: '.webp', publicType: 'image/webp' },
  'image/gif': { extension: '.gif', publicType: 'image/gif' },
  'application/pdf': { extension: '.pdf', publicType: 'application/pdf' }
});
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function magicMatches(file, mimeType) {
  const handle = fs.openSync(file, 'r');
  try {
    const header = Buffer.alloc(16); const length = fs.readSync(handle, header, 0, header.length, 0);
    if (mimeType === 'image/jpeg') return length >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
    if (mimeType === 'image/png') return length >= 8 && header.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    if (mimeType === 'image/webp') return length >= 12 && header.toString('ascii', 0, 4) === 'RIFF' && header.toString('ascii', 8, 12) === 'WEBP';
    if (mimeType === 'image/gif') return length >= 6 && ['GIF87a','GIF89a'].includes(header.toString('ascii', 0, 6));
    if (mimeType === 'application/pdf') return length >= 5 && header.toString('ascii', 0, 5) === '%PDF-';
    return false;
  } finally { fs.closeSync(handle); }
}

function createMediaUploads(options) {
  const mediaDirectory = path.join(options.dataDir, 'cms', 'media');
  fs.mkdirSync(mediaDirectory, { recursive: true, mode: 0o700 });

  function parse(req) {
    return new Promise((resolve, reject) => {
      let parser;
      try { parser = busboy({ headers: req.headers, limits: { fileSize: MAX_FILE_SIZE, files: 1, fields: 20, fieldSize: 10000, parts: 22 } }); }
      catch (_) { return reject(new Error('Please choose a file to upload.')); }
      const fields = {}; let upload = null; let writeTask = Promise.resolve(); let failed = null;
      parser.on('field', (name, value) => { fields[String(name).slice(0, 80)] = String(value).slice(0, 10000); });
      parser.on('file', (name, stream, info) => {
        if (name !== 'file' || upload) { stream.resume(); return; }
        const type = TYPES[info.mimeType];
        if (!type) { failed = new Error('Only JPEG, PNG, WebP, GIF, and PDF files are allowed.'); stream.resume(); return; }
        const temporary = path.join(mediaDirectory, `.upload-${process.pid}-${crypto.randomUUID()}.tmp`);
        upload = { temporary, mimeType: info.mimeType, originalName: path.basename(String(info.filename || 'upload')).slice(0, 180), type };
        stream.on('limit', () => { failed = new Error('The file is larger than 10 MB.'); });
        writeTask = pipeline(stream, fs.createWriteStream(temporary, { flags: 'wx', mode: 0o600 })).catch((error) => { failed = failed || error; });
      });
      parser.on('filesLimit', () => { failed = new Error('Upload one file at a time.'); });
      parser.on('partsLimit', () => { failed = new Error('The upload contains too many fields.'); });
      parser.on('error', reject);
      parser.on('close', async () => {
        await writeTask;
        try {
          if (failed) throw failed;
          if (!upload || !fs.existsSync(upload.temporary)) throw new Error('Please choose a file to upload.');
          const size = fs.statSync(upload.temporary).size;
          if (!size || size > MAX_FILE_SIZE) throw new Error('The file is empty or larger than 10 MB.');
          if (!magicMatches(upload.temporary, upload.mimeType)) throw new Error('The file contents do not match the selected file type.');
          const filename = `${crypto.randomUUID()}${upload.type.extension}`;
          const finalPath = path.join(mediaDirectory, filename);
          fs.renameSync(upload.temporary, finalPath);
          resolve({ fields, filename, originalName: upload.originalName, mimeType: upload.mimeType, size, publicUrl: `/cms-media/${filename}`, finalPath });
        } catch (error) {
          if (upload && fs.existsSync(upload.temporary)) fs.unlinkSync(upload.temporary);
          reject(error);
        }
      });
      req.pipe(parser);
    });
  }

  function serve(req, res, pathname) {
    const filename = path.basename(pathname.slice('/cms-media/'.length));
    if (!/^[a-f0-9-]{36}\.(?:jpg|png|webp|gif|pdf)$/.test(filename)) { res.writeHead(404); return res.end('Not Found'); }
    const file = path.join(mediaDirectory, filename);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end('Not Found'); }
    const extension = path.extname(filename).toLowerCase();
    const mimeType = Object.values(TYPES).find((value) => value.extension === extension).publicType;
    res.writeHead(200, { 'Content-Type': mimeType, 'Content-Length': fs.statSync(file).size, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff', 'Content-Disposition': 'inline' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  }
  function remove(file) { if (file && file.startsWith(mediaDirectory + path.sep) && fs.existsSync(file)) fs.unlinkSync(file); }
  return { parse, serve, remove, mediaDirectory, MAX_FILE_SIZE };
}

module.exports = { createMediaUploads, MAX_FILE_SIZE };
