const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
function functionSource(name) {
  const start = server.search(new RegExp('(?:async )?function ' + name + '\\('));
  const end = server.indexOf('\n}', start) + 2;
  assert.ok(start >= 0 && end > start);
  return server.slice(start, end);
}
async function backend() {
  for (const email of ['test@ultraleadgeneration.com', 'TEST@ULTRALEADGENERATION.COM', ' Test@UltraLeadGeneration.Com ', 'test@ultraleadgeneration.com\0', 'test@ultralead\0generation.com', 'test@gmail.com', 'test@example.org', 'test@notultraleadgeneration.com']) {
    const blocked = email.replace(/\0/g, '').trim().toLowerCase().endsWith('@ultraleadgeneration.com');
    const calls = [];
    const body = {firstName:'Jane',lastName:'Smith',email,phone:'+17068900000',message:'Please contact me about my accident.',consent:true,formStartedAt:Date.now()-10000};
    const context = vm.createContext({
      console, Date, Number, String, Boolean, Promise,
      isBlockedIp:()=>false,isRateLimited:()=>false,securityLog:()=>{},clientIp:()=>'',
      readBody:async()=>JSON.stringify(body),sendJson:(_req,status,payload)=>({status,payload}),
      contactField:(b,names,max)=>String(b[names.find(n=>b[n]!==undefined)]||'').trim().slice(0,max),
      verifyHcaptcha:async()=>{calls.push('captcha');return {success:true};},
      looksLikeAutomatedLead:()=>false,
      sendSalesforceLead:async lead=>calls.push(['crm',lead.email]),
      sendWeb3FormsNotification:async lead=>calls.push(['email',lead.email]),
      saveSubscriber:async record=>calls.push(['subscriber',record.email])
    });
    vm.runInContext(['isBlockedEmail','isValidEmail','submitContact','subscribe'].map(functionSource).join('\n'),context);
    const result = await context.submitContact({},{});
    assert.equal(result.status,blocked?400:200,email);
    if(blocked){assert.equal(result.payload.message,'Please use a different email address.');assert.equal(calls.length,0);}
    else {assert.ok(calls.some(c=>c[0]==='crm'));assert.ok(calls.some(c=>c[0]==='email'));}
    calls.length=0;
    const subscription=await context.subscribe({},{});
    assert.equal(subscription.status,blocked?400:200);
    assert.equal(calls.length,blocked?0:1);
  }
}
async function frontend() {
  const {JSDOM}=require('jsdom');
  const script=fs.readFileSync(path.join(root,'script.js'),'utf8');
  const start=script.indexOf("form.addEventListener('submit', async function (event) {");
  const end=script.indexOf('var isValid = true;',start);
  const guard=script.slice(start,end)+"});";
  for(const email of ['test@ultraleadgeneration.com','TEST@ULTRALEADGENERATION.COM','test@gmail.com','test@example.org']){
    const dom=new JSDOM('<form><input type="email" name="email"><button>Send</button></form>',{runScripts:'outside-only'});
    const w=dom.window;const form=w.document.querySelector('form');const messages=[];
    w.form=form;w.showToast=(_title,message)=>messages.push(message);
    w.eval(guard);form.elements.email.value=email;form.dispatchEvent(new w.Event('submit',{cancelable:true}));
    assert.equal(messages.length,email.toLowerCase().endsWith('@ultraleadgeneration.com')?1:0);
    if(messages.length)assert.equal(messages[0],'Please use a different email address.');
    dom.window.close();
    const html=fs.readFileSync(path.join(root,'chatgpt/index.html'),'utf8');
    let fetches=0,conversions=0;
    const chat=new JSDOM(html,{url:'https://theawadlawfirm.com/chatgpt/',runScripts:'dangerously',beforeParse(c){
      c.HTMLElement.prototype.scrollIntoView=()=>{};c.turnstile={render:()=>0};
      c.navigator.sendBeacon=()=>true;c.fetch=()=>{fetches++;return Promise.resolve({ok:true,json:async()=>({ok:true})});};
      c.AbortController=AbortController;
    }});
    const c=chat.window,d=c.document;c.gtag=()=>conversions++;
    for(const [id,value] of Object.entries({lesiones_del_accidente:'inj_yes_doctor',cuando_ocurrio_el_accidente:'when_30d',tiene_abogado:'no',quien_recibio_la_multa:'ticket_other'})){d.getElementById(id).value=value;d.getElementById(id).dispatchEvent(new c.Event('change'));}
    for(const [id,value] of Object.entries({first_name:'Jane',last_name:'Smith',phone_number:'7068900000',email}))d.getElementById(id).value=value;
    d.getElementById('consent').checked=true;d.getElementById('leadForm').dispatchEvent(new c.Event('submit',{cancelable:true}));
    await new Promise(r=>setTimeout(r,10));
    const blocked=email.toLowerCase().endsWith('@ultraleadgeneration.com');
    assert.equal(fetches,blocked?0:1);if(blocked){assert.equal(conversions,0);assert.equal(d.getElementById('formStatus').textContent,'Please use a different email address.');}
    else assert.equal(d.getElementById('success').style.display,'block');
    chat.window.close();
  }
}
async function sharedSubmissionRegression() {
  const {JSDOM}=require('jsdom');
  const script=fs.readFileSync(path.join(root,'script.js'),'utf8');
  const start=script.indexOf("form.addEventListener('submit', async function (event) {");
  const end=script.indexOf('\n    });',start);
  const handler=script.slice(start,end).trim();
  for (const scenario of [
    {email:'TEST@ULTRALEADGENERATION.COM',status:200,fetches:0,events:0},
    {email:'test@gmail.com',status:200,fetches:1,events:2},
    {email:'test@example.org',status:202,fetches:1,events:2},
    {email:'test@gmail.com',status:400,fetches:1,events:0},
    {email:'test@gmail.com',status:502,fetches:1,events:0}
  ]) {
    const dom=new JSDOM('<form class="contact-form"><input name="firstName" value="Jane" required><input name="lastName" value="Smith" required><input type="email" name="email" required><input type="tel" name="phone" value="7068900000" required><textarea name="message" required>Please contact me about my accident.</textarea><button type="submit">Send</button></form>',{url:'https://theawadlawfirm.com/contact/',runScripts:'outside-only'});
    const w=dom.window,form=w.document.querySelector('form'),events=[],requests=[],messages=[];
    form.elements.email.value=scenario.email;
    w.form=form;w.isCaseForm=true;w.isNewsletterForm=false;
    w.showToast=(_title,message)=>messages.push(message);
    w.AwadGetFormType=()=> 'Contact Form';
    w.AwadTrackConversion=(name,data)=>events.push({name,data});
    w.fetch=async(url,options)=>{requests.push({url,payload:JSON.parse(options.body)});return {ok:scenario.status<300,status:scenario.status,json:async()=>({message:scenario.status===400?'Please use a different email address.':'Test result',notificationDelivered:scenario.status!==202})};};
    w.console={error:()=>{},warn:()=>{}};
    w.setTimeout=fn=>{fn();return 0;};
    w.eval(handler);
    form.dispatchEvent(new w.Event('submit',{cancelable:true}));
    await new Promise(r=>setTimeout(r,20));
    assert.equal(requests.length,scenario.fetches,JSON.stringify(scenario));
    assert.equal(events.length,scenario.events,JSON.stringify(scenario));
    if(events.length){assert.deepEqual(events.map(e=>e.name),['form_submission','generate_lead']);assert.equal(events[0].data.form_category,'case_lead');assert.equal(events[1].data.lead_source,'website_form');}
    if(requests.length){assert.equal(requests[0].url,'/api/contact/submit');assert.equal(requests[0].payload.email,scenario.email);assert.equal(requests[0].payload.phone,'+17068900000');}
    assert.equal(form.querySelector('button').disabled,false);
    if(scenario.fetches===0)assert.equal(messages[0],'Please use a different email address.');
    dom.window.close();
  }
}
backend().then(frontend).then(sharedSubmissionRegression).then(()=>console.log('PASS: mixed-case domain blocking; legitimate email/CRM forwarding; full shared submit flow; unchanged event names/payloads on 200/202; zero success events on rejection/502; standalone form and newsletter. Integrations mocked, no live leads sent.')).catch(e=>{console.error(e);process.exitCode=1;});
