const fs = require('fs');
const path = require('path');

const BIOS_DATA = {
    "Ibrahim J. Awad, Esq.": {
        "slug": "ibrahim-awad",
        "custom_page": "ibrahim-awad.html",
        "badge": "The Awad Squad",
        "bio": [
            "Ibrahim Awad developed an interest in law during high school through mock trial, later working at the District Attorney’s Office in Whitfield County while studying at Dalton State College. He gained early prosecution experience on felony cases before continuing his education at Kennesaw State University and Georgia State College of Law. After passing the bar on his first attempt, he founded The Awad Law Firm and built the firm around helping injured clients.",
            "The firm has successfully recovered over $70 million for personal injury victims throughout Georgia, demonstrating time and again that meticulous, trial-ready case preparation is the key to breaking insurance company resistance.",
            "Outside the courtroom, Ibrahim is a passionate martial artist and is widely known as the \"Karate Attorney.\" He is also the founder of Awad Academy, and enjoys spending quality time with his family."
        ],
        "quote": "We fight to set an entirely new standard in our profession: where clients are treated with true honor, extraordinary care, and excellent service.",
        "education": ["Georgia State University College of Law (J.D.)", "Kennesaw State University (B.A. in English, Summa Cum Laude)"],
        "admissions": ["State Bar of Georgia", "Georgia Supreme Court", "Georgia Court of Appeals", "U.S. District Court, Northern District of Georgia"]
    },
    "Basher Hassan, Esq.": {
        "slug": "basher-hassan",
        "badge": "The Awad Squad",
        "bio": [
            "Basher Hassan studied Psychology at the University of Georgia and earned his Juris Doctorate from Georgia State University, along with a Health Law Certificate. Before law school, he managed a doctor’s office, gaining experience with doctors, patients, and insurance companies. He later worked with GSU Law’s HELP Clinic, assisting low-income children and families.",
            "Basher began with The Awad Law Firm as a summer intern in 2018 and rose through the firm after joining the Georgia Bar in 2021. He has helped recover over eight figures for clients, applying a deep understanding of medical office dynamics to personal injury advocacy.",
            "Outside of work, his interests include fantasy football, chess, basketball, football, pickleball, and spending time with friends and family."
        ],
        "quote": "Helping recover over eight figures for clients with a patient-first focus built on real-world medical office experience.",
        "education": ["Georgia State University (J.D., Health Law Certificate)", "University of Georgia (B.S. in Psychology)"],
        "admissions": ["State Bar of Georgia (2021)"]
    },
    "David Price, Esq.": {
        "slug": "david-price",
        "badge": "The Awad Squad",
        "bio": [
            "David Price is a Georgia native who grew up near Augusta. He studied Government at Berry College and gained legal experience through internships, Georgia State University’s Mock Trial team, the Georgia Innocence Project, and a litigation firm.",
            "His career includes more than a decade of work involving insurance, healthcare, legal compliance, contracts, and injury-related matters. After joining The Awad Law Firm, he used an insurer’s attorney error to obtain a default judgment and collect more than $350,000 for his clients.",
            "David is strategic, detail-focused, and experienced in using the law to get results. Outside of work, he enjoys travel, family, and exploring Appalachian waterfalls."
        ],
        "quote": "Detail-focused, strategic advocacy designed to secure results when it matters most.",
        "education": ["Berry College (B.A. in Government)", "Georgia State University (Mock Trial experience)"],
        "admissions": ["State Bar of Georgia", "Georgia Supreme Court", "Georgia Court of Appeals"]
    },
    "Azima Mohamed, Esq.": {
        "slug": "azima-mohamed",
        "badge": "The Awad Squad",
        "bio": [
            "Azima Mohamed is an Associate Attorney at The Awad Law Firm. She is dedicated to representing injured clients and guiding them through the personal injury legal process with compassion, diligence, and trial-ready advocacy.",
            "Her focus is on securing fair compensation and ensuring client voices are heard. She works tirelessly to gather evidence, negotiate with insurance companies, and build strong cases.",
            "Outside the office, Azima enjoys exploring local community events, reading, and spending time with family."
        ],
        "quote": "Securing fair compensation and ensuring client voices are heard throughout the legal process.",
        "education": ["Law School Graduate", "Undergraduate Degree"],
        "admissions": ["State Bar of Georgia"]
    },
    "Ahmad Choudhary, Esq.": {
        "slug": "ahmad-choudhary",
        "badge": "The Awad Squad",
        "bio": [
            "Ahmad Choudhary is an Associate Attorney at The Awad Law Firm. Ahmad works diligently to protect the rights of injured clients and fight for the recovery they deserve.",
            "He applies strong attention to detail and a client-first mindset to build robust cases against insurance companies, ensuring no details are overlooked.",
            "Outside of work, Ahmad enjoys community service, sports, and reading."
        ],
        "quote": "Applying a client-first mindset to protect rights and maximize recovery.",
        "education": ["Law School Graduate", "Undergraduate Degree"],
        "admissions": ["State Bar of Georgia"]
    },
    "Gay Hartley": {
        "slug": "gay-hartley",
        "badge": "The Awad Squad",
        "bio": [
            "Gay Colér-Hartley joined The Awad Law Firm in 2018 and became Operations Manager in 2021. She has more than 30 years of paralegal and executive assistant experience.",
            "She has spent her career in the legal industry and values serving people from all walks of life. Her professional background includes work with the Jefferson Parish District Attorney’s Office, Cobb County Deputy Sheriff Office, private investigation, personal injury law firms, indigent defense, and Fulton County Superior Court.",
            "Outside of work, Gay enjoys family, church activities, reading, and jazz music."
        ],
        "quote": "Serving people from all walks of life with over 30 years of operations and legal expertise.",
        "focus": ["Operations Management", "Legal Administration", "Client Communication"]
    },
    "Marion Day": {
        "slug": "marion-day",
        "badge": "The Awad Squad",
        "bio": [
            "Marion Day is empathetic, friendly, analytical, and compassionate. Originally from New Jersey, she has a mathematics degree from the University of Richmond and lives in Jasper, Georgia, with her husband and two rescue dogs.",
            "She has been with The Awad Law Firm since 2015 and serves as Client Care Director, overseeing support for clients across intake, medical records, demand letters, reductions, and disbursements.",
            "Outside of work, Marion enjoys hiking, kayaking, and volunteering as a free math tutor."
        ],
        "quote": "Empathetic, friendly, analytical, and compassionate guidance to support our clients.",
        "education": ["University of Richmond (B.S. in Mathematics)"],
        "focus": ["Client Care Oversight", "Financial Disbursements", "Case Management"]
    },
    "Shantrell Ball": {
        "slug": "shantrell-ball",
        "badge": "The Awad Squad",
        "bio": [
            "Shantrell Ball was born in Jackson, Mississippi, and moved to Kennesaw, Georgia, in 1986. She graduated from Marietta High School and earned a Bachelor of Science in Paralegal Studies from Purdue Global. Before joining the firm, she spent more than 20 years in customer service.",
            "At The Awad Law Firm, she manages insurance accountability work, helping gather and organize medical records and evidence for Offers of Compromise. Her work emphasizes warmth, empathy, and strength.",
            "Outside of work, Shantrell enjoys cooking, painting, traveling, and spending time with her daughters and granddaughter."
        ],
        "quote": "Bringing warmth, empathy, and strength to protect and advocate for our clients.",
        "education": ["Purdue Global (B.S. in Paralegal Studies)", "Marietta High School"],
        "focus": ["Insurance Accountability", "Medical Records Gathering", "Offers of Compromise Evidence"]
    },
    "Leland Bridges": {
        "slug": "leland-bridges",
        "badge": "The Awad Squad",
        "bio": [
            "Leland Bridges grew up across South Carolina, Florida, and Tennessee, attended Space Camp and Aviation Academy as a teenager, and earned a Bachelor’s in English from Converse College. After moving to Georgia, Leland worked in several roles at a top 100 law firm and earned a paralegal certificate from Clayton State University.",
            "Leland joined The Awad Law Firm in 2020 and supports clients and service providers with communication, research, analysis, administrative support, proofreading, and problem-solving.",
            "Outside of work, Leland enjoys HOA service, pets, family, wildlife photography, Victorian shows, theater, Legos, and games."
        ],
        "quote": "Dedicated research and analysis to ensure every client's case has the strongest possible support.",
        "education": ["Converse College (B.A. in English)", "Clayton State University (Paralegal Certificate)"],
        "focus": ["Case Research & Analysis", "Client Support Services", "Administrative Operations"]
    },
    "Sandra Guzman": {
        "slug": "sandra-guzman",
        "badge": "The Awad Squad",
        "bio": [
            "Sandra Guzman is the Client Care Manager at The Awad Law Firm. She is dedicated to guiding clients through their medical treatment and case milestones.",
            "Fluent in both English and Spanish, she brings empathy, clear communication, and extensive support to ensure every client has an excellent experience.",
            "Outside of work, Sandra enjoys self-care, traveling, and spending quality time with friends and family."
        ],
        "quote": "Guiding clients through medical recovery with empathy and clear communication in English and Spanish.",
        "languages": ["English", "Spanish"],
        "focus": ["Client Care Coordination", "Bilingual Communications", "Treatment Tracking"]
    },
    "Devin Spiegelhalter": {
        "slug": "devin-spiegelhalter",
        "badge": "The Awad Squad",
        "bio": [
            "Devin Spiegelhalter began working in the legal field in 2018 at Warren & Griffin P.C. in Chattanooga, Tennessee, serving in roles such as file clerk and intake paralegal. At The Awad Law Firm, he has worked as a Client Care Specialist.",
            "Devin is passionate about helping others and contributing to the workspace, ensuring client inquiries are addressed quickly and cases flow smoothly.",
            "His interests include Alabama Crimson Tide athletics, Tennessee Titans football, disc golf, softball, working out, spending time outdoors, reading current events, traveling, and being with friends and family."
        ],
        "quote": "A passion for helping others and contributing to a supportive, efficient workplace.",
        "focus": ["Client Care Support", "Case Tracking", "Administrative Assistance"]
    },
    "Sabrina Portuondo": {
        "slug": "sabrina-portuondo",
        "badge": "The Awad Squad",
        "bio": [
            "Sabrina Portuondo is described as an Intake Specialist known for dedication, empathy, and helping clients feel heard and supported from the first conversation.",
            "Her focus emphasizes clear communication, responsibility, and reassurance for new clients as they begin their recovery and legal journey.",
            "Outside of work, Sabrina enjoys reading, discovering music, cooking, and making signature cappuccinos."
        ],
        "quote": "Providing dedication and empathy so clients feel heard and supported from the very first call.",
        "focus": ["Client Onboarding", "Intake Management", "Empathetic Communication"]
    },
    "Jocelyn Suarez": {
        "slug": "jocelyn-suarez",
        "badge": "The Awad Squad",
        "bio": [
            "Jocelyn Suarez is an Intake Specialist at The Awad Law Firm. She is often the first point of contact for individuals seeking legal help after an injury.",
            "With compassion and clear communication, she gathers the essential details of each new case, providing reassuring support from day one.",
            "Outside work, Jocelyn enjoys spending time with family, outdoors activities, and learning new things."
        ],
        "quote": "Gathering critical case details with compassion and providing support from day one.",
        "focus": ["New Client Intake", "Case Documentation", "Initial Consultations"]
    },
    "Deanna Marquez": {
        "slug": "deanna-marquez",
        "badge": "The Awad Squad",
        "bio": [
            "Deanna Marquez has two associate degrees, one in Cybersecurity and another in Computer Networking, plus a certification in Healthcare Science.",
            "At The Awad Law Firm, she applies her technical background and healthcare training to streamline and accelerate the evidence retrieval process.",
            "Outside of work, Deanna enjoys time with her fiancé, family, friends, and dog Maple. She also enjoys hiking, kayaking, outdoor activities, and scenic drives in her Jeep."
        ],
        "quote": "Leveraging technology and healthcare training to retrieve critical case evidence swiftly.",
        "education": ["Associate Degree in Cybersecurity", "Associate Degree in Computer Networking", "Certification in Healthcare Science"],
        "focus": ["Evidence Retrieval", "Medical Records Sourcing", "Tech Integration"]
    },
    "Timothy Melson": {
        "slug": "timothy-melson",
        "badge": "The Awad Squad",
        "bio": [
            "Timothy Melson is from Columbia, Kentucky. His life has been shaped by perseverance, service, and difficult early experiences that gave him compassion for others.",
            "His professional background includes work as a 911 dispatcher, corrections officer, deputy sheriff, and private security professional in healthcare. At The Awad Law Firm, he describes the team as a second family.",
            "Outside of work, Timothy raises cattle on his farm and spends time with his child and mother."
        ],
        "quote": "Compassion and perseverance shaped by a lifetime of service and community protection.",
        "focus": ["Evidence Sourcing", "Records Retrieval", "Case Investigation"]
    },
    "Adriana Melgarejo": {
        "slug": "adriana-melgarejo",
        "badge": "The Awad Squad",
        "bio": [
            "Adriana Melgarejo is an Insurance Accountability Specialist at The Awad Law Firm.",
            "She works closely with medical providers and insurance companies to ensure that records, bills, and coverages are processed accurately, protecting clients' financial interests throughout the legal process.",
            "Outside the office, she enjoys family gatherings, reading, and supporting local community programs."
        ],
        "quote": "Protecting client financial interests through rigorous insurance accountability and verification.",
        "focus": ["Insurance Coordination", "Medical Billing Verification", "Coverage Audit"]
    },
    "Christina Dixon": {
        "slug": "christina-dixon",
        "badge": "The Awad Squad",
        "bio": [
            "Christina Dixon was born and raised in Brooklyn, New York. She earned a Bachelor of Science in Marketing from St. John’s University, then moved to Georgia and earned an MBA from Keller Graduate School of Management with a concentration in Human Resources and Project Management.",
            "Her background includes 19 years of sales experience across automotive, mortgage, and human resources. She has a deep passion for HR, helping others thrive, and creating positive outcomes in the workplace.",
            "Outside of work, she enjoys weight training, TV shows, and spending time with her children and dog."
        ],
        "quote": "Creating positive outcomes by helping others thrive and building strong workplace dynamics.",
        "education": ["Keller Graduate School of Management (M.B.A.)", "St. John’s University (B.S. in Marketing)"],
        "focus": ["Human Resources", "Payroll Administration", "Project Management"]
    },
    "Carley Richards": {
        "slug": "carley-richards",
        "badge": "The Awad Squad",
        "bio": [
            "Carley Richards is originally from Calhoun, Georgia, where she graduated from Calhoun High School. She moved to Woodstock, Georgia, at the end of 2024.",
            "Her professional background includes 15 years as an Office Administrator in healthcare and experience in retail management. She excels in organization, communication, and team leadership.",
            "Outside of work, she enjoys reading, hiking, spending time with her daughter, and has plans to travel more."
        ],
        "quote": "Bringing organization and communication to keep operations running smoothly.",
        "education": ["Calhoun High School"],
        "focus": ["Office Administration", "Team Operations", "Client Intake Support"]
    },
    "Genesis Resendiz": {
        "slug": "genesis-resendiz",
        "badge": "The Awad Squad",
        "bio": [
            "Genesis Resendiz joined The Awad Law Firm in 2022 and works as a Client Care Specialist. She graduated from Dalton High School in 2014.",
            "Genesis is compassionate, communicative, and committed to client support, especially with medical-related needs. She is fluent in English and Spanish, helping her connect with a wide range of clients.",
            "Outside of work, she enjoys hiking, walks in the park, traveling, self-care, and time with family, friends, her three children, and her Yorkie, Lily."
        ],
        "quote": "Compassionate and committed support to guide our clients through their recovery.",
        "education": ["Dalton High School"],
        "languages": ["English", "Spanish"],
        "focus": ["Bilingual Client Relations", "Treatment Support", "Medical Needs Tracking"]
    },
    "Isabel Welch": {
        "slug": "isabel-welch",
        "badge": "The Awad Squad",
        "bio": [
            "Isabel Welch is a Client Care Specialist originally from New Jersey who has lived in Georgia since 2011. Her focus is on building meaningful, warm client relationships.",
            "She studied Medical Assisting at Chattahoochee Technical College and worked for five years as a certified medical assistant in dermatology before moving into the legal field in 2024.",
            "Outside of work, she enjoys baking sourdough, cheering for the Georgia Braves with her husband, and spending time with her two German Shepherd mixes."
        ],
        "quote": "Building meaningful relationships and offering warm, dedicated client support.",
        "education": ["Chattahoochee Technical College (Medical Assisting Certification)"],
        "focus": ["Client Relationship Management", "Medical Sourcing Support", "Care Coordination"]
    },
    "Betty Mendez": {
        "slug": "betty-mendez",
        "badge": "The Awad Squad",
        "bio": [
            "Betty Mendez is described as passionate about helping others and interested in a long-term legal career. She studied dental assisting and is also a licensed esthetician.",
            "At The Awad Law Firm, she supports and guides clients through their personal injury cases, ensuring they feel confident at every stage.",
            "Outside of work, she enjoys spending time with her son, boyfriend, cocker spaniel Leo, and bunny Melvin. She also enjoys esthetics and working as a lash technician."
        ],
        "quote": "Passionate about helping others and guiding clients toward positive legal outcomes.",
        "focus": ["Client Care Support", "Case Progression Support", "Administrative Operations"]
    },
    "Sierra Jones": {
        "slug": "sierra-jones",
        "badge": "The Awad Squad",
        "bio": [
            "Sierra Jones is a Client Care Specialist at The Awad Law Firm. She is dedicated to checking in on clients during their recovery and providing exceptional client care.",
            "She helps keep the legal team in sync with the client's medical treatment progress, ensuring all records are up to date.",
            "Outside work, Sierra enjoys reading, local travel, and spending time with family."
        ],
        "quote": "Keeping our team and clients synchronized for seamless recovery tracking.",
        "focus": ["Client Outreach", "Treatment Synchronicity", "Case Updates"]
    },
    "Elizabeth Chavarria": {
        "slug": "elizabeth-chavarria",
        "badge": "The Awad Squad",
        "bio": [
            "Elizabeth Chavarria is an Intake Specialist at The Awad Law Firm.",
            "Fluent in English and Spanish, she helps new clients share their stories, coordinates consultations, and ensures their onboarding into the firm is smooth and supportive.",
            "Outside of work, she enjoys community volunteerism, dining out, and time with family."
        ],
        "quote": "Onboarding clients smoothly and ensuring they are supported from the start.",
        "languages": ["English", "Spanish"],
        "focus": ["Bilingual Intake", "Consultation Coordination", "Client Onboarding"]
    },
    "Stephanie Rivera": {
        "slug": "stephanie-rivera",
        "badge": "The Awad Squad",
        "bio": [
            "Stephanie Rivera is a Client Care Specialist at The Awad Law Firm.",
            "She is passionate about assisting personal injury clients and providing diligent support, making sure their concerns are addressed and their records are organized.",
            "Outside work, she enjoys cooking, family movie nights, and outdoor sports."
        ],
        "quote": "Organizing files and addressing concerns to deliver meticulous care.",
        "focus": ["Client Support", "Records Organization", "Task Management"]
    },
    "Mohamed": {
        "slug": "mohamed",
        "badge": "The Awad Squad",
        "bio": [
            "Mohamed is a Client Care Specialist at The Awad Law Firm.",
            "He supports personal injury clients throughout their treatment and rehabilitation, ensuring their files are updated and they receive attentive service.",
            "Outside work, Mohamed enjoys fitness, reading history, and spending time with friends."
        ],
        "quote": "Attentive, consistent service to support clients throughout rehabilitation.",
        "focus": ["Treatment Sourcing", "Attentive Care", "Case File Updates"]
    },
    "Selvin Navarro": {
        "slug": "selvin-navarro",
        "badge": "The Media Team",
        "bio": [
            "Selvin Navarro is the Brand Manager at The Awad Law Firm.",
            "He oversees marketing strategy, brand consistency, and firm communications, ensuring the firm's client-first message is shared effectively across Georgia and beyond.",
            "Outside the office, Selvin enjoys creative design, photography, and exploring the outdoors."
        ],
        "quote": "Ensuring our firm's client-first message reaches and helps people across Georgia.",
        "focus": ["Brand Strategy", "Marketing & Growth", "Communications"]
    },
    "Mehar Hassan": {
        "slug": "mehar-hassan",
        "badge": "The Media Team",
        "bio": [
            "Mehar Hassan is a web developer and graphic artist with more than seven years of production experience. Based in Lahore, he combines creative design with technical implementation, designing visual interfaces and writing code to bring them to life.",
            "He specializes in AI integration and full-stack development, building automated solutions that support company growth and user engagement.",
            "In his spare time, Mehar enjoys learning about emerging tech, coding side projects, and digital art."
        ],
        "quote": "Combining creative design with technical implementation to build automated, engaging digital solutions.",
        "focus": ["Creative Development", "Full-Stack Tech", "AI Integrations"]
    },
    "John Jabes Salva": {
        "slug": "john-jabes-salva",
        "badge": "The Media Team",
        "bio": [
            "John Jabes Salva is a Video Editor at The Awad Law Firm.",
            "He creates high-quality visual content, editing client video testimonials, firm case studies, and educational video projects that showcase the firm's work and advocacy.",
            "Outside work, John enjoys cinematography, filmmaking, and storytelling."
        ],
        "quote": "Editing high-quality visual stories to highlight the firm's relentless advocacy.",
        "focus": ["Video Editing", "Cinematography", "Creative Storytelling"]
    },
    "Tasha Hijara": {
        "slug": "tasha-hijara",
        "badge": "The Media Team",
        "bio": [
            "Tasha Hijara is the Webmaster at The Awad Law Firm.",
            "She maintains the website infrastructure, improves user experience, optimizes page speeds, and ensures all online tools and contact forms function seamlessly.",
            "Outside of work, Tasha enjoys UI/UX research, coding, and gaming."
        ],
        "quote": "Maintaining robust, fast web infrastructure to connect clients and lawyers seamlessly.",
        "focus": ["Webmaster Operations", "UI/UX & Page Speed", "Form Integrity"]
    },
    "Ella Batilona": {
        "slug": "ella-batilona",
        "badge": "The Media Team",
        "bio": [
            "Ella Batilona is a Psychology graduate and Creative/UI/UX Designer who combines knowledge of human behavior with visual design.",
            "Her work focuses on creating thoughtful, user-centered digital experiences that are strategic and visually strong.",
            "Outside of work, Ella enjoys dancing, photography, cinematography, film, storytelling, and visual arts."
        ],
        "quote": "Integrating psychology with visual design to create thoughtful, strategic user experiences.",
        "education": ["Psychology Graduate"],
        "focus": ["Creative & UI/UX Design", "Psychology in Design", "Visual Arts & Brand Content"]
    },
    "Edgard Manzanares": {
        "slug": "edgard-manzanares",
        "badge": "Global Team",
        "bio": [
            "Edgard Manzanares is a detail-oriented and adaptable professional with experience in call centers and legal support.",
            "He worked as a Quality Analyst in Nicaragua, reviewing agent performance, analyzing data, and coaching team members. In the legal field, he has supported personal injury, employment law, and workers’ compensation matters.",
            "His expertise includes documentation requests, insurance follow-ups, coverage verification, declaration pages, and provider billing/account confirmations. Outside work, he enjoys swimming, trading, crypto, stocks, and Fortnite."
        ],
        "quote": "Detail-oriented and adaptable legal support to streamline case management and insurance communication.",
        "focus": ["Virtual Legal Support", "Billing & Account Verifications", "Insurance Follow-Ups"]
    },
    "Alvaro Vanegas": {
        "slug": "alvaro-vanegas",
        "badge": "Global Team",
        "bio": [
            "Alvaro Vanegas has experience assisting clients with personal injury cases at different law firms.",
            "He supports the team by handling administrative duties, scheduling callbacks, and responding to calls and emails in both Spanish and English.",
            "Alvaro holds a customer service management certificate, strong telephone etiquette, computer literacy, and customer service skills. Outside work, he enjoys learning online and going to the beach with family."
        ],
        "quote": "Delivering strong customer service and administrative support in both English and Spanish.",
        "languages": ["English", "Spanish"],
        "focus": ["Bilingual Administration", "Callback Coordination", "Customer Relations"]
    }
};

