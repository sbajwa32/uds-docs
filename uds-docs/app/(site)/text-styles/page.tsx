// Ported from docs/pages/tokens/text-styles.html + the text-styles render
// function in docs/app.js (~lines 3052-3094) during Chunk 06a.
//
// The legacy markup was just a placeholder div populated by JS. Here it's a
// proper React component reading from the same hardcoded data array. The 35
// utility classes come from uds/tokens/text-styles.css and are applied as-is
// to render preview rows.

export const metadata = { title: 'Text Styles — UDS' };

interface TextStyleItem {
  cls: string;
  label: string;
  spec: string;
}

interface TextStyleSection {
  title: string;
  desc?: string;
  items: TextStyleItem[];
}

const SECTIONS: TextStyleSection[] = [
  {
    title: 'Headings',
    desc: 'Always Bold weight.',
    items: [
      { cls: 'uds-text-heading-h1', label: 'Heading H1', spec: '32/44 Bold' },
      { cls: 'uds-text-heading-h2', label: 'Heading H2', spec: '24/32 Bold' },
      { cls: 'uds-text-heading-h3', label: 'Heading H3', spec: '18/26 Bold' },
      { cls: 'uds-text-heading-h4', label: 'Heading H4', spec: '16/24 Bold' },
    ],
  },
  {
    title: 'Paragraphs',
    desc: '6 sizes x 3 weights = 18 styles.',
    items: [
      { cls: 'uds-text-paragraph-xl', label: 'Paragraph XL', spec: '20/28 Regular' },
      { cls: 'uds-text-paragraph-xl-medium', label: 'Paragraph XL Medium', spec: '20/28 Medium' },
      { cls: 'uds-text-paragraph-xl-bold', label: 'Paragraph XL Bold', spec: '20/28 Bold' },
      { cls: 'uds-text-paragraph-lg', label: 'Paragraph LG', spec: '18/26 Regular' },
      { cls: 'uds-text-paragraph-lg-medium', label: 'Paragraph LG Medium', spec: '18/26 Medium' },
      { cls: 'uds-text-paragraph-lg-bold', label: 'Paragraph LG Bold', spec: '18/26 Bold' },
      { cls: 'uds-text-paragraph-md', label: 'Paragraph MD', spec: '16/24 Regular' },
      { cls: 'uds-text-paragraph-md-medium', label: 'Paragraph MD Medium', spec: '16/24 Medium' },
      { cls: 'uds-text-paragraph-md-bold', label: 'Paragraph MD Bold', spec: '16/24 Bold' },
      { cls: 'uds-text-paragraph-base', label: 'Paragraph Base', spec: '14/20 Regular' },
      { cls: 'uds-text-paragraph-base-medium', label: 'Paragraph Base Medium', spec: '14/20 Medium' },
      { cls: 'uds-text-paragraph-base-bold', label: 'Paragraph Base Bold', spec: '14/20 Bold' },
      { cls: 'uds-text-paragraph-sm', label: 'Paragraph SM', spec: '12/16 Regular' },
      { cls: 'uds-text-paragraph-sm-medium', label: 'Paragraph SM Medium', spec: '12/16 Medium' },
      { cls: 'uds-text-paragraph-sm-bold', label: 'Paragraph SM Bold', spec: '12/16 Bold' },
      { cls: 'uds-text-paragraph-xs', label: 'Paragraph XS', spec: '10/12 Regular' },
      { cls: 'uds-text-paragraph-xs-medium', label: 'Paragraph XS Medium', spec: '10/12 Medium' },
      { cls: 'uds-text-paragraph-xs-bold', label: 'Paragraph XS Bold', spec: '10/12 Bold' },
    ],
  },
  {
    title: 'Labels',
    desc: '2 sizes x 3 weights = 6 styles.',
    items: [
      { cls: 'uds-text-label-base', label: 'Label Base', spec: '14/20 Regular' },
      { cls: 'uds-text-label-base-medium', label: 'Label Base Medium', spec: '14/20 Medium' },
      { cls: 'uds-text-label-base-bold', label: 'Label Base Bold', spec: '14/20 Bold' },
      { cls: 'uds-text-label-sm', label: 'Label SM', spec: '12/16 Regular' },
      { cls: 'uds-text-label-sm-medium', label: 'Label SM Medium', spec: '12/16 Medium' },
      { cls: 'uds-text-label-sm-bold', label: 'Label SM Bold', spec: '12/16 Bold' },
    ],
  },
  {
    title: 'Inputs',
    desc: 'Form input text styles.',
    items: [
      { cls: 'uds-text-input-base', label: 'Input Base', spec: '14/20 Regular' },
      { cls: 'uds-text-input-base-medium', label: 'Input Base Medium', spec: '14/20 Medium' },
      { cls: 'uds-text-input-base-bold', label: 'Input Base Bold', spec: '14/20 Bold' },
      { cls: 'uds-text-input-helper', label: 'Input Helper', spec: '10/12 Regular' },
    ],
  },
  {
    title: 'Data',
    desc: 'Table cell styles.',
    items: [
      { cls: 'uds-text-data-cell', label: 'Data Cell', spec: '14/20 Regular' },
      { cls: 'uds-text-data-cell-medium', label: 'Data Cell Medium', spec: '14/20 Medium' },
      { cls: 'uds-text-data-cell-bold', label: 'Data Cell Bold', spec: '14/20 Bold' },
    ],
  },
];

function TextStyleRow({ cls, label, spec }: TextStyleItem) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <span className={cls}>{label}</span>
      <span
        style={{
          fontSize: 'var(--uds-font-size-xs)',
          color: 'var(--uds-color-text-secondary)',
          whiteSpace: 'nowrap',
        }}
      >
        .{cls} &middot; {spec}
      </span>
    </div>
  );
}

export default function TextStylesPage() {
  return (
    <>
      <h1 className="sg-page-title">Text Styles</h1>
      <p className="sg-page-desc">
        35 typography utility classes built on semantic font tokens. Each maps
        1:1 to a Figma text style and responds to font family, scale, and
        density changes via the theme bar above.
      </p>
      {SECTIONS.map((section) => (
        <div key={section.title} className="sg-subsection">
          <h3 className="sg-subsection-title">{section.title}</h3>
          {section.desc ? <p className="sg-subsection-desc">{section.desc}</p> : null}
          <div className="sg-example">
            <div
              className="sg-example-preview"
              data-direction="column"
              style={{ gap: 12 }}
            >
              {section.items.map((item) => (
                <TextStyleRow key={item.cls} {...item} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
