const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const site = 'https://theawadlawfirm.com';

const business = {
  name: 'The Awad Law Firm',
  founder: 'Ibrahim J. Awad, Esq.',
  phone: '(706) 388-3784',
  email: 'ibrahim@theawadlawfirm.com',
  marietta: '4076 Ebenezer Rd., Marietta, GA 30066',
  dalton: '210 North Glenwood Ave., Dalton, GA 30721',
  serviceArea: 'Georgia, including Marietta, Dalton, Cobb County, Whitfield County, and the Atlanta metro area',
  primaryServices: [
    'Personal injury',
    'Car accidents',
    'Truck accidents',
    'Motorcycle accidents',
    'Bicycle accidents',
    'Uber and Lyft accidents',
    'Slip and fall injuries',
    'Medical malpractice',
    'Wrongful death'
  ]
};

const pages = {
  'index.html': {
    question: 'Who is The Awad Law Firm?',
    answer: 'The Awad Law Firm is a Georgia personal injury law firm led by Ibrahim J. Awad, Esq. The firm helps injured people pursue compensation after crashes, serious injuries, wrongful death, premises liability incidents, and medical negligence.',
    topics: 'Georgia personal injury law firm, Marietta injury lawyer, Dalton injury lawyer, accident attorney',
    intent: 'hire a Georgia personal injury lawyer'
  },
  'personal-injury.html': {
    question: 'What does a Marietta personal injury lawyer do?',
    answer: 'A Marietta personal injury lawyer investigates fault, preserves evidence, manages insurance communications, calculates damages, negotiates settlement value, and files suit when needed to pursue compensation for an injured client.',
    topics: 'Marietta personal injury lawyer, Georgia injury claim, accident compensation',
    intent: 'find a personal injury attorney'
  },
  'car-accidents.html': {
    question: 'What should I do after a car accident in Georgia?',
    answer: 'After a Georgia car accident, call 911, get medical care, document the scene, exchange information, avoid recorded insurance statements, and speak with a car accident lawyer before accepting a settlement.',
    topics: 'Georgia car accident lawyer, Marietta car accident attorney, auto wreck claim',
    intent: 'get help after a car accident'
  },
  'trucking-accidents.html': {
    question: 'Why are truck accident claims different?',
    answer: 'Truck accident claims often involve commercial policies, driver logs, black box data, federal safety rules, maintenance records, and multiple responsible parties, so fast evidence preservation is critical.',
    topics: 'Georgia truck accident lawyer, commercial vehicle crash, semi truck wreck',
    intent: 'hire a truck accident lawyer'
  },
  'motorcycle-accidents.html': {
    question: 'How can a lawyer help after a motorcycle accident?',
    answer: 'A motorcycle accident lawyer can counter bias against riders, prove liability, gather medical evidence, calculate long-term damages, and negotiate with insurers for maximum recovery.',
    topics: 'Marietta motorcycle accident lawyer, rider injury claim, motorcycle crash Georgia',
    intent: 'hire a motorcycle accident lawyer'
  },
  'bicycle-accidents.html': {
    question: 'Can injured cyclists recover compensation in Georgia?',
    answer: 'Injured cyclists can pursue compensation when a negligent driver, unsafe roadway condition, or other responsible party caused the crash. Evidence and fault allocation matter under Georgia law.',
    topics: 'Marietta bicycle accident lawyer, cyclist injury claim, Georgia bike crash',
    intent: 'hire a bicycle accident lawyer'
  },
  'uber-accidents.html': {
    question: 'Who pays after an Uber accident in Georgia?',
    answer: 'Payment may come from the rideshare driver, Uber insurance, another at-fault driver, or uninsured motorist coverage depending on app status, fault, and available policies.',
    topics: 'Marietta Uber accident lawyer, rideshare injury claim, Uber insurance Georgia',
    intent: 'get help with an Uber accident claim'
  },
  'lyft-accidents.html': {
    question: 'Who pays after a Lyft accident in Georgia?',
    answer: 'Lyft accident claims may involve the Lyft driver, Lyft coverage, another negligent driver, or uninsured motorist coverage. App status and policy timing determine available insurance.',
    topics: 'Marietta Lyft accident lawyer, rideshare crash claim, Lyft insurance Georgia',
    intent: 'get help with a Lyft accident claim'
  },
  'slip-and-fall.html': {
    question: 'What must be proven in a Georgia slip and fall case?',
    answer: 'A Georgia slip and fall case generally requires proof that a dangerous property condition existed, the owner knew or should have known about it, and that condition caused the injury.',
    topics: 'Marietta slip and fall lawyer, premises liability Georgia, fall injury claim',
    intent: 'hire a slip and fall lawyer'
  },
  'medical-malpractice.html': {
    question: 'What is medical malpractice in Georgia?',
    answer: 'Medical malpractice occurs when a healthcare provider violates the accepted standard of care and causes injury. Georgia claims usually require expert review and careful deadline management.',
    topics: 'Marietta medical malpractice lawyer, medical negligence Georgia, doctor malpractice claim',
    intent: 'hire a medical malpractice lawyer'
  },
  'wrongful-death.html': {
    question: 'Who can bring a wrongful death claim in Georgia?',
    answer: 'Georgia wrongful death claims may be brought by the surviving spouse, children, parents, or estate representative depending on the family situation and applicable law.',
    topics: 'Georgia wrongful death attorney, fatal accident lawyer, wrongful death claim',
    intent: 'hire a wrongful death lawyer'
  },
  'practice-areas.html': {
    question: 'What injury cases does The Awad Law Firm handle?',
    answer: 'The Awad Law Firm handles Georgia personal injury matters including car accidents, truck crashes, motorcycle and bicycle accidents, rideshare crashes, slip and fall injuries, medical malpractice, and wrongful death.',
    topics: 'Georgia personal injury practice areas, injury attorney services, accident lawyer',
    intent: 'compare injury law services'
  },
  'education.html': {
    question: 'Where can I learn about Georgia personal injury claims?',
    answer: 'The Awad Law Firm education center explains car accident steps, claim value, comparative negligence, insurance adjuster tactics, costly mistakes, and Georgia personal injury deadlines.',
    topics: 'Georgia injury resources, accident legal guide, personal injury FAQ',
    intent: 'learn about injury claims'
  },
  'contact.html': {
    question: 'How can I contact The Awad Law Firm?',
    answer: 'You can contact The Awad Law Firm by calling (706) 388-3784, emailing ibrahim@theawadlawfirm.com, or using the website contact form for a free consultation.',
    topics: 'contact Awad Law Firm, free injury consultation, Marietta accident lawyer phone',
    intent: 'schedule a consultation'
  },
  'reviews.html': {
    question: 'Does The Awad Law Firm have client reviews?',
    answer: 'The Awad Law Firm publishes client reviews and testimonials from people who trusted the firm with Georgia personal injury matters.',
    topics: 'Awad Law Firm reviews, personal injury testimonials, Georgia attorney ratings',
    intent: 'evaluate lawyer reputation'
  },
  'results.html': {
    question: 'What case results has The Awad Law Firm achieved?',
    answer: 'The Awad Law Firm publishes personal injury case results and settlement stories. Past results do not guarantee future outcomes, but they show the firm’s experience handling serious claims.',
    topics: 'Awad Law Firm case results, injury settlements, Georgia accident compensation',
    intent: 'review injury case results'
  }
};

