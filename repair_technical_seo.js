const fs = require('fs');
const path = require('path');
const { allPages } = require('../scratch/config.js');

const root = __dirname;
const site = 'https://theawadlawfirm.com';

const teamNames = {
  'ibrahim-awad': 'Ibrahim J. Awad, Esq.',
  'basher-hassan': 'Basher Hassan, Esq.',
  'david-price': 'David Price, Esq.',
  'azima-mohamed': 'Azima Mohamed, Esq.',
  'ahmad-choudhary': 'Ahmad Choudhary, Esq.',
  'gay-hartley': 'Gay Hartley',
  'marion-day': 'Marion Day',
  'shantrell-ball': 'Shantrell Ball',
  'leland-bridges': 'Leland Bridges',
  'sandra-guzman': 'Sandra Guzman',
  'devin-spiegelhalter': 'Devin Spiegelhalter',
  'sabrina-portuondo': 'Sabrina Portuondo',
  'jocelyn-suarez': 'Jocelyn Suarez',
  'deanna-marquez': 'Deanna Marquez',
  'timothy-melson': 'Timothy Melson',
  'adriana-melgarejo': 'Adriana Melgarejo',
  'christina-dixon': 'Christina Dixon',
  'carley-richards': 'Carley Richards',
  'genesis-resendiz': 'Genesis Resendiz',
  'isabel-welch': 'Isabel Welch',
  'betty-mendez': 'Betty Mendez',
  'sierra-jones': 'Sierra Jones',
  'elizabeth-chavarria': 'Elizabeth Chavarria',
  'stephanie-rivera': 'Stephanie Rivera',
  mohamed: 'Mohamed Ahmed',
  'selvin-navarro': 'Selvin Navarro',
  'mehar-hassan': 'Mehar Hassan',
  'john-jabes-salva': 'John Jabes Salva',
  'tasha-hijara': 'Tasha Hijara',
  'ella-batilona': 'Ella Batilona',
  'edgard-manzanares': 'Edgard Manzanares',
  'alvaro-vanegas': 'Alvaro Vanegas'
};

const spanishTitles = {
  'index.html': 'Abogados de lesiones personales en Georgia | The Awad Law Firm',
  'about.html': 'Sobre The Awad Law Firm | Abogados de lesiones en Georgia',
  'practice-areas.html': 'Áreas de práctica | Abogados de lesiones en Georgia',
  'results.html': 'Resultados de casos y acuerdos | The Awad Law Firm',
  'contact.html': 'Contacto y consulta gratuita | The Awad Law Firm',
  'car-accidents.html': 'Abogado de accidentes de auto en Marietta | The Awad Law Firm',
  'trucking-accidents.html': 'Abogado de accidentes de camión en Georgia | The Awad Law Firm',
  'slip-and-fall.html': 'Abogado de resbalones y caídas en Marietta | The Awad Law Firm',
  'wrongful-death.html': 'Abogado de muerte injusta en Georgia | The Awad Law Firm',
  'medical-malpractice.html': 'Abogado de negligencia médica en Marietta | The Awad Law Firm',
  'personal-injury.html': 'Abogado de lesiones personales en Marietta | The Awad Law Firm',
  'motorcycle-accidents.html': 'Abogado de accidentes de motocicleta | The Awad Law Firm',
  'bicycle-accidents.html': 'Abogado de accidentes de bicicleta | The Awad Law Firm',
  'uber-accidents.html': 'Abogado de accidentes de Uber en Marietta | The Awad Law Firm',
  'lyft-accidents.html': 'Abogado de accidentes de Lyft en Marietta | The Awad Law Firm',
  'mission-vision.html': 'Misión y visión | The Awad Law Firm',
  'testimonials.html': 'Testimonios e historias de clientes | The Awad Law Firm',
  'reviews.html': 'Reseñas de clientes | The Awad Law Firm',
  'education.html': 'Recursos sobre lesiones personales en Georgia | The Awad Law Firm',
  'newsletter.html': 'Boletín mensual | The Awad Law Firm',
  'team-experts.html': 'Nuestro equipo | The Awad Law Firm',
  'why-choose-us.html': 'Por qué elegir The Awad Law Firm',
  'core-values.html': 'Nuestros valores fundamentales | The Awad Law Firm',
  'community.html': 'Participación comunitaria | The Awad Law Firm',
  'tedx.html': 'Charla TEDx de Ibrahim Awad | The Awad Law Firm',
  'privacy-policy.html': 'Política de privacidad | The Awad Law Firm',
  'terms-of-service.html': 'Términos de servicio | The Awad Law Firm'
};

