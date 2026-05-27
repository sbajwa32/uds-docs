import React from 'react';
import { createComponent } from '@lit/react';

import {
  UdsBadgeElement,
  UdsButtonElement,
  UdsCheckboxElement,
  UdsChipElement,
  UdsBreadcrumbElement,
  UdsComboboxElement,
  UdsComboboxOptionElement,
  UdsDataTableElement,
  UdsDataViewElement,
  UdsDatePickerElement,
  UdsDialogElement,
  UdsDividerElement,
  UdsDropdownElement,
  UdsDropdownItemElement,
  UdsIconWrapperElement,
  UdsLabelElement,
  UdsLinkElement,
  UdsListElement,
  UdsListItemElement,
  UdsNavHeaderElement,
  UdsNavItemElement,
  UdsNavVerticalElement,
  UdsNotificationElement,
  UdsPaginationElement,
  UdsRadioElement,
  UdsRadioGroupElement,
  UdsSearchElement,
  UdsSpacerElement,
  UdsTabElement,
  UdsTabPanelElement,
  UdsTabsElement,
  UdsTextAreaElement,
  UdsTextInputElement,
  UdsTileElement,
  UdsToggleElement,
  UdsTooltipElement,
  registerUdsComponents,
} from '@uds/web-components';

registerUdsComponents();

export const UdsButton = createComponent({
  react: React,
  tagName: 'udc-button',
  elementClass: UdsButtonElement,
});

export const UdsBadge = createComponent({
  react: React,
  tagName: 'udc-badge',
  elementClass: UdsBadgeElement,
});

export const UdsChip = createComponent({
  react: React,
  tagName: 'udc-chip',
  elementClass: UdsChipElement,
  events: {
    onUdsChipToggle: 'udc-chip-toggle',
    onUdsDismiss: 'udc-dismiss',
  },
});

export const UdsNotification = createComponent({
  react: React,
  tagName: 'udc-notification',
  elementClass: UdsNotificationElement,
  events: {
    onUdsDismiss: 'udc-dismiss',
  },
});

export const UdsTile = createComponent({
  react: React,
  tagName: 'udc-tile',
  elementClass: UdsTileElement,
  events: {
    onUdsTileToggle: 'udc-tile-toggle',
  },
});

export const UdsTextInput = createComponent({
  react: React,
  tagName: 'udc-text-input',
  elementClass: UdsTextInputElement,
  events: {
    onUdsInput: 'udc-input',
    onUdsChange: 'udc-change',
  },
});

export const UdsCheckbox = createComponent({
  react: React,
  tagName: 'udc-checkbox',
  elementClass: UdsCheckboxElement,
  events: {
    onUdsChange: 'udc-change',
  },
});

export const UdsTabs = createComponent({
  react: React,
  tagName: 'udc-tabs',
  elementClass: UdsTabsElement,
  events: {
    onUdsTabChange: 'udc-tab-change',
  },
});

export const UdsTab = createComponent({
  react: React,
  tagName: 'udc-tab',
  elementClass: UdsTabElement,
});

export const UdsTabPanel = createComponent({
  react: React,
  tagName: 'udc-tab-panel',
  elementClass: UdsTabPanelElement,
});

