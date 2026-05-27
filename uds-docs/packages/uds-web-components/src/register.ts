import { UdsBadgeElement } from './components/badge';
import { UdsBreadcrumbElement } from './components/breadcrumb';
import { UdsButtonElement } from './components/button';
import { UdsCheckboxElement } from './components/checkbox';
import { UdsChipElement } from './components/chip';
import { UdsDatePickerElement } from './components/date-picker';
import { UdsDialogElement } from './components/dialog';
import { UdsDropdownElement, UdsDropdownItemElement } from './components/dropdown';
import { UdsLabelElement } from './components/label';
import { UdsLinkElement } from './components/link';
import { UdsNavHeaderElement } from './components/nav-header';
import { UdsNavItemElement, UdsNavVerticalElement } from './components/nav-vertical';
import { UdsNotificationElement } from './components/notification';
import { UdsPaginationElement } from './components/pagination';
import { UdsRadioElement, UdsRadioGroupElement } from './components/radio';
import { UdsSearchElement } from './components/search';
import { UdsTextAreaElement } from './components/text-area';
import { UdsToggleElement } from './components/toggle';
import { UdsTooltipElement } from './components/tooltip';
import {
  UdsComboboxElement,
  UdsComboboxOptionElement,
  UdsDataTableElement,
  UdsDataViewElement,
  UdsDividerElement,
  UdsIconWrapperElement,
  UdsListElement,
  UdsListItemElement,
  UdsSpacerElement,
} from './components/remaining';
import { UdsTabsElement, UdsTabElement, UdsTabPanelElement } from './components/tabs';
import { UdsTextInputElement } from './components/text-input';
import { UdsTileElement } from './components/tile';

const definitions: Array<[string, CustomElementConstructor]> = [
  ['udc-button', UdsButtonElement],
  ['udc-badge', UdsBadgeElement],
  ['udc-chip', UdsChipElement],
  ['udc-notification', UdsNotificationElement],
  ['udc-tile', UdsTileElement],
  ['udc-text-input', UdsTextInputElement],
  ['udc-checkbox', UdsCheckboxElement],
  ['udc-tabs', UdsTabsElement],
  ['udc-tab', UdsTabElement],
  ['udc-tab-panel', UdsTabPanelElement],
  ['udc-breadcrumb', UdsBreadcrumbElement],
  ['udc-combobox', UdsComboboxElement],
  ['udc-combobox-option', UdsComboboxOptionElement],
  ['udc-data-table', UdsDataTableElement],
  ['udc-data-view', UdsDataViewElement],
  ['udc-date-picker', UdsDatePickerElement],
  ['udc-dialog', UdsDialogElement],
  ['udc-divider', UdsDividerElement],
  ['udc-dropdown', UdsDropdownElement],
  ['udc-dropdown-item', UdsDropdownItemElement],
  ['udc-icon-wrapper', UdsIconWrapperElement],
  ['udc-label', UdsLabelElement],
  ['udc-link', UdsLinkElement],
  ['udc-list', UdsListElement],
  ['udc-list-item', UdsListItemElement],
  ['udc-nav-header', UdsNavHeaderElement],
  ['udc-nav-vertical', UdsNavVerticalElement],
  ['udc-nav-item', UdsNavItemElement],
  ['udc-pagination', UdsPaginationElement],
  ['udc-radio-group', UdsRadioGroupElement],
  ['udc-radio', UdsRadioElement],
  ['udc-search', UdsSearchElement],
  ['udc-spacer', UdsSpacerElement],
  ['udc-text-area', UdsTextAreaElement],
  ['udc-toggle', UdsToggleElement],
  ['udc-tooltip', UdsTooltipElement],
];

export function registerUdsComponents() {
  for (const [tagName, elementClass] of definitions) {
    if (!customElements.get(tagName)) customElements.define(tagName, elementClass);
  }
}