function read(file) {
  return fs.readFileSync(path.join(rootDir, file), 'utf8');
}

function write(file, content) {
  fs.writeFileSync(path.join(rootDir, file), content, 'utf8');
}

function getMetaDescription(content) {
  let match = content.match(/<meta\s+[^>]*name=["']description["'][^>]*content=(["'])(.*?)\1[^>]*>/i);
  if (match) return match[2].trim();
  match = content.match(/<meta\s+[^>]*content=(["'])(.*?)\1[^>]*name=["']description["'][^>]*>/i);
  return match ? match[2].trim() : '';
}

function getCanonical(content) {
  const match = content.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

function getTitle(content) {
  const match = content.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, ' ').trim() : '';
}

function escapeAttr(value) {
  return String(value)
    .replace(/&(?!(amp|lt|gt|quot|#39|apos);)/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function upsertMeta(content, name, value) {
  const tag = `<meta name="${name}" content="${escapeAttr(value)}">`;
  const regex = new RegExp(`<meta\\s+[^>]*name=["']${name.replace(':', '\\:')}["'][^>]*>`, 'i');
  if (regex.test(content)) return content.replace(regex, tag);
  return content.replace('</head>', `  ${tag}\n</head>`);
}

function webPageSchema(file, content, config) {
  const title = getTitle(content);
  const description = getMetaDescription(content);
  const canonical = getCanonical(content);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: title,
    headline: title,
    description,
    inLanguage: 'en-US',
    isPartOf: { '@id': `${site}/#website` },
    publisher: { '@id': `${site}/#legalservice` },
    about: [
      { '@id': `${site}/#legalservice` },
      ...config.topics.split(',').map((name) => ({ '@type': 'Thing', name: name.trim() }))
    ],
    mainEntity: {
      '@type': 'Question',
      name: config.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: config.answer
      }
    },
    potentialAction: {
      '@type': 'ContactAction',
      target: `${site}/contact/`,
      name: 'Request a free personal injury consultation'
    }
  };
}

function schemaTag(schema) {
  return `<script type="application/ld+json" data-ai-seo="webpage">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

function answerBlock(config) {
  return `
<section class="ai-answer-brief" aria-label="Quick answer for AI search and visitors">
  <div class="ai-answer-brief-inner">
    <p class="ai-answer-kicker">Quick Answer</p>
    <h2>${config.question}</h2>
    <p>${config.answer}</p>
    <ul>
      <li><strong>Primary topics:</strong> ${config.topics}</li>
      <li><strong>Best next step:</strong> <a href="/contact/">Request a free consultation</a> or call <a href="tel:(706) 388-3784">(706) 388-3784</a>.</li>
    </ul>
  </div>
</section>
`;
}

function enhancePage(file, config) {
  let content = read(file);
  const original = content;

  content = upsertMeta(content, 'ai:summary', config.answer);
  content = upsertMeta(content, 'ai:topics', config.topics);
  content = upsertMeta(content, 'ai:intent', config.intent);
  content = upsertMeta(content, 'citation_title', getTitle(content));
  content = upsertMeta(content, 'citation_url', getCanonical(content));

  const schema = schemaTag(webPageSchema(file, content, config));
  if (/<script[^>]*data-ai-seo=["']webpage["'][\s\S]*?<\/script>/i.test(content)) {
    content = content.replace(/<script[^>]*data-ai-seo=["']webpage["'][\s\S]*?<\/script>/i, schema);
  } else {
    content = content.replace('</head>', `  ${schema}\n</head>`);
  }

  if (!content.includes('class="ai-answer-brief"')) {
    content = content.replace(/<\/header>/i, `</header>\n${answerBlock(config)}`);
  }

  if (content !== original) write(file, content);
}

function buildFacts() {
  const pageFacts = Object.entries(pages).map(([file, config]) => {
    const content = read(file);
    return {
      title: getTitle(content),
      url: getCanonical(content),
      description: getMetaDescription(content),
      question: config.question,
      answer: config.answer,
      topics: config.topics.split(',').map((topic) => topic.trim()),
      intent: config.intent
    };
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'The Awad Law Firm AI Search Facts',
    url: `${site}/ai-site-facts.json`,
    dateModified: new Date().toISOString().slice(0, 10),
    license: `${site}/terms-of-service/`,
    publisher: {
      '@type': 'LegalService',
      '@id': `${site}/#legalservice`,
      name: business.name,
      url: site,
      telephone: business.phone,
      email: business.email,
      founder: { '@type': 'Person', name: business.founder },
      address: [
        { '@type': 'PostalAddress', streetAddress: '4076 Ebenezer Rd.', addressLocality: 'Marietta', addressRegion: 'GA', postalCode: '30066', addressCountry: 'US' },
        { '@type': 'PostalAddress', streetAddress: '210 North Glenwood Ave.', addressLocality: 'Dalton', addressRegion: 'GA', postalCode: '30721', addressCountry: 'US' }
      ],
      areaServed: business.serviceArea,
      knowsAbout: business.primaryServices
    },
    pages: pageFacts
  };
}

