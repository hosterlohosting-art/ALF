// Offline regression audit of every tracked public HTML form. No live leads sent.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const start = script.indexOf("form.addEventListener('submit', async function (event) {");
const end = script.indexOf('\n    });', start);
const handler = script.slice(start, end).trim();
const baselineScript = cp.execFileSync('git', ['show','HEAD:script.js'], {cwd:root,encoding:'utf8'});
const baselineStart = baselineScript.indexOf("form.addEventListener('submit', async function (event) {");
const baselineHandler = baselineScript.slice(baselineStart,baselineScript.indexOf('\n    });',baselineStart)).trim();
const files = cp.execFileSync('git', ['ls-files', '*.html'], { cwd: root, encoding: 'utf8' }).trim().split('\n');
const inventory = [];
const counts = {};

async function testForm(markup, file, index, category, email, baseline = false) {
  const dom = new JSDOM(markup, { url: 'https://theawadlawfirm.com/' + file, runScripts: 'outside-only' });
  const w = dom.window, form = w.document.querySelector('form');
  const requests = [], events = [], messages = [];
  w.form = form; w.isNewsletterForm = category === 'newsletter'; w.isCaseForm = category === 'case';
  w.showToast = (_title, message) => messages.push(message);
  w.AwadGetFormType = () => category;
  w.AwadTrackConversion = (name, data) => events.push({ name, data });
  w.console = { error: () => {}, warn: () => {} };
  w.setTimeout = fn => { fn(); return 0; };
  w.hcaptcha = { getResponse: () => 'mock-captcha', reset: () => {} };
  w.fetch = async (url, options) => { requests.push({ url, payload: JSON.parse(options.body) }); return { ok: true, status: 200, json: async () => ({ message: 'Accepted in mock', notificationDelivered: true }) }; };
  if (!form.querySelector('button')) { const b = w.document.createElement('button'); b.type = 'submit'; form.appendChild(b); }
  for (const input of form.querySelectorAll('input,textarea,select')) {
    if (input.type === 'hidden') continue;
    if (/_honey|_hp$|company_website/.test(input.name)) { input.value = ''; continue; }
    if (input.tagName === 'SELECT') { const option = [...input.options].find(o => o.value && !o.disabled); if (option) input.value = option.value; }
    else if (['checkbox','radio'].includes(input.type)) input.checked = true;
    else if (input.type === 'email' || input.name === 'email') input.value = email;
    else if (input.type === 'tel') input.value = '7068900000';
    else if (input.tagName === 'TEXTAREA' || input.name === 'message') input.value = 'Please contact me about my accident.';
    else if (input.required || /first|last|name/i.test(input.name)) input.value = 'Jane';
  }
  if (category === 'newsletter' && !form.querySelector('[name="newsletter_consent"]')) {
    const consent = w.document.createElement('input'); consent.type = 'checkbox'; consent.name = 'newsletter_consent'; consent.checked = true; form.appendChild(consent);
  }
  form.dataset.awadStartedAt = '1700000000000';
  w.eval(baseline ? baselineHandler : handler);
  form.dispatchEvent(new w.Event('submit', { cancelable: true }));
  await new Promise(resolve => setTimeout(resolve, 0));
  const blocked = email.toLowerCase().endsWith('@ultraleadgeneration.com');
  const label = `${file} form ${index} ${email}`;
  if (blocked) {
    assert.equal(requests.length, 0, label); assert.equal(events.length, 0, label);
    assert.equal(messages[0], 'Please use a different email address.', label);
  } else {
    assert.equal(requests.length, 1, label + ' ' + JSON.stringify(messages));
    assert.equal(requests[0].url, category === 'newsletter' ? '/api/newsletter/subscribe' : '/api/contact/submit', label);
    assert.equal(events.length, category === 'newsletter' ? 1 : 2, label);
    assert.deepEqual(events.map(e => e.name), category === 'newsletter' ? ['newsletter_subscription'] : ['form_submission','generate_lead'], label);
  }
  dom.window.close();
  return requests;
}

async function main() {
  for (const file of files) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    if (!/<form\b/i.test(html)) continue;
    const dom = new JSDOM(html);
    const forms = [...dom.window.document.querySelectorAll('form')];
    for (const [index, form] of forms.entries()) {
      const email = form.querySelector('input[type="email"],input[name="email"]');
      const category = file === 'chatgpt/index.html' ? 'external-worker' : form.classList.contains('newsletter-form') ? 'newsletter' : !email ? 'search' : 'case';
      const record = { file, index, category, id: form.id, classes: form.className, declaredAction: form.getAttribute('action'), emailField: email?.name || null };
      counts[category] = (counts[category] || 0) + 1;
      if (category === 'search') {
        assert.ok(form.getAttribute('role') === 'search' || form.classList.contains('nav-search') || /search/i.test(form.id) || /search/.test(form.getAttribute('action') || ''), `${file}: unclassified form without email`);
        record.status = 'No email collection or email/CRM delivery; search left unchanged';
      } else if (category === 'external-worker') {
        assert.ok(html.includes('endsWith("@ultraleadgeneration.com")'));
        record.status = 'Standalone handler tested by test-email-domain-block.cjs; external server restriction unverified';
      } else {
        assert.ok(html.includes('script.js'), file);
        for (const address of ['test@ultraleadgeneration.com','TEST@ULTRALEADGENERATION.COM','test@gmail.com','test@example.org']) {
          const requests = await testForm(form.outerHTML,file,index,category,address);
          if (!address.toLowerCase().endsWith('@ultraleadgeneration.com')) {
            const baselineRequests = await testForm(form.outerHTML,file,index,category,address,true);
            assert.deepEqual(JSON.parse(JSON.stringify(requests)),JSON.parse(JSON.stringify(baselineRequests)),file + ': legitimate payload changed');
            const payload = requests[0].payload;
            if (category === 'case') {
              record.missingPayloadFields = ['firstName','lastName','email','phone','message'].filter(key => !payload[key]);
              assert.deepEqual(record.missingPayloadFields, [], file + ': incomplete contact payload');
              const area = form.querySelector('select[name="practiceArea"]');
              if (area) assert.ok(payload.practiceArea, file + ': practice area not submitted');
            }
          }
        }
        record.status = 'PASS: lowercase/uppercase blocked; legitimate requests and conversion names match existing implementation with mocks';
      }
      inventory.push(record);
    }
    dom.window.close();
  }
  const report = { checkedAt: new Date().toISOString(), scope: 'All tracked public HTML pages, including English/Spanish and clean/legacy routes', pageCount: new Set(inventory.map(r => r.file)).size, formCount: inventory.length, counts, liveLeadsSent: false, externalWorkerServerSideProtection: 'Not verified; no source/account access', internalForms: 'CMS login, staff account management, content editing/restoration and uploads are authenticated administrative workflows, not lead/newsletter submissions; unchanged', forms: inventory };
  fs.writeFileSync(path.join(root,'scripts/form-domain-audit.json'), JSON.stringify(report,null,2) + '\n');
  console.log(JSON.stringify({pageCount:report.pageCount,formCount:report.formCount,counts,report:'scripts/form-domain-audit.json'},null,2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
