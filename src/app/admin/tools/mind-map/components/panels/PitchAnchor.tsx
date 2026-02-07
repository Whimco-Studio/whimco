"use client";

import { useState } from "react";
import { useMindMap } from "../../hooks/useMindMapState";

export default function PitchAnchor() {
  const { state, dispatch } = useMindMap();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(state.pitch);
  const [confirming, setConfirming] = useState(false);

  const handleStartEdit = () => {
    setDraft(state.pitch);
    setEditing(true);
  };

  const handleSave = () => {
    if (draft.trim() !== state.pitch) {
      setConfirming(true);
    } else {
      setEditing(false);
    }
  };

  const handleConfirm = () => {
    dispatch({ type: "SET_PITCH", payload: draft.trim() });
    setEditing(false);
    setConfirming(false);
  };

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4">
      <div className="backdrop-blur-xl bg-[#1a1a2e]/80 border border-white/10 rounded-lg px-4 py-3 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">
              Core Pitch
            </div>
            {editing ? (
              <textarea
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setEditing(false);
                    setConfirming(false);
                  }
                }}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none"
              />
            ) : (
              <p className="text-sm text-white/70 leading-relaxed">{state.pitch}</p>
            )}
          </div>
          {!editing && (
            <button
              onClick={handleStartEdit}
              className="flex-shrink-0 px-2 py-1 text-[10px] text-white/40 hover:text-white/70 hover:bg-white/5 rounded transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {editing && !confirming && (
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setEditing(false);
                setConfirming(false);
              }}
              className="px-3 py-1 text-xs text-white/50 hover:text-white/80 rounded hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs bg-white/10 text-white/80 rounded hover:bg-white/20 transition-colors"
            >
              Save
            </button>
          </div>
        )}

        {confirming && (
          <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
            <p className="text-xs text-yellow-400/80 mb-2">
              Changing your pitch is a big deal. Are you sure?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="px-3 py-1 text-xs text-white/50 hover:text-white/80 rounded hover:bg-white/5 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirm}
                className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded hover:bg-yellow-500/30 transition-colors"
              >
                Yes, Update Pitch
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