export const UdsBreadcrumb = createComponent({ react: React, tagName: 'udc-breadcrumb', elementClass: UdsBreadcrumbElement });
export const UdsCombobox = createComponent({
  react: React,
  tagName: 'udc-combobox',
  elementClass: UdsComboboxElement,
  events: { onUdsChange: 'udc-change' },
});
export const UdsComboboxOption = createComponent({ react: React, tagName: 'udc-combobox-option', elementClass: UdsComboboxOptionElement });
export const UdsDataTable = createComponent({
  react: React,
  tagName: 'udc-data-table',
  elementClass: UdsDataTableElement,
  events: { onUdsSortChange: 'udc-sort-change' },
});
export const UdsDataView = createComponent({ react: React, tagName: 'udc-data-view', elementClass: UdsDataViewElement });
export const UdsDatePicker = createComponent({
  react: React,
  tagName: 'udc-date-picker',
  elementClass: UdsDatePickerElement,
  events: { onUdsChange: 'udc-change' },
});
export const UdsDialog = createComponent({
  react: React,
  tagName: 'udc-dialog',
  elementClass: UdsDialogElement,
  events: { onUdsClose: 'udc-close' },
});
export const UdsDivider = createComponent({ react: React, tagName: 'udc-divider', elementClass: UdsDividerElement });
export const UdsDropdown = createComponent({
  react: React,
  tagName: 'udc-dropdown',
  elementClass: UdsDropdownElement,
  events: { onUdsChange: 'udc-change' },
});
export const UdsDropdownItem = createComponent({ react: React, tagName: 'udc-dropdown-item', elementClass: UdsDropdownItemElement });
export const UdsIconWrapper = createComponent({ react: React, tagName: 'udc-icon-wrapper', elementClass: UdsIconWrapperElement });
export const UdsLabel = createComponent({ react: React, tagName: 'udc-label', elementClass: UdsLabelElement });
export const UdsLink = createComponent({ react: React, tagName: 'udc-link', elementClass: UdsLinkElement });
export const UdsList = createComponent({ react: React, tagName: 'udc-list', elementClass: UdsListElement });
export const UdsListItem = createComponent({
  react: React,
  tagName: 'udc-list-item',
  elementClass: UdsListItemElement,
  events: { onUdsListItemSelect: 'udc-list-item-select' },
});
export const UdsNavHeader = createComponent({ react: React, tagName: 'udc-nav-header', elementClass: UdsNavHeaderElement });
export const UdsNavVertical = createComponent({ react: React, tagName: 'udc-nav-vertical', elementClass: UdsNavVerticalElement });
export const UdsNavItem = createComponent({ react: React, tagName: 'udc-nav-item', elementClass: UdsNavItemElement });
export const UdsPagination = createComponent({
  react: React,
  tagName: 'udc-pagination',
  elementClass: UdsPaginationElement,
  events: { onUdsPageChange: 'udc-page-change' },
});
export const UdsRadioGroup = createComponent({
  react: React,
  tagName: 'udc-radio-group',
  elementClass: UdsRadioGroupElement,
  events: { onUdsRadioGroupChange: 'udc-radio-group-change' },
});
export const UdsRadio = createComponent({
  react: React,
  tagName: 'udc-radio',
  elementClass: UdsRadioElement,
  events: { onUdsChange: 'udc-change' },
});
export const UdsSearch = createComponent({
  react: React,
  tagName: 'udc-search',
  elementClass: UdsSearchElement,
  events: { onUdsInput: 'udc-input', onUdsChange: 'udc-change' },
});
export const UdsSpacer = createComponent({ react: React, tagName: 'udc-spacer', elementClass: UdsSpacerElement });
export const UdsTextArea = createComponent({
  react: React,
  tagName: 'udc-text-area',
  elementClass: UdsTextAreaElement,
  events: { onUdsInput: 'udc-input', onUdsChange: 'udc-change' },
});
export const UdsToggle = createComponent({
  react: React,
  tagName: 'udc-toggle',
  elementClass: UdsToggleElement,
  events: { onUdsChange: 'udc-change' },
});
export const UdsTooltip = createComponent({ react: React, tagName: 'udc-tooltip', elementClass: UdsTooltipElement });

export type {
  UdsBadgeSize,
  UdsBadgeTone,
  UdsBadgeVariant,
  UdsButtonColor,
  UdsButtonSize,
  UdsButtonType,
  UdsButtonVariant,
  UdsCheckboxChangeDetail,
  UdsCheckedChangeDetail,
  UdsChipToggleDetail,
  UdsChipVariant,
  UdsDismissDetail,
  UdsNotificationTone,
  UdsNotificationVariant,
  UdsPageChangeDetail,
  UdsSortChangeDetail,
  UdsTabChangeDetail,
  UdsTextInputDetail,
  UdsTextInputState,
  UdsTextInputType,
  UdsTileToggleDetail,
  UdsValueChangeDetail,
} from '@uds/web-components';
