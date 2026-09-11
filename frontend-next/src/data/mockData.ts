/**
 * mockData.ts — Dados demonstrativos para fallbacks visuais e sparklines sem dados reais.
 *
 * REGRAS:
 * - Nunca substituir chamadas reais à API por estes dados.
 * - Usar apenas quando a API não retornar dados ou para sparklines de demonstração.
 * - Não importar no telemetryService.
 */

/** Série de RPM para sparkline demonstrativa */
export const mockRpmSeries = [
  { valor: 1750 }, { valor: 1800 }, { valor: 1820 },
  { valor: 1790 }, { valor: 1850 }, { valor: 1820 },
];

/** Série de temperatura para sparkline demonstrativa */
export const mockTemperaturaSeries = [
  { valor: 72 }, { valor: 74 }, { valor: 76 },
  { valor: 79 }, { valor: 82 }, { valor: 78 },
];

/** Série de vibração para sparkline demonstrativa */
export const mockVibracaoSeries = [
  { valor: 1.8 }, { valor: 2.0 }, { valor: 1.9 },
  { valor: 2.2 }, { valor: 2.1 }, { valor: 2.1 },
];

/** Resumo de frota para overlay do mapa quando API não retornar dados */
export const mockFleetSummary = {
  total:    12,
  operando: 9,
  atencao:  2,
  paradas:  1,
} as const;

/** Tendência operacional para gráfico de linha no dashboard */
export const mockTrendSeries = [
  { hora: '06h', rpm: 1720, temp: 70, vib: 1.7 },
  { hora: '08h', rpm: 1780, temp: 73, vib: 1.9 },
  { hora: '10h', rpm: 1820, temp: 76, vib: 2.0 },
  { hora: '12h', rpm: 1800, temp: 79, vib: 2.1 },
  { hora: '14h', rpm: 1850, temp: 82, vib: 2.2 },
  { hora: '16h', rpm: 1820, temp: 78, vib: 2.0 },
  { hora: '18h', rpm: 1760, temp: 74, vib: 1.8 },
];