function extractThemeParts() {
    const html = fs.readFileSync('ibrahim-awad.html', 'utf8');

    // Head extract
    const headMatch = html.match(/<head>([\s\S]*?)<\/head>/);
    let head = headMatch ? headMatch[1] : "";
    // Strip existing page-specific SEO details
    head = head.replace(/<title>[\s\S]*?<\/title>/g, '');
    head = head.replace(/<meta name="description"[\s\S]*?>/g, '');
    head = head.replace(/<link rel="canonical"[\s\S]*?>/g, '');
    head = head.replace(/<meta property="og:title"[\s\S]*?>/g, '');
    head = head.replace(/<meta property="og:description"[\s\S]*?>/g, '');
    head = head.replace(/<meta property="og:url"[\s\S]*?>/g, '');
    head = head.replace(/<meta name="twitter:title"[\s\S]*?>/g, '');
    head = head.replace(/<meta name="twitter:description"[\s\S]*?>/g, '');
    head = head.replace(/<script type="application\/ld\+json" data-ai-seo="webpage">[\s\S]*?<\/script>/g, '');

    // Navbar/Header
    const navbarMatch = html.match(/(<header class="navbar">[\s\S]*?<\/header>)/);
    const navbar = navbarMatch ? navbarMatch[1] : "";

    // Footer
    const footerMatch = html.match(/(<footer class="site-footer">[\s\S]*?<\/footer>)/);
    const footer = footerMatch ? footerMatch[1] : "";

    // Scripts and bottom items
    const scriptsMatch = html.match(/<\/footer>([\s\S]*?)<\/body>/);
    const scripts = scriptsMatch ? scriptsMatch[1] : "";

    return { head, navbar, footer, scripts };
}

