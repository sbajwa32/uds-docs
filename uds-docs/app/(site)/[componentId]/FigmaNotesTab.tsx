'use client';

// Figma Notes tab — renders open Figma findings raised by the
// figma-component-inspector subagent.
//
// Conditional injection: the parent (ComponentPageClient) only renders
// this component when figmanotes.json exists and has at least one note,
// so this file just maps notes → cards.

import type { FigmaNotes } from '@/lib/uds-data';

import '../../../styles/site/figma-notes.css';

// File-key for the UDS Components Figma file. Used to build deep-links
// to individual nodes.
const FIGMA_FILE_KEY = '1XJoUJgtNpw4R0IIT3VjoK';

const KIND_LABELS: Record<string, string> = {
  'new-in-figma': 'New in Figma',
  'figma-orphan': 'Figma orphan',
  drift: 'Drift',
  question: 'Open question',
};

type Note = FigmaNotes['notes'][number];

export function FigmaNotesTab({ notes }: { notes: ReadonlyArray<Note> }) {
  return (
    <>
      <p className="sg-figma-notes-intro">
        Open Figma findings the inspector surfaced. These resolve automatically
        on the next inspector run when the underlying condition is fixed.
      </p>
      {notes.map((note) => (
        <FigmaNoteCard key={note.id} note={note} />
      ))}
    </>
  );
}

function FigmaNoteCard({ note }: { note: Note }) {
  const figmaRefs = Array.isArray(note.figmaRefs) ? note.figmaRefs : [];
  const validRefs = figmaRefs.filter((r) => r && r.nodeId);

  const hasFooter = !!(note.autoPruneWhen || note.raisedBy || note.raisedOn);
  const by = note.raisedBy || 'figma-component-inspector';

  return (
    <section className="sg-figma-note" data-kind={note.kind}>
      <header className="sg-figma-note__header">
        <h3 className="sg-figma-note__title">{note.title || '(untitled note)'}</h3>
        {note.kind && (
          <span className="sg-figma-note__kind" data-kind={note.kind}>
            {KIND_LABELS[note.kind] || note.kind}
          </span>
        )}
      </header>

      {note.summary && <p className="sg-figma-note__summary">{note.summary}</p>}

      {note.decisionNeeded && (
        <p className="sg-figma-note__decision">
          <strong>Decision needed: </strong>
          {note.decisionNeeded}
        </p>
      )}

      {validRefs.length > 0 && (
        <ul className="sg-figma-note__refs">
          {validRefs.map((ref) => {
            const node = String(ref.nodeId);
            return (
              <li key={node}>
                <a
                  href={
                    'https://www.figma.com/design/' +
                    FIGMA_FILE_KEY +
                    '/?node-id=' +
                    encodeURIComponent(node.replace(':', '-'))
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sg-figma-note__ref-link"
                >
                  {ref.name || node}
                </a>
                <span className="sg-figma-note__ref-id">{node}</span>
              </li>
            );
          })}
        </ul>
      )}

      {hasFooter && (
        <footer className="sg-figma-note__footer">
          {note.autoPruneWhen && (
            <p className="sg-figma-note__prune">
              <strong>Auto-resolves when: </strong>
              {note.autoPruneWhen}
            </p>
          )}
          <p className="sg-figma-note__meta">
            Raised by {by}
            {note.raisedOn ? ` on ${note.raisedOn}` : ''}
          </p>
        </footer>
      )}
    </section>
  );
}
