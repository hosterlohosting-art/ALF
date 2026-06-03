const fs = require('fs');
const path = require('path');

const root = __dirname;
const routes = {
  'about-the-awad-law-firm-history': 'about.html',
  'team-members': 'team-experts.html',
  'awad-law-firm-4': 'mission-vision.html',
  'car-accident': 'car-accidents.html',
  'truck-accident': 'trucking-accidents.html',
  'motorcycle-accident': 'motorcycle-accidents.html',
  'bicycle-accident': 'bicycle-accidents.html',
  'uber-accident': 'uber-accidents.html',
  'lyft-accident': 'lyft-accidents.html',
  'slip-and-fall': 'slip-and-fall.html',
  'medical-malpractice': 'medical-malpractice.html',
  'wrongful-death': 'wrongful-death.html',
  'personal-injury': 'personal-injury.html',
  'practice-areas': 'practice-areas.html',
  'results': 'results.html',
  'testimonials': 'testimonials.html',
  'reviews': 'reviews.html',
  'video-library': 'tedx.html',
  'resources': 'education.html',
  'core-values': 'core-values.html',
  'community': 'community.html',
  'why-choose-us': 'why-choose-us.html',
  'contact': 'contact.html',
  'search': 'search.html',
  'newsletter': 'newsletter.html',
  'privacy-policy': 'privacy-policy.html',
  'terms-of-service': 'terms-of-service.html',
  'ai-search-overview': 'ai-search-overview.html',
  'average-car-accident-settlement-georgia': 'article-average-settlement.html',
  'distracted-driver-accident-georgia': 'article-distracted-driver.html',
  'community-accident-report': 'community-accident-report.html',
  'community-ajp': 'community-ajp.html',
  'community-anti-bullying': 'community-anti-bullying.html',
  'community-islamic-relief': 'community-islamic-relief.html',
  'community-lowball': 'community-lowball.html',
  'community-tacos': 'community-tacos.html',
  'community-wanted-my-phone': 'community-wanted-my-phone.html',
  'community-window-tint': 'community-window-tint.html',
  'community-yaqeen': 'community-yaqeen.html',
  'edu-guide-car-accident': 'edu-guide-car-accident.html',
  'edu-guide-claim-worth': 'edu-guide-claim-worth.html',
  'edu-guide-comparative-negligence': 'edu-guide-comparative-negligence.html',
  'edu-guide-costly-mistakes': 'edu-guide-costly-mistakes.html',
  'edu-guide-insurance-adjusters': 'edu-guide-insurance-adjusters.html',
  'edu-guide-statute-of-limitations': 'edu-guide-statute-of-limitations.html',
  'team-members/ibrahim-awad': 'ibrahim-awad.html'
};

for (const [route, file] of Object.entries(routes)) {
  const source = path.join(root, file);
  const targetDir = path.join(root, route);
  const target = path.join(targetDir, 'index.html');
  fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(source, target);
  console.log(`${route}/index.html <- ${file}`);
}