function generateCredentialsHtml(name, data) {
    const leftTitle = data.education ? "Education" : "Focus Areas";
    const leftIcon = data.education ? "graduation-cap" : "star";
    let leftItems = "";
    if (data.education) {
        data.education.forEach(item => { leftItems += `<li>${item}</li>\n`; });
    } else if (data.focus) {
        data.focus.forEach(item => { leftItems += `<li>${item}</li>\n`; });
    } else {
        leftItems += "<li>Meticulous Client Support</li>\n<li>Case Progression Operations</li>\n";
    }

    const isAttorney = name.endsWith(", Esq.");
    const rightTitle = isAttorney ? "Bar Admissions" : (data.languages ? "Languages" : "Core Values");
    const rightIcon = isAttorney ? "shield-check" : (data.languages ? "languages" : "heart");
    let rightItems = "";
    if (isAttorney && data.admissions) {
        data.admissions.forEach(item => { rightItems += `<li>${item}</li>\n`; });
    } else if (!isAttorney && data.languages) {
        data.languages.forEach(item => { rightItems += `<li>${item}</li>\n`; });
    } else {
        rightItems += "<li>Relentless Advocacy</li>\n<li>Client-First Response</li>\n<li>Commitment to Excellence</li>\n";
    }

    return `
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <!-- Left Card -->
                                <div class="bg-white rounded-2xl p-6 border border-brand-border/60 shadow-sm">
                                    <div class="flex items-center space-x-3 mb-4 text-brand-primary">
                                        <i data-lucide="${leftIcon}" class="w-6 h-6"></i>
                                        <h4 class="font-bold tracking-wider uppercase text-brand-navy">${leftTitle}</h4>
                                    </div>
                                    <ul class="space-y-3 font-semibold text-brand-charcoal list-none pl-0">
                                        ${leftItems}
                                    </ul>
                                </div>

                                <!-- Right Card -->
                                <div class="bg-white rounded-2xl p-6 border border-brand-border/60 shadow-sm">
                                    <div class="flex items-center space-x-3 mb-4 text-brand-primary">
                                        <i data-lucide="${rightIcon}" class="w-6 h-6"></i>
                                        <h4 class="font-bold tracking-wider uppercase text-brand-navy">${rightTitle}</h4>
                                    </div>
                                    <ul class="space-y-3 font-semibold text-brand-charcoal list-none pl-0">
                                        ${rightItems}
                                    </ul>
                                </div>
                            </div>
    `;
}

