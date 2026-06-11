const { chromium } = require('/opt/node22/lib/node_modules/playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: '/tmp/webrec', size: { width: 1920, height: 1080 } },
  });
  const page = await ctx.newPage();

  // visible cursor that follows real mouse events
  await page.addInitScript(() => {
    addEventListener('DOMContentLoaded', () => {
      const c = document.createElement('div');
      c.id = 'fcur';
      c.style.cssText = `position:fixed;left:0;top:0;width:26px;height:26px;border-radius:50%;
        border:2.5px solid #fff;background:rgba(255,255,255,.25);box-shadow:0 0 14px rgba(0,224,255,.9),0 2px 8px rgba(0,0,0,.6);
        pointer-events:none;z-index:99999;transform:translate(-50%,-50%);transition:width .12s,height .12s`;
      document.body.appendChild(c);
      addEventListener('mousemove', e => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
      addEventListener('mousedown', () => { c.style.width = '18px'; c.style.height = '18px';
        const r = document.createElement('div');
        r.style.cssText = `position:fixed;left:${c.style.left};top:${c.style.top};width:26px;height:26px;border-radius:50%;
          border:2px solid #00e0ff;pointer-events:none;z-index:99998;transform:translate(-50%,-50%);
          transition:all .5s ease-out;opacity:1`;
        document.body.appendChild(r);
        requestAnimationFrame(() => { r.style.width = '90px'; r.style.height = '90px'; r.style.opacity = '0'; });
        setTimeout(() => r.remove(), 600);
      }, true);
      addEventListener('mouseup', () => { c.style.width = '26px'; c.style.height = '26px'; }, true);
    });
  });

  await page.goto('file:///home/user/App-UI/webapp/index.html');
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(960, 540, { steps: 5 });
  await page.waitForTimeout(1800);

  const moveClick = async (sel, holdMs = 600) => {
    const el = page.locator(sel).first();
    const box = await el.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 45 });
    await page.waitForTimeout(holdMs);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
  };

  // 1. dashboard: hover a recent tile, then CTA
  const t1 = await page.locator('#screen-dash .tile').nth(1).boundingBox();
  await page.mouse.move(t1.x + t1.width / 2, t1.y + 80, { steps: 50 });
  await page.waitForTimeout(900);
  await moveClick('#screen-dash .cta', 700);
  await page.waitForTimeout(1100);

  // 2. create: click prompt, type, pick style, generate
  await moveClick('#prompt', 450);
  await page.type('#prompt', 'chrome hex cube slowly rotating, neon cyan and magenta light trails', { delay: 34 });
  await page.waitForTimeout(500);
  await moveClick('.chip:nth-child(4)', 550);   // Liquid Chrome
  await page.waitForTimeout(450);
  await moveClick('#gen', 700);

  // 3. generating plays ~3.6s then auto-advances
  await page.waitForTimeout(4400);

  // 4. preview: admire, then cast
  await page.mouse.move(700, 600, { steps: 40 });
  await page.waitForTimeout(1300);
  await moveClick('#cast', 650);
  await page.waitForTimeout(2400);

  // 5. library: sidebar nav, sweep across tiles
  await moveClick('.nbtn[data-go="screen-library"]', 600);
  await page.waitForTimeout(800);
  const g1 = await page.locator('#screen-library .tile').nth(1).boundingBox();
  await page.mouse.move(g1.x + 120, g1.y + 90, { steps: 45 });
  await page.waitForTimeout(700);
  const g2 = await page.locator('#screen-library .tile').nth(6).boundingBox();
  await page.mouse.move(g2.x + 120, g2.y + 90, { steps: 55 });
  await page.waitForTimeout(1200);

  await ctx.close();
  const v = await page.video().path();
  console.log('video at', v);
  await browser.close();
})();
