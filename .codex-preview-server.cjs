const http = require('http');
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const types = {
  '.html':'text/html; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.js':'application/javascript; charset=utf-8',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg',
  '.webp':'image/webp',
  '.svg':'image/svg+xml',
  '.xml':'application/xml; charset=utf-8',
  '.txt':'text/plain; charset=utf-8'
};

const cleanSlugMap = {
  '/': 'index.html',
  '/about-the-awad-law-firm-history/': 'about.html',
  '/team-members/': 'team-experts.html',
  '/awad-law-firm-4/': 'mission-vision.html',
  '/car-accident/': 'car-accidents.html',
  '/truck-accident/': 'trucking-accidents.html',
  '/motorcycle-accident/': 'motorcycle-accidents.html',
  '/bicycle-accident/': 'bicycle-accidents.html',
  '/uber-accident/': 'uber-accidents.html',
  '/lyft-accident/': 'lyft-accidents.html',
  '/slip-and-fall/': 'slip-and-fall.html',
  '/medical-malpractice/': 'medical-malpractice.html',
  '/wrongful-death/': 'wrongful-death.html',
  '/personal-injury/': 'personal-injury.html',
  '/practice-areas/': 'practice-areas.html',
  '/contact/': 'contact.html',
  '/reviews/': 'reviews.html',
  '/testimonials/': 'testimonials.html',
  '/video-library/': 'tedx.html',
  '/resources/': 'education.html',
  '/core-values/': 'core-values.html',
  '/community/': 'community.html',
  '/why-choose-us/': 'why-choose-us.html',
  '/results/': 'results.html',
  '/newsletter/': 'newsletter.html',
  '/community-accident-report/': 'community-accident-report.html',
  '/community-ajp/': 'community-ajp.html',
  '/community-anti-bullying/': 'community-anti-bullying.html',
  '/community-islamic-relief/': 'community-islamic-relief.html',
  '/community-lowball/': 'community-lowball.html',
  '/community-tacos/': 'community-tacos.html',
  '/community-wanted-my-phone/': 'community-wanted-my-phone.html',
  '/community-window-tint/': 'community-window-tint.html',
  '/community-yaqeen/': 'community-yaqeen.html',
  '/edu-guide-car-accident/': 'edu-guide-car-accident.html',
  '/edu-guide-claim-worth/': 'edu-guide-claim-worth.html',
  '/edu-guide-comparative-negligence/': 'edu-guide-comparative-negligence.html',
  '/edu-guide-costly-mistakes/': 'edu-guide-costly-mistakes.html',
  '/edu-guide-insurance-adjusters/': 'edu-guide-insurance-adjusters.html',
  '/edu-guide-statute-of-limitations/': 'edu-guide-statute-of-limitations.html',
  '/team-members/ibrahim-awad/': 'ibrahim-awad.html',
  '/average-car-accident-settlement-georgia/': 'article-average-settlement.html',
  '/distracted-driver-accident-georgia/': 'article-distracted-driver.html'
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  // Simulate staging/local noindex header
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  // Redirect legacy direct .html requests to clean slugs
  for (const [slug, htmlFile] of Object.entries(cleanSlugMap)) {
    if (urlPath === '/' + htmlFile) {
      res.writeHead(301, { 'Location': slug });
      return res.end();
    }
  }

  // If request has no extension and doesn't end with slash, redirect to trailing slash version
  if (!urlPath.includes('.') && !urlPath.endsWith('/')) {
    res.writeHead(301, { 'Location': urlPath + '/' });
    return res.end();
  }

  // Lookup in clean slug map
  let fileToServe = cleanSlugMap[urlPath];
  let safePath;

  if (fileToServe) {
    safePath = fileToServe;
  } else {
    safePath = urlPath === '/' ? 'index.html' : urlPath.replace(/^([\\/])+/, '');
  }

  const file = path.join(root, safePath);
  if (!file.startsWith(root)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(8080, '127.0.0.1', () => {
  console.log('Server running at http://127.0.0.1:8080/');
});