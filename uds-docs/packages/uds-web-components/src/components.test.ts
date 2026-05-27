// @vitest-environment happy-dom
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { registerUdsComponents } from './register';

beforeAll(() => {
  registerUdsComponents();
});

async function nextFrame() {
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

describe('UDS Web Components', () => {
  it('renders a shadow DOM button with the public variant API', async () => {
    const button = document.createElement('udc-button');
    button.setAttribute('variant', 'secondary');
    button.textContent = 'Save';
    document.body.append(button);
    await button.updateComplete;

    const inner = button.shadowRoot?.querySelector('button');
    const slot = button.shadowRoot?.querySelector('slot');
    expect(button.getAttribute('variant')).toBe('secondary');
    expect(inner).toBeTruthy();
    expect(slot?.assignedNodes({ flatten: true })[0]?.textContent).toBe('Save');
  });

  it('toggles filter chips and emits a typed event', async () => {
    const chip = document.createElement('udc-chip');
    chip.setAttribute('variant', 'filter');
    chip.textContent = 'Active';
    const onToggle = vi.fn();
    chip.addEventListener('udc-chip-toggle', onToggle);
    document.body.append(chip);
    await chip.updateComplete;

    chip.shadowRoot?.querySelector('button')?.click();
    await chip.updateComplete;

    expect(chip.selected).toBe(true);
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle.mock.calls[0][0].detail).toEqual({ selected: true, variant: 'filter' });
  });

  it('keeps text input value in sync and emits input detail', async () => {
    const field = document.createElement('udc-text-input');
    field.setAttribute('label', 'Full name');
    const onInput = vi.fn();
    field.addEventListener('udc-input', onInput);
    document.body.append(field);
    await field.updateComplete;

    const input = field.shadowRoot?.querySelector('input');
    expect(input).toBeTruthy();
    input!.value = 'Ada Lovelace';
    input!.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    await field.updateComplete;

    expect(field.value).toBe('Ada Lovelace');
    expect(onInput.mock.calls[0][0].detail).toEqual({ value: 'Ada Lovelace' });
  });

  it('checks a checkbox and emits a custom change event', async () => {
    const checkbox = document.createElement('udc-checkbox');
    checkbox.textContent = 'I agree';
    const onChange = vi.fn();
    checkbox.addEventListener('udc-change', onChange);
    document.body.append(checkbox);
    await checkbox.updateComplete;

    const input = checkbox.shadowRoot?.querySelector('input');
    input!.checked = true;
    input!.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    await checkbox.updateComplete;

    expect(checkbox.checked).toBe(true);
    expect(onChange.mock.calls[0][0].detail).toEqual({ checked: true, value: 'on' });
  });

  it('selects tabs and syncs matching panels', async () => {
    const tabs = document.createElement('udc-tabs');
    const overview = document.createElement('udc-tab');
    overview.setAttribute('panel', 'overview');
    overview.textContent = 'Overview';
    const details = document.createElement('udc-tab');
    details.setAttribute('panel', 'details');
    details.textContent = 'Details';
    const overviewPanel = document.createElement('udc-tab-panel');
    overviewPanel.setAttribute('panel', 'overview');
    const detailsPanel = document.createElement('udc-tab-panel');
    detailsPanel.setAttribute('panel', 'details');
    tabs.append(overview, details, overviewPanel, detailsPanel);
    document.body.append(tabs);
    await tabs.updateComplete;
    await nextFrame();

    details.shadowRoot?.querySelector('button')?.click();
    await tabs.updateComplete;
    await details.updateComplete;
    await detailsPanel.updateComplete;

    expect(tabs.selectedPanel).toBe('details');
    expect(details.selected).toBe(true);
    expect(detailsPanel.selected).toBe(true);
    expect(overviewPanel.selected).toBe(false);
  });

  it('registers every documented component tag', () => {
    [
      'udc-breadcrumb',
      'udc-combobox',
      'udc-data-table',
      'udc-data-view',
      'udc-date-picker',
      'udc-dialog',
      'udc-divider',
      'udc-dropdown',
      'udc-icon-wrapper',
      'udc-label',
      'udc-link',
      'udc-list',
      'udc-nav-header',
      'udc-nav-vertical',
      'udc-pagination',
      'udc-radio-group',
      'udc-search',
      'udc-spacer',
      'udc-text-area',
      'udc-toggle',
      'udc-tooltip',
    ].forEach((tagName) => {
      expect(customElements.get(tagName)).toBeTruthy();
    });
  });

  it('updates second-wave form controls and emits value changes', async () => {
    const textarea = document.createElement('udc-text-area');
    const search = document.createElement('udc-search');
    const toggle = document.createElement('udc-toggle');
    const onTextInput = vi.fn();
    const onSearchInput = vi.fn();
    const onToggleChange = vi.fn();
    textarea.addEventListener('udc-input', onTextInput);
    search.addEventListener('udc-input', onSearchInput);
    toggle.addEventListener('udc-change', onToggleChange);
    document.body.append(textarea, search, toggle);
    await textarea.updateComplete;
    await search.updateComplete;
    await toggle.updateComplete;

    const textAreaControl = textarea.shadowRoot?.querySelector('textarea');
    textAreaControl!.value = 'Notes';
    textAreaControl!.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));

    const searchControl = search.shadowRoot?.querySelector('input');
    searchControl!.value = 'Lease';
    searchControl!.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));

    const toggleControl = toggle.shadowRoot?.querySelector('button');
    toggleControl!.click();
    await textarea.updateComplete;
    await search.updateComplete;
    await toggle.updateComplete;

    expect(textarea.value).toBe('Notes');
    expect(search.value).toBe('Lease');
    expect(toggle.checked).toBe(true);
    expect(onTextInput.mock.calls[0][0].detail).toEqual({ value: 'Notes' });
    expect(onSearchInput.mock.calls[0][0].detail).toEqual({ value: 'Lease' });
    expect(onToggleChange.mock.calls[0][0].detail).toEqual({ checked: true, value: 'on' });
  });

  it('selects dropdown items and pages pagination', async () => {
    const dropdown = document.createElement('udc-dropdown');
    const item = document.createElement('udc-dropdown-item');
    item.value = 'active';
    item.textContent = 'Active';
    dropdown.append(item);
    const onDropdownChange = vi.fn();
    dropdown.addEventListener('udc-change', onDropdownChange);

    const pagination = document.createElement('udc-pagination');
    pagination.totalPages = 3;
    const onPageChange = vi.fn();
    pagination.addEventListener('udc-page-change', onPageChange);
    document.body.append(dropdown, pagination);
    await dropdown.updateComplete;
    await item.updateComplete;
    await pagination.updateComplete;

    item.shadowRoot?.querySelector('button')?.click();
    pagination.shadowRoot?.querySelector('[part="next"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    await dropdown.updateComplete;
    await pagination.updateComplete;

    expect(dropdown.value).toBe('active');
    expect(onDropdownChange.mock.calls[0][0].detail).toEqual({ value: 'active' });
    expect(pagination.page).toBe(2);
    expect(onPageChange.mock.calls[0][0].detail).toEqual({ page: 2 });
  });

  it('emits sort changes from data table headers', async () => {
    const table = document.createElement('udc-data-table');
    table.innerHTML = `
      <table>
        <thead>
          <tr><th data-sort-key="tenant" tabindex="0">Tenant</th></tr>
        </thead>
        <tbody><tr><td>Brian Smith</td></tr></tbody>
      </table>
    `;
    const onSort = vi.fn();
    table.addEventListener('udc-sort-change', onSort);
    document.body.append(table);
    await table.updateComplete;

    table.querySelector('th')?.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    table.querySelector('th')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }));
    await table.updateComplete;

    expect(table.sortKey).toBe('tenant');
    expect(table.sortDirection).toBe('desc');
    expect(onSort.mock.calls[0][0].detail).toEqual({ key: 'tenant', direction: 'asc' });
    expect(onSort.mock.calls[1][0].detail).toEqual({ key: 'tenant', direction: 'desc' });
  });
});