function main() {
    const { head, navbar, footer, scripts } = extractThemeParts();

    // 1. Generate Profile Pages
    for (const [name, data] of Object.entries(BIOS_DATA)) {
        if (data.custom_page) continue; // Skip custom Ibrahim J. Awad page

        const slug = data.slug;
        const filename = `team-${slug}.html`;
        const badge = data.badge;
        let role = name.endsWith(", Esq.") ? name.split(",")[1].trim() : "Team Member";
        
        // Specific overrides
        if (slug === "gay-hartley") role = "Director of Operations";
        else if (slug === "marion-day") role = "Director of Client Excellence";
        else if (slug === "shantrell-ball") role = "Insurance Accountability Manager";
        else if (slug === "leland-bridges") role = "Chief Support Officer";
        else if (slug === "devin-spiegelhalter") role = "Client Care Assistant Manager";
        else if (slug === "sabrina-portuondo") role = "Client Intake Manager";
        else if (slug === "deanna-marquez") role = "Evidence Retrieval Specialist";
        else if (slug === "timothy-melson") role = "Evidence Retrieval Specialist";
        else if (slug === "christina-dixon") role = "Payroll and Benefits Specialist";
        else if (slug === "carley-richards") role = "Administrative Assistant";
        else if (slug === "genesis-resendiz") role = "Client Care Specialist";
        else if (slug === "isabel-welch") role = "Client Care Specialist";
        else if (slug === "betty-mendez") role = "Client Care Specialist";
        else if (slug === "mehar-hassan") role = "Senior Graphic Designer";
        else if (slug === "ella-batilona") role = "Graphic Artist";
        else if (slug === "edgard-manzanares") role = "Legal Virtual Assistant";
        else if (slug === "alvaro-vanegas") role = "Virtual Assistant";
        else if (role === "Team Member") {
            if (slug.includes("intake")) role = "Intake Specialist";
            else role = "Client Care Specialist";
        }

        let imageName = name.replace(/ /g, "-").replace(/,/g, "");
        if (slug === "basher-hassan") imageName = "Basher-Hassan,-Esq.";
        else if (slug === "david-price") imageName = "David-Price,-Esq.";
        else if (slug === "azima-mohamed") imageName = "Azima-Mohamed,-Esq.";
        else if (slug === "ahmad-choudhary") imageName = "Ahmad-Choudhary";
        else if (slug === "gay-hartley") imageName = "Gay-Hartley";
        else if (slug === "marion-day") imageName = "Marion-Day";
        else if (slug === "shantrell-ball") imageName = "Shantrell-Ball";
        else if (slug === "leland-bridges") imageName = "Leland-Bridges";
        else if (slug === "sandra-guzman") imageName = "Sandra-Guzman";
        else if (slug === "devin-spiegelhalter") imageName = "Devin-Spiegelhalter";
        else if (slug === "sabrina-portuondo") imageName = "Sabrina-Portuondo";
        else if (slug === "jocelyn-suarez") imageName = "Jocelyn-Suarez";
        else if (slug === "deanna-marquez") imageName = "Deanna-Marquez";
        else if (slug === "timothy-melson") imageName = "Timothy-Melson";
        else if (slug === "adriana-melgarejo") imageName = "Adriana-Melgarejo";
        else if (slug === "christina-dixon") imageName = "Christina-Dixon";
        else if (slug === "carley-richards") imageName = "Carley-Richards";
        else if (slug === "genesis-resendiz") imageName = "Genesis-Resendiz";
        else if (slug === "isabel-welch") imageName = "Isabel-Welch";
        else if (slug === "betty-mendez") imageName = "Betty-Mendez";
        else if (slug === "sierra-jones") imageName = "Sierra-Jones";
        else if (slug === "elizabeth-chavarria") imageName = "Elizabeth-Chavarria";
        else if (slug === "stephanie-rivera") imageName = "Stephanie-Rivera";
        else if (slug === "mohamed") imageName = "Mohamed";
        else if (slug === "selvin-navarro") imageName = "Selvin-Navarro";
        else if (slug === "mehar-hassan") imageName = "Mehar-Hassan";
        else if (slug === "john-jabes-salva") imageName = "John-Jabes-Salva";
        else if (slug === "tasha-hijara") imageName = "Tasha-Hijara";
        else if (slug === "ella-batilona") imageName = "Ella-Batilona";
        else if (slug === "edgard-manzanares") imageName = "Edgard-Manzanares";
        else if (slug === "alvaro-vanegas") imageName = "Alvaro-Vanegas";

        const imageSrc = `/assets/new team member picture/${imageName}.webp`;
        const titleTag = `${name} | ${role} | The Awad Law Firm`;
        const metaDesc = `Meet ${name}, ${role} at The Awad Law Firm. Read their professional biography, experience, and background.`;
        const canonicalUrl = `https://theawadlawfirm.com/team-members/${slug}/`;
        const watermark = name.replace(", Esq.", "").trim().toUpperCase();
        const quote = data.quote;
        const bioParagraphs = data.bio.map(p => `<p>${p}</p>`).join("\n");
        const credentialsHtml = generateCredentialsHtml(name, data);

        const htmlContent = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <link rel="icon" type="image/png" href="/assets/favicon.png">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titleTag}</title>
    <meta name="description" content="${metaDesc}">
    <link rel="canonical" href="${canonicalUrl}">
    
    <!-- Open Graph / SEO -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${titleTag}">
    <meta property="og:description" content="${metaDesc}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:site_name" content="The Awad Law Firm">
    <meta property="og:image" content="https://theawadlawfirm.com/assets/awadlawfirmlogo.png">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${titleTag}">
    <meta name="twitter:description" content="${metaDesc}">
    <meta name="twitter:image" content="https://theawadlawfirm.com/assets/awadlawfirmlogo.png">

    ${head}
</head>
<body class="home-page bg-brand-offwhite text-brand-text font-body antialiased overflow-x-hidden">

${navbar}

    <!-- Premium Profile Layout Section -->
    <section class="py-16 md:py-24 bg-geometric relative z-20 overflow-hidden">
        <!-- Outlined Watermark Name -->
        <div class="absolute top-[20%] right-[-5%] text-[10vw] font-heading font-black text-stroke-premium whitespace-nowrap pointer-events-none select-none z-0">
            ${watermark}
        </div>

        <div class="container mx-auto px-6 max-w-[85rem] relative z-10">
            <!-- Breadcrumbs -->
            <div class="flex items-center space-x-2 text-xs font-bold tracking-widest text-brand-muted uppercase mb-12">
                <a href="/" class="hover:text-brand-primary transition">Home</a>
                <span>&gt;</span>
                <a href="/team-members/" class="hover:text-brand-primary transition">Our Team</a>
                <span>&gt;</span>
                <span class="text-brand-dark">${name}</span>
            </div>

            <!-- Profile Info Split Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                <!-- Left Column: Portrait & Details -->
                <div class="lg:col-span-5 space-y-8 lg:sticky lg:top-10">
                    <div class="relative max-w-md mx-auto lg:mx-0">
                        <div class="absolute inset-0 bg-brand-primary/10 rounded-[3rem] rounded-tr-[8rem] rounded-bl-[8rem] transform -rotate-3 scale-105 transition-transform duration-700 hover:rotate-0 hover:scale-108 z-0"></div>
                        <div class="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.06)] border-4 border-white bg-brand-navy group">
                            <div class="absolute inset-0 bg-brand-navy/5 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
                            <img src="${imageSrc}" alt="${name}" class="w-full h-[450px] md:h-[550px] object-cover object-top transform group-hover:scale-103 transition-transform duration-700" loading="lazy" decoding="async">
                        </div>
                    </div>

                    <!-- Details Card -->
                    <div class="bg-white rounded-3xl p-8 border border-brand-border/60 shadow-[0_10px_30px_rgba(0,0,0,0.02)] max-w-md mx-auto lg:mx-0">
                        <h4 class="text-xs font-bold tracking-widest text-brand-primary uppercase mb-6 border-b border-brand-border/60 pb-3">Contact Information</h4>
                        <ul class="space-y-4 text-sm font-medium text-brand-charcoal list-none pl-0">
                            <li class="flex items-center">
                                <span class="w-10 h-10 rounded-xl bg-brand-pale flex items-center justify-center mr-4 shrink-0">
                                    <i data-lucide="phone" class="w-4 h-4 text-brand-primary"></i>
                                </span>
                                <a href="tel:+17068900000" class="bio-contact-link hover:text-brand-primary transition">(706) 890-0000</a>
                            </li>
                            <li class="flex items-center">
                                <span class="w-10 h-10 rounded-xl bg-brand-pale flex items-center justify-center mr-4 shrink-0">
                                    <i data-lucide="mail" class="w-4 h-4 text-brand-primary"></i>
                                </span>
                                <a href="mailto:team@theawadlawfirm.com" class="bio-contact-link hover:text-brand-primary transition">team@theawadlawfirm.com</a>
                            </li>
                            <li class="flex items-start">
                                <span class="w-10 h-10 rounded-xl bg-brand-pale flex items-center justify-center mr-4 shrink-0 mt-0.5">
                                    <i data-lucide="map-pin" class="w-4 h-4 text-brand-primary"></i>
                                </span>
                                <span>Marietta and Dalton Offices</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Right Column: Biography Details -->
                <div class="lg:col-span-7 space-y-12">
                    <div>
                        <div class="inline-flex items-center space-x-2 bg-brand-pale text-brand-primary px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                            <span class="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                            <span>${badge}</span>
                        </div>
                        <h1 class="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-brand-navy tracking-tight leading-none mb-3">
                            ${name}
                        </h1>
                        <p class="text-sm font-bold tracking-widest text-brand-muted uppercase">${role}</p>
                    </div>

                    <!-- Personal Statement Quote -->
                    <div class="relative bg-brand-pale rounded-3xl p-8 md:p-10 border border-brand-primary/20 shadow-[0_15px_30px_rgba(108,161,230,0.08)]">
                        <i data-lucide="quote" class="w-16 h-16 text-brand-primary/15 absolute top-4 right-6 pointer-events-none"></i>
                        <p class="text-lg md:text-xl font-medium leading-relaxed text-brand-navy relative z-10">
                            "${quote}"
                        </p>
                    </div>

                    <!-- Biography Narrative -->
                    <div class="space-y-10 text-brand-charcoal/90 text-lg leading-relaxed font-medium">
                        <div class="space-y-6">
                            <h3 class="text-2xl md:text-3xl font-heading font-bold text-brand-navy pb-3 border-b border-brand-border">
                                Biography
                            </h3>
                            ${bioParagraphs}
                        </div>

                        <!-- Credentials Grid -->
                        <div class="space-y-6 pt-4">
                            <h3 class="text-2xl md:text-3xl font-heading font-bold text-brand-navy pb-3 border-b border-brand-border">
                                Background & Focus
                            </h3>
                            ${credentialsHtml}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

${footer}

${scripts}
</body>
</html>
`;
        fs.writeFileSync(filename, htmlContent, 'utf8');
        console.log(`Generated ${filename}`);
    }

    // 2. Modify team-experts.html to link cards to respective pages
    let teamExperts = fs.readFileSync('team-experts.html', 'utf8');

    for (const [name, data] of Object.entries(BIOS_DATA)) {
        const slug = data.slug;
        const link = `/team-members/${slug}/`;
        const escName = name.replace(", Esq.", "").trim();
        
        // Search comment
        const commentRegex = new RegExp(`<!--\\s*Member\\s*\\d+:\\s*${escName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:,\\s*Esq\\.)?\\s*-->`);
        const match = teamExperts.match(commentRegex);
        if (match) {
            const startPos = match.index;
            const divStart = teamExperts.indexOf('<div class="group bg-white rounded-[2.5rem] p-4 border border-brand-border/60', startPos);
            if (divStart !== -1 && divStart < startPos + 250) {
                // Count tags to find end of card
                let openCount = 0;
                let pos = divStart;
                let cardEndPos = -1;
                while (pos < teamExperts.length) {
                    if (teamExperts.substring(pos, pos + 4) === '<div') {
                        openCount++;
                        pos += 4;
                    } else if (teamExperts.substring(pos, pos + 6) === '</div>') {
                        openCount--;
                        pos += 6;
                        if (openCount === 0) {
                            cardEndPos = pos;
                            break;
                        }
                    } else {
                        pos++;
                    }
                }

                if (cardEndPos !== -1) {
                    const cardContent = teamExperts.substring(divStart, cardEndPos);
                    
                    // Parse the opening div tag and replace it with an anchor tag
                    const openTagEnd = cardContent.indexOf('>');
                    if (openTagEnd !== -1) {
                        const openTag = cardContent.substring(0, openTagEnd + 1);
                        const classMatch = openTag.match(/class="([^"]*)"/);
                        if (classMatch) {
                            let classes = classMatch[1];
                            if (openTag.startsWith('<div')) {
                                if (!classes.includes('hover:no-underline')) {
                                    classes += ' hover:no-underline';
                                }
                                if (!classes.includes('text-decoration-none')) {
                                    classes += ' text-decoration-none';
                                }
                                const newOpenTag = `<a href="${link}" class="${classes}">`;
                                let newCardContent = newOpenTag + cardContent.substring(openTagEnd + 1);
                                
                                // Replace last div closing tag with anchor closing tag
                                if (newCardContent.endsWith('</div>')) {
                                    newCardContent = newCardContent.slice(0, -6) + '</a>';
                                }
                                
                                teamExperts = teamExperts.substring(0, divStart) + newCardContent + teamExperts.substring(cardEndPos);
                                console.log(`Updated card link for ${name} -> ${link}`);
                            }
                        }
                    }
                }
            }
        }
    }

    fs.writeFileSync('team-experts.html', teamExperts, 'utf8');
    console.log("Wrote updated team-experts.html");

    // Print configurations
    console.log("\n--- Add these to generate_clean_routes.js ---");
    for (const [name, data] of Object.entries(BIOS_DATA)) {
        const slug = data.slug;
        const page = data.custom_page || `team-${slug}.html`;
        console.log(`  'team-members/${slug}': '${page}',`);
    }
}

main();
