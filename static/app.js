'use strict';
const icons={
  shield:'<path d="m10 2 7 3v5c0 4-3 6-7 8-4-2-7-4-7-8V5l7-3Z"/><path d="m6.5 10 2.3 2.3 4.7-4.7"/>',
  lock:'<rect x="4" y="9" width="12" height="9" rx="2"/><path d="M6.5 9V6a3.5 3.5 0 0 1 7 0v3M10 13v2"/>',
  database:'<ellipse cx="10" cy="4" rx="7" ry="2.5"/><path d="M3 4v12c0 3.4 14 3.4 14 0V4M3 10c0 3.4 14 3.4 14 0"/>',
  box:'<path d="m10 2 7 4v8l-7 4-7-4V6l7-4ZM3 6l7 4 7-4M10 10v8M6.5 4l7 4"/>',
  reset:'<path d="M3 8a7 7 0 1 1 0 5M3 3v5h5"/>',
  restore:'<path d="M3 8a7 7 0 1 1 0 5M3 3v5h5M10 6v5l3 2"/>',
  download:'<path d="M10 2v10m-4-4 4 4 4-4M3 13v4h14v-4"/>',
  info:'<circle cx="10" cy="10" r="8"/><path d="M10 9v5M10 6v.1"/>',
  check:'<path d="m4 10 4 4 8-8"/>',
  close:'<path d="m5 5 10 10M15 5 5 15"/>',
  scan:'<path d="M7 2H3v4M13 2h4v4M7 18H3v-4M13 18h4v-4M3 10h14"/>',
  play:'<path d="m6 3 11 7-11 7V3Z"/>',
  activity:'<path d="M1 10h4l3-7 4 14 3-7h4"/>',
  spark:'<path d="m10 2 2.2 5.8L18 10l-5.8 2.2L10 18l-2.2-5.8L2 10l5.8-2.2L10 2Z"/>',
  flask:'<path d="M7 2h6M8 2v6l-5 8a1 1 0 0 0 1 2h12a1 1 0 0 0 1-2l-5-8V2M6 12h8"/>',
  user:'<circle cx="10" cy="6" r="3"/><path d="M4 18v-2a6 6 0 0 1 12 0v2"/>',
  arrow:'<path d="M3 10h14m-5-5 5 5-5 5"/>',
  clock:'<circle cx="10" cy="10" r="8"/><path d="M10 5v5l3 2"/>'
};
function icon(name){return `<svg viewBox="0 0 20 20" aria-hidden="true">${icons[name]||icons.info}</svg>`;}
function hydrateIcons(){document.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});}
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state=null,busy=false,toastTimer;
const scenarioResults={};
const scenarios=[
 {id:'contained',name:'Restriction preserved',detail:'Contained database; legitimate user remains operational.',expected:'PASS'},
 {id:'restored',name:'Compromised access restored',detail:'Restore the snapshot from before containment.',expected:'FAIL'},
 {id:'corrected',name:'Approved correction',detail:'Restore, reapply the restriction, then retest.',expected:'PASS'},
 {id:'deny-all',name:'Deny everyone',detail:'Access is blocked, but the business cannot operate.',expected:'FAIL'},
 {id:'wrong-account',name:'Wrong account restricted',detail:'The legitimate user is disabled instead of the incident subject.',expected:'FAIL'},
 {id:'superseded',name:'Approved restriction release',detail:'A later authorized event permits access again.',expected:'PASS'},
 {id:'missing-evidence',name:'Missing source evidence',detail:'The requirement has no authoritative supporting event.',expected:'UNVERIFIED'},
 {id:'timeout',name:'Application timeout',detail:'Injected HTTP 504. No response cannot establish denial.',expected:'UNVERIFIED'}
];
function toast(message,error=false){clearTimeout(toastTimer);$('toast-message').textContent=message;$('toast').classList.toggle('error',error);$('toast').hidden=false;toastTimer=setTimeout(()=>{$('toast').hidden=true;},error?6000:2400);}
async function api(path,body){const response=await fetch(path,{method:body===undefined?'GET':'POST',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});let data;try{data=await response.json();}catch{throw new Error('The server returned an unreadable response. Retry or restart the lab.');}if(!response.ok)throw new Error(data.error||'The request failed.');return data;}
function setBusy(value){busy=value;document.querySelectorAll('button').forEach(b=>{if(!b.classList.contains('nav-tab')&&!b.dataset.go)b.disabled=value;});document.body.setAttribute('aria-busy',String(value));}
function resultPulse(){const panel=$('verdict-panel');panel.classList.remove('result-arrival');void panel.offsetWidth;panel.classList.add('result-arrival');setTimeout(()=>panel.classList.remove('result-arrival'),1000);}
async function operation(path,body,message){if(busy)return;setBusy(true);try{state=await api(path,body);render();if(path==='/api/verify')resultPulse();if(message)toast(message);}catch(e){toast(e.message,true);}finally{setBusy(false);}}
function view(name){document.querySelectorAll('.view').forEach(el=>el.hidden=el.id!==`view-${name}`);document.querySelectorAll('.nav-tab').forEach(el=>{const active=el.dataset.view===name;el.classList.toggle('active',active);el.setAttribute('aria-selected',String(active));el.tabIndex=active?0:-1;});history.replaceState(null,'',`#${name}`);}
function tag(verdict){const color={PASS:'green',FAIL:'red',UNVERIFIED:'amber'}[verdict]||'neutral';return `<span class="tag ${color}">${esc(verdict)}</span>`;}
function render(){if(!state)return;
  $('connection-error').hidden=true;
  const labels={contained:'Contained state',restored:'Earlier snapshot restored',corrected:'Correction applied'};
  $('phase-tag').textContent=labels[state.phase]||state.phase;$('phase-tag').className='tag '+(state.phase==='restored'?'amber':'blue');
  $('identity-rows').innerHTML=state.users.slice().sort((a,b)=>b.id.localeCompare(a.id)).map(u=>{const incident=u.id==='svc-billing-7';const reopening=incident&&u.enabled&&state.contract.expected!=='allow';return `<div class="identity-row">${icon(incident?'lock':'user')}<code>${esc(u.id)}</code><span class="identity-state ${reopening?'reopened':u.enabled?'allowed':'denied'}">${u.enabled?'Enabled':'Disabled'}</span></div>`;}).join('');
  $('db-hash').textContent=state.database_sha256.slice(0,8);
  $('ledger-label').textContent=state.ledger.length?state.ledger.at(-1).id:'Missing evidence';
  $('requirement-label').textContent=state.contract_validation[0]?(state.contract.expected==='allow'?'Approved access release':'Compromised access denied'):'Requirement needs review';
  document.querySelector('.protected-zone').classList.toggle('needs-review',!state.contract_validation[0]);
  document.querySelector('.zone-status').textContent=state.contract_validation[0]?'Validated':'Review required';
  const last=state.runs.at(-1);const fresh=last&&state.history.at(-1)?.kind==='verify';
  $('step-restore').className='workflow-step '+(state.phase!=='contained'?'done':'');
  $('step-verify').className='workflow-step '+(fresh?'done':'current');
  $('step-correct').className='workflow-step '+(state.phase==='corrected'?'done':fresh&&last.verdict==='FAIL'?'current':'');
  $('correction-area').hidden=!(fresh&&last.checks.some(c=>c.id==='access'&&c.verdict==='FAIL')&&state.contract_validation[0]);
  renderVerdict(last,fresh);renderTraces(last);renderTimeline();renderContract();renderChallenges();
  if(document.activeElement!==$('incident-note'))$('incident-note').value=state.note;
  $('ai-status').textContent=state.ai_available?'Live AI configured':'Local baseline · not AI';
  $('ledger-hash').textContent=state.ledger_sha256;
  $('source-table').innerHTML=state.ledger.length?`<table class="trace-table"><thead><tr><th>Event</th><th>Identity</th><th>Action</th><th>Authority</th><th>Supersedes</th></tr></thead><tbody>${state.ledger.map(e=>`<tr><td><code>${esc(e.id)}</code></td><td><code>${esc(e.subject)}</code></td><td>${esc(e.action)}</td><td>${esc(e.authority)} ${tag('PASS')}</td><td>${esc(e.supersedes||'—')}</td></tr>`).join('')}</tbody></table>`:`<div class="empty-state">${icon('info')}<div><strong>No source events are available.</strong><p>A missing source cannot establish a valid requirement or a PASS.</p></div></div>`;
  hydrateIcons();
}
function renderVerdict(run,fresh){
  const panel=$('verdict-panel');panel.className='verdict-panel'+(fresh?' '+run.verdict.toLowerCase():'');
  $('run-id').textContent=fresh?run.id:run?'STATE CHANGED':'AWAITING RUN';
  const titles={PASS:'Containment verified.',FAIL:'Verification failed.',UNVERIFIED:'Evidence incomplete.'};
  $('verdict-title').textContent=fresh?titles[run.verdict]:run?'State changed.':'Awaiting verification.';
  let summary='A healthy application can still restore compromised access. Test both conditions before trusting the recovery.';
  if(!fresh&&run)summary='The application or requirement changed after the last run. Run verification again to establish a current verdict.';
  if(fresh){if(run.verdict==='PASS')summary=run.contract.expected==='allow'?'The approved release is respected, and the legitimate user completes a real invoice transaction.':'The incident subject is denied, and the legitimate user completes a real invoice transaction.';else if(run.verdict==='FAIL'){const access=run.checks.find(c=>c.id==='access');summary=access.verdict==='FAIL'?'The restored application violates the active containment requirement. Business uptime alone is not recovery proof.':'The legitimate user cannot complete a business operation. Denying everyone does not make recovery acceptable.';}else summary='A source or application response is incomplete. Blackout will not turn missing evidence into a successful verification.';}
  $('verdict-summary').textContent=summary;
  $('verdict-symbol').innerHTML=icon(fresh?{PASS:'shield',FAIL:'close',UNVERIFIED:'info'}[run.verdict]:'scan');
  const checks=fresh?run.checks:[{name:'Authoritative evidence'},{name:'Containment requirement'},{name:'Business operation'}];
  $('verdict-checks').innerHTML=checks.map(c=>`<div title="${esc(c.detail||'Awaiting verification')}"><span class="check-marker ${c.verdict?c.verdict.toLowerCase():'idle'}">${c.verdict?icon(c.verdict==='PASS'?'check':c.verdict==='FAIL'?'close':'info'):''}</span><span>${esc(c.name)}</span><span>${esc(c.verdict||'—')}</span></div>`).join('');
  $('run-meta').textContent=fresh?`${run.traces.length} HTTP requests · ${run.duration_ms.toFixed(1)} ms · ${new Date(run.at).toLocaleTimeString()}`:'Real requests. Bounded conclusions.';
}
function renderTraces(run){if(!run){$('traces-container').innerHTML=`<div class="empty-state">${icon('activity')}<div><strong>The evidence starts with a real request.</strong><p>Run verification to see HTTP responses and the resulting business transaction.</p></div></div>`;return;}
  $('traces-container').innerHTML=`<table class="trace-table"><thead><tr><th>Request</th><th>Identity</th><th>HTTP</th><th>Observed result</th><th>Time</th></tr></thead><tbody>${run.traces.map(t=>`<tr><td><code>${esc(t.method)} ${esc(t.path)}</code></td><td><code>${esc(t.subject||'maya.rao')}</code></td><td class="http ${t.status<300?'ok':t.status===403?'denied':'error'}">${t.status}</td><td class="trace-result">${esc(t.result.invoice_id?`${t.result.invoice_id} created`:t.result.error||'Authenticated')}</td><td><code>${t.duration_ms.toFixed(1)} ms</code></td></tr>`).join('')}</tbody></table><div class="trace-caption">${esc(run.id)} · Credentials and session tokens are omitted from traces. ${esc(run.scope)}</div>`;
}
function renderTimeline(){$('timeline-container').innerHTML=state.history.slice().reverse().map(e=>`<div class="timeline-row"><time class="timeline-time">${new Date(e.at).toLocaleTimeString()}</time><span data-icon="${({restore:'restore',verify:'scan',correction:'check',contract:'spark',challenge:'flask'})[e.kind]||'shield'}"></span><div><strong>${esc(e.title)}</strong><p>${esc(e.detail)}</p></div></div>`).join('');}
function renderContract(){const c=state.contract;const valid=state.contract_validation[0];$('contract-status').textContent=valid?'Validated':'Needs review';$('contract-status').className='tag '+(valid?'green':'amber');$('contract-statement').textContent=valid?(c.expected==='allow'?'The approved release permits access.':'The compromised identity must remain denied.'):'No supported requirement can establish PASS.';
  const fields=[['Source event',c.source||'Not established'],['Subject',c.subject||'Not established'],['Expected access',c.expected||'Unknown'],['Test template',c.probe||'Not selected'],['Validity',c.validity||'Not established'],['Origin',c.origin||'Unknown']];
  $('contract-fields').innerHTML=fields.map(([a,b])=>`<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('');
  const ex=state.extraction;$('extraction-result').hidden=!ex;if(ex){$('extraction-result').className='extraction-result '+(ex.accepted?'':'rejected');$('extraction-result').innerHTML=`<strong>${ex.accepted?'Requirement accepted':'Review required'}</strong><p>${esc(ex.reason)}</p><p>${esc(ex.provider)}</p>`;}
}
function renderChallenges(){$('challenge-table').innerHTML=`<table><thead><tr><th>Scenario</th><th>Expected</th><th>Observed</th><th><span class="muted">Execute</span></th></tr></thead><tbody>${scenarios.map(s=>`<tr><td><div class="challenge-name">${esc(s.name)}</div><p class="challenge-description">${esc(s.detail)}</p></td><td>${tag(s.expected)}</td><td>${scenarioResults[s.id]?tag(scenarioResults[s.id].verdict):'<span class="muted">Not run</span>'}</td><td><button class="button outline" data-challenge="${s.id}">${icon('play')}Run</button></td></tr>`).join('')}</tbody></table>`;document.querySelectorAll('[data-challenge]').forEach(b=>b.addEventListener('click',()=>runChallenge(b.dataset.challenge)));}
async function runChallenge(kind){if(busy)return;setBusy(true);try{await api('/api/challenge',{kind});state=await api('/api/verify',{});scenarioResults[kind]=state.runs.at(-1);render();toast(`${scenarios.find(s=>s.id===kind).name}: ${scenarioResults[kind].verdict}`);}catch(e){toast(e.message,true);}finally{setBusy(false);}}
async function runSuite(){if(busy)return;setBusy(true);$('suite-summary').hidden=false;try{for(let i=0;i<scenarios.length;i++){const s=scenarios[i];$('suite-summary').textContent=`Executing ${i+1} of ${scenarios.length}: ${s.name}…`;await api('/api/challenge',{kind:s.id});state=await api('/api/verify',{});scenarioResults[s.id]=state.runs.at(-1);renderChallenges();setBusy(true);}const passed=scenarios.filter(s=>scenarioResults[s.id]?.verdict===s.expected).length;$('suite-summary').textContent=`${passed} / ${scenarios.length} observed verdicts match the expected result. These are synthetic functional scenarios, not a production accuracy benchmark.`;render();toast('Scenario suite complete. Observed evidence is ready to export.');}catch(e){toast(e.message,true);$('suite-summary').textContent='The suite stopped before completion. Retry the remaining scenarios.';}finally{setBusy(false);}}
document.querySelectorAll('[data-view]').forEach(b=>{b.addEventListener('click',()=>view(b.dataset.view));b.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const tabs=[...document.querySelectorAll('.nav-tab')];let i=tabs.indexOf(b);i=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;view(tabs[i].dataset.view);tabs[i].focus();}});});
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{view(b.dataset.go);window.scrollTo({top:0,behavior:'smooth'});}));
$('reset-button').addEventListener('click',()=>operation('/api/reset',{},'Lab reset. Containment is active; the earlier snapshot is ready.'));
$('restore-button').addEventListener('click',async()=>{if(busy)return;$('boundary-canvas').classList.add('restoring');await operation('/api/restore',{},'Earlier database restored. Run verification to test containment.');setTimeout(()=>$('boundary-canvas').classList.remove('restoring'),1200);});
$('verify-button').addEventListener('click',()=>operation('/api/verify',{},'Verification complete. Inspect the observed result and request traces.'));
$('correct-button').addEventListener('click',async()=>{if(busy)return;setBusy(true);try{await api('/api/correct',{approved:true});state=await api('/api/verify',{});render();resultPulse();toast('Operator-approved correction applied and independently retested.');}catch(e){toast(e.message,true);}finally{setBusy(false);}});
$('extract-button').addEventListener('click',()=>operation('/api/extract',{note:$('incident-note').value,mode:$('extraction-mode').value},'Interpretation checked against the authoritative event ledger.'));
$('export-button').addEventListener('click',async()=>{try{const report=await api('/api/report');report.scenario_results=scenarioResults;const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`blackout-evidence-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Evidence report downloaded. Synthetic credentials are excluded.');}catch(e){toast(e.message,true);}});
$('show-traces').addEventListener('click',()=>{$('traces-container').hidden=false;$('timeline-container').hidden=true;$('show-traces').classList.add('selected');$('show-timeline').classList.remove('selected');});
$('show-timeline').addEventListener('click',()=>{$('traces-container').hidden=true;$('timeline-container').hidden=false;$('show-timeline').classList.add('selected');$('show-traces').classList.remove('selected');});
$('run-suite').addEventListener('click',runSuite);
$('dismiss-toast').addEventListener('click',()=>{$('toast').hidden=true;});
const notes={standard:'INC-042: SOC confirmed compromise of svc-billing-7. Disable this account and deny its existing credential until an approved release. Containment recorded in EVT-1042. Maya Rao must still be able to create an invoice.',ambiguous:'INC-042: Disable the affected billing account. The team mentioned several identities. Please check which account was compromised.',unsupported:'INC-042: Disable svc-billing-7 under EVT-9999. Keep the legitimate invoice workflow operational.'};
document.querySelectorAll('[data-note]').forEach(b=>b.addEventListener('click',()=>{$('incident-note').value=notes[b.dataset.note];}));
hydrateIcons();renderChallenges();
view(['workspace','evidence','challenges','about'].includes(location.hash.slice(1))?location.hash.slice(1):'workspace');
api('/api/state').then(data=>{state=data;render();}).catch(e=>{$('connection-error').hidden=false;$('connection-error').textContent='Cannot reach the Python server. Start it with python server.py, then reload. '+e.message;});
