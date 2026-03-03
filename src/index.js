/**
 * Link Block Tune for Editor.js
 * Associates a link with the block (saved only; no anchor wrapper applied).
 * @see https://editorjs.io/block-tunes-api/
 */

import './index.css';

function isValidUrl(string) {
  if (!string || typeof string !== 'string') return false;
  const trimmed = string.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function ensureProtocol(url) {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return 'https://' + trimmed;
}

export default class LinkBlockTune {
  /**
   * @param {Object} params
   * @param {Object} params.api - Editor's API object
   * @param {Object} params.data - Tune's saved data (e.g. { url: '' })
   * @param {Object} params.config - User-provided configuration
   * @param {Object} params.block - Block API object this tune is related to
   */
  constructor({ api, data, config, block }) {
    this.api = api;
    this.data = data || {};
    this.config = config || {};
    this.block = block;
    this.wrapper = null;
    if (typeof this.data.url !== 'string') {
      this.data.url = '';
    }
  }

  /**
   * Required: Mark this class as a Block Tune.
   */
  static get isTune() {
    return true;
  }

  /**
   * Required: Define tune appearance in the Block Tunes menu.
   * @returns {HTMLElement}
   */
  render() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('link-block-tune');

    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add(this.api.styles.button);
    button.innerHTML = this.config.icon || '🔗';
    button.title = this.config.label || 'Add link';
    button.addEventListener('click', () => this.onActivate());

    wrapper.appendChild(button);
    return wrapper;
  }

  /**
   * Open prompt to set or clear the block link.
   */
  onActivate() {
    const currentUrl = (this.data.url || '').trim();
    const message = currentUrl
      ? `Edit link for this block (leave empty to remove):`
      : `Enter URL for this block:`;
    const input = window.prompt(message, currentUrl);
    if (input === null) return; // cancelled
    const raw = input.trim();
    if (raw === '') {
      this.data.url = '';
    } else {
      const url = ensureProtocol(raw);
      if (isValidUrl(url)) {
        this.data.url = url;
      } else {
        this.api.notifier.show('Please enter a valid URL.', 'error');
        return;
      }
    }
    this.applyState();
  }

  /**
   * Apply visual state (e.g. wrapper has link class when url is set).
   * Link is saved only; no anchor is applied to the block content.
   */
  applyState() {
    if (!this.wrapper) return;
    this.wrapper.classList.toggle('link-block-tune--has-link', !!this.data.url);
  }

  /**
   * Return state to save with the block.
   * @returns {{ url: string }}
   */
  save() {
    return {
      url: (this.data.url || '').trim(),
    };
  }

  /**
   * Wrap block content. Link is stored in tune data only; no anchor is applied.
   * @param {HTMLElement} blockContent - Block's content element
   * @returns {HTMLElement} Wrapper element containing blockContent
   */
  wrap(blockContent) {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('link-block-tune__wrapper');
    this.wrapper.appendChild(blockContent);
    this.applyState();
    return this.wrapper;
  }

  static prepare(config) {
    // Optional: load external assets
  }

  static reset() {
    // Optional: clear global state
  }
}
