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
    this.wrapper = null;
    if (typeof this.data.url !== 'string') {
      this.data.url = '';
    }
    this._CSS = {
      wrapper: 'link-block-tune__wrapper',
      wrapperHasLink: 'link-block-tune--has-link',
      button: {
        default: 'ce-popover-item',
        active: 'ce-popover-item--active',
        icon: 'ce-popover-item__icon',
        title: 'ce-popover-item__title',
      },
    };
  }

  /**
   * Wrap block content. Link is stored in tune data only; no anchor is applied.
   * @param {HTMLElement} blockContent - Block's content element
   * @returns {HTMLElement} Wrapper element containing blockContent
   */
  wrap(blockContent) {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add(this._CSS.wrapper);
    this.wrapper.appendChild(blockContent);
    this.applyState();
    return this.wrapper;
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
      isActive: !!(this.data.url || '').trim(),
      onActivate: () => {
        this.onActivate();
      },
    };
    return [linkTuneItem];
  }

  getLabel() {
    const hasLink = !!(this.data.url || '').trim();
    return hasLink
      ? (this.config.labelEditLink || 'Edit link')
      : (this.config.labelAddLink || this.config.label || 'Add link');
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
    this.block?.dispatchChange();
  }

  /**
   * Apply visual state: wrapper has-link class.
   */
  applyState() {
    if (this.wrapper) {
      this.wrapper.classList.toggle(this._CSS.wrapperHasLink, !!this.data.url);
    }
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
