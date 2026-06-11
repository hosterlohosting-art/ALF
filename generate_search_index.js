const fs = require('fs');
const path = require('path');

const root = __dirname;
const SITE_URL = 'https://theawadlawfirm.com';

const pages = [
  ['/', 'index.html', 'Main Page'],
  ['/about-the-awad-law-firm-history/', 'about.html', 'About'],
  ['/team-members/', 'team-experts.html', 'Team'],
  ['/team-members/ibrahim-awad/', 'ibrahim-awad.html', 'Team'],
  ['/awad-law-firm-4/', 'mission-vision.html', 'About'],
  ['/practice-areas/', 'practice-areas.html', 'Practice Areas'],
  ['/personal-injury/', 'personal-injury.html', 'Practice Areas'],
  ['/car-accident/', 'car-accidents.html', 'Practice Areas'],
  ['/truck-accident/', 'trucking-accidents.html', 'Practice Areas'],
  ['/motorcycle-accident/', 'motorcycle-accidents.html', 'Practice Areas'],
  ['/bicycle-accident/', 'bicycle-accidents.html', 'Practice Areas'],
  ['/uber-accident/', 'uber-accidents.html', 'Practice Areas'],
  ['/lyft-accident/', 'lyft-accidents.html', 'Practice Areas'],
  ['/slip-and-fall/', 'slip-and-fall.html', 'Practice Areas'],
  ['/medical-malpractice/', 'medical-malpractice.html', 'Practice Areas'],
  ['/wrongful-death/', 'wrongful-death.html', 'Practice Areas'],
  ['/results/', 'results.html', 'Results'],
  ['/testimonials/', 'testimonials.html', 'Videos'],
  ['/reviews/', 'reviews.html', 'Reviews'],
  ['/video-library/', 'tedx.html', 'Videos'],
  ['/resources/', 'education.html', 'Resources'],
  ['/newsletter/', 'newsletter.html', 'Newsletter'],
  ['/core-values/', 'core-values.html', 'About'],
  ['/community/', 'community.html', 'Community'],
  ['/why-choose-us/', 'why-choose-us.html', 'About'],
  ['/contact/', 'contact.html', 'Contact'],
  ['/ai-search-overview/', 'ai-search-overview.html', 'AI SEO'],
  ['/average-car-accident-settlement-georgia/', 'article-average-settlement.html', 'Articles'],
  ['/distracted-driver-accident-georgia/', 'article-distracted-driver.html', 'Articles'],
  ['/community-accident-report/', 'community-accident-report.html', 'Community'],
  ['/community-ajp/', 'community-ajp.html', 'Community'],
  ['/community-anti-bullying/', 'community-anti-bullying.html', 'Community'],
  ['/community-islamic-relief/', 'community-islamic-relief.html', 'Community'],
  ['/community-lowball/', 'community-lowball.html', 'Community'],
  ['/community-tacos/', 'community-tacos.html', 'Community'],
  ['/community-wanted-my-phone/', 'community-wanted-my-phone.html', 'Community'],
  ['/community-window-tint/', 'community-window-tint.html', 'Community'],
  ['/community-yaqeen/', 'community-yaqeen.html', 'Community'],
  ['/edu-guide-car-accident/', 'edu-guide-car-accident.html', 'Articles'],
  ['/edu-guide-claim-worth/', 'edu-guide-claim-worth.html', 'Articles'],
  ['/edu-guide-comparative-negligence/', 'edu-guide-comparative-negligence.html', 'Articles'],
  ['/edu-guide-costly-mistakes/', 'edu-guide-costly-mistakes.html', 'Articles'],
  ['/edu-guide-insurance-adjusters/', 'edu-guide-insurance-adjusters.html', 'Articles'],
  ['/edu-guide-statute-of-limitations/', 'edu-guide-statute-of-limitations.html', 'Articles'],
  ['/privacy-policy/', 'privacy-policy.html', 'Legal'],
  ['/terms-of-service/', 'terms-of-service.html', 'Legal']
];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8599;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function pick(pattern, html) {
  const match = html.match(pattern);
  return match ? stripHtml(match[1]).trim() : '';
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function cleanTitle(title) {
  return title
    .replace(/\s*\|\s*The Awad Law Firm\s*$/i, '')
    .replace(/\s*[-–—]\s*Awad Law Firm\s*$/i, '')
    .replace(/\s*:\s*Awad Law Firm\s*$/i, '')
    .trim();
}

function excerpt(text, max = 210) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, '') + '...' : text;
}

function buildPageItem(url, file, category) {
  const html = read(file);
  const title = cleanTitle(pick(/<title[^>]*>([\s\S]*?)<\/title>/i, html) || pick(/<h1[^>]*>([\s\S]*?)<\/h1>/i, html) || url);
  const description = pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i, html);
  const h1 = pick(/<h1[^>]*>([\s\S]*?)<\/h1>/i, html);
  const headings = Array.from(html.matchAll(/<h[2-3][^>]*>([\s\S]*?)<\/h[2-3]>/gi)).slice(0, 12).map(m => stripHtml(m[1])).join(' ');
  const body = stripHtml(html).slice(0, 5500);

  return {
    title,
    url,
    category,
    description: description || excerpt(body),
    keywords: [title, h1, headings, body].join(' ')
  };
}

function buildTeamItems() {
  const html = read('team-experts.html');
  const items = [];
  const cards = html.matchAll(/<!-- Member\s+\d+:\s+([^<]+?)\s+-->([\s\S]*?)(?=<!-- Member|\n\s*<\/div>\s*\n\s*<\/div>\s*\n\s*<!--|$)/g);
  for (const card of cards) {
    const fallbackName = card[1].trim();
    const chunk = card[2];
    const h3 = pick(/<h3[^>]*>([\s\S]*?)<\/h3>/i, chunk) || fallbackName;
    const role = pick(/<span[^>]*>([\s\S]*?)<\/span>/i, chunk);
    const slug = slugify(h3.replace(/,\s*Esq\.?/i, ''));
    
    let file = `team-${slug}.html`;
    if (slug === 'ibrahim-awad') {
      file = 'ibrahim-awad.html';
    }
    
    let bodyText = "";
    if (fs.existsSync(path.join(root, file))) {
      const pageHtml = fs.readFileSync(path.join(root, file), 'utf8');
      bodyText = stripHtml(pageHtml).slice(0, 5500);
    }
    
    items.push({
      title: h3,
      url: `/team-members/${slug}/`,
      category: 'Team Member',
      description: role ? `${h3} - ${role}. Meet the people behind The Awad Law Firm.` : `Meet ${h3} at The Awad Law Firm.`,
      keywords: `${h3} ${role} Awad Law Firm team staff attorney client care media ${bodyText}`
    });
  }
  return items;
}

const index = pages.map(([url, file, category]) => buildPageItem(url, file, category));
index.push(...buildTeamItems());

const out = `window.AWAD_SEARCH_INDEX = ${JSON.stringify(index, null, 2)};\n`;
fs.writeFileSync(path.join(root, 'site-search-data.js'), out);
console.log(`Wrote site-search-data.js with ${index.length} entries`);
