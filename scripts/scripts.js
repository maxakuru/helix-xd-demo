/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const PROJECT = 'consonant--adobecom';
const LCP_BLOCKS = ['marquee']; // add your LCP blocks to the list
const SEARCH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false">
<path d="M14 2A8 8 0 0 0 7.4 14.5L2.4 19.4a1.5 1.5 0 0 0 2.1 2.1L9.5 16.6A8 8 0 1 0 14 2Zm0 14.1A6.1 6.1 0 1 1 20.1 10 6.1 6.1 0 0 1 14 16.1Z"></path>
</svg>`;

/**
 * log RUM if part of the sample.
 * @param {string} checkpoint identifies the checkpoint in funnel
 * @param {Object} data additional data for RUM sample
 */
export function sampleRUM(checkpoint, data = {}) {
  try {
    window.hlx = window.hlx || {};
    if (!window.hlx.rum) {
      const usp = new URLSearchParams(window.location.search);
      const weight = (usp.get('rum') === 'on') ? 1 : 100; // with parameter, weight is 1. Defaults to 100.
      // eslint-disable-next-line no-bitwise
      const hashCode = (s) => s.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0);
      const id = `${hashCode(window.location.href)}-${new Date().getTime()}-${Math.random().toString(16).substr(2, 14)}`;
      const random = Math.random();
      const isSelected = (random * weight < 1);
      // eslint-disable-next-line object-curly-newline
      window.hlx.rum = { weight, id, random, isSelected };
    }
    const { random, weight, id } = window.hlx.rum;
    if (random && (random * weight < 1)) {
      const sendPing = () => {
        // eslint-disable-next-line object-curly-newline, max-len, no-use-before-define
        const body = JSON.stringify({ weight, id, referer: window.location.href, generation: PROJECT, checkpoint, ...data });
        const url = `https://rum.hlx3.page/.rum/${weight}`;
        // eslint-disable-next-line no-unused-expressions
        navigator.sendBeacon(url, body);
      };
      sendPing();
      // special case CWV
      if (checkpoint === 'cwv') {
        // eslint-disable-next-line import/no-unresolved
        import('./web-vitals-module-2-1-2.js').then((mod) => {
          const storeCWV = (measurement) => {
            data.cwv = {};
            data.cwv[measurement.name] = measurement.value;
            sendPing();
          };
          mod.getCLS(storeCWV);
          mod.getFID(storeCWV);
          mod.getLCP(storeCWV);
        });
      }
    }
  } catch (e) {
    // something went wrong
  }
}

/**
 * Loads a CSS file.
 * @param {string} href The path to the CSS file
 */
