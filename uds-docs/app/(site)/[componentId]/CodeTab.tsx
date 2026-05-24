// Code tab — renders Import line + CSS Classes table + Data Attributes table
// from data/component-api/<componentId>.ts. Falls back to rawCodeHtml when
// the component's legacy Code tab didn't follow the standard structure.

import { COMPONENT_API } from '@/data/component-api';

export function CodeTab({ componentId }: { componentId: string }) {
  const api = COMPONENT_API[componentId];

  if (!api) {
    return (
      <p className="sg-changelog-empty">
        No API documented for <code>{componentId}</code> yet.
      </p>
    );
  }

  // Raw fallback — render the legacy Code tab markup verbatim.
  if (api.rawCodeHtml && (!api.cssClasses || api.cssClasses.length === 0) && !api.attributes) {
    return <div dangerouslySetInnerHTML={{ __html: api.rawCodeHtml }} />;
  }

  return (
    <>
      {api.importPath ? (
        <>
          <h3 className="sg-subsection-title">Import</h3>
          <pre className="sg-playground-code" style={{ marginBottom: 24 }}>
            @import url(&apos;{api.importPath}&apos;);
          </pre>
        </>
      ) : null}

      {api.cssClasses && api.cssClasses.length > 0 ? (
        <>
          <h3 className="sg-subsection-title">CSS Classes</h3>
          <table className="sg-api-table">
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
        </>
      ) : null}

      {api.attributes && api.attributes.length > 0 ? (
        <>
          <h3 className="sg-subsection-title">Data Attributes</h3>
          <table className="sg-api-table">
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
