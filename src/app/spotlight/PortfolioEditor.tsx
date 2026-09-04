'use client';

import React, { useEffect, useState } from 'react';
import {
  APPEARANCE_URL, CLAIM_START_URL, LAYOUT_NOTES, PORTFOLIO_ACCENTS,
  PORTFOLIO_LAYOUTS, PortfolioAccent, PortfolioLayout, ShowcaseItem,
} from './constants';

export type Appearance = {
  layout: PortfolioLayout;
  accent: PortfolioAccent;
  feature: number | null;
};

/**
 * The customise bar a creator gets on their own portfolio.
 *
 * The preview is the page itself. Picking a layout re-renders the real
 * portfolio behind this bar with the creator's real work in it, which is
 * the only honest way to choose: five names and five sentences cannot
 * tell someone whether their own GFX looks better as a wall or a sheet.
 *
 * Nothing is written until Save. Cancel restores what was stored, so a
 * creator can try all five and walk away unchanged.
 */
export default function PortfolioEditor({
  layout, accent, feature, items, onPreview, onClose, onSaved,
}: {
  layout: PortfolioLayout;
  accent: PortfolioAccent;
  feature: number | null;
  /** Everything loaded on the page, for the fold picker. Loaded rather
      than all: a creator past one page picks from what they can see, and
      pressing "show more" adds to the strip. */
  items: ShowcaseItem[];
  onPreview: (next: Appearance) => void;
  onClose: () => void;
  onSaved: (saved: Appearance) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Escape is the same as Cancel: it puts back what was stored, because
  // an editor that keeps an unsaved preview after you dismiss it is
  // showing you a portfolio nobody else can see.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(APPEARANCE_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout, accent, feature_item_id: feature }),
      });
      if (res.status === 401) {
        // The session expired while they were deciding. Send them back
        // through Discord and return them to this page rather than
        // dropping the choice on the floor.
        const next = encodeURIComponent(window.location.href);
        window.location.href = `${CLAIM_START_URL}?next=${next}`;
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || 'That did not save. Try again.');
        return;
      }
      // The server answers with what actually renders, which can differ
      // from what was asked for, so the page settles on its answer.
      onSaved({
        layout: data.layout,
        accent: data.accent,
        feature: data.feature_item_id ?? null,
      });
    } catch {
      setError('That did not save. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pe-bar" role="dialog" aria-label="Customise your portfolio">
      <div className="pe-group">
        <span className="pe-label">Layout</span>
        <div className="pe-opts">
          {PORTFOLIO_LAYOUTS.map((id) => (
            <button
              type="button"
              key={id}
              className="pe-pill"
              aria-pressed={id === layout}
              title={LAYOUT_NOTES[id]}
              onClick={() => onPreview({ layout: id, accent, feature })}
            >
              {id[0].toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="pe-group">
        <span className="pe-label">Colour</span>
        <div className="pe-opts">
          {(Object.keys(PORTFOLIO_ACCENTS) as PortfolioAccent[]).map((id) => (
            <button
              type="button"
              key={id}
              className="pe-swatch"
              style={{ background: PORTFOLIO_ACCENTS[id].hex }}
              aria-pressed={id === accent}
              aria-label={PORTFOLIO_ACCENTS[id].label}
              title={PORTFOLIO_ACCENTS[id].label}
              onClick={() => onPreview({ layout, accent: id, feature })}
            />
          ))}
        </div>
      </div>

      {/* Only Feature reads it, so it only appears there. Offering a
          fold picker beside a layout with no fold is a control that does
          nothing, which reads as broken rather than as inapplicable. */}
      {layout === 'feature' && items.length > 0 && (
        <div className="pe-group pe-fold">
          <span className="pe-label">Fold</span>
          <div className="pe-strip">
            <button
              type="button"
              className="pe-auto"
              aria-pressed={feature === null}
              title="Let the network's hearts choose"
              onClick={() => onPreview({ layout, accent, feature: null })}
            >
              Auto
            </button>
            {items.map((item) => {
              const m = item.media[0];
              const still = m?.content_type.startsWith('video/')
                ? m.thumbnail
                : m?.url;
              return (
                <button
                  type="button"
                  key={item.id}
                  className="pe-thumb"
                  aria-pressed={feature === item.id}
                  aria-label={`Feature this creation`}
                  onClick={() => onPreview({ layout, accent, feature: item.id })}
                >
                  {still && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={still} alt="" referrerPolicy="no-referrer" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="pe-note">{error || LAYOUT_NOTES[layout]}</p>

      <div className="pe-actions">
        <button type="button" className="pe-cancel" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="pe-save"
          onClick={save}
          disabled={saving}
        >
          {saving ? 'Saving' : 'Save'}
        </button>
      </div>

      <style jsx global>{`
        .pe-bar {
          position: fixed;
          flex-wrap: wrap;
          left: 50%;
          bottom: 18px;
          transform: translateX(-50%);
          z-index: 80;
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 10px 14px;
          max-width: calc(100vw - 24px);
          overflow-x: auto;
          background: rgba(16, 16, 24, 0.94);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          box-shadow: 0 20px 50px -22px #000;
          font-family: 'Inter', -apple-system, sans-serif;
          color: #f4f5fa;
        }
        .pe-group { display: flex; align-items: center; gap: 9px; }
        .pe-label {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          color: #6f7385;
          white-space: nowrap;
        }
        .pe-opts { display: flex; align-items: center; gap: 4px; }
        .pe-pill {
          appearance: none;
          border: 1px solid transparent;
          background: none;
          font: inherit;
          font-size: 12.5px;
          color: #9ba0b4;
          padding: 6px 11px 7px;
          border-radius: 6px;
          cursor: pointer;
          white-space: nowrap;
          transition: color 0.16s ease, background 0.16s ease;
        }
        .pe-pill:hover { color: #f4f5fa; background: rgba(255, 255, 255, 0.06); }
        .pe-pill[aria-pressed='true'] {
          color: #0a0a0f;
          background: var(--beam, #ffd98a);
          font-weight: 600;
        }
        .pe-swatch {
          width: 20px;
          height: 20px;
          padding: 0;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .pe-swatch:hover { transform: scale(1.15); }
        .pe-swatch[aria-pressed='true'] {
          border-color: #f4f5fa;
          transform: scale(1.15);
        }
        /* Doubles as the error line. One slot, because a bar that grows a
           row on failure shifts every control out from under the cursor
           that just pressed Save. */
        .pe-note {
          margin: 0;
          font-size: 11.5px;
          line-height: 1.35;
          color: #9ba0b4;
          max-width: 36ch;
          min-width: 16ch;
        }
        /* Its own row: a strip of thumbnails beside four other controls
           would either squeeze them or push Save off a laptop screen. */
        .pe-fold { flex: 1 1 100%; order: 4; min-width: 0; }
        .pe-strip {
          display: flex;
          align-items: center;
          gap: 5px;
          overflow-x: auto;
          padding-bottom: 3px;
          min-width: 0;
        }
        .pe-thumb {
          flex: none;
          width: 46px;
          height: 34px;
          padding: 0;
          overflow: hidden;
          border-radius: 4px;
          border: 2px solid transparent;
          background: #06060a;
          cursor: pointer;
          opacity: 0.55;
          transition: opacity 0.16s ease, border-color 0.16s ease;
        }
        .pe-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .pe-thumb:hover { opacity: 1; }
        .pe-thumb[aria-pressed='true'] {
          opacity: 1;
          border-color: var(--beam, #ffd98a);
        }
        .pe-auto {
          flex: none;
          appearance: none;
          font: inherit;
          font-size: 11.5px;
          color: #9ba0b4;
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 4px;
          padding: 9px 10px;
          cursor: pointer;
          white-space: nowrap;
        }
        .pe-auto[aria-pressed='true'] {
          color: #0a0a0f;
          background: var(--beam, #ffd98a);
          border-color: transparent;
          font-weight: 600;
        }
        .pe-actions { display: flex; align-items: center; gap: 8px; }
        .pe-cancel, .pe-save {
          appearance: none;
          font: inherit;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          white-space: nowrap;
        }
        .pe-cancel {
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: none;
          color: #9ba0b4;
        }
        .pe-cancel:hover { color: #f4f5fa; }
        .pe-save {
          border: 0;
          background: var(--beam, #ffd98a);
          color: #0a0a0f;
        }
        .pe-save:disabled { opacity: 0.6; cursor: default; }
        .pe-bar :focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

        @media (max-width: 900px) {
          .pe-bar {
            left: 12px;
            right: 12px;
            transform: none;
            max-width: none;
            flex-wrap: wrap;
            gap: 10px 14px;
            overflow-x: visible;
          }
          /* Each group takes its own row and scrolls inside itself. With
             the bar doing the scrolling, the five layout names ran off
             the edge of a phone with nothing to say they continued. */
          .pe-group { flex: 1 1 100%; min-width: 0; }
          .pe-opts { overflow-x: auto; padding-bottom: 2px; }
          .pe-note { max-width: none; flex: 1 1 100%; order: 5; }
          .pe-fold { order: 4; }
          .pe-actions { flex: 1 1 100%; order: 6; }
          .pe-cancel, .pe-save { flex: 1; }
        }
      `}</style>
    </div>
  );
}