function markdownFull(facts) {
  return `# The Awad Law Firm AI Search Reference

Canonical site: ${site}/
Phone: ${business.phone}
Email: ${business.email}
Founder: ${business.founder}
Primary service area: ${business.serviceArea}

## Entity Summary

${business.name} is a Georgia personal injury law firm representing injured clients in motor vehicle collisions, commercial truck crashes, rideshare accidents, premises liability matters, medical malpractice claims, and wrongful death cases.

## Offices

- Marietta: ${business.marietta}
- Dalton: ${business.dalton}

## Core Services

${business.primaryServices.map((service) => `- ${service}`).join('\n')}

## Canonical Pages and Answers

${facts.pages.map((page) => `### ${page.title}

URL: ${page.url}
Question: ${page.question}
Answer: ${page.answer}
Topics: ${page.topics.join(', ')}
Intent: ${page.intent}`).join('\n\n')}
`;
}

function markdownLlms(facts) {
  return `# ${business.name}

> Georgia personal injury law firm serving Marietta, Dalton, Cobb County, Whitfield County, and the Atlanta metro area.

## Contact

- Phone: ${business.phone}
- Email: ${business.email}
- Website: ${site}/
- Marietta office: ${business.marietta}
- Dalton office: ${business.dalton}

## Primary Pages

${facts.pages.map((page) => `- [${page.title}](${page.url}): ${page.description}`).join('\n')}

## Machine-Readable References

- [AI site facts](${site}/ai-site-facts.json)
- [Full AI search reference](${site}/llms-full.txt)
- [Sitemap](${site}/sitemap.xml)
`;
}