const titleOverrides = {
  [`${site}/`]: 'Marietta Personal Injury Lawyer | Awad Law Firm',
  [`${site}/average-car-accident-settlement-georgia/`]: 'Average Car Accident Settlement in Georgia | Awad Law Firm',
  [`${site}/community-ajp/`]: 'AJP 3 Days of Action | Community | Awad Law Firm',
  [`${site}/community-lowball/`]: 'Responding to a Lowball Settlement Offer | Awad Law Firm',
  [`${site}/community-tacos/`]: '5,000 Tacos for Dalton | The Awad Law Firm',
  [`${site}/community-wanted-my-phone/`]: 'Civil Rights & Free Speech Story | Awad Law Firm',
  [`${site}/core-values/`]: 'Our Core Values | The Awad Law Firm',
  [`${site}/edu-guide-claim-worth/`]: 'Georgia Car Accident Claim Value | Awad Law Firm',
  [`${site}/distracted-driver-accident-georgia/`]: 'Distracted Driving Accident Claims in Georgia | Awad Law Firm',
  [`${site}/newsletter/`]: 'Monthly Legal Newsletter | The Awad Law Firm',
  [`${site}/practice-areas/`]: 'Georgia Personal Injury Practice Areas | Awad Law Firm',
  [`${site}/resources/`]: 'Georgia Personal Injury Resources | Awad Law Firm',
  [`${site}/slip-and-fall/`]: 'Marietta Slip and Fall Lawyer | Awad Law Firm',
  [`${site}/video-library/`]: 'Ibrahim Awad TEDx Talk | The Awad Law Firm'
};

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function write(file, content) {
  fs.writeFileSync(path.join(root, file), content, 'utf8');
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function escapeAttr(value) {
  return String(value)
    .replace(/&(?!(?:amp|lt|gt|quot|#39|apos);)/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function upsertMeta(content, attribute, key, value) {
  const tag = `<meta ${attribute}="${key}" content="${escapeAttr(value)}">`;
  const re = new RegExp(`<meta\\s+[^>]*${attribute}=["']${key.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}["'][^>]*>`, 'i');
  return re.test(content) ? content.replace(re, tag) : content.replace('</head>', `  ${tag}\n</head>`);
}

function upsertCanonical(content, url) {
  const tag = `<link rel="canonical" href="${url}">`;
  const re = /<link\s+[^>]*rel=["']canonical["'][^>]*>/i;
  return re.test(content) ? content.replace(re, tag) : content.replace('</head>', `  ${tag}\n</head>`);
}

function upsertTitle(content, title) {
  return content.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
}

function getDescription(content) {
  const match = content.match(/<meta\s+[^>]*name=["']description["'][^>]*content=(["'])(.*?)\1[^>]*>/i)
    || content.match(/<meta\s+[^>]*content=(["'])(.*?)\1[^>]*name=["']description["'][^>]*>/i);
  return match ? match[2].trim() : '';
}

function getCanonical(content) {
  const match = content.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

function shortenDescription(description) {
  if (description.length <= 160) return description;
  const sentences = description.match(/[^.!?]+[.!?]+/g) || [];
  let concise = '';
  for (const sentence of sentences) {
    if ((concise + sentence).trim().length > 160) break;
    concise = `${concise} ${sentence}`.trim();
  }
  if (concise.length >= 90) return concise;
  const clipped = description.slice(0, 157);
  const boundary = clipped.lastIndexOf(' ');
  return `${clipped.slice(0, boundary > 120 ? boundary : 157).trim()}...`;
}

function removeNonstandardAiMarkup(content) {
  content = content.replace(/\s*<meta\s+[^>]*name=["'](?:ai:[^"']+|citation_(?:title|url))["'][^>]*>\s*/gi, '\n');
  content = content.replace(/\s*<meta\s+[^>]*name=["']keywords["'][^>]*>\s*/gi, '\n');
  content = content.replace(/\s*<script[^>]*data-ai-seo=["']webpage["'][^>]*>[\s\S]*?<\/script>\s*/gi, '\n');
  return content;
}

function addAlternates(content, enUrl, esUrl) {
  content = content.replace(/\s*<link\s+[^>]*rel=["']alternate["'][^>]*hreflang=["'][^"']+["'][^>]*>\s*/gi, '\n');
  const tags = [
    `<link rel="alternate" hreflang="en-US" href="${enUrl}">`,
    `<link rel="alternate" hreflang="es-US" href="${esUrl}">`,
    `<link rel="alternate" hreflang="x-default" href="${enUrl}">`
  ].join('\n');
  const canonical = /<link\s+[^>]*rel=["']canonical["'][^>]*>/i;
  return canonical.test(content)
    ? content.replace(canonical, (match) => `${match}\n${tags}`)
    : content.replace('</head>', `  ${tags}\n</head>`);
}

function normalizeSchemaValue(value, language, canonical, pairedCanonical) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeSchemaValue(item, language, canonical, pairedCanonical));
  }
  if (!value || typeof value !== 'object') return value;

  const result = {};
  for (const [key, current] of Object.entries(value)) {
    result[key] = normalizeSchemaValue(current, language, canonical, pairedCanonical);
  }

  if (result['@type'] === 'Preguntas frecuentesPage') result['@type'] = 'FAQPage';
  if (result['@type'] === 'ContactoAction') result['@type'] = 'ContactAction';
  if (Object.prototype.hasOwnProperty.call(result, 'inLanguage')) {
    result.inLanguage = language === 'es' ? 'es-US' : 'en-US';
  }
  if (result['@type'] === 'WebPage' || result['@type'] === 'CollectionPage') {
    result.url = canonical;
    if (result['@id']) result['@id'] = `${canonical}#webpage`;
  }
  if (result['@type'] === 'BreadcrumbList' && Array.isArray(result.itemListElement)) {
    const items = result.itemListElement;
    if (items.length) items[0].item = language === 'es' ? `${site}/es/` : `${site}/`;
    if (items.length > 1) items[items.length - 1].item = canonical;
  }
  if (result['@type'] === 'LegalService') {
    if (result.name) result.name = 'The Awad Law Firm';
    if (result.description) {
      result.description = language === 'es'
        ? 'Bufete de abogados de lesiones personales que atiende a clientes en Marietta, Dalton y todo Georgia.'
        : 'Personal injury law firm serving clients in Marietta, Dalton, and throughout Georgia.';
    }
    if (Array.isArray(result.areaServed)) {
      const seen = new Set();
      result.areaServed = result.areaServed.filter((item) => {
        const label = JSON.stringify(item);
        if (seen.has(label)) return false;
        seen.add(label);
        return true;
      });
    }
    if (Array.isArray(result.serviceArea)) {
      const seen = new Set();
      result.serviceArea = result.serviceArea.filter((item) => {
        const label = JSON.stringify(item);
        if (seen.has(label)) return false;
        seen.add(label);
        return true;
      });
    }
  }

  for (const key of ['url', '@id', 'item']) {
    if (typeof result[key] === 'string' && pairedCanonical && result[key].startsWith(pairedCanonical)) {
      result[key] = canonical + result[key].slice(pairedCanonical.length);
    }
  }
  return result;
}

function normalizeJsonLd(content, language, canonical, pairedCanonical) {
  return content.replace(/<script([^>]*type=["']application\/ld\+json["'][^>]*)>([\s\S]*?)<\/script>/gi, (tag, attrs, json) => {
    try {
      const parsed = JSON.parse(json);
      const normalized = normalizeSchemaValue(parsed, language, canonical, pairedCanonical);
      return `<script${attrs}>\n${JSON.stringify(normalized, null, 2)}\n</script>`;
    } catch {
      return tag;
    }
  });
}

function repairFile(file, options) {
  if (!exists(file)) return false;
  let content = read(file);
  const original = content;
  const { language, canonical, pairedCanonical, enUrl, esUrl, title, description, personName } = options;

  content = removeNonstandardAiMarkup(content);
  content = content.replace(/<html([^>]*?)\slang=["'][^"']*["']([^>]*)>/i, `<html$1 lang="${language === 'es' ? 'es-US' : 'en-US'}"$2>`);
  content = upsertCanonical(content, canonical);
  content = addAlternates(content, enUrl, esUrl);
  content = upsertMeta(content, 'property', 'og:url', canonical);
  content = upsertMeta(content, 'property', 'og:locale', language === 'es' ? 'es_US' : 'en_US');
  content = upsertMeta(content, 'property', 'og:locale:alternate', language === 'es' ? 'en_US' : 'es_US');
  content = upsertMeta(content, 'property', 'og:site_name', 'The Awad Law Firm');

  if (title) {
    content = upsertTitle(content, title);
    content = upsertMeta(content, 'property', 'og:title', title);
    content = upsertMeta(content, 'name', 'twitter:title', title);
  }
  if (description) {
    content = upsertMeta(content, 'name', 'description', description);
    content = upsertMeta(content, 'property', 'og:description', description);
    content = upsertMeta(content, 'name', 'twitter:description', description);
  }
  if (personName && language === 'es') {
    content = content.replace(/(<h1\b[^>]*>)[\s\S]*?(<\/h1>)/i, `$1\n                            ${personName}\n                        $2`);
  }

  content = normalizeJsonLd(content, language, canonical, pairedCanonical);
  if (content !== original) write(file, content);
  return content !== original;
}

const changed = new Set();
for (const [sourceFile, info] of Object.entries(allPages)) {
  const enPath = info.route ? `/${info.route}/` : '/';
  const esPath = `/${String(info.esRoute).replace(/^\/+|\/+$/g, '')}/`;
  const enUrl = `${site}${enPath}`;
  const esUrl = `${site}${esPath}`;
  const enFiles = new Set([sourceFile, info.route ? `${info.route}/index.html` : 'index.html']);
  const esFiles = new Set([info.esFile, `${String(info.esRoute).replace(/^\/+|\/+$/g, '')}/index.html`]);

  let enTitle;
  let enDescription;
  let esTitle = spanishTitles[sourceFile];
  let esDescription;
  let personName;
  if (info.route.startsWith('team-members/')) {
    const slug = info.route.split('/').pop();
    const name = teamNames[slug] || slug.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');
    personName = name;
    enTitle = name.includes('Esq.')
      ? `${name} | Georgia Personal Injury Attorney`
      : `${name} | The Awad Law Firm Team`;
    enDescription = `${name.replace(', Esq.', '')} is a member of The Awad Law Firm team serving personal injury clients across Georgia.`;
    esTitle = `${name} | Equipo de The Awad Law Firm`;
    esDescription = `Conozca a ${name.replace(', Esq.', '')} y su trabajo con el equipo de The Awad Law Firm para ayudar a clientes de lesiones personales en Georgia.`;
  }

  for (const file of enFiles) {
    const didChange = repairFile(file, {
      language: 'en', canonical: enUrl, pairedCanonical: esUrl, enUrl, esUrl,
      title: enTitle, description: enDescription
    });
    if (didChange) changed.add(file);
  }
  for (const file of esFiles) {
    const didChange = repairFile(file, {
      language: 'es', canonical: esUrl, pairedCanonical: enUrl, enUrl, esUrl,
      title: esTitle,
      description: esDescription,
      personName
    });
    if (didChange) changed.add(file);
  }
}

// Remove nonstandard AI/citation tags and translated schema type names from
// remaining English-only pages without changing their canonical targeting.
for (const file of fs.readdirSync(root, { recursive: true })) {
  if (!file.endsWith('.html')) continue;
  const full = path.join(root, file);
  if (!fs.statSync(full).isFile()) continue;
  let content = fs.readFileSync(full, 'utf8');
  const original = content;
  content = removeNonstandardAiMarkup(content)
    .replace(/"@type"\s*:\s*"Preguntas frecuentesPage"/g, '"@type": "FAQPage"')
    .replace(/"@type"\s*:\s*"ContactoAction"/g, '"@type": "ContactAction"');
  const canonical = getCanonical(content);
  const titleOverride = titleOverrides[canonical];
  if (titleOverride) {
    content = upsertTitle(content, titleOverride);
    content = upsertMeta(content, 'property', 'og:title', titleOverride);
    content = upsertMeta(content, 'name', 'twitter:title', titleOverride);
  }
  const description = getDescription(content);
  const conciseDescription = shortenDescription(description);
  if (description && conciseDescription !== description) {
    content = upsertMeta(content, 'name', 'description', conciseDescription);
    content = upsertMeta(content, 'property', 'og:description', conciseDescription);
    content = upsertMeta(content, 'name', 'twitter:description', conciseDescription);
  }
  if (content !== original) {
    fs.writeFileSync(full, content, 'utf8');
    changed.add(path.relative(root, full));
  }
}

// Add reciprocal language alternates to every paired URL in the sitemap.
let sitemap = read('sitemap.xml');
sitemap = sitemap.replace(/<lastmod>[^<]+<\/lastmod>/g, '<lastmod>2026-06-19</lastmod>');
sitemap = sitemap.replace(
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
);
sitemap = sitemap.replace(/\n\s*<xhtml:link[^>]+\/>/g, '');
for (const info of Object.values(allPages)) {
  const enPath = info.route ? `/${info.route}/` : '/';
  const esPath = `/${String(info.esRoute).replace(/^\/+|\/+$/g, '')}/`;
  const enUrl = `${site}${enPath}`;
  const esUrl = `${site}${esPath}`;
  for (const loc of [enUrl, esUrl]) {
    const escaped = loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(<loc>${escaped}<\\/loc>)`);
    const links = [
      `$1`,
      `    <xhtml:link rel="alternate" hreflang="en-US" href="${enUrl}" />`,
      `    <xhtml:link rel="alternate" hreflang="es-US" href="${esUrl}" />`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />`
    ].join('\n');
    sitemap = sitemap.replace(re, links);
  }
}
write('sitemap.xml', sitemap);
changed.add('sitemap.xml');

console.log(`Repaired technical SEO across ${changed.size} files.`);
