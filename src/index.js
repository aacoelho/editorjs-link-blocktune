/**
 * Link Block Tune for Editor.js
 * Associates a link with the block (saved only; no anchor wrapper applied).
 * @see https://editorjs.io/block-tunes-api/
 */

import './index.css';
import { IconLink } from '@codexteam/icons';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * User-facing strings (labels, buttons, messages). Override via config where supported.
 */
const STRINGS = {
  labelAddLink: 'Add link',
  labelEditLink: 'Edit link',
  modalTitle: 'Link',
  modalLabelUrl: 'URL',
  modalPlaceholderUrl: 'https://example.com or /path',
  modalCheckboxOpenNewTab: 'Open in new tab',
  modalButtonCancel: 'Cancel',
  modalButtonSave: 'Save',
  modalButtonRemoveLink: 'Remove link',
  errorInvalidUrl: 'Please enter a valid URL.',
};

// ---------------------------------------------------------------------------
// URL helpers (pure functions)
// ---------------------------------------------------------------------------

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
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.charAt(0) === '/' || trimmed.charAt(0) === '?' || trimmed.charAt(0) === '#') return trimmed;
  if (trimmed.startsWith('./') || trimmed.startsWith('../')) return trimmed;
  return 'https://' + trimmed;
}

function isRelativeUrl(raw) {
  return /^\//.test(raw) || /^\.\.?\//.test(raw) || /^[?#]/.test(raw);
}

// ---------------------------------------------------------------------------
// LinkBlockTune (Block Tunes API)
// ---------------------------------------------------------------------------

export default class LinkBlockTune {
  static get isTune() {
    return true;
  }

  static prepare(config) {}
  static reset() {}

  constructor({ api, data, config, block }) {
    this.api = api;
    this.block = block;
    this.config = config || {};
    this.data = data || {};
    if (typeof this.data.url !== 'string') this.data.url = '';
    if (typeof this.data.openInNewTab !== 'boolean') this.data.openInNewTab = true;
    this._CSS = {
      button: {
        default: 'ce-popover-item',
        active: 'ce-popover-item--active',
        icon: 'ce-popover-item__icon',
        title: 'ce-popover-item__title',
      },
    };
  }

  // ----- Block Tunes API -----

  wrap(blockContent) {
    return blockContent;
  }

  render() {
    return [
      {
        icon: this.config.icon || IconLink,
        name: 'link',
        label: this.getLabel(),
        toggle: 'link',
        closeOnActivate: true,
        onActivate: () => this.onActivate(),
      },
    ];
  }

  save() {
    return {
      url: (this.data.url || '').trim(),
      openInNewTab: !!this.data.openInNewTab,
    };
  }

  // ----- Tune menu label -----

  getLabel() {
    const hasLink = !!(this.data.url || '').trim();
    return hasLink
      ? (this.config.labelEditLink || STRINGS.labelEditLink)
      : (this.config.labelAddLink || this.config.label || STRINGS.labelAddLink);
  }

  // ----- Modal: open and handle actions -----

  onActivate() {
    const currentUrl = (this.data.url || '').trim();
    const currentOpenInNewTab = !!this.data.openInNewTab;
    const modal = this._createModal(currentUrl, currentOpenInNewTab);

    const close = () => {
      modal.overlay.remove();
      document.body.style.overflow = '';
    };

    modal.cancelBtn.addEventListener('click', close);
    modal.saveBtn.addEventListener('click', () => {
      const raw = modal.inputUrl.value.trim();
      if (raw === '') {
        this._clearLink();
        close();
        this.block?.dispatchChange();
        return;
      }
      if (!this._applyLink(raw, modal.inputCheck.checked)) {
        this.api.notifier.show(STRINGS.errorInvalidUrl, 'error');
        return;
      }
      close();
      this.block?.dispatchChange();
    });
    if (modal.removeBtn) {
      modal.removeBtn.addEventListener('click', () => {
        this._clearLink();
        close();
        this.block?.dispatchChange();
      });
    }

    modal.overlay.addEventListener('click', (e) => e.target === modal.overlay && close());
    modal.inputUrl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Enter') modal.saveBtn.click();
    });

    document.body.appendChild(modal.overlay);
    document.body.style.overflow = 'hidden';
    modal.inputUrl.focus();
  }

  /**
   * Build modal DOM. Returns overlay and refs needed for events.
   * @private
   */
  _createModal(currentUrl, currentOpenInNewTab) {
    const overlay = document.createElement('div');
    overlay.className = 'link-block-tune-modal-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'link-block-tune-modal';

    const title = document.createElement('div');
    title.className = 'link-block-tune-modal__title';
    title.textContent = STRINGS.modalTitle;

    const labelUrl = document.createElement('label');
    labelUrl.className = 'link-block-tune-modal__label';
    labelUrl.textContent = STRINGS.modalLabelUrl;
    const inputUrl = document.createElement('input');
    inputUrl.type = 'text';
    inputUrl.className = 'link-block-tune-modal__input';
    inputUrl.placeholder = STRINGS.modalPlaceholderUrl;
    inputUrl.value = currentUrl;
    inputUrl.setAttribute('autocomplete', 'off');
    labelUrl.appendChild(inputUrl);

    const labelCheck = document.createElement('label');
    labelCheck.className = 'link-block-tune-modal__checkbox-wrap';
    const inputCheck = document.createElement('input');
    inputCheck.type = 'checkbox';
    inputCheck.className = 'link-block-tune-modal__checkbox';
    inputCheck.checked = currentOpenInNewTab;
    const spanCheck = document.createElement('span');
    spanCheck.textContent = STRINGS.modalCheckboxOpenNewTab;
    labelCheck.appendChild(inputCheck);
    labelCheck.appendChild(spanCheck);

    const actions = document.createElement('div');
    actions.className = 'link-block-tune-modal__actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'link-block-tune-modal__btn link-block-tune-modal__btn--cancel';
    cancelBtn.textContent = STRINGS.modalButtonCancel;

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'link-block-tune-modal__btn link-block-tune-modal__btn--ok';
    saveBtn.textContent = STRINGS.modalButtonSave;

    if (currentUrl) {
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'link-block-tune-modal__btn link-block-tune-modal__btn--remove';
      removeBtn.textContent = STRINGS.modalButtonRemoveLink;
      actions.appendChild(removeBtn);
    }
    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);

    dialog.append(title, labelUrl, labelCheck, actions);
    overlay.appendChild(dialog);

    const removeBtn = overlay.querySelector('.link-block-tune-modal__btn--remove');
    return {
      overlay,
      inputUrl,
      inputCheck,
      cancelBtn,
      saveBtn,
      removeBtn,
    };
  }

  /**
   * Validate and set link data. Returns true if valid.
   * @private
   */
  _applyLink(raw, openInNewTab) {
    const urlToValidate = isRelativeUrl(raw) ? raw : ensureProtocol(raw);
    const urlToSave = isRelativeUrl(raw) ? raw : urlToValidate;
    if (!isValidUrl(urlToValidate)) return false;
    this.data.url = urlToSave;
    this.data.openInNewTab = openInNewTab;
    return true;
  }

  /**
   * Clear link from block.
   * @private
   */
  _clearLink() {
    this.data.url = '';
    this.data.openInNewTab = true;
  }
}