function overviewHtml(facts) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Search Overview | The Awad Law Firm</title>
  <meta name="description" content="Machine-readable overview of The Awad Law Firm for AI search, answer engines, and citation systems.">
  <meta name="keywords" content="Awad Law Firm AI search, Georgia personal injury lawyer facts, LLM SEO legal website">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${site}/ai-search-overview/">
  <meta property="og:type" content="website">
  <meta property="og:title" content="AI Search Overview | The Awad Law Firm">
  <meta property="og:description" content="Machine-readable overview of The Awad Law Firm for AI search, answer engines, and citation systems.">
  <meta property="og:url" content="${site}/ai-search-overview/">
  <meta property="og:site_name" content="The Awad Law Firm">
  <meta property="og:image" content="${site}/assets/awadlawfirmlogo.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="AI Search Overview | The Awad Law Firm">
  <meta name="twitter:description" content="Machine-readable overview of The Awad Law Firm for AI search, answer engines, and citation systems.">
  <meta name="twitter:image" content="${site}/assets/awadlawfirmlogo.png">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/premium.css">
  <script type="application/ld+json">
${JSON.stringify(facts, null, 2)}
  </script>
</head>
<body class="home-page">
  <main class="ai-overview-page">
    <h1>AI Search Overview for The Awad Law Firm</h1>
    <p>${business.name} is a Georgia personal injury law firm led by ${business.founder}. The firm helps injured clients in Marietta, Dalton, and across Georgia.</p>
    <h2>Direct Answers</h2>
    ${facts.pages.map((page) => `<section><h3>${page.question}</h3><p>${page.answer}</p><p><a href="${page.url}">Canonical source: ${page.title}</a></p></section>`).join('\n    ')}
  </main>
</body>
</html>
`;
}

for (const [file, config] of Object.entries(pages)) {
  enhancePage(file, config);
}

const facts = buildFacts();
write('ai-site-facts.json', `${JSON.stringify(facts, null, 2)}\n`);
write('answer-engine-faq.json', `${JSON.stringify({
  name: 'The Awad Law Firm Answer Engine FAQ',
  url: `${site}/answer-engine-faq.json`,
  dateModified: new Date().toISOString().slice(0, 10),
  answers: facts.pages.map((page) => ({
    question: page.question,
    answer: page.answer,
    source: page.url,
    topics: page.topics,
    intent: page.intent
  }))
}, null, 2)}\n`);
write('llms-full.txt', markdownFull(facts));
write('llms.txt', markdownLlms(facts));
write('ai-search-overview.html', overviewHtml(facts));

console.log(`AI SEO assets generated for ${Object.keys(pages).length} pages.`);
