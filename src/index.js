/**
 * Link Block Tune for Editor.js
 * Associates a link with the block (saved only; no anchor wrapper applied).
 * @see https://editorjs.io/block-tunes-api/
 */

import './index.css';
import { IconLink } from '@codexteam/icons';

function isValidUrl(string) {
  if (!string || typeof string !== 'string') return false;
  const trimmed = string.trim();
  if (!trimmed) return false;
  try {
    const absolute = new URL(trimmed);
    if (absolute.protocol === 'http:' || absolute.protocol === 'https:') return true;
  } catch {
    // not a valid absolute URL
  }
  try {
    new URL(trimmed, 'https://example.com/');
    return true;
  } catch {
    return false;
  }
}

function ensureProtocol(url) {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  // Already has a scheme (http:, https:, mailto:, etc.)
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  // Relative URL: path, query, or hash — return as-is, never add protocol
  if (trimmed.charAt(0) === '/' || trimmed.charAt(0) === '?' || trimmed.charAt(0) === '#') return trimmed;
  if (trimmed.startsWith('./') || trimmed.startsWith('../')) return trimmed;
  return 'https://' + trimmed;
}

export default class LinkBlockTune {
  static get isTune() {
    return true;
  }

  /**
   * @param {Object} params
   * @param {Object} params.api - Editor's API object
   * @param {Object} params.data - Tune's saved data (e.g. { url: '' })
   * @param {Object} params.config - User-provided configuration (label, icon, labelAddLink, labelEditLink)
   * @param {Object} params.block - Block API object this tune is related to
   */
  constructor({ api, data, config, block }) {
    this.api = api;
    this.block = block;
    this.config = config || {};
    this.data = data || {};
    if (typeof this.data.url !== 'string') {
      this.data.url = '';
    }
    this._CSS = {
      button: {
        default: 'ce-popover-item',
        active: 'ce-popover-item--active',
        icon: 'ce-popover-item__icon',
        title: 'ce-popover-item__title',
      },
    };
  }

  /**
   * Wrap block content. Link is stored in tune data only; content is returned as-is.
   * @param {HTMLElement} blockContent - Block's content element
   * @returns {HTMLElement} blockContent
   */
  wrap(blockContent) {
    return blockContent;
  }

  /**
   * Rendering block tune: Menu Config (same structure as alignment tune).
   * @returns {Array<{ icon: string, name: string, label: string, toggle: string, isActive: boolean, onActivate: function }>}
   */
  render() {
    const linkTuneItem = {
      icon: this.config.icon || IconLink,
      name: 'link',
      label: this.getLabel(),
      toggle: 'link',
      closeOnActivate: true,
      onActivate: () => {
        this.onActivate();
      },
    };
    return [linkTuneItem];
  }

  getLabel() {
    const hasLink = !!(this.data.url || '').trim();
    return hasLink
      ? this.config.labelEditLink || 'Edit link'
      : this.config.labelAddLink || this.config.label || 'Add link';
  }

  /**
   * Open prompt to set or clear the block link.
   */
  onActivate() {
    const currentUrl = (this.data.url || '').trim();
    const message = currentUrl ? `Edit link for this block (leave empty to remove):` : `Enter URL for this block:`;
    const input = window.prompt(message, currentUrl);
    if (input === null) return; // cancelled
    const raw = input.trim();
    if (raw === '') {
      this.data.url = '';
    } else {
      const isRelative = /^\//.test(raw) || /^\.\.?\//.test(raw) || /^[?#]/.test(raw);
      const urlToValidate = isRelative ? raw : ensureProtocol(raw);
      const urlToSave = isRelative ? raw : urlToValidate;
      if (isValidUrl(urlToValidate)) {
        this.data.url = urlToSave;
      } else {
        this.api.notifier.show('Please enter a valid URL.', 'error');
        return;
      }
    }
    this.block?.dispatchChange();
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

  static prepare(config) {
    // Optional: load external assets
  }

  static reset() {
    // Optional: clear global state
  }
}
