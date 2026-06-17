import os
import re

BIOS_DATA = {
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
            "Leland Bridges grew up across South Carolina, Florida, and Tennessee, attended Space Camp and Aviation Academy as a teenager, and earned a Bachelor’s in English from Converse College. After moving to Atlanta, Leland worked in several roles at a top 100 law firm and earned a paralegal certificate from Clayton State University.",
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
            "Christina Dixon was born and raised in Brooklyn, New York. She earned a Bachelor of Science in Marketing from St. John’s University, then moved to Atlanta and earned an MBA from Keller Graduate School of Management with a concentration in Human Resources and Project Management.",
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
            "Outside of work, she enjoys baking sourdough, cheering for the Atlanta Braves with her husband, and spending time with her two German Shepherd mixes."
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
    "Mohamed Ahmed": {
        "slug": "mohamed",
        "badge": "The Awad Squad",
        "bio": [
            "Mohamed Ahmed is a Client Care Specialist at The Awad Law Firm.",
            "He supports personal injury clients throughout their treatment and rehabilitation, ensuring their files are updated and they receive attentive service.",
            "Outside work, Mohamed Ahmed enjoys fitness, reading history, and spending time with friends."
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
}

# Template HTML files extraction logic
def extract_theme_parts():
    with open('ibrahim-awad.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Head extract
    head_match = re.search(r'<head>(.*?)</head>', html, re.DOTALL)
    head = head_match.group(1) if head_match else ""
    # Strip existing page-specific SEO titles/metadata
    head = re.sub(r'<title>.*?</title>', '', head)
    head = re.sub(r'<meta name="description".*?>', '', head)
    head = re.sub(r'<link rel="canonical".*?>', '', head)
    head = re.sub(r'<meta property="og:title".*?>', '', head)
    head = re.sub(r'<meta property="og:description".*?>', '', head)
    head = re.sub(r'<meta property="og:url".*?>', '', head)
    head = re.sub(r'<meta name="twitter:title".*?>', '', head)
    head = re.sub(r'<meta name="twitter:description".*?>', '', head)
    head = re.sub(r'<script type="application/ld\+json" data-ai-seo="webpage">.*?</script>', '', head, flags=re.DOTALL)

    # Navbar/Header
    navbar_match = re.search(r'(<header class="navbar">.*?</header>)', html, re.DOTALL)
    navbar = navbar_match.group(1) if navbar_match else ""

    # Footer
    footer_match = re.search(r'(<footer class="site-footer">.*?</footer>)', html, re.DOTALL)
    footer = footer_match.group(1) if footer_match else ""

    # Script/Modals
    scripts_match = re.search(r'</footer>(.*?)</body>', html, re.DOTALL)
    scripts = scripts_match.group(1) if scripts_match else ""

    return head, navbar, footer, scripts

def generate_credentials_html(name, data):
    # Left Card
    left_title = "Education" if "education" in data else "Focus Areas"
    left_icon = "graduation-cap" if "education" in data else "star"
    left_items = ""
    if "education" in data:
        for item in data["education"]:
            left_items += f"<li>{item}</li>\n"
    elif "focus" in data:
        for item in data["focus"]:
            left_items += f"<li>{item}</li>\n"
    else:
        left_items += "<li>Meticulous Client Support</li>\n<li>Case Progression Operations</li>\n"

    # Right Card
    is_attorney = name.endswith(", Esq.")
    right_title = "Bar Admissions" if is_attorney else ("Languages" if "languages" in data else "Core Values")
    right_icon = "shield-check" if is_attorney else ("languages" if "languages" in data else "heart")
    right_items = ""
    if is_attorney and "admissions" in data:
        for item in data["admissions"]:
            right_items += f"<li>{item}</li>\n"
    elif not is_attorney and "languages" in data:
        for item in data["languages"]:
            right_items += f"<li>{item}</li>\n"
    else:
        right_items += "<li>Relentless Advocacy</li>\n<li>Client-First Response</li>\n<li>Commitment to Excellence</li>\n"

    return f"""
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <!-- Left Card -->
                                <div class="bg-white rounded-2xl p-6 border border-brand-border/60 shadow-sm">
                                    <div class="flex items-center space-x-3 mb-4 text-brand-primary">
                                        <i data-lucide="{left_icon}" class="w-6 h-6"></i>
                                        <h4 class="font-bold tracking-wider uppercase text-brand-navy">{left_title}</h4>
                                    </div>
                                    <ul class="space-y-3 font-semibold text-brand-charcoal list-none pl-0">
                                        {left_items}
                                    </ul>
                                </div>

                                <!-- Right Card -->
                                <div class="bg-white rounded-2xl p-6 border border-brand-border/60 shadow-sm">
                                    <div class="flex items-center space-x-3 mb-4 text-brand-primary">
                                        <i data-lucide="{right_icon}" class="w-6 h-6"></i>
                                        <h4 class="font-bold tracking-wider uppercase text-brand-navy">{right_title}</h4>
                                    </div>
                                    <ul class="space-y-3 font-semibold text-brand-charcoal list-none pl-0">
                                        {right_items}
                                    </ul>
                                </div>
                            </div>
    """

def get_profile_email(name):
    first_name = re.sub(r'[^a-zA-Z]', '', name.split()[0]).lower()
    return f"{first_name}@theawadlawfirm.com"

def main():
    head, navbar, footer, scripts = extract_theme_parts()
    
    # 1. Generate Profile Pages
    for name, data in BIOS_DATA.items():
        if "custom_page" in data:
            # Skip custom page generation, but we still need its details
            continue
            
        slug = data["slug"]
        filename = f"team-{slug}.html"
        badge = data["badge"]
        role = name.split(",")[-1].strip() if name.endswith(", Esq.") else data.get("role", "Team Member")
        # Overwrite standard roles
        if slug == "gay-hartley": role = "Director of Operations"
        elif slug == "marion-day": role = "Director of Client Excellence"
        elif slug == "shantrell-ball": role = "Insurance Accountability Manager"
        elif slug == "leland-bridges": role = "Chief Support Officer"
        elif slug == "devin-spiegelhalter": role = "Client Care Assistant Manager"
        elif slug == "sabrina-portuondo": role = "Client Intake Manager"
        elif slug == "deanna-marquez": role = "Evidence Retrieval Specialist"
        elif slug == "timothy-melson": role = "Evidence Retrieval Specialist"
        elif slug == "christina-dixon": role = "Payroll and Benefits Specialist"
        elif slug == "carley-richards": role = "Administrative Assistant"
        elif slug == "genesis-resendiz": role = "Client Care Specialist"
        elif slug == "isabel-welch": role = "Client Care Specialist"
        elif slug == "betty-mendez": role = "Client Care Specialist"
        elif slug == "mehar-hassan": role = "Senior Graphic Designer"
        elif slug == "ella-batilona": role = "Graphic Artist"
        elif slug == "edgard-manzanares": role = "Legal Virtual Assistant"
        elif slug == "alvaro-vanegas": role = "Virtual Assistant"
        elif not role or role == "Team Member":
            # Guess from details
            if "Intake" in name or "intake" in slug: role = "Intake Specialist"
            elif "Specialist" in name: role = "Specialist"
            else: role = "Client Care Specialist"

        image_name = name.replace(" ", "-").replace(",", "")
        # Correct custom portrait files mapped in team-experts
        if slug == "basher-hassan": image_name = "Basher-Hassan,-Esq."
        elif slug == "david-price": image_name = "David-Price,-Esq."
        elif slug == "azima-mohamed": image_name = "Azima-Mohamed,-Esq."
        elif slug == "ahmad-choudhary": image_name = "Ahmad-Choudhary"
        elif slug == "gay-hartley": image_name = "Gay-Hartley"
        elif slug == "marion-day": image_name = "Marion-Day"
        elif slug == "shantrell-ball": image_name = "Shantrell-Ball"
        elif slug == "leland-bridges": image_name = "Leland-Bridges"
        elif slug == "sandra-guzman": image_name = "Sandra-Guzman"
        elif slug == "devin-spiegelhalter": image_name = "devin"
        elif slug == "sabrina-portuondo": image_name = "Sabrina-Portuondo"
        elif slug == "jocelyn-suarez": image_name = "Jocelyn-Suarez-Intake-Specialist"
        elif slug == "deanna-marquez": image_name = "DeannaMarquez-(1)"
        elif slug == "timothy-melson": image_name = "Timothy-Melson"
        elif slug == "adriana-melgarejo": image_name = "adriana-picture"
        elif slug == "christina-dixon": image_name = "Christina-Dixon"
        elif slug == "carley-richards": image_name = "Carley-Richards"
        elif slug == "genesis-resendiz": image_name = "genesis"
        elif slug == "isabel-welch": image_name = "Isabel-Welch"
        elif slug == "betty-mendez": image_name = "Betty-Mendez"
        elif slug == "sierra-jones": image_name = "Sierra-Jones"
        elif slug == "elizabeth-chavarria": image_name = "Elizabeth-Chavarria"
        elif slug == "stephanie-rivera": image_name = "StephanieRivera"
        elif slug == "mohamed": image_name = "Mohamad-Client-Care-Speacilist"
        elif slug == "selvin-navarro": image_name = "Selvin-Navarro"
        elif slug == "mehar-hassan": image_name = "Mehar-Hassan"
        elif slug == "john-jabes-salva": image_name = "John-Jabes-Salva"
        elif slug == "tasha-hijara": image_name = "Tasha-Hijara"
        elif slug == "ella-batilona": image_name = "Ella-Batilona"
        elif slug == "edgard-manzanares": image_name = "Edgard-Manzanares"
        elif slug == "alvaro-vanegas": image_name = "Alvaro-Vanegas"

        image_src = f"/assets/new team member picture/{image_name}.webp"
        
        # Meta and descriptions
        title_tag = f"{name} | {role} | The Awad Law Firm"
        meta_desc = f"Meet {name}, {role} at The Awad Law Firm. Read their professional biography, experience, and background."
        canonical_url = f"https://theawadlawfirm.com/team-members/{slug}/"
        watermark = name.replace(", Esq.", "").strip().upper()
        quote = data["quote"]
        profile_email = get_profile_email(name)
        
        bio_paragraphs = "\n".join([f"<p>{p}</p>" for p in data["bio"]])
        credentials_html = generate_credentials_html(name, data)

        html_content = f"""<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <link rel="icon" type="image/png" href="/assets/favicon.png">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title_tag}</title>
    <meta name="description" content="{meta_desc}">
    <link rel="canonical" href="{canonical_url}">
    
    <!-- Open Graph / SEO -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="{title_tag}">
    <meta property="og:description" content="{meta_desc}">
    <meta property="og:url" content="{canonical_url}">
    <meta property="og:site_name" content="The Awad Law Firm">
    <meta property="og:image" content="https://theawadlawfirm.com/assets/awadlawfirmlogo.png">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title_tag}">
    <meta name="twitter:description" content="{meta_desc}">
    <meta name="twitter:image" content="https://theawadlawfirm.com/assets/awadlawfirmlogo.png">

    {head}
</head>
<body class="home-page bg-brand-offwhite text-brand-text font-body antialiased overflow-x-hidden">

{navbar}

    <!-- Premium Profile Layout Section -->
    <section class="py-16 md:py-24 bg-geometric relative z-20 overflow-hidden">
        <!-- Outlined Watermark Name -->
        <div class="absolute top-[20%] right-[-5%] text-[10vw] font-heading font-black text-stroke-premium whitespace-nowrap pointer-events-none select-none z-0">
            {watermark}
        </div>

        <div class="container mx-auto px-6 max-w-[85rem] relative z-10">
            <!-- Breadcrumbs -->
            <div class="flex items-center space-x-2 text-xs font-bold tracking-widest text-brand-muted uppercase mb-12">
                <a href="/" class="hover:text-brand-primary transition">Home</a>
                <span>&gt;</span>
                <a href="/team-members/" class="hover:text-brand-primary transition">Our Team</a>
                <span>&gt;</span>
                <span class="text-brand-dark">{name}</span>
            </div>

            <!-- Profile Info Split Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                <!-- Left Column: Portrait & Details -->
                <div class="lg:col-span-5 space-y-8 lg:sticky lg:top-10">
                    <div class="relative max-w-md mx-auto lg:mx-0">
                        <div class="absolute inset-0 bg-brand-primary/10 rounded-[3rem] rounded-tr-[8rem] rounded-bl-[8rem] transform -rotate-3 scale-105 transition-transform duration-700 hover:rotate-0 hover:scale-108 z-0"></div>
                        <div class="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.06)] border-4 border-white bg-brand-navy group">
                            <div class="absolute inset-0 bg-brand-navy/5 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
                            <img src="{image_src}" alt="{name}" class="w-full h-[450px] md:h-[550px] object-cover object-top transform group-hover:scale-103 transition-transform duration-700" loading="lazy" decoding="async">
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
                                <a href="tel:+17068900000" class="hover:text-brand-primary transition">(706) 890-0000</a>
                            </li>
                            <li class="flex items-center">
                                <span class="w-10 h-10 rounded-xl bg-brand-pale flex items-center justify-center mr-4 shrink-0">
                                    <i data-lucide="mail" class="w-4 h-4 text-brand-primary"></i>
                                </span>
                                <a href="mailto:{profile_email}" class="bio-contact-link hover:text-brand-primary transition">{profile_email}</a>
                            </li>
                            <li class="flex items-start">
                                <span class="w-10 h-10 rounded-xl bg-brand-pale flex items-center justify-center mr-4 shrink-0 mt-0.5">
                                    <i data-lucide="map-pin" class="w-4 h-4 text-brand-primary"></i>
                                </span>
                                <span>Marietta and Dalton Offices</span>
                            </li>
                        </ul>

                        <!-- Firm Socials -->
                        <div class="flex items-center space-x-4 mt-8 pt-6 border-t border-brand-border/60">
                            <a href="https://www.facebook.com/theawadlawfirm" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-xl bg-brand-offwhite border border-brand-border/60 flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-sm" aria-label="Facebook">
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                                </svg>
                            </a>
                            <a href="https://www.instagram.com/awadlawfirm/" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-xl bg-brand-offwhite border border-brand-border/60 flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-sm" aria-label="Instagram">
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                                </svg>
                            </a>
                            <a href="https://www.linkedin.com/company/the-awad-law-firm/" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-xl bg-brand-offwhite border border-brand-border/60 flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-sm" aria-label="LinkedIn">
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.27c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 12.27h-3v-5.6c0-3.34-4-3.1-4 0v5.6h-3v-11h3v1.76c1.4-2.58 7-2.78 7 2.47v6.77z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Biography Details -->
                <div class="lg:col-span-7 space-y-12">
                    <div>
                        <div class="inline-flex items-center space-x-2 bg-brand-pale text-brand-primary px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                            <span class="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                            <span>{badge}</span>
                        </div>
                        <h1 class="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-brand-navy tracking-tight leading-none mb-3">
                            {name}
                        </h1>
                        <p class="text-sm font-bold tracking-widest text-brand-muted uppercase">{role}</p>
                    </div>

                    <!-- Personal Statement Quote -->
                    <div class="relative bg-brand-pale rounded-3xl p-8 md:p-10 border border-brand-primary/20 shadow-[0_15px_30px_rgba(108,161,230,0.08)]">
                        <i data-lucide="quote" class="w-16 h-16 text-brand-primary/15 absolute top-4 right-6 pointer-events-none"></i>
                        <p class="text-lg md:text-xl font-medium leading-relaxed text-brand-navy relative z-10">
                            "{quote}"
                        </p>
                    </div>

                    <!-- Biography Narrative -->
                    <div class="space-y-10 text-brand-charcoal/90 text-lg leading-relaxed font-medium">
                        <div class="space-y-6">
                            <h3 class="text-2xl md:text-3xl font-heading font-bold text-brand-navy pb-3 border-b border-brand-border">
                                Biography
                            </h3>
                            {bio_paragraphs}
                        </div>

                        <!-- Credentials Grid -->
                        <div class="space-y-6 pt-4">
                            <h3 class="text-2xl md:text-3xl font-heading font-bold text-brand-navy pb-3 border-b border-brand-border">
                                Background & Focus
                            </h3>
                            {credentials_html}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

{footer}

{scripts}

<script>
    // Create icons
    lucide.createIcons();
</script>
<a class="premium-float-call" href="tel:+17068900000" aria-label="Call Awad Law Firm at (706) 890-0000">
  <span class="float-call-pulse" aria-hidden="true"></span>
  <span class="float-call-pulse-2" aria-hidden="true"></span>
  <span class="float-call-content">
    <svg class="float-call-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.12.81.35 1.6.68 2.34a2 2 0 0 1-.45 2.18L9.09 10.91a16 16 0 0 0 4 4l1.67-1.25a2 2 0 0 1 2.18-.45c.74.33 1.53.56 2.34.68A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <span class="float-call-text">
      <span class="float-call-prefix">706-</span><span class="float-call-primary">890-0000</span>
    </span>
  </span>
 </a>
</body>
</html>
"""
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f"Generated {filename}")

    # 2. Modify team-experts.html to link cards to the respective pages
    with open('team-experts.html', 'r', encoding='utf-8') as f:
        team_experts = f.read()

    # We will search for team grid cards in team-experts.html and wrap/replace their wrappers
    # A card looks like:
    # <div class="group bg-white rounded-[2.5rem] p-4 border border-brand-border/60 hover:border-brand-primary/40 hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(108,161,230,0.2)] transition-all duration-500 flex flex-col h-full">
    # And contains Name in the <h3>:
    # <h3 class="font-heading font-black text-xl text-brand-navy group-hover:text-brand-primary transition-colors duration-300 mb-2">Name</h3>

    # Let's do a reliable card-by-card replacement using regex matching for the card patterns
    # We can match comments and cards to find each member
    for name, data in BIOS_DATA.items():
        slug = data["slug"]
        link = f"/team-members/{slug}/"
        
        # Regex to locate the card block following the member comment.
        # Example: <!-- Member 2: Basher Hassan -->
        #          <div class="group bg-white rounded-[2.5rem] p-4...
        esc_name = re.escape(name.replace(", Esq.", "").strip())
        pattern = r"(<!--\s*Member\s*\d+:\s*" + esc_name + r"(?:,\s*Esq\.)?\s*-->\s*)<div(\s+class=\"group bg-white rounded-\[2\.5rem\] p-4 border[^>]*>)"
        
        # We also need to change the matching closing tag at the end of that card
        # A card spans until the next member card or closing column grid block.
        # Since doing full nested div matching is complex, we can use a regex to capture:
        # 1. The card container open tag
        # 2. The inner contents
        # 3. The card container close tag
        # Let's find each card container. In team-experts.html, each member card has a specific structure:
        # <div class="group bg-white rounded-[2.5rem] p-4 border border-brand-border/60 hover:border-brand-primary/40 hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(108,161,230,0.2)] transition-all duration-500 flex flex-col h-full">
        # ... inner html ...
        # </div>
        # Inside the card, the last element is the title + badge <div> wrapper.
        # We can find this whole card block cleanly. Let's write a regex that matches the div block:
        # <div class="group bg-white rounded-[2.5rem] p-4 border border-brand-border/60 hover:border-brand-primary/40 hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(108,161,230,0.2)] transition-all duration-500 flex flex-col h-full">...</div>
        
        card_start_pat = r"<div\s+class=\"group bg-white rounded-\[2\.5rem\] p-4 border border-brand-border/60 hover:border-brand-primary/40 hover:-translate-y-3 hover:shadow-\[0_20px_50px_rgba\(108,161,230,0\.2\)\] transition-all duration-500 flex flex-col h-full\"[^>]*>"
        
        # To match the exact card for this member:
        # We look for the comment, then the card open tag, then inner content containing name, then the closing card tag.
        # Inside the card there are nested divs (like team-split-bg, and text-center).
        # The card structure has exactly 4 closing tags:
        # - team-split-bg ends (1)
        # - image wrapper or overlay ends (not nested, img is direct child)
        # - text-center open -> h3 -> span -> text-center ends (2)
        # - card open -> card ends (3)
        # Wait, let's verify if there are other nested divs.
        # Yes:
        # <div class="group bg-white ..."> (Card open)
        #   <div class="relative overflow-hidden ..."> (team-split-bg open)
        #     <div class="absolute inset-0 ..."></div> (overlay)
        #     <img ...>
        #   </div> (team-split-bg close)
        #   <div class="text-center ..."> (text-center open)
        #     <h3>...</h3>
        #     <span>...</span>
        #   </div> (text-center close)
        # </div> (Card close)
        # So it is exactly structured like:
        # <div class="group ...">
        #   <div class="...">
        #     <div class="..."></div>
        #     <img>
        #   </div>
        #   <div class="...">
        #     <h3>...</h3>
        #     <span>...</span>
        #   </div>
        # </div>
        # Let's match this exactly:
        member_card_pattern = r"(<!--\s*Member\s*\d+:\s*" + esc_name + r"(?:,\s*Esq\.)?\s*-->\s*)" + \
                              card_start_pat + r"(.*?)\s*</div>\s*(.*?)\s*</div>\s*(.*?)\s*</div>\s*</div>"
        
        # Let's see what is inside:
        # Group 1: Comment
        # Group 2: Inner details of image div (relative overflow-hidden)
        # Group 3: Inner details of text-center div
        # Group 4: Spacer or text-center close contents (actually we just need the inner HTML of the card)
        
        # Instead of parsing nesting with regex, we can replace:
        # `<div class="group bg-white ... h-full">` with `<a href="{link}" class="group bg-white ... h-full block hover:no-underline text-decoration-none">`
        # and replace the corresponding close `</div>` with `</a>`.
        # How to find the card block uniquely?
        # We can find:
        # `<!-- Member X: Name -->`
        # Followed by `<div class="group bg-white ...>`
        # Followed by everything until the NEXT `<!-- Member` or closing grid tag `</div>\s*</div>\s*<!-- ==========================================`
        # Or simply, each card has exactly:
        # `<div class="group bg-white rounded-[2.5rem] p-4 border border-brand-border/60 hover:border-brand-primary/40 hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(108,161,230,0.2)] transition-all duration-500 flex flex-col h-full">`
        # ...
        # and ends with:
        # `</div>`
        # Let's use a non-greedy search for the card block:
        card_search_pattern = r"(<!--\s*Member\s*\d+:\s*" + esc_name + r"(?:,\s*Esq\.)?\s*-->\s*)" + \
                              r"<div\s+class=\"group bg-white rounded-\[2\.5rem\] p-4 border border-brand-border/60 hover:border-brand-primary/40 hover:-translate-y-3 hover:shadow-\[0_20px_50px_rgba\(108,161,230,0\.2\)\] transition-all duration-500 flex flex-col h-full\"(.*?)</h3>\s*(.*?)\s*</span>\s*</div>\s*</div>"
        
        # Let's check if we can do a substitution:
        replacement = r"\1<a href=\"" + link + r"\" class=\"group bg-white rounded-[2.5rem] p-4 border border-brand-border/60 hover:border-brand-primary/40 hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(108,161,230,0.2)] transition-all duration-500 flex flex-col h-full block hover:no-underline text-decoration-none\"\2</h3>\s*\3\s*</span>\s*</div>\s*</a>"
        
        # Wait, using regex substitution with multiple captures of newlines can be finicky.
        # Let's do it cleanly by finding the index of the comment, then finding the card start, then finding the closing </div> of the card.
        # Since we know the card structure, we can count open/close tags or look for the first `</div>` that matches the end of the card.
        # The card block starts at `comment_index` + length of comment + whitespace, and we can find the next card start or grid close.
        # Let's write a python parser using string splits or simple index searches, which is 100% reliable.
        
    # Let's write a simple scanner:
    for name, data in BIOS_DATA.items():
        slug = data["slug"]
        link = f"/team-members/{slug}/"
        esc_name = name.replace(", Esq.", "").strip()
        
        # Search for the comment
        comment_marker = f"<!-- Member"
        # Find the comment that matches our member name
        # We can search for re.search(r'<!--\s*Member\s*\d+:\s*' + re.escape(esc_name), team_experts)
        match = re.search(r'<!--\s*Member\s*\d+:\s*' + re.escape(esc_name) + r'(?:,\s*Esq\.)?\s*-->', team_experts)
        if match:
            start_pos = match.start()
            # Find the card container start div after this comment
            div_start = team_experts.find('<div class="group bg-white rounded-[2.5rem] p-4 border border-brand-border/60', start_pos)
            if div_start != -1 and div_start < start_pos + 200:
                # We need to find the matching closing </div> of this card.
                # A card contains nested divs. Let's count divs from div_start:
                # We start with open_count = 1 at div_start + 4.
                # Loop through the string and increment for <div and decrement for </div.
                # When open_count reaches 0, we found the closing tag.
                open_count = 0
                pos = div_start
                while pos < len(team_experts):
                    if team_experts[pos:pos+4] == '<div':
                        open_count += 1
                        pos += 4
                    elif team_experts[pos:pos+5] == '</div':
                        open_count -= 1
                        pos += 5
                        if open_count == 0:
                            # Found the closing tag!
                            card_end_pos = pos
                            break
                    else:
                        pos += 1
                
                # Now we have the exact card block: team_experts[div_start:card_end_pos]
                card_content = team_experts[div_start:card_end_pos]
                # Modify open tag to be <a>
                # Replace `<div class="group bg-white ... h-full">` with `<a href="{link}" class="group bg-white ... h-full hover:no-underline text-decoration-none">`
                new_card_content = card_content.replace(
                    '<div class="group bg-white rounded-[2.5rem] p-4 border border-brand-border/60 hover:border-brand-primary/40 hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(108,161,230,0.2)] transition-all duration-500 flex flex-col h-full">',
                    f'<a href="{link}" class="group bg-white rounded-[2.5rem] p-4 border border-brand-border/60 hover:border-brand-primary/40 hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(108,161,230,0.2)] transition-all duration-500 flex flex-col h-full hover:no-underline text-decoration-none">'
                )
                # Replace the very last `</div>` with `</a>`
                if new_card_content.endswith('</div>'):
                    new_card_content = new_card_content[:-6] + '</a>'
                
                # Replace the card in the main team_experts string
                team_experts = team_experts[:div_start] + new_card_content + team_experts[card_end_pos:]
                print(f"Updated card link for {name} -> {link}")

    # Write the modified team-experts.html
    with open('team-experts.html', 'w', encoding='utf-8') as f:
        f.write(team_experts)
    print("Wrote updated team-experts.html")

    # 3. Output the required entries to paste in generate_clean_routes.js
    print("\n--- Route Configurations to add to generate_clean_routes.js ---")
    for name, data in BIOS_DATA.items():
        slug = data["slug"]
        page = data.get("custom_page", f"team-{slug}.html")
        print(f"  'team-members/{slug}': '{page}',")
    print("--------------------------------------------------------------")

if __name__ == '__main__':
    main()
