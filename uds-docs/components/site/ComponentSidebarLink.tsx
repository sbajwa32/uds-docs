'use client';

// Component sidebar link with the legacy hover/focus metadata tooltip.
// The tooltip is portaled to <body> so it isn't clipped by the sticky
// sidebar's scrolling/stacking context.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';

import {
  getComponentSpec,
  getComponentStatus,
  type ComponentSpec,
  type ComponentStatus,
} from '@/lib/uds-data';
import { COMPLETENESS_FIELDS, SPEC_FIELD_LABELS } from '@/data/completeness-fields';
import { STATUS_LABELS, STATUS_STEPS } from '@/data/status-labels';

import { useUdsVersion } from './UdsVersionProvider';
import { SgSidebarLink } from './SgSidebar';
import { withUdsVersion } from './internal-href';

interface TooltipData {
  spec: ComponentSpec;
  status: ComponentStatus;
}

interface CompletenessScore {
  filled: number;
  total: number;
  filledFields: Set<string>;
  missingFields: string[];
}

function isFilledValue(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).some(isFilledValue);
  }
  return true;
}

function getDotPath(obj: unknown, dotPath: string): unknown {
  return dotPath.split('.').reduce<unknown>(
    (acc, key) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined),
    obj,
  );
}

function computeCompleteness(spec: ComponentSpec): CompletenessScore {
  let filled = 0;
  const filledFields = new Set<string>();
  const missingFields: string[] = [];

  for (const field of COMPLETENESS_FIELDS) {
    const value = getDotPath(spec, field);
    let isFilled = false;
    if (field === 'owner' && value && typeof value === 'object') {
      const owner = value as { designer?: string; developer?: string };
      isFilled = !!(
        (owner.designer && owner.designer !== 'Unassigned') ||
        (owner.developer && owner.developer !== 'Unassigned')
      );
    } else {
      isFilled = isFilledValue(value);
    }
    if (isFilled) {
      filled++;
      filledFields.add(field);
    } else {
      missingFields.push(field);
    }
  }

  return { filled, total: COMPLETENESS_FIELDS.length, filledFields, missingFields };
}

export function ComponentSidebarLink({
  href,
  componentId,
  children,
}: {
  href: string;
  componentId: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { fetchVersion } = useUdsVersion();
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const [data, setData] = useState<TooltipData | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [top, setTop] = useState(0);
  const [mounted, setMounted] = useState(false);
  // Stable id for the tooltip so the link can declare it via
  // aria-describedby. The id encodes the component id; multiple
  // tooltips never coexist visibly, but keeping the id stable means
  // screen readers re-announce the right one if focus moves between
  // links quickly.
  const tooltipId = `sg-sidebar-tooltip-${componentId}`;

  useEffect(() => setMounted(true), []);

  // Refetch on archive-version switch only when the tooltip has already
  // loaded once; don't front-load 29 component fetches on first paint.
  useEffect(() => {
    if (!data) return;
    setData(null);
  }, [fetchVersion]);

  const active = pathname === href;

  const ensureLoaded = useCallback(async () => {
    if (data || loading) return;
    setLoading(true);
    try {
      const [spec, status] = await Promise.all([
        getComponentSpec(componentId, fetchVersion),
        getComponentStatus(componentId, fetchVersion),
      ]);
      setData({ spec, status });
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [componentId, data, fetchVersion, loading]);

  const show = useCallback(() => {
    const rect = linkRef.current?.getBoundingClientRect();
    if (rect) setTop(rect.top + rect.height / 2);
    setVisible(true);
    void ensureLoaded();
  }, [ensureLoaded]);

  const hide = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (!visible) return;
    const sidebar = document.querySelector('.sg-sidebar');
    sidebar?.addEventListener('scroll', hide);
    window.addEventListener('scroll', hide, true);
    return () => {
      sidebar?.removeEventListener('scroll', hide);
      window.removeEventListener('scroll', hide, true);
    };
  }, [hide, visible]);

  const tooltip = useMemo(() => {
    if (!visible || !mounted || !data) return null;
    return <SidebarTooltip id={tooltipId} top={top} data={data} />;
  }, [data, mounted, top, visible, tooltipId]);

  const versionedHref = withUdsVersion(href, fetchVersion);

  return (
    <>
      <SgSidebarLink
        ref={linkRef}
        href={versionedHref}
        active={active}
        ariaDescribedBy={visible && data ? tooltipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </SgSidebarLink>
      {tooltip ? createPortal(tooltip, document.body) : null}
    </>
  );
}

function SidebarTooltip({
  id,
  top,
  data,
}: {
  id: string;
  top: number;
  data: TooltipData;
}) {
  const meta = STATUS_LABELS[data.status.current] || {
    label: data.status.current,
    css: data.status.current,
  };
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === data.status.current);
  const score = computeCompleteness(data.spec);
  const nextMissing = score.missingFields[0];

  return (
    <span
      id={id}
      className="sg-sidebar-portal-tooltip"
      role="tooltip"
      data-visible="true"
      style={{ top }}
    >
      <span className="sg-sidebar-tooltip__title">{data.spec.title}</span>
      <span className="sg-sidebar-tooltip__section">
        <span className="sg-sidebar-tooltip__section-label">Status</span>
        <span className="sg-sidebar-tooltip__mini-bar sg-sidebar-tooltip__mini-bar--status">
          {STATUS_STEPS.map((step, idx) => {
            let state: 'complete' | 'current' | 'future' = 'future';
            if (currentIdx < 0) state = 'future';
            else if (idx < currentIdx) state = 'complete';
            else if (idx === currentIdx) state = 'current';
            return (
              <span
                key={step.key}
                className="sg-sidebar-tooltip__mini-segment"
                data-state={state}
                data-status={step.key}
              />
            );
          })}
        </span>
        <span className="sg-sidebar-tooltip__caption">
          {meta.label} · since {data.status.since}
        </span>
      </span>
      <span className="sg-sidebar-tooltip__section">
        <span className="sg-sidebar-tooltip__section-label">Spec</span>
        <span className="sg-sidebar-tooltip__mini-bar sg-sidebar-tooltip__mini-bar--spec">
          {COMPLETENESS_FIELDS.map((field) => (
            <span
              key={field}
              className="sg-sidebar-tooltip__mini-segment sg-sidebar-tooltip__mini-segment--spec"
              data-filled={score.filledFields.has(field) ? 'true' : 'false'}
            />
          ))}
        </span>
        <span className="sg-sidebar-tooltip__caption">
          {score.filled} of {score.total} fields filled
        </span>
      </span>
      {nextMissing ? (
        <span className="sg-sidebar-tooltip__missing">
          Next to fill: <strong>{SPEC_FIELD_LABELS[nextMissing as keyof typeof SPEC_FIELD_LABELS]}</strong>
        </span>
      ) : null}
    </span>
  );
}
