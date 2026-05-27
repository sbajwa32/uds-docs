import { css } from 'lit';

export const focusRing = css`
  :focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--uds-color-surface-white, #fff),
      0 0 0 4px var(--uds-color-border-outline-focus-visible, #2563eb);
  }
`;

export const materialIconStyles = css`
  .material-symbols-outlined {
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    font-size: 20px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-feature-settings: 'liga';
    -webkit-font-smoothing: antialiased;
  }
`;

export const hostInline = css`
  :host {
    box-sizing: border-box;
    display: inline-flex;
    font-family: var(--uds-font-family, system-ui, sans-serif);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;

export const hostBlock = css`
  :host {
    box-sizing: border-box;
    display: block;
    font-family: var(--uds-font-family, system-ui, sans-serif);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;
