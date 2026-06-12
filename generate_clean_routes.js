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
  'team-members/ibrahim-awad': 'ibrahim-awad.html',
  'team-members/basher-hassan': 'team-basher-hassan.html',
  'team-members/david-price': 'team-david-price.html',
  'team-members/azima-mohamed': 'team-azima-mohamed.html',
  'team-members/ahmad-choudhary': 'team-ahmad-choudhary.html',
  'team-members/gay-hartley': 'team-gay-hartley.html',
  'team-members/marion-day': 'team-marion-day.html',
  'team-members/shantrell-ball': 'team-shantrell-ball.html',
  'team-members/leland-bridges': 'team-leland-bridges.html',
  'team-members/sandra-guzman': 'team-sandra-guzman.html',
  'team-members/devin-spiegelhalter': 'team-devin-spiegelhalter.html',
  'team-members/sabrina-portuondo': 'team-sabrina-portuondo.html',
  'team-members/jocelyn-suarez': 'team-jocelyn-suarez.html',
  'team-members/deanna-marquez': 'team-deanna-marquez.html',
  'team-members/timothy-melson': 'team-timothy-melson.html',
  'team-members/adriana-melgarejo': 'team-adriana-melgarejo.html',
  'team-members/christina-dixon': 'team-christina-dixon.html',
  'team-members/carley-richards': 'team-carley-richards.html',
  'team-members/genesis-resendiz': 'team-genesis-resendiz.html',
  'team-members/isabel-welch': 'team-isabel-welch.html',
  'team-members/betty-mendez': 'team-betty-mendez.html',
  'team-members/sierra-jones': 'team-sierra-jones.html',
  'team-members/elizabeth-chavarria': 'team-elizabeth-chavarria.html',
  'team-members/stephanie-rivera': 'team-stephanie-rivera.html',
  'team-members/mohamed': 'team-mohamed.html',
  'team-members/selvin-navarro': 'team-selvin-navarro.html',
  'team-members/mehar-hassan': 'team-mehar-hassan.html',
  'team-members/john-jabes-salva': 'team-john-jabes-salva.html',
  'team-members/tasha-hijara': 'team-tasha-hijara.html',
  'team-members/ella-batilona': 'team-ella-batilona.html',
  'team-members/edgard-manzanares': 'team-edgard-manzanares.html',
  'team-members/alvaro-vanegas': 'team-alvaro-vanegas.html',
  
  // Spanish Clean Routes
  'es/sobre-nosotros': 'es/about.html',
  'es/areas-de-practica': 'es/practice-areas.html',
  'es/resultados': 'es/results.html',
  'es/contacto': 'es/contact.html',
  'es/accidente-de-auto': 'es/car-accidents.html',
  'es/accidente-de-camion': 'es/trucking-accidents.html',
  'es/resbalon-y-caida': 'es/slip-and-fall.html',
  'es/muerte-injusta': 'es/wrongful-death.html',
  'es/negligencia-medica': 'es/medical-malpractice.html',
  'es/lesiones-personales': 'es/personal-injury.html',
  'es/accidente-de-motocicleta': 'es/motorcycle-accidents.html',
  'es/accidente-de-bicicleta': 'es/bicycle-accidents.html',
  'es/accidente-de-uber': 'es/uber-accidents.html',
  'es/accidente-de-lyft': 'es/lyft-accidents.html'
};

for (const [route, file] of Object.entries(routes)) {
  const source = path.join(root, file);
  if (!fs.existsSync(source)) {
    console.log(`Skipping: ${file} (source file does not exist yet)`);
    continue;
  }
  const targetDir = path.join(root, route);
  const target = path.join(targetDir, 'index.html');
  fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(source, target);
  console.log(`${route}/index.html <- ${file}`);
}
