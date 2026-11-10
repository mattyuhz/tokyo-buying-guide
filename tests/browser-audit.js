// Run with the Playwright browser_run_code tool (filename), in an isolated context.
// This exercises browser events without modifying the user's saved guide state.
async (page) => {
  let checks = 0;
  const assert = (value, message) => { if (!value) throw Error(message); checks++; };
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:8765/');
  await page.evaluate(() => { localStorage.clear(); });
  await page.reload();
  checks += await page.evaluate(() => {
    let n = 0;
    const assert = (v, m) => { if (!v) throw Error(m); n++; };
    const click = selector => document.querySelector(selector).click();
    const visibleCards = () => [...document.querySelectorAll('.card:not(.hidden)')];
    click('.nov-scope[data-scope="all"]');
    click('[data-view="got"]');
    for (const button of document.querySelectorAll('.cbv-square')) {
      button.click(); assert(button.classList.contains('checked'), `save ${button.dataset.checkId}`);
      button.click(); assert(!button.classList.contains('checked'), `unsave ${button.dataset.checkId}`);
    }
    click('[data-view="want"]');
    for (const button of document.querySelectorAll('.got-btn')) {
      button.click(); assert(button.classList.contains('done'), `visit ${button.dataset.gotId}`);
      button.click(); assert(!button.classList.contains('done'), `unvisit ${button.dataset.gotId}`);
    }
    click('[data-view="all"]');
    click('.nov-scope[data-scope="november"]');
    const ids = new Set([...document.querySelectorAll('.nov-item .item-check')].map(b => b.dataset.checkId));
    assert(ids.size === 60, '60 actionable pickups; owned jacket has no purchase toggle');
    for (const id of ids) {
      const selector = `.nov-item [data-check-id="${id}"]`;
      click(selector);
      assert([...document.querySelectorAll(`[data-check-id="${id}"]`)].every(b => b.classList.contains('checked')), `shared pickup state ${id}`);
      click('[data-view="got"]');
      assert(visibleCards().some(c => c.querySelector(selector)), `purchased view ${id}`);
      click(selector); click('[data-view="all"]');
    }
    for (const button of document.querySelectorAll('.items-toggle')) {
      const section = button.closest('.items-section');
      const before = section.classList.contains('open');
      button.click(); assert(section.classList.contains('open') !== before, 'collapse section'); button.click();
    }
    for (const axis of ['n', 'c']) {
      for (const button of document.querySelectorAll(`.pill[data-axis="${axis}"]`)) {
        button.click();
        const key = axis === 'n' ? 'neighborhood' : 'category';
        assert(visibleCards().every(c => ['anywhere', 'anything'].includes(button.dataset.val) || c.dataset[key] === button.dataset.val), `filter ${button.dataset.val}`);
        if (!['anywhere', 'anything'].includes(button.dataset.val)) button.click();
      }
    }
    click('.nov-scope[data-scope="original"]'); assert(visibleCards().length === 73, 'original scope');
    click('.nov-scope[data-scope="all"]'); assert(visibleCards().length === 90, 'combined scope');
    click('.nov-scope[data-scope="november"]');
    for (const button of document.querySelectorAll('.nov-kind')) {
      button.click();
      assert([...document.querySelectorAll('.nov-item:not([hidden])')].every(r => button.dataset.kind === 'all' || r.dataset.kind === button.dataset.kind), `pickup kind ${button.dataset.kind}`);
    }
    click('.nov-kind[data-kind="all"]');
    return n;
  });
  await page.reload();
  await page.locator('.nov-search').fill('sokit');
  assert(await page.locator('.card:not(.hidden)').count() === 1, 'shop search');
  await page.locator('[data-id="sokit"] .cbv-square').click();
  await page.waitForTimeout(1100);
  assert(await page.locator('.card:not(.hidden)').count() === 0, 'saved shop leaves list');
  await page.reload();
  await page.locator('[data-view="want"]').click();
  assert(await page.locator('[data-id="sokit"]').isVisible(), 'saved shop persists');
  await page.locator('[data-id="sokit"] .cbv-square').click();
  await page.locator('[data-view="all"]').click();
  await page.locator('.nov-search').fill('ZP6');
  await page.locator('[data-id="1zpresso-online"] .item-body').click();
  await page.reload();
  await page.locator('[data-view="got"]').click();
  assert(await page.locator('[data-id="1zpresso-online"] .item-check').getAttribute('aria-pressed') === 'true', 'purchase persists');
  await page.locator('[data-id="1zpresso-online"] .item-check').click();
  await page.locator('[data-view="all"]').click();
  await page.locator('.nov-search').fill('zzzz-no-match');
  assert(await page.locator('.nov-empty').isVisible(), 'empty search feedback');
  await page.locator('.nov-search').fill('');
  await page.locator('#map-fab').click();
  await page.locator('.leaflet-control-zoom-in').click();
  await page.locator('.leaflet-control-zoom-out').click();
  await page.locator('.leaflet-marker-icon').first().click();
  assert(await page.locator('.leaflet-popup a').isVisible(), 'map popup directions');
  await page.locator('.map-extra summary').click();
  assert(await page.locator('.map-extra a').count() === 15, 'new shop directions');
  await page.locator('#map-fab').click();
  assert(await page.locator('.nov-search').isVisible(), 'return from map');
  await page.locator('.nov-destinations summary').press('Enter');
  assert(await page.locator('.nov-destinations').getAttribute('open') !== null, 'keyboard destinations');
  const broken = await page.evaluate(async () => Promise.all([...document.querySelectorAll('.card')].map(async card => {
    const img = card.querySelector('.card-img');
    if (!img) return card.dataset.id;
    const probe = new Image(); probe.src = img.src;
    try { await probe.decode(); return probe.naturalWidth > 10 ? null : card.dataset.id; }
    catch { return card.dataset.id; }
  })));
  assert(broken.length === 90 && broken.every(x => x === null), 'all 90 cards have real decodable images');
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `no overflow at ${width}`);
  }
  assert(errors.length === 0, `no JavaScript errors: ${errors.join(', ')}`);
  return { checks, cards: 90, pickups: 61, errors };
}
