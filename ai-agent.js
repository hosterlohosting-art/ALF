/**
 * ALF AI Chatbot Agent
 * Instantly answers questions about The Awad Law Firm, its practice areas, attorneys, locations, and reviews.
 * Client-side execution with zero latency and no external API keys required.
 */
(function() {
  // Prevent duplicate load
  if (document.getElementById('alf-ai-chat-widget')) return;

  // 1. Inject CSS Stylesheets
  const style = document.createElement('style');
  style.textContent = `
    /* AI Chatbot container */
    #alf-ai-chat-widget {
      position: fixed !important;
      bottom: 32px !important;
      left: 32px !important;
      top: auto !important;
      right: auto !important;
      z-index: 100002 !important;
      font-family: 'Outfit', 'Inter', sans-serif !important;
    }

    /* Floating bubble button */
    .alf-ai-chat-bubble {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: #1b2b42;
      border: 2px solid rgba(108, 161, 230, 0.4);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 8px 30px rgba(12, 24, 39, 0.22);
      transition: transform 0.3s ease, background 0.3s ease, border-color 0.3s ease;
      position: relative;
    }

    .alf-ai-chat-bubble:hover {
      transform: scale(1.08);
      background: #6da6e3;
      border-color: #ffffff;
    }

    /* Pulsing dashed indicator */
    .alf-ai-chat-bubble::after {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px dashed #6da6e3;
      opacity: 0.6;
      animation: alf-chat-pulse 12s linear infinite;
      pointer-events: none;
    }

    @keyframes alf-chat-pulse {
      to { transform: rotate(360deg); }
    }

    /* Chat Window Panel */
    .alf-ai-chat-window {
      position: absolute !important;
      bottom: 72px !important;
      left: 0 !important;
      top: auto !important;
      width: 380px !important;
      height: 500px !important;
      max-height: calc(100vh - 130px) !important;
      border-radius: 24px !important;
      background: #ffffff !important;
      border: 1px solid rgba(108, 161, 230, 0.22) !important;
      box-shadow: 0 15px 50px rgba(12, 24, 39, 0.16) !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      pointer-events: none;
      transition: opacity 0.3s cubic-bezier(0.25, 1, 0.5, 1), transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
      transform-origin: left bottom;
      z-index: 100000;
    }

    .alf-ai-chat-window.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    /* Header styling */
    .alf-ai-chat-header {
      background: #1b2b42;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(108, 161, 230, 0.15);
    }

    .alf-ai-chat-header-profile {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .alf-ai-chat-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #6da6e3;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 14px;
      color: #ffffff;
      border: 1.5px solid rgba(255, 255, 255, 0.35);
      font-family: 'Outfit', sans-serif;
    }

    .alf-ai-chat-title-info {
      display: flex;
      flex-direction: column;
    }

    .alf-ai-chat-title {
      color: #ffffff;
      font-weight: 700;
      font-size: 14.5px;
      line-height: 1.2;
    }

    .alf-ai-chat-status {
      color: #22c55e;
      font-size: 10px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 1px;
    }

    .alf-ai-chat-status::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      display: inline-block;
      animation: pulse-dot-ai 1.5s infinite;
    }

    @keyframes pulse-dot-ai {
      50% { opacity: 0.5; }
    }

    .alf-ai-chat-close {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.75);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .alf-ai-chat-close:hover {
      color: #ffffff;
    }

    /* Chat Messages list */
    .alf-ai-chat-messages {
      flex-grow: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: #f8fafc;
    }

    /* Chat Bubble styling */
    .alf-ai-message {
      max-width: 82%;
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 13.5px;
      line-height: 1.48;
      font-weight: 500;
      word-wrap: break-word;
      animation: message-slide-in 0.25s ease-out;
    }

    @keyframes message-slide-in {
      from { opacity: 0; transform: translateY(8px); }
    }

    .alf-ai-message.incoming {
      background: #ffffff;
      color: #1b2b42;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      border: 1px solid rgba(108, 161, 230, 0.12);
      box-shadow: 0 2px 8px rgba(21, 42, 73, 0.02);
    }

    .alf-ai-message.outgoing {
      background: #1b2b42;
      color: #ffffff;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }

    .alf-ai-message a {
      color: #6da6e3;
      text-decoration: underline;
      font-weight: 700;
    }

    .alf-ai-message a:hover {
      color: #1b2b42;
    }

    .alf-ai-message.outgoing a {
      color: #7fbeff;
    }

    .alf-ai-message p {
      margin: 0 0 8px 0;
    }
    .alf-ai-message p:last-child {
      margin-bottom: 0;
    }

    /* Suggestion Chips block */
    .alf-ai-chips-container {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 5px;
    }

    .alf-ai-chip {
      background: rgba(108, 161, 230, 0.08);
      border: 1px solid rgba(108, 161, 230, 0.2);
      color: #1b2b42;
      padding: 8px 14px;
      border-radius: 12px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 600;
      text-align: left;
      width: fit-content;
      max-width: 100%;
    }

    .alf-ai-chip:hover {
      background: #6da6e3;
      color: #ffffff;
      border-color: #6da6e3;
      transform: translateX(3px);
    }

    /* Typing indicators */
    .alf-ai-typing {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 12px 16px;
      align-self: flex-start;
      background: #ffffff;
      border-radius: 18px;
      border-bottom-left-radius: 4px;
      border: 1px solid rgba(108, 161, 230, 0.12);
    }

    .alf-ai-typing span {
      width: 6px;
      height: 6px;
      background: #94a3b8;
      border-radius: 50%;
      animation: typing-bubble-ai 1s infinite alternate;
    }

    .alf-ai-typing span:nth-child(2) { animation-delay: 0.2s; }
    .alf-ai-typing span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typing-bubble-ai {
      from { transform: translateY(0); }
      to { transform: translateY(-5px); }
    }

    /* Input text area and send button */
    .alf-ai-chat-input-area {
      padding: 14px;
      background: #ffffff;
      border-top: 1px solid rgba(108, 161, 230, 0.15);
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .alf-ai-chat-input {
      flex-grow: 1;
      border: 1px solid rgba(108, 161, 230, 0.3);
      padding: 10px 16px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 500;
      outline: none;
      color: #1b2b42;
      background: #f8fafc;
      transition: border-color 0.2s, background 0.2s;
    }

    .alf-ai-chat-input:focus {
      border-color: #6da6e3;
      background: #ffffff;
    }

    .alf-ai-chat-send {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #1b2b42;
      border: none;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s, transform 0.2s;
      flex-shrink: 0;
    }

    .alf-ai-chat-send:hover {
      background: #6da6e3;
      transform: scale(1.05);
    }

    .alf-ai-chat-send svg {
      width: 16px;
      height: 16px;
    }

    /* Mobile Responsive styling */
    @media (max-width: 450px) {
      #alf-ai-chat-widget {
        left: 14px !important;
        right: 14px !important;
        bottom: 14px !important;
        top: auto !important;
      }
      .alf-ai-chat-window {
        width: auto !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 64px !important;
        height: auto !important;
        max-height: calc(100vh - 90px) !important;
      }
    }
  `;
  document.head.appendChild(style);

  // 2. Build Widget HTML Structure
  const widget = document.createElement('div');
  widget.id = 'alf-ai-chat-widget';
  widget.innerHTML = `
    <!-- Floating bubble -->
    <div class="alf-ai-chat-bubble" id="alfAiBubble" aria-label="Chat with AI Assistant">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </div>

    <!-- Chat Panel window -->
    <div class="alf-ai-chat-window" id="alfAiWindow">
      <!-- Header -->
      <div class="alf-ai-chat-header">
        <div class="alf-ai-chat-header-profile">
          <div class="alf-ai-chat-avatar">ALF</div>
          <div class="alf-ai-chat-title-info">
            <span class="alf-ai-chat-title">ALF AI Assistant</span>
            <span class="alf-ai-chat-status">Online</span>
          </div>
        </div>
        <button class="alf-ai-chat-close" id="alfAiClose" aria-label="Close Chat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Messages body -->
      <div class="alf-ai-chat-messages" id="alfAiMessages">
        <!-- Welcoming Message -->
        <div class="alf-ai-message incoming">
          <p>Hi there! I am the ALF AI Assistant. Ask me anything about The Awad Law Firm, our legal team, practice areas, or locations.</p>
          <div class="alf-ai-chips-container">
            <button class="alf-ai-chip" data-question="Who is Attorney Ibrahim Awad?">Who is Attorney Ibrahim Awad?</button>
            <button class="alf-ai-chip" data-question="What types of injury cases do you handle?">What types of injury cases do you handle?</button>
            <button class="alf-ai-chip" data-question="Where are your offices located?">Where are your offices located?</button>
            <button class="alf-ai-chip" data-question="How can I get a free case evaluation?">How can I get a free case evaluation?</button>
          </div>
        </div>
      </div>

      <!-- Footer input text area -->
      <div class="alf-ai-chat-input-area">
        <input type="text" class="alf-ai-chat-input" id="alfAiInput" placeholder="Ask a question..." autocomplete="off">
        <button class="alf-ai-chat-send" id="alfAiSend" aria-label="Send Message">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  `;
  document.documentElement.appendChild(widget);

  // 3. Select DOM Elements
  const bubble = document.getElementById('alfAiBubble');
  const windowEl = document.getElementById('alfAiWindow');
  const closeBtn = document.getElementById('alfAiClose');
  const messagesContainer = document.getElementById('alfAiMessages');
  const textInput = document.getElementById('alfAiInput');
  const sendBtn = document.getElementById('alfAiSend');

  let aiFacts = [];

  // Load Facts Dataset
  async function loadAiFacts() {
    try {
      const response = await fetch('/ai-site-facts.json');
      if (response.ok) {
        const data = await response.json();
        aiFacts = data.pages || [];
      }
    } catch (err) {
      console.warn("Could not load AI facts dataset:", err);
    }
  }
  loadAiFacts();

  // 4. Toggle Chat Window
  bubble.addEventListener('click', () => {
    windowEl.classList.toggle('open');
    if (windowEl.classList.contains('open')) {
      textInput.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    windowEl.classList.remove('open');
  });

  // 5. Chat Interaction Handlers
  function appendMessage(text, isOutgoing) {
    const bubbleMsg = document.createElement('div');
    bubbleMsg.className = `alf-ai-message ${isOutgoing ? 'outgoing' : 'incoming'}`;
    bubbleMsg.innerHTML = text;
    messagesContainer.appendChild(bubbleMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'alf-ai-typing';
    indicator.id = 'alfAiTyping';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideTypingIndicator() {
    const indicator = document.getElementById('alfAiTyping');
    if (indicator) indicator.remove();
  }

  // Answer matching engine (keyword/token based scoring)
  // Answer matching engine (keyword/token based scoring)
  function findBestResponse(userText) {
    if (!userText || !aiFacts.length) return null;

    // Clean and split user input into tokens
    const stopWords = new Set([
      'i', 'me', 'my', 'myself', 'we', 'us', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
      'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
      'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as',
      'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after',
      'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
      'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
      'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now',
      'need', 'get', 'got', 'give', 'tell', 'talk', 'ask', 'make', 'take', 'way', 'want', 'please', 'would', 'could', 'should'
    ]);
    const tokens = userText.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    if (tokens.length === 0) return null;

    let bestPage = null;
    let highestScore = 0;

    const escapeRegExp = (str) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    aiFacts.forEach(page => {
      let score = 0;
      const questionText = page.question.toLowerCase();
      const answerText = page.answer.toLowerCase();
      const titleText = page.title.toLowerCase();
      const intentText = page.intent ? page.intent.toLowerCase() : "";
      const topics = page.topics || [];

      tokens.forEach(token => {
        const escapedToken = escapeRegExp(token);
        const exactRegex = new RegExp('\\b' + escapedToken + '\\b', 'i');
        const prefixRegex = new RegExp('\\b' + escapedToken, 'i');

        // Boost matches in topics (highly specific)
        topics.forEach(topic => {
          const tLower = topic.toLowerCase();
          if (exactRegex.test(tLower)) score += 3.5;
          else if (prefixRegex.test(tLower)) score += 1.75;
        });

        // Matches in the core question text
        if (exactRegex.test(questionText)) score += 2.5;
        else if (prefixRegex.test(questionText)) score += 1.25;

        // Matches in the user intent
        if (exactRegex.test(intentText)) score += 2.0;
        else if (prefixRegex.test(intentText)) score += 1.0;

        // Matches in title
        if (exactRegex.test(titleText)) score += 1.0;
        else if (prefixRegex.test(titleText)) score += 0.5;

        // Matches in answer body
        if (exactRegex.test(answerText)) score += 0.5;
        else if (prefixRegex.test(answerText)) score += 0.25;
      });

      if (score > highestScore) {
        highestScore = score;
        bestPage = page;
      }
    });

    // We require a minimum score threshold to prevent false matches
    if (bestPage && highestScore >= 2.0) {
      return bestPage;
    }
    return null;
  }

  // Match conversational phrases
  function findConversationalResponse(userText) {
    if (!userText) return null;
    const cleaned = userText.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
    
    // 1. Greetings check
    const greetings = ['hello', 'hi', 'hey', 'yo', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    if (greetings.some(g => cleaned === g || cleaned.startsWith(g + ' '))) {
      return "Hello! How can I help you today? You can ask me about our practice areas, attorneys, locations, or reviews.";
    }

    // 2. Presence check ("are you there")
    if (cleaned === 'are you there' || cleaned === 'you there' || cleaned.includes('anyone there') || cleaned.includes('anyone here') || cleaned.includes('anybody here') || cleaned.includes('anybody there') || cleaned === 'hello there') {
      return "Yes, I am here and ready to help! What questions do you have about The Awad Law Firm or your case?";
    }

    // 3. Slang / Friendly chat check ("bro", "dude")
    if (cleaned === 'bro' || cleaned === 'dude' || cleaned === 'buddy' || cleaned === 'mate' || cleaned === 'yo' || cleaned.includes('whats up') || cleaned.includes('whatsup')) {
      return "Hey! How can I help you today? Feel free to ask about our legal team, office locations, or practice areas.";
    }

    // 4. General Help check ("can you help me", "help me", "i need help")
    if (cleaned === 'help' || cleaned === 'help me' || cleaned === 'can you help me' || cleaned === 'can you help' || cleaned === 'i need help' || cleaned === 'assist' || cleaned === 'assist me') {
      return "Yes, I can absolutely help you! The Awad Law Firm assists clients throughout Georgia with personal injury cases (including car/truck accidents, slip and falls, wrongful death, and medical malpractice). How can I assist you today? You can also call us 24/7 at <a href=\"tel:+17068900000\">(706) 890-0000</a>.";
    }

    // 5. Human Escalation check ("connect me with real person")
    const connectKeywords = ['connect', 'speak', 'talk', 'chat', 'call', 'contact', 'reach', 'get in touch'];
    const humanKeywords = ['person', 'perosn', 'human', 'live', 'someone', 'somebody', 'member', 'attorney', 'lawyer', 'team', 'real'];
    
    const wantsConnect = connectKeywords.some(kw => cleaned.includes(kw));
    const wantsHuman = humanKeywords.some(kw => cleaned.includes(kw));
    
    if ((wantsConnect && wantsHuman) || cleaned.includes('real person') || cleaned.includes('real perosn') || cleaned.includes('human') || cleaned.includes('live agent') || cleaned.includes('real human')) {
      return "I can certainly help connect you! While I am an AI assistant, you can connect with a real member of our team 24/7 by calling us at <a href=\"tel:+17068900000\">(706) 890-0000</a> or by submitting our <a href=\"/contact/\">Free Case Evaluation form</a>. If you'd like to browse our attorneys, you can check out our <a href=\"/team-members/\">Team Directory</a>.";
    }

    // 6. Identity check
    if (cleaned.includes('who are you') || cleaned.includes('what is your name') || cleaned.includes('whats your name') || cleaned.includes('your identity') || cleaned.includes('what do you call yourself') || cleaned.includes('call yourself') || cleaned.includes('who is this') || cleaned === 'what are you') {
      return "I am the ALF AI Assistant. I am here to help answer your questions about The Awad Law Firm, including our attorneys, locations, reviews, and practice areas.";
    }

    // 7. Thank you / Acknowledgment check
    if (cleaned.includes('thank you') || cleaned.startsWith('thanks') || cleaned === 'thank' || cleaned.includes('thankyou') || cleaned === 'great' || cleaned === 'awesome' || cleaned === 'cool' || cleaned === 'ok' || cleaned === 'okay') {
      return "You are very welcome! Let me know if you need help with anything else.";
    }

    // 8. General conversational complaint (catch-all)
    if (
      (cleaned.includes('talk') && cleaned.includes('properly')) ||
      (cleaned.includes('work') && cleaned.includes('properly')) ||
      (cleaned.includes('work') && cleaned.includes('naturally')) ||
      (cleaned.includes('talk') && cleaned.includes('naturally'))
    ) {
      return "I am a helpful AI assistant trained on facts about The Awad Law Firm. While I can't have general human conversations, I can answer anything about our legal team, practice areas, office locations, case results, and client reviews. Try asking a specific question like 'Who is Basher Hassan?' or 'Where is the Dalton office?'";
    }

    return null;
  }

  // Send message processing
  function processMessage(messageText) {
    if (!messageText.trim()) return;

    // Append user's outgoing message
    appendMessage(messageText, true);
    textInput.value = '';

    // Show AI typing simulation
    showTypingIndicator();

    setTimeout(() => {
      hideTypingIndicator();

      // Check for conversational greetings or general intents first
      const conversationalAnswer = findConversationalResponse(messageText);
      if (conversationalAnswer) {
        appendMessage(`<p>${conversationalAnswer}</p>`, false);
        return;
      }

      const matchedPage = findBestResponse(messageText);

      if (matchedPage) {
        let responseHtml = `<p>${matchedPage.answer}</p>`;
        
        // Clean canonical source title
        const cleanTitle = matchedPage.title.split('|')[0].trim();
        responseHtml += `<p style="font-size: 11.5px; margin-top: 8px; opacity: 0.85;">Source: <a href="${matchedPage.url}" target="_blank">${cleanTitle}</a></p>`;
        
        appendMessage(responseHtml, false);
      } else {
        // Fallback friendly default response containing main firm facts
        const fallbackHtml = `
          <p>I couldn't find a direct answer to that, but here are some details about the firm:</p>
          <ul style="margin: 6px 0 10px 0; padding-left: 20px; font-size: 13px;">
            <li><strong>Our Practice:</strong> The Awad Law Firm represents injured people in crashes (car, truck, motorcycle, bicycle, Uber/Lyft), slip & falls, wrongful death, and medical malpractice.</li>
            <li><strong>Locations:</strong> We serve clients throughout Georgia, with offices in <strong>Marietta</strong> and <strong>Dalton</strong>.</li>
            <li><strong>Consultation:</strong> You can contact our team 24/7 at <a href="tel:+17068900000">(706) 890-0000</a> or fill out our <a href="/contact/">Free Case Evaluation form</a>.</li>
          </ul>
          <p>Would you like to search our site or view all <a href="/team-members/">team members</a>?</p>
        `;
        appendMessage(fallbackHtml, false);
      }
    }, 900); // 900ms simulated thinking delay
  }

  // Bind enter key on input
  textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const msg = textInput.value;
      processMessage(msg);
    }
  });

  // Bind click on send button
  sendBtn.addEventListener('click', () => {
    const msg = textInput.value;
    processMessage(msg);
  });

  // Bind click on suggestion chips
  messagesContainer.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('alf-ai-chip')) {
      const q = e.target.getAttribute('data-question');
      processMessage(q);
      
      // Disable suggestion chips in the clicked welcoming block to keep timeline clean
      const container = e.target.parentNode;
      if (container) {
        container.style.opacity = '0.5';
        container.style.pointerEvents = 'none';
      }
    }
  });

})();