export function loadStyle(href, callback) {
  if (!document.querySelector(`head > link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', href);
    if (typeof callback === 'function') {
      link.onload = (e) => callback(e.type);
      link.onerror = (e) => callback(e.type);
    }
    document.head.appendChild(link);
  } else if (typeof callback === 'function') {
    callback('noop');
  }
}

const envs = {
  stage: {
    ims: 'stg1',
    adminconsole: 'stage.adminconsole.adobe.com',
    account: 'stage.account.adobe.com',
    target: false,
  },
  prod: {
    ims: 'prod',
    adminconsole: 'adminconsole.adobe.com',
    account: 'account.adobe.com',
    target: true,
  },
};

/**
 * Get the current Helix environment
 * @returns {Object} the env object
 */
export function getEnv() {
  let envName = sessionStorage.getItem('helix-env');
  if (!envName) envName = 'prod';
  const env = envs[envName];
  if (env) {
    env.name = envName;
  }
  return env;
}

/**
 * Sanitizes a name for use as class name.
 * @param {*} name The unsanitized name
 * @returns {string} The class name
 */
 export function toClassName(name) {
  return name && typeof name === 'string'
    ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-')
    : '';
}

export function makeLinkRelative(href) {
  const url = new URL(href);
  const host = url.hostname;
  if (host.endsWith('.page') || host.endsWith('.live') || host === 'gnav.adobe.com') return (`${url.pathname}${url.search}${url.hash}`);
  return (href);
}

const LANG = {
  EN: 'en',
  DE: 'de',
  FR: 'fr',
  KO: 'ko',
  ES: 'es',
  IT: 'it',
  JP: 'jp',
  BR: 'br',
};

const LANG_LOC = {
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  ko: 'ko-KR',
  es: 'es-ES', // es-MX?
  it: 'it-IT',
  jp: 'ja-JP',
  br: 'pt-BR',
};

let language;

export function getLanguage() {
  if (language) return language;
  language = LANG.EN;
  const segs = window.location.pathname.split('/');
  if (segs && segs.length > 0) {
    // eslint-disable-next-line no-restricted-syntax
    for (const [, value] of Object.entries(LANG)) {
      if (value === segs[1]) {
        language = value;
        break;
      }
    }
  }
  return language;
}

/**
 * Returns the language dependent root path
 * @returns {string} The computed root path
 */
export function getRootPath() {
  const loc = getLanguage();
  if (loc === LANG.EN) {
    return '';
  }
  return `/${loc}/`;
}

/**
 * Retrieves the content of a metadata tag.
 * @param {string} name The metadata name (or property)
 * @returns {string} The metadata value
 */
export function getMetadata(name) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  const $meta = document.head.querySelector(`meta[${attr}="${name}"]`);
  return $meta && $meta.content;
}

/**
 * Adds one or more URLs to the dependencies for publishing.
 * @param {string|[string]} url The URL(s) to add as dependencies
 */
export function addPublishDependencies(url) {
  const urls = Array.isArray(url) ? url : [url];
  window.hlx = window.hlx || {};
  if (window.hlx.dependencies && Array.isArray(window.hlx.dependencies)) {
    window.hlx.dependencies = window.hlx.dependencies.concat(urls);
  } else {
    window.hlx.dependencies = urls;
  }
}

/**
 * Wraps each section in an additional {@code div}.
 * @param {[Element]} $sections The sections
 */
function wrapSections(sections) {
  sections.forEach((section) => {
    if (section.childNodes.length === 0) {
      // remove empty sections
      section.remove();
    } else if (!section.id) {
      const $wrapper = document.createElement('div');
      $wrapper.className = 'section-wrapper';
      section.parentNode.appendChild($wrapper);
      $wrapper.appendChild(section);
    }
  });
}

/**
 * Decorates a block.
 * @param {Element} block The block element
 */
 export function decorateBlock(block) {
  const trimDashes = (str) => str.replace(/(^\s*-)|(-\s*$)/g, '');
  const classes = Array.from(block.classList.values());
  const blockName = classes[0];
  if (!blockName) return;
  const section = block.closest('.section');
  if (section) {
    section.classList.add(`${blockName}-container`.replace(/--/g, '-'));
  }
  const blockWithVariants = blockName.split('--');
  const shortBlockName = trimDashes(blockWithVariants.shift());
  const variants = blockWithVariants.map((v) => trimDashes(v));
  block.classList.add(shortBlockName);
  block.classList.add(...variants);

  block.classList.add('block');
  block.setAttribute('data-block-name', shortBlockName);
  block.setAttribute('data-block-status', 'initialized');

  const blockWrapper = block.parentElement;
  blockWrapper.classList.add(`${shortBlockName}-wrapper`);
}

/**
 * Extracts the config from a block.
 * @param {Element} block The block element
 * @returns {object} The block config
 */
 export function readBlockConfig(block) {
  const config = {};
  block.querySelectorAll(':scope>div').forEach((row) => {
    if (row.children) {
      const cols = [...row.children];
      if (cols[1]) {
        const col = cols[1];
        const name = toClassName(cols[0].textContent);
        let value = '';
        if (col.querySelector('a')) {
          const as = [...col.querySelectorAll('a')];
          if (as.length === 1) {
            value = as[0].href;
          } else {
            value = as.map((a) => a.href);
          }
        } else if (col.querySelector('p')) {
          const ps = [...col.querySelectorAll('p')];
          if (ps.length === 1) {
            value = ps[0].textContent;
          } else {
            value = ps.map((p) => p.textContent);
          }
        } else value = row.children[1].textContent;
        config[name] = value;
      }
    }
  });
  return config;
}

/**
 * Decorates all sections in a container element.
 * @param {Element} $main The container element
 */
export function decorateSections($main) {
  $main.querySelectorAll(':scope > div').forEach((section) => {
    const wrappers = [];
    let defaultContent = false;
    [...section.children].forEach((e) => {
      if (e.tagName === 'DIV' || !defaultContent) {
        const wrapper = document.createElement('div');
        defaultContent = e.tagName !== 'DIV';
        if (defaultContent) wrapper.className = 'default-content-wrapper';
        wrappers.push(wrapper);
      }
      wrappers[wrappers.length - 1].append(e);
    });
    wrappers.forEach((wrapper) => section.append(wrapper));
    section.classList.add('section');
    section.setAttribute('data-section-status', 'initialized');

    /* process section metadata */
    const sectionMeta = section.querySelector('div.section-metadata');
    if (sectionMeta) {
      const meta = readBlockConfig(sectionMeta);
      const keys = Object.keys(meta);
      keys.forEach((key) => {
        if (key === 'style') section.classList.add(toClassName(meta.style));
        else section.dataset[key] = meta[key];
      });
      sectionMeta.remove();
    }
  });
}

/**
 * Updates all section status in a container element.
 * @param {Element} $main The container element
 */
 export function updateSectionsStatus($main) {
  const sections = [...$main.querySelectorAll(':scope > div.section')];
  for (let i = 0; i < sections.length; i += 1) {
    const section = sections[i];
    const status = section.getAttribute('data-section-status');
    if (status !== 'loaded') {
      const loadingBlock = section.querySelector('.block[data-block-status="initialized"], .block[data-block-status="loading"]');
      if (loadingBlock) {
        section.setAttribute('data-section-status', 'loading');
        break;
      } else {
        section.setAttribute('data-section-status', 'loaded');
      }
    }
  }
}

/**
 * Loads JS and CSS for a theme.
 * @param {Element} $block The block element
 */
const config = {
  themes: {
    adobe: {
      class: 'adobe-theme',
      location: '/themes/adobe/',
      styles: 'adobe.css',
    },
    helix: {
      class: 'helix-theme',
      location: '/themes/helix/',
      styles: 'helix.css',
    },
    ccx: {
      class: 'ccx-theme',
      location: '/themes/ccx/',
      styles: 'ccx.css',
    },
    nike: {
      class: 'nike-theme',
      location: '/themes/nike/',
      styles: 'nike.css',
    },
    servicenow: {
      class: 'servicenow-theme',
      location: '/themes/servicenow/',
      styles: 'servicenow.css',
    },
    styleguide: {
      class: 'styleguide-theme',
      location: '/themes/styleguide/',
      styles: 'styleguide.css',
    },
  },
};

const loadTheme = (config) => {
  const theme = getMetadata('theme');
  const isLoaded = () => {
    document.body.classList.add('is-Loaded');
  };
  if (theme) {
    const themeConf = config.themes[theme] || {};
    if (themeConf.class) {
      document.body.classList.add(themeConf.class);
    }
    if (themeConf.styles) {
      loadStyle(`${themeConf.location}${themeConf.styles}`, isLoaded);
    } else {
      isLoaded();
    }
  } else {
    isLoaded();
  }
};



/**
 * Decorates all blocks in a container element.
 * @param {Element} $main The container element
 */
 export function decorateBlocks($main) {
  $main
    .querySelectorAll('div.section > div div')
    .forEach(($block) => decorateBlock($block));
}

/**
 * Builds a block DOM Element from a two dimensional array
 * @param {string} blockName name of the block
 * @param {any} content two dimensional array or string or object of content
 */
 export function buildBlock(blockName, content) {
  const table = Array.isArray(content) ? content : [[content]];
  const blockEl = document.createElement('div');
  // build image block nested div structure
  blockEl.classList.add(blockName);
  table.forEach((row) => {
    const rowEl = document.createElement('div');
    row.forEach((col) => {
      const colEl = document.createElement('div');
      const vals = col.elems ? col.elems : [col];
      vals.forEach((val) => {
        if (val) {
          if (typeof val === 'string') {
            colEl.innerHTML += val;
          } else {
            colEl.appendChild(val);
          }
        }
      });
      rowEl.appendChild(colEl);
    });
    blockEl.appendChild(rowEl);
  });
  return (blockEl);
}

/**
 * Loads JS and CSS for a block.
 * @param {Element} $block The block element
 */
export async function loadBlock(block, eager = false) {
  if (!(block.getAttribute('data-block-status') === 'loading' || block.getAttribute('data-block-status') === 'loaded')) {
    block.setAttribute('data-block-status', 'loading');
    const blockName = block.getAttribute('data-block-name');
    try {
      const cssLoaded = new Promise((resolve) => {
        loadStyle(`${window.hlx.codeBasePath}/blocks/${blockName}/${blockName}.css`, resolve);
      });
      const decorationComplete = new Promise((resolve) => {
        (async () => {
          try {
            const mod = await import(`../blocks/${blockName}/${blockName}.js`);
            if (mod.default) {
              await mod.default(block, blockName, document, eager);
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.log(`failed to load module for ${blockName}`, err);
          }
          resolve();
        })();
      });
      await Promise.all([cssLoaded, decorationComplete]);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(`failed to load block ${blockName}`, err);
    }
    block.setAttribute('data-block-status', 'loaded');
  }
}

/**
 * Loads JS and CSS for all blocks in a container element.
 * @param {Element} $main The container element
 */
export async function loadBlocks($main) {
  updateSectionsStatus($main);
  const blocks = [...$main.querySelectorAll('div.block')];
  for (let i = 0; i < blocks.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await loadBlock(blocks[i]);
    updateSectionsStatus($main);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * fetches the string variables.
 * @returns {object} localized variables
 */

export async function fetchPlaceholders() {
  if (!window.placeholders) {
    window.placeholders = {};

    try {
      const resp = await fetch(`${getRootPath()}/placeholders.json`);
      const json = await resp.json();
      json.data.forEach((placeholder) => {
        window.placeholders[placeholder.Key] = placeholder.Text;
      });
    } catch(e) {
      console.warn('Failed to set placeholders: ', e);
    }
  }
  return window.placeholders;
}


/**
 * load LCP block and/or wait for LCP in default content.
 */
async function waitForLCP() {
  const block = document.querySelector('.block');
  const hasLCPBlock = (block && LCP_BLOCKS.includes(block.getAttribute('data-block-name')));
  if (hasLCPBlock) await loadBlock(block, true);

  document.querySelector('body').classList.add('appear');
  const lcpCandidate = document.querySelector('main img');
  await new Promise((resolve) => {
    if (lcpCandidate && !lcpCandidate.complete) {
      lcpCandidate.addEventListener('load', () => resolve());
      lcpCandidate.addEventListener('error', () => resolve());
    } else {
      resolve();
    }
  });
}

export function initHlx() {
  window.hlx = window.hlx || {};
  window.hlx.lighthouse = new URLSearchParams(window.location.search).get('lighthouse') === 'on';
  window.hlx.codeBasePath = '';

  const scriptEl = document.querySelector('script[src$="/scripts/scripts.js"]');
  if (scriptEl) {
    try {
      [window.hlx.codeBasePath] = new URL(scriptEl.src).pathname.split('/scripts/scripts.js');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }
}

initHlx();

/*
 * ------------------------------------------------------------
 * Edit above at your own risk
 * ------------------------------------------------------------
 */

sampleRUM('top');
window.addEventListener('load', () => sampleRUM('load'));
document.addEventListener('click', () => sampleRUM('click'));

export function makeRelative(anchor) {
  const { href } = anchor;
  const url = new URL(href);
  const host = url.hostname;
  if (host.endsWith(`${PROJECT}.hlx3.page`)
      || host.endsWith(`${PROJECT}.hlx.live`)) {
    const relative = `${url.pathname}${url.search}${url.hash}`;
    anchor.setAttribute('href', relative);
    return relative;
  }
  // external link
  anchor.target = '_blank';
  return href;
}

export function setSVG(anchor) {
  const { textContent } = anchor;
  const href = anchor.getAttribute('href');
  const ext = textContent.substr(textContent.lastIndexOf('.') + 1);
  if (ext !== 'svg') return;
  const img = document.createElement('img');
  img.src = textContent;
  if (textContent === href) {
    anchor.insertAdjacentElement('afterend', img);
    anchor.remove();
  } else {
    anchor.textContent = '';
    anchor.append(img);
  }
}

export function decorateMenu(parent) {
  const anchors = parent.getElementsByTagName('a');
  parent.classList.add('demo-menu');

  return Array.from(anchors).map((anchor) => {


    makeRelative(anchor);
    setSVG(anchor);
    if(anchor.textContent.includes('Search')){
      anchor.classList.add('search');
      anchor.innerHTML = SEARCH_ICON;
    }
    return anchor;
  });
}


export function decorateAnchors(parent) {
  const anchors = parent.getElementsByTagName('a');
  return Array.from(anchors).map((anchor) => {
    makeRelative(anchor);
    setSVG(anchor);
    return anchor;
  });
}

export function loadScript(url, callback, type) {
  const script = document.createElement('script');
  script.onload = callback;
  script.setAttribute('src', url);
  if (type) { script.setAttribute('type', type); }
  document.head.append(script);
  return script;
}

export function setTemplate() {
  const template = getMetadata('template');
  if (!template) return;
  document.body.classList.add(`${template}-template`);
}

/**
 * Clean up variant classes
 * Ex: marquee--small--contained- -> marquee small contained
 * @param {HTMLElement} parent
 */
export function cleanVariations(parent) {
  const variantBlocks = parent.querySelectorAll('[class$="-"]');
  return Array.from(variantBlocks).map((variant) => {
    const { className } = variant;
    const classNameClipped = className.slice(0, -1);
    variant.classList.remove(className);
    const classNames = classNameClipped.split('--');
    variant.classList.add(...classNames);
    return variant;
  });
}

function buildEmbeds() {
  const embeds = document.querySelectorAll('a[href^="https://www.youtube.com"], a[href^="https://gist.github.com"]');
  embeds.forEach((embed) => {
    if (embed.href === embed.textContent) {
      embed.replaceWith(buildBlock('embed', embed.outerHTML));
    }
  });
}

function buildHeader() {
  const header = document.querySelector('header');
  header.append(buildBlock('header', ''));
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
export function buildAutoBlocks() {
  try {
    buildHeader();
    buildEmbeds();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
export function decorateMain() {
  const main = document.querySelector('main');
  if (main) {
    decorateAnchors(main);
    buildAutoBlocks(main);
    decorateSections(main);
    decorateBlocks(main);
  }
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager() {
  setTemplate();
  decorateMain();
  await waitForLCP();
}

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  const header = doc.querySelector('header > div');
  const main = document.querySelector('main');

  if (main) {
    loadTheme(config);
    loadBlocks(main);

    decorateBlock(header);
    const gnavPath = getMetadata('gnav') || `/gnav-kitchen-sink`;
    header.setAttribute('data-gnav-source', gnavPath);
    loadBlock(header);

    /* load footer */
    const footer = document.querySelector('footer');
    footer.setAttribute('data-block-name', 'footer');
    footer.setAttribute('data-footer-source', `/footer`);
    loadBlock(footer);

    loadStyle('/fonts/fonts.css');
    addFavIcon(`${window.hlx.codeBasePath}/img/icon.svg`);
  }
}

/**
 * loads everything that happens a lot later, without impacting
 * the user experience.
 */
function loadDelayed() {
  // load anything that can be postponed to the latest here
}

(async function decoratePage() {
  await loadEager();
  await loadLazy(document);
  loadDelayed(document);
}());
