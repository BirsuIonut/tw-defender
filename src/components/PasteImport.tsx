import { useMemo, useState } from 'react';
import type { Attack } from '../models/attack';
import type { MergeResult } from '../parsing/importAttacks';
import { mergeImport, parsePaste } from '../parsing/importAttacks';

export interface PasteImportProps {
  ownerPlayer: string;
  existing: Attack[];
  onConfirm: (toUpsert: Attack[]) => void;
}

export function PasteImport({ ownerPlayer, existing, onConfirm }: PasteImportProps) {
  const [text, setText] = useState('');
  const [previewRequested, setPreviewRequested] = useState(false);

  const preview: MergeResult | null = useMemo(() => {
    if (!previewRequested || !text.trim()) return null;
    const parsed = parsePaste(text);
    return mergeImport(parsed, existing, ownerPlayer);
  }, [previewRequested, text, existing, ownerPlayer]);

  const parsedCount = preview ? preview.added.length + preview.unchanged.length : 0;
  const failedToParse = previewRequested && text.trim() && parsedCount === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Import incomings</h2>
        <p className="text-xs text-slate-400">
          Paste BB-code from the in-game incomings overview.
        </p>
      </div>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setPreviewRequested(false);
        }}
        placeholder="[player]Attacker[/player] [village=12345]Source (500|500) K55[/village] [unit]ram[/unit] -> [village=67890]Target (510|510) K55[/village] arriving 2026-05-08 14:23:45:123"
        className="w-full h-40 rounded-lg bg-slate-900 ring-1 ring-slate-800 p-3 font-mono text-xs outline-none focus:ring-sky-500/40"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPreviewRequested(true)}
          disabled={!text.trim() || !ownerPlayer}
          className="rounded bg-sky-700 hover:bg-sky-600 disabled:bg-slate-800 disabled:text-slate-500 px-3 py-1.5 text-sm"
        >
          Preview
        </button>
        {preview && (
          <button
            onClick={() => {
              onConfirm(preview.toUpsert);
              setText('');
              setPreviewRequested(false);
            }}
            disabled={preview.added.length === 0}
            className="rounded bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 px-3 py-1.5 text-sm"
          >
            Save {preview.added.length} new
          </button>
        )}
        {!ownerPlayer && (
          <span className="text-xs text-amber-400">
            Set "Acting as" first.
          </span>
        )}
      </div>

      {failedToParse && (
        <div className="rounded bg-amber-900/30 ring-1 ring-amber-800/50 p-3 text-sm text-amber-200">
          Couldn't extract any attacks from the paste. Each row needs two
          <code className="mx-1 px-1 bg-amber-950/50 rounded">[village=ID]…[/village]</code>
          tags and a recognisable timestamp.
        </div>
      )}

      {preview && (
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <Stat label="New" value={preview.added.length} tone="emerald" />
          <Stat label="Already imported" value={preview.unchanged.length} tone="slate" />
          <Stat
            label="No longer in paste"
            value={preview.missing.length}
            tone={preview.missing.length ? 'amber' : 'slate'}
          />
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'emerald' | 'amber' | 'slate';
}) {
  const colors = {
    emerald: 'bg-emerald-950/60 ring-emerald-800/60 text-emerald-200',
    amber: 'bg-amber-950/60 ring-amber-800/60 text-amber-200',
    slate: 'bg-slate-900 ring-slate-800 text-slate-300',
  }[tone];
  return (
    <div className={`rounded-lg ring-1 p-3 ${colors}`}>
      <div className="text-xs uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
