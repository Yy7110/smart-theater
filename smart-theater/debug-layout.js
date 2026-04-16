const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Test each page
  const pages = [
    { url: '/', name: 'Home' },
    { url: '/shows', name: 'Shows' },
    { url: '/show/show-001', name: 'ShowDetail' },
    { url: '/venue', name: 'Venue' },
    { url: '/schedule', name: 'Schedule' },
    { url: '/about', name: 'About' },
    { url: '/contact', name: 'Contact' },
  ];

  for (const p of pages) {
    await page.goto('http://localhost:3000' + p.url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    const data = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      const main = document.querySelector('main');
      const body = document.body;
      const firstSection = main?.querySelector('section, div');

      const getStyles = (el, name) => {
        if (!el) return name + ': NOT FOUND';
        const cs = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          name,
          position: cs.position,
          zIndex: cs.zIndex,
          display: cs.display,
          overflow: cs.overflow,
          transform: cs.transform,
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          paddingTop: cs.paddingTop,
        };
      };

      // Check if nav is visually on top
      const navRect = nav?.getBoundingClientRect();
      let navCovered = false;
      let coveringElement = null;
      if (navRect) {
        const centerX = navRect.left + navRect.width / 2;
        const centerY = navRect.top + navRect.height / 2;
        const topEl = document.elementFromPoint(centerX, centerY);
        if (topEl && !nav.contains(topEl)) {
          navCovered = true;
          coveringElement = {
            tag: topEl.tagName,
            className: topEl.className?.substring?.(0, 80),
            zIndex: window.getComputedStyle(topEl).zIndex,
            position: window.getComputedStyle(topEl).position,
          };
        }
      }

      // Check all ancestors of nav for transform (which creates containing block)
      let navAncestorWithTransform = null;
      let el = nav?.parentElement;
      while (el && el !== document.documentElement) {
        const t = window.getComputedStyle(el).transform;
        if (t && t !== 'none') {
          navAncestorWithTransform = { tag: el.tagName, class: el.className?.substring?.(0, 60), transform: t };
          break;
        }
        el = el.parentElement;
      }

      // Check noise overlay
      const bodyAfter = window.getComputedStyle(body, '::after');

      return {
        nav: getStyles(nav, 'nav'),
        main: getStyles(main, 'main'),
        body: getStyles(body, 'body'),
        firstSection: getStyles(firstSection, 'firstSection'),
        navCovered,
        coveringElement,
        navAncestorWithTransform,
        noiseOverlay: {
          zIndex: bodyAfter.zIndex,
          position: bodyAfter.position,
          pointerEvents: bodyAfter.pointerEvents,
          content: bodyAfter.content,
        },
        // Check all elements with position fixed or z-index > 50
        highZElements: Array.from(document.querySelectorAll('*')).filter(el => {
          const cs = window.getComputedStyle(el);
          return (cs.zIndex && parseInt(cs.zIndex) > 10 && cs.position !== 'static');
        }).map(el => ({
          tag: el.tagName,
          class: el.className?.substring?.(0, 60),
          zIndex: window.getComputedStyle(el).zIndex,
          position: window.getComputedStyle(el).position,
          rect: { top: el.getBoundingClientRect().top, height: el.getBoundingClientRect().height },
        })).slice(0, 10),
      };
    });

    console.log(`\n========== ${p.name} (${p.url}) ==========`);
    console.log('NAV:', JSON.stringify(data.nav, null, 2));
    console.log('NAV COVERED?', data.navCovered);
    if (data.coveringElement) console.log('COVERING ELEMENT:', JSON.stringify(data.coveringElement, null, 2));
    if (data.navAncestorWithTransform) console.log('NAV ANCESTOR WITH TRANSFORM:', JSON.stringify(data.navAncestorWithTransform, null, 2));
    console.log('NOISE OVERLAY:', JSON.stringify(data.noiseOverlay, null, 2));
    console.log('HIGH-Z ELEMENTS:', JSON.stringify(data.highZElements, null, 2));
    console.log('FIRST SECTION:', JSON.stringify(data.firstSection, null, 2));
  }

  await browser.close();
})();
