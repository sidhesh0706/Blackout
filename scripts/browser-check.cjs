// Optional browser QA. Set PLAYWRIGHT_MODULE to an installed Playwright package.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({headless:true, channel:process.env.BROWSER_CHANNEL || 'msedge'});
  const page = await browser.newPage({viewport:{width:1440,height:1050},reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8000');
  await page.waitForSelector('.identity-row');
  await page.evaluate(()=>document.fonts.ready);
  fs.mkdirSync('.impeccable/review',{recursive:true});
  async function capture(name){
    await page.locator('#toast').waitFor({state:'hidden'});
    await page.screenshot({path:`.impeccable/review/${name}.png`,fullPage:true});
  }
  await capture('desktop');
  await page.getByRole('button',{name:'Run verification',exact:true}).click();
  await page.waitForSelector('.verdict-panel.pass');
  await page.getByRole('button',{name:'Restore older backup'}).click();
  await page.waitForFunction(()=>document.querySelector('#phase-tag').textContent.includes('restored'));
  await page.getByRole('button',{name:'Run verification',exact:true}).click();
  await page.waitForSelector('.verdict-panel.fail');
  await capture('failure');
  await page.getByRole('button',{name:'Approve correction & retest'}).click();
  await page.waitForSelector('.verdict-panel.pass');
  await capture('pass');
  await page.getByRole('tab',{name:'Incident & requirements'}).click();
  await page.getByRole('button',{name:'Interpret & validate'}).click();
  await page.waitForFunction(()=>document.querySelector('#extraction-result').textContent.includes('Requirement accepted'));
  await capture('evidence');
  await page.getByRole('tab',{name:'Challenge lab'}).click();
  await page.getByRole('button',{name:'Run all 8 scenarios'}).click();
  await page.waitForFunction(()=>document.querySelector('#suite-summary').textContent.includes('8 / 8'),{timeout:30000});
  await capture('challenges');
  await page.getByRole('tab',{name:'Recovery workspace'}).click();
  await page.getByRole('button',{name:'Reset lab'}).click();
  await page.waitForFunction(()=>document.querySelector('#run-id').textContent==='AWAITING RUN');
  await page.setViewportSize({width:390,height:844});
  await capture('mobile');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  console.log(JSON.stringify({errors,mobileOverflow:overflow,flow:'PASS → FAIL → PASS',challengeSuite:'8/8',font:await page.evaluate(()=>document.fonts.check('14px Manrope'))}));
  await browser.close();
  if(errors.length||overflow)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1);});
