'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CLAIM_START_URL, INTRODUCE_URL, INTRODUCTIONS_URL, SUPPORT_INVITE_URL,
} from './constants';
import { DiscordHandle } from './PortfolioHeader';
import type { Likes } from './useLikes';

/** One ask as the server describes it. "waiting" covers a creator's no
    as well as no answer yet: the page never tells a requester they were
    turned down, the same as the DMs. */
type AskRequest = {
  id: number;
  creator: string;
  status: 'waiting' | 'accepted' | 'refused' | 'undelivered';
  handle: string;
  created_at: string;
};

type AskStatus = {
  signed_in: boolean;
  can_ask: boolean;
  reason: string;
  request: AskRequest | null;
};

/** Matches NEED_MAX in the Spotlight service and the bot's modal.
    Raised from 300 on 2026-10-11 at a hirer's request. */
const NEED_MAX = 1000;
const BUDGET_MAX = 80;
/** The hash a signed-out press carries through Discord sign-in, so the
    form is already open when the viewer lands back here. */
const OPEN_HASH = '#ask';

/**
 * Ask for an introduction, from the portfolio page.
 *
 * The same ask the creator card offers in Discord. The creator gets a DM
 * with what the viewer needs and a Blacklight line on them, and decides;
 * on yes both get the other's handle, and the handle also appears here.
 * Nothing on this page lets anyone message the creator directly:
 * Spotlight is the wire, not the room.
 *
 * The press is also the sign-in. A signed-out viewer is sent through the
 * claim OAuth flow with ?next= pointing back here plus #ask, which is how
 * a hirer who has never used Spotlight ends up with an account: they
 * came to hire somebody, and that is the one thing they are asked to
 * sign in for.
 */
export default function AskIntroduction({ creator, likes }: {
  creator: string; likes: Likes;
}) {
  const [info, setInfo] = useState<AskStatus | null>(null);
  const [open, setOpen] = useState(false);
  const [need, setNeed] = useState('');
  const [budget, setBudget] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ creator });
      const r = await fetch(`${INTRODUCTIONS_URL}?${params}`, { credentials: 'include' });
      if (!r.ok) return;
      const body = (await r.json()) as AskStatus;
      setInfo(body);
      // Back from sign-in with the hash: open the form if the ask is
      // allowed, and clear the hash either way so a reload does not
      // reopen it.
      if (window.location.hash === OPEN_HASH) {
        if (body.signed_in && body.can_ask) setOpen(true);
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } catch {
      // The button still renders; a press will find out.
    }
  }, [creator]);

  useEffect(() => {
    if (!likes.ready) return;
    if (!likes.signedIn) { setInfo({ signed_in: false, can_ask: false, reason: '', request: null }); return; }
    load();
  }, [likes.ready, likes.signedIn, load]);

  const press = () => {
    if (!likes.ready) return;
    if (!likes.signedIn) {
      const here = window.location.href.split('#')[0] + OPEN_HASH;
      window.location.href = `${CLAIM_START_URL}?next=${encodeURIComponent(here)}`;
      return;
    }
    setOpen(true);
  };

  const send = async () => {
    if (sending || !need.trim()) return;
    setSending(true);
    setNotice('');
    try {
      const r = await fetch(INTRODUCE_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator, need: need.trim(), budget: budget.trim() }),
      });
      if (r.status === 401) { press(); return; }
      const body = (await r.json()) as { ok: boolean; text: string; request: AskRequest | null };
      if (body.ok && body.request) {
        setInfo((prev) => ({ ...(prev ?? { signed_in: true, can_ask: false, reason: '' }), request: body.request, can_ask: false }));
        setOpen(false);
        setNeed('');
        setBudget('');
      } else {
        setNotice(body.text || 'Could not send that just now. Try again in a minute.');
      }
    } catch {
      setNotice('Could not send that just now. Try again in a minute.');
    } finally {
      setSending(false);
    }
  };

  if (!likes.ready || info === null) return null;

  const request = info.request;
  if (request?.status === 'accepted') {
    return (
      <div className="pf-ask">
        <p className="pf-ask-state">
          {creator} said yes. Message them on Discord:{' '}
          <DiscordHandle handle={request.handle || creator} />
        </p>
      </div>
    );
  }
  if (request) {
    return (
      <div className="pf-ask">
        <p className="pf-ask-state">
          Request sent. Spotlight will DM you if {creator} says yes, and their handle will show here.
          <br />
          Not in a Spotlight server? <a href={SUPPORT_INVITE_URL} target="_blank" rel="noopener noreferrer">Join the Support server ↗</a> so Spotlight can reach you.
        </p>
      </div>
    );
  }
  if (info.signed_in && !info.can_ask) {
    // Nothing to press: the reason is the whole message.
    return info.reason ? (
      <div className="pf-ask"><p className="pf-ask-state">{info.reason}</p></div>
    ) : null;
  }

  return (
    <div className="pf-ask">
      {!open && (
        <button type="button" className="pf-ask-btn" onClick={press}>
          Ask for an introduction
        </button>
      )}
      {open && (
        <div className="pf-ask-form" role="group" aria-label={`Ask ${creator} for an introduction`}>
          <label>
            What do you need?
            <textarea
              value={need}
              maxLength={NEED_MAX}
              placeholder="A sentence or two about the work."
              onChange={(e) => setNeed(e.target.value)}
              autoFocus
            />
          </label>
          <label>
            Budget, if you have one
            <input
              type="text"
              value={budget}
              maxLength={BUDGET_MAX}
              placeholder="e.g. 15,000 to 25,000 Robux"
              onChange={(e) => setBudget(e.target.value)}
            />
          </label>
          <p className="pf-ask-note">
            {creator} gets this as a DM from Spotlight and decides. If they say yes, you each get the other&apos;s Discord handle. They can&apos;t see yours unless they do.
          </p>
          {notice && <p className="pf-ask-note" role="alert">{notice}</p>}
          <div className="pf-ask-row">
            <button type="button" className="pf-ask-btn" onClick={send} disabled={sending || !need.trim()}>
              {sending ? 'Sending' : 'Send'}
            </button>
            <button type="button" className="pf-ask-cancel" onClick={() => { setOpen(false); setNotice(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
