'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, LoaderCircle, Tractor } from 'lucide-react';
import { SparklineCard } from '@/components/SparklineCard';
import { telemetryService } from '@/services/telemetryService';
import type { Machine, Telemetry } from '@/types/telemetry';
import { mockRpmSeries, mockTemperaturaSeries, mockVibracaoSeries } from '@/data/mockData';

type SparklineStatus = 'normal' | 'atencao' | 'critico';

function average(readings: Telemetry[], field: keyof Pick<Telemetry, 'rpm' | 'temperatura' | 'vibracao'>) {
  if (!readings.length) return 0;
  return readings.reduce((sum, reading) => sum + Number(reading[field]), 0) / readings.length;
}

function series(readings: Telemetry[], field: keyof Pick<Telemetry, 'rpm' | 'temperatura' | 'vibracao'>, fallback: { valor: number; label: string }[]) {
  const values = readings.map((reading) => Number(reading[field])).filter(Number.isFinite);
  if (!values.length) return { dados: fallback, isDemoData: true };
  return {
    dados: readings.map((reading, index) => ({
      valor: Number(reading[field]),
      label: reading.timestamp ? new Date(reading.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : `Ponto ${index + 1}`,
    })).filter((point) => Number.isFinite(point.valor)),
    isDemoData: false,
  };
}

function status(value: number, field: 'rpm' | 'temperatura' | 'vibracao'): SparklineStatus {
  if (field === 'rpm') return value < 1300 ? 'atencao' : 'normal';
  if (field === 'temperatura') return value > 85 ? 'critico' : value > 75 ? 'atencao' : 'normal';
  return value > 0.8 ? 'critico' : value > 0.5 ? 'atencao' : 'normal';
}

export function DashboardMachineData({ machines, initialReadings }: { machines: Machine[]; initialReadings: Telemetry[] }) {
  const options = machines.filter((machine) => Boolean(machine.maquina_id));
  const [selectedMachineId, setSelectedMachineId] = useState(options[0]?.maquina_id ?? '');
  const [readings, setReadings] = useState(() => initialReadings.filter((reading) => reading.maquina_id === options[0]?.maquina_id));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedMachineId) {
      setReadings([]);
      return;
    }
    const initial = initialReadings.filter((reading) => reading.maquina_id === selectedMachineId);
    if (initial.length) {
      setReadings(initial);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    telemetryService.getMachineReadings(selectedMachineId)
      .then((data) => { if (!cancelled) setReadings(data); })
      .catch((err: unknown) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Falha ao carregar a máquina.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [initialReadings, selectedMachineId]);

  const machine = options.find((item) => item.maquina_id === selectedMachineId);
  const rpm = series(readings, 'rpm', mockRpmSeries);
  const temperatura = series(readings, 'temperatura', mockTemperaturaSeries);
  const vibracao = series(readings, 'vibracao', mockVibracaoSeries);
  const rpmValue = readings.length ? Math.round(average(readings, 'rpm')) : 0;
  const temperaturaValue = readings.length ? average(readings, 'temperatura') : 0;
  const vibracaoValue = readings.length ? average(readings, 'vibracao') : 0;

  return (
    <section aria-label="Indicadores da máquina selecionada" className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl p-3 liquid-glass sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Tractor size={15} className="text-[color:var(--ui-accent)]" aria-hidden="true" />
          <div>
            <p className="section-heading">Máquina selecionada</p>
            <p className="text-sm font-semibold text-[var(--text-1)]">{machine?.maquina_id ?? 'Nenhuma máquina disponível'}</p>
          </div>
          {loading ? <LoaderCircle size={15} className="animate-spin text-[color:var(--ui-accent)]" aria-label="Atualizando dados" /> : null}
        </div>
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Selecionar máquina</span>
          <select value={selectedMachineId} onChange={(event) => setSelectedMachineId(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 pr-9 text-sm font-medium text-[var(--text-1)] outline-none transition focus:border-[color:var(--ui-accent)] focus:ring-2 focus:ring-[color:var(--ui-accent)]/20">
            {options.map((item) => <option key={item.maquina_id} value={item.maquina_id}>{item.maquina_id} · {item.modelo.nome}</option>)}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-2)]" aria-hidden="true" />
        </label>
      </div>
      {error ? <p className="rounded-xl border border-[color:var(--status-critico)]/30 bg-[color:var(--status-critico)]/10 p-3 text-xs text-[var(--text-2)]">{error}</p> : null}
      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-3">
        <SparklineCard key={`${selectedMachineId}-rpm`} titulo="RPM Médio" valor={rpmValue || '—'} unidade="rpm" dados={rpm.dados} status={status(rpmValue, 'rpm')} isDemoData={rpm.isDemoData && !readings.length} />
        <SparklineCard key={`${selectedMachineId}-temperature`} titulo="Temperatura do Motor" valor={readings.length ? temperaturaValue.toFixed(1) : '—'} unidade="°C" dados={temperatura.dados} status={status(temperaturaValue, 'temperatura')} isDemoData={temperatura.isDemoData && !readings.length} />
        <SparklineCard key={`${selectedMachineId}-vibration`} titulo="Vibração do Rotor" valor={readings.length ? vibracaoValue.toFixed(2) : '—'} unidade="g" dados={vibracao.dados} status={status(vibracaoValue, 'vibracao')} isDemoData={vibracao.isDemoData && !readings.length} />
      </div>
    </section>
  );
}