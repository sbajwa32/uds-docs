'use client';

// Code tab — live docs now lead with the Web Component API. The legacy
// component-api table remains as a fallback for components without a
// Web Component example or for archive contexts.

import { WEB_COMPONENT_EXAMPLES } from '@/data/web-component-examples';
import { COMPONENT_API } from '@/data/component-api';
import { DocsCodeBlock, DocsSection, DocsStateMessage } from '@/components/site/ui';

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractLegacyCode(rawCodeHtml: string): string {
  const codeMatch = /<code>([\s\S]*?)<\/code>/i.exec(rawCodeHtml);
  return decodeHtmlEntities(codeMatch?.[1] ?? rawCodeHtml.replace(/<[^>]+>/g, ''));
}

export function CodeTab({ componentId }: { componentId: string }) {
  const webComponentExample = WEB_COMPONENT_EXAMPLES[componentId]?.[0] ?? null;
  const api = COMPONENT_API[componentId];

  if (webComponentExample) {
    return (
      <>
        <DocsSection
          title="Install"
          description="Register the Web Components package once, then use the component tag anywhere in your app."
        >
          <DocsCodeBlock
            code={`import './uds/uds.css';
import { registerUdsComponents } from '@uds/web-components';

registerUdsComponents();`}
            language="js"
          />
        </DocsSection>

        <DocsSection title="Web Component Usage" description={webComponentExample.description}>
          <DocsCodeBlock code={webComponentExample.html} language="html" />
        </DocsSection>
      </>
    );
  }

  if (!api) {
    return (
      <DocsStateMessage>
        No API documented for <code>{componentId}</code> yet.
      </DocsStateMessage>
    );
  }

  // Raw fallback — render the legacy code sample as text, not HTML.
  if (api.rawCodeHtml && (!api.cssClasses || api.cssClasses.length === 0) && !api.attributes) {
    return (
      <DocsSection title="Legacy HTML">
        <DocsCodeBlock code={extractLegacyCode(api.rawCodeHtml)} language="html" />
      </DocsSection>
    );
  }

  return (
    <>
      {api.importPath ? (
        <>
          <DocsSection title="Import">
            <DocsCodeBlock code={`@import url('${api.importPath}');`} language="css" />
          </DocsSection>
        </>
      ) : null}

      {api.cssClasses && api.cssClasses.length > 0 ? (
        <>
          <DocsSection title="CSS Classes">
          <table className="ds-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {api.cssClasses.map((cls) => (
                <tr key={cls.name}>
                  <td>
                    <code>{cls.name}</code>
                  </td>
                  <td>{cls.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </DocsSection>
        </>
      ) : null}

      {api.attributes && api.attributes.length > 0 ? (
        <>
          <DocsSection title="Data Attributes">
          <table className="ds-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Values</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {api.attributes.map((attr) => (
                <tr key={attr.name}>
                  <td>
                    <code>{attr.name}</code>
                  </td>
                  <td>
                    {attr.values === '—' ? (
                      '—'
                    ) : (
                      <ValuesCell values={attr.values} />
                    )}
                  </td>
                  <td>{attr.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </DocsSection>
        </>
      ) : null}
    </>
  );
}

function ValuesCell({ values }: { values: string }) {
  // Comma-separated list of values, each wrapped in <code>.
  const parts = values.split(',').map((p) => p.trim()).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => (
        <span key={p}>
          <code>{p}</code>
          {i < parts.length - 1 ? ', ' : ''}
        </span>
      ))}
    </>
  );
}
