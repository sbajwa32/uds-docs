import { beforeEach, describe, expect, it } from 'vitest';

import { assembleHTMLBody, composeHTMLBody, type ExampleMap } from './assembler';
import { reseedRandom } from './rng';

describe('composeHTMLBody (pure composition)', () => {
  beforeEach(() => {
    reseedRandom(123);
  });

  it('returns the layout shell when no components are selected', () => {
    const out = composeHTMLBody({}, []);
    expect(out).toContain('max-width:1000px');
    expect(out).toContain('margin:0 auto');
  });

  it('wraps content in the nav-shell when nav-header or nav-vertical is selected', () => {
    const examples: ExampleMap = {
      'nav-header': '<header>nav</header>',
      button: '<button>Go</button>',
    };
    const out = composeHTMLBody(examples, ['nav-header', 'button']);
    expect(out).toContain('<header>nav</header>');
    expect(out).toContain('<button>Go</button>');
    expect(out).toContain('min-height:calc(100vh - 76px)');
  });

  it('renders the page-title heading next to the action button when both button + data-table are present', () => {
    const examples: ExampleMap = {
      button: '<button>New</button>',
      'data-table': '<table>...</table>',
    };
    const out = composeHTMLBody(examples, ['button', 'data-table']);
    expect(out).toMatch(/<h2[^>]*>[^<]+<\/h2><button>New<\/button>/);
    expect(out).toContain('<table>...</table>');
  });

  it('groups form fields under a heading when form components are selected', () => {
    const examples: ExampleMap = {
      'text-input': '<input />',
      checkbox: '<input type="checkbox" />',
    };
    const out = composeHTMLBody(examples, ['text-input', 'checkbox']);
    expect(out).toMatch(/<h3[^>]*>[^<]+<\/h3>/);
    expect(out).toContain('<input />');
    expect(out).toContain('<input type="checkbox" />');
  });

  it('combines search + chip into a filter bar above the table', () => {
    const examples: ExampleMap = {
      search: '<input type="search" />',
      chip: '<span>Active</span>',
    };
    const out = composeHTMLBody(examples, ['search', 'chip']);
    expect(out).toContain('flex-wrap:wrap');
    expect(out).toContain('<input type="search" />');
    expect(out).toContain('<span>Active</span>');
  });

  it('omits sections whose component HTML is empty', () => {
    const examples: ExampleMap = {
      button: '<button>Go</button>',
      'data-table': '',
    };
    const out = composeHTMLBody(examples, ['button', 'data-table']);
    expect(out).toContain('<button>Go</button>');
    expect(out).not.toMatch(/<table[\s\S]*<\/table>/);
  });

  it('emits sections in the canonical layout order', () => {
    const examples: ExampleMap = {
      breadcrumb: '<nav>bc</nav>',
      notification: '<aside>note</aside>',
      tabs: '<div>tabs</div>',
      'data-table': '<table>tbl</table>',
    };
    const out = composeHTMLBody(examples, [
      'data-table',
      'tabs',
      'breadcrumb',
      'notification',
    ]);
    const idxBreadcrumb = out.indexOf('<nav>bc</nav>');
    const idxNotification = out.indexOf('<aside>note</aside>');
    const idxTabs = out.indexOf('<div>tabs</div>');
    const idxTable = out.indexOf('<table>tbl</table>');
    expect(idxBreadcrumb).toBeGreaterThan(-1);
    expect(idxNotification).toBeGreaterThan(idxBreadcrumb);
    expect(idxTabs).toBeGreaterThan(idxNotification);
    expect(idxTable).toBeGreaterThan(idxTabs);
  });
});

describe('assembleHTMLBody (async wrapper)', () => {
  beforeEach(() => {
    reseedRandom(99);
  });

  it('fetches each requested component once and composes the result', async () => {
    const calls: string[] = [];
    const out = await assembleHTMLBody(['nav-header', 'button'], {
      fetchRawExample: async (id) => {
        calls.push(id);
        return `<div data-cid="${id}">{{tenant}}</div>`;
      },
    });
    expect(calls.sort()).toEqual(['button', 'nav-header']);
    expect(out).toContain('<div data-cid="nav-header">');
    expect(out).toContain('<div data-cid="button">');
    // {{tenant}} should be substituted to a real name (not left literal).
    expect(out).not.toContain('{{tenant}}');
  });

  it('treats null fetch results as empty fragments', async () => {
    const out = await assembleHTMLBody(['button', 'data-table'], {
      fetchRawExample: async (id) => (id === 'button' ? '<button>Go</button>' : null),
    });
    expect(out).toContain('<button>Go</button>');
    expect(out).not.toContain('<table');
  });

  it('swallows fetch rejections per component without aborting the build', async () => {
    const out = await assembleHTMLBody(['button', 'data-table'], {
      fetchRawExample: async (id) => {
        if (id === 'data-table') throw new Error('boom');
        return '<button>Go</button>';
      },
    });
    expect(out).toContain('<button>Go</button>');
  });
});
