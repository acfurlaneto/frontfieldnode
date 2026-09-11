'use client';

import { useMemo, useState, type MouseEvent } from 'react';
import { Download } from 'lucide-react';
import { resolveApiUrl } from '@/services/telemetryService';

type ReportMachineOption = {
  maquina_id?: string | null;
  modelo?: { nome?: string };
};

type ReportButtonProps = {
  machineId?: string;
  machines?: ReportMachineOption[];
  label?: string;
  className?: string;
};

const selectClass =
  'rounded-xl border border-[var(--line)] bg-[var(--panel-glass-mid)] px-3 py-2 text-xs font-semibold text-[var(--text-1)] outline-none transition hover:border-[rgba(255,255,255,0.18)] focus:border-[color:var(--ui-accent)]/60';

const btnClass =
  'inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--panel-glass-mid)] px-3 py-2 text-xs font-semibold text-[var(--text-2)] transition hover:border-[rgba(255,255,255,0.18)] hover:bg-[var(--panel-glass-strong)] hover:text-[var(--text-1)] active:scale-95';

export function ReportButton({
  machineId,
  machines = [],
  label = 'Exportar',
  className = '',
}: ReportButtonProps) {
  const machineOptions = useMemo(
    () => machines.filter((m) => m.maquina_id),
    [machines],
  );
  const [selectedMachineId, setSelectedMachineId] = useState(
    machineOptions[0]?.maquina_id ?? '',
  );
  const exportMachineId = machineId || selectedMachineId;

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!exportMachineId) {
      alert('Selecione uma máquina para gerar o relatório.');
      return;
    }
    const url = `${resolveApiUrl()}/relatorio/exportar/?maquina_id=${encodeURIComponent(exportMachineId)}`;
    try {
      const res = await fetch(url, { headers: { Accept: '*/*' } });
      if (!res.ok) throw new Error(String(res.status));
      const blob    = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const anchor  = document.createElement('a');
      anchor.href     = blobUrl;
      anchor.download = `relatorio_${exportMachineId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 0);
    } catch {
      alert('Não foi possível gerar o relatório agora.');
    }
  };

  if (!machineId && machineOptions.length > 0) {
    return (
      <div className="flex items-center gap-2">
        <select
          value={selectedMachineId}
          onChange={(e) => setSelectedMachineId(e.target.value)}
          className={selectClass}
          aria-label="Máquina do relatório"
        >
          {machineOptions.map((m) => (
            <option key={m.maquina_id} value={m.maquina_id ?? ''}>
              {m.maquina_id} {m.modelo?.nome ? `· ${m.modelo.nome}` : ''}
            </option>
          ))}
        </select>
        <button onClick={handleClick} className={`${btnClass} ${className}`}>
          <Download size={13} aria-hidden="true" />
          {label}
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleClick} className={`${btnClass} ${className}`}>
      <Download size={13} aria-hidden="true" />
      {label}
    </button>
  );
}
