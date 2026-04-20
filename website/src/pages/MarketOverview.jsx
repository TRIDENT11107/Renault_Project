import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import energyMixCsv from '@/data/clean_energy_mix_data.csv?raw';
import forecastResultsCsv from '@/data/forecast_results.csv?raw';
import manufacturerSalesCsv from '@/data/tables_cleaned.csv?raw';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pause, Play } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const ENERGY_MIX_FOLDER_FILES = import.meta.glob('../../../Energy mix/*.csv', {
  eager: true,
  import: 'default',
  query: '?raw'
});

const FUEL_SERIES = [
  { key: 'Petrol', label: 'Petrol', color: '#16A34A' },
  { key: 'Diesel', label: 'Diesel', color: '#3B82F6' },
  { key: 'CNG', label: 'CNG', color: '#F59E0B' },
  { key: 'EV', label: 'EV', color: '#EF4444' },
  { key: 'Hybrid', label: 'Hybrid', color: '#14B8A6' }
];
const MILESTONE_YEARS = new Set([2023, 2025, 2026, 2030]);

const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN');
const formatCompactNumber = (value) =>
  new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
const formatYear = (value) => String(Math.round(Number(value || 0)));
const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;
const toPercent = (value, total) => (total > 0 ? (Number(value || 0) / total) * 100 : 0);

const sumFuelTotals = (rows = [], fuelSeries = FUEL_SERIES) =>
  fuelSeries.reduce((acc, fuel) => {
    acc[fuel.key] = rows.reduce((sum, row) => sum + Number(row[fuel.key] || 0), 0);
    return acc;
  }, {});

const buildSliceDataFromTotals = (totals = {}, fuelSeries = FUEL_SERIES) => {
  const slices = fuelSeries
    .map((fuel) => ({
      name: fuel.label,
      value: Number(totals[fuel.key] || 0),
      color: fuel.color
    }))
    .filter((slice) => slice.value > 0);

  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  return {
    total,
    slices: slices.map((slice) => ({
      ...slice,
      percent: total > 0 ? (slice.value / total) * 100 : 0
    }))
  };
};

const FOLDER_FUEL_NAME_MAP = {
  petrol: 'Petrol',
  diesel: 'Diesel',
  cng: 'CNG',
  electric: 'EV',
  ev: 'EV',
  hybrid: 'Hybrid'
};

const buildSliceDataFromRows = (rows = [], fuelSeries = FUEL_SERIES) => buildSliceDataFromTotals(sumFuelTotals(rows, fuelSeries), fuelSeries);

const parseEnergyMixFolderRow = (filePath = '', csvText = '') => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return null;
  }

  const fileName = filePath.split(/[\\/]/).pop()?.replace(/\.csv$/i, '') || filePath;
  const yearMatch = fileName.match(/\d{4}/);
  const year = yearMatch ? Number(yearMatch[0]) : Number.NaN;
  const totals = {};

  for (const fuel of FUEL_SERIES) {
    totals[fuel.key] = 0;
  }

  for (const line of lines.slice(1)) {
    const [fuelNameRaw = '', totalRaw = '0'] = line.split(',').map((value) => value.trim());
    const fuelKey = FOLDER_FUEL_NAME_MAP[fuelNameRaw.toLowerCase()];
    if (!fuelKey) {
      continue;
    }
    totals[fuelKey] += Number(totalRaw || 0);
  }

  const total = Object.values(totals).reduce((sum, value) => sum + Number(value || 0), 0);
  if (!Number.isFinite(year) || total <= 0) {
    return null;
  }

  return {
    id: fileName,
    sourceFile: `${fileName}.csv`,
    Year: year,
    Petrol: totals.Petrol,
    Diesel: totals.Diesel,
    CNG: totals.CNG,
    EV: totals.EV,
    Hybrid: totals.Hybrid,
    Total: total
  };
};

const parseFuelMixCsv = (csvText = '') => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(',').map((header) => header.trim().toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(',').map((value) => value.trim());
    const rawRow = headers.reduce((acc, header, index) => {
      acc[header] = values[index] ?? '';
      return acc;
    }, {});

    const year = Number(rawRow.year || String(rawRow.ds || '').slice(0, 4));
    const petrol = Number(rawRow.petrol || 0);
    const diesel = Number(rawRow.diesel || 0);
    const cng = Number(rawRow.cng || 0);
    const ev = Number(rawRow.ev || 0);
    const hybrid = Number(rawRow.hybrid || 0);

    return {
      Year: year,
      Petrol: petrol,
      Diesel: diesel,
      CNG: cng,
      EV: ev,
      Hybrid: hybrid,
      Total: petrol + diesel + cng + ev + hybrid
    };
  });

  return rows
    .filter((row) => Number.isFinite(row.Year))
    .sort((a, b) => a.Year - b.Year);
};

const normalizeForecastRows = (historicalRows = [], forecastRows = []) => {
  if (!historicalRows.length || !forecastRows.length) {
    return forecastRows;
  }

  const anchorHistoricalRow = historicalRows[historicalRows.length - 1];
  const firstForecastRow = forecastRows[0];
  const anchorTotal = Number(anchorHistoricalRow?.Total || 0);
  const firstForecastTotal = Number(firstForecastRow?.Total || 0);

  if (!anchorTotal || !firstForecastTotal) {
    return forecastRows;
  }

  const scaleFactor = anchorTotal / firstForecastTotal;

  return forecastRows.map((row) => {
    const scaledRow = FUEL_SERIES.reduce(
      (acc, fuel) => {
        acc[fuel.key] = Math.round(Number(row[fuel.key] || 0) * scaleFactor);
        return acc;
      },
      { Year: row.Year }
    );

    scaledRow.Total = FUEL_SERIES.reduce((sum, fuel) => sum + Number(scaledRow[fuel.key] || 0), 0);
    return scaledRow;
  });
};

const mergeFuelMixRows = (...collections) => {
  const byYear = new Map();
  for (const collection of collections) {
    for (const row of collection) {
      byYear.set(row.Year, row);
    }
  }
  return Array.from(byYear.values()).sort((a, b) => a.Year - b.Year);
};

const parseManufacturerSalesCsv = (csvText = '') => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const rows = lines.slice(1).map((line) => {
    const cols = line.split(',');
    return {
      manufacturer: (cols[0] || '').trim(),
      sales2025: Number(cols[1] || 0),
      sales2024: Number(cols[2] || 0)
    };
  });

  const selected = [];
  for (const row of rows) {
    if (!row.manufacturer || row.manufacturer.includes('Cars Sales Snapshot')) {
      continue;
    }
    if (row.manufacturer.toLowerCase().includes('total total')) {
      break;
    }
    if (Number.isFinite(row.sales2025) && row.sales2025 > 0) {
      selected.push(row);
    }
  }

  return selected.sort((a, b) => b.sales2025 - a.sales2025).slice(0, 8);
};

const getFuelBrandWeight = (fuelName, manufacturerName) => {
  const m = manufacturerName.toLowerCase();
  const rules = {
    Petrol: [
      [/maruti/i, 1.25],
      [/hyundai|honda/i, 1.15],
      [/toyota|kia/i, 1.05]
    ],
    Diesel: [
      [/mahindra|tata/i, 1.25],
      [/toyota|hyundai/i, 1.1]
    ],
    CNG: [
      [/maruti/i, 1.35],
      [/tata|hyundai/i, 1.1]
    ],
    EV: [
      [/tata|mg|mahindra/i, 1.3],
      [/hyundai|kia/i, 1.1]
    ],
    Hybrid: [
      [/toyota|honda/i, 1.3],
      [/maruti|hyundai/i, 1.1]
    ]
  };

  let weight = 1;
  for (const [regex, multiplier] of rules[fuelName] || []) {
    if (regex.test(m)) {
      weight *= multiplier;
    }
  }
  return weight;
};

const buildOemWeightedTotals = (rows = [], manufacturers = []) => {
  const baseTotals = sumFuelTotals(rows);
  const total = Object.values(baseTotals).reduce((sum, value) => sum + value, 0);

  if (!total || !manufacturers.length) {
    return baseTotals;
  }

  const weightedScores = FUEL_SERIES.reduce((acc, fuel) => {
    const oemScore = manufacturers.reduce(
      (sum, manufacturer) => sum + manufacturer.sales2025 * getFuelBrandWeight(fuel.key, manufacturer.manufacturer),
      0
    );
    acc[fuel.key] = baseTotals[fuel.key] * oemScore;
    return acc;
  }, {});

  const weightedScoreTotal = Object.values(weightedScores).reduce((sum, value) => sum + value, 0);
  if (!weightedScoreTotal) {
    return baseTotals;
  }

  return FUEL_SERIES.reduce((acc, fuel) => {
    acc[fuel.key] = (weightedScores[fuel.key] / weightedScoreTotal) * total;
    return acc;
  }, {});
};

const TooltipContent = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0]?.payload;
  if (!row) {
    return null;
  }

  return (
    <div className="min-w-[220px] rounded-lg border border-border bg-card p-3 shadow-sm">
      <p className="text-sm font-semibold text-foreground">{formatYear(label)}</p>
      <p className="text-xs text-muted-foreground mb-2">Fuel share in total sales</p>
      <div className="space-y-1.5">
        {FUEL_SERIES.map((fuel) => (
          <div key={fuel.key} className="flex items-center justify-between gap-4 text-sm">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: fuel.color }} />
              {fuel.label}
            </span>
            <span className="font-medium text-foreground">{formatPercent(row[fuel.key])}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 border-t border-border pt-2 flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">Total</span>
        <span className="font-semibold text-foreground">{formatNumber(row.Total)}</span>
      </div>
    </div>
  );
};

const createMilestoneDot = (color) => ({ cx, cy, payload }) => {
  const yearValue = Number(payload?.Year);
  const roundedYear = Math.round(yearValue);

  if (!Number.isFinite(yearValue) || Math.abs(yearValue - roundedYear) > 0.001 || !MILESTONE_YEARS.has(roundedYear)) {
    return null;
  }

  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="#FFFFFF" fillOpacity="0.94" />
      <circle cx={cx} cy={cy} r={3.5} fill={color} stroke="#FFFFFF" strokeWidth={1.5} />
    </g>
  );
};

const MarketOverview = () => {
  const historicalData = useMemo(() => parseFuelMixCsv(energyMixCsv), []);
  const rawForecastData = useMemo(() => parseFuelMixCsv(forecastResultsCsv), []);
  const forecastData = useMemo(() => normalizeForecastRows(historicalData, rawForecastData), [historicalData, rawForecastData]);
  const energyMixData = useMemo(() => mergeFuelMixRows(historicalData, forecastData), [forecastData, historicalData]);
  const topManufacturerSales = useMemo(() => parseManufacturerSalesCsv(manufacturerSalesCsv), []);
  const energyMixFolderRows = useMemo(
    () =>
      Array.from(
        Object.entries(ENERGY_MIX_FOLDER_FILES)
          .map(([filePath, csvText]) => parseEnergyMixFolderRow(filePath, csvText))
          .filter(Boolean)
          .reduce((byYear, row) => {
            byYear.set(row.Year, row);
            return byYear;
          }, new Map())
          .values()
      )
        .sort((a, b) => {
          if (a.Year !== b.Year) {
            return a.Year - b.Year;
          }
          return a.sourceFile.localeCompare(b.sourceFile, undefined, { numeric: true });
        }),
    []
  );
  const years = energyMixData.map((row) => row.Year);
  const xAxisDomain = years.length ? [years[0], years[years.length - 1]] : [0, 0];
  const maxIndex = Math.max(energyMixData.length - 1, 0);
  const [playhead, setPlayhead] = useState(maxIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePieBreakdown, setActivePieBreakdown] = useState(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(null);
  const YEAR_DURATION_MS = 900;

  const safePlayhead = Math.min(Math.max(playhead, 0), maxIndex);
  const selectedIndex = Math.round(safePlayhead);
  const safeIndex = Math.min(Math.max(selectedIndex, 0), maxIndex);
  const selectedYear = years[safeIndex];
  const selectedRow = energyMixData[safeIndex];
  const progressPercent = maxIndex > 0 ? (safePlayhead / maxIndex) * 100 : 100;
  const renderPlayhead = safePlayhead;

  const chartData = useMemo(() => {
    if (!energyMixData.length) {
      return [];
    }

    const floorIndex = Math.floor(renderPlayhead);
    const fraction = renderPlayhead - floorIndex;
    const base = energyMixData.slice(0, floorIndex + 1);

    if (floorIndex >= maxIndex || fraction <= 0) {
      return base;
    }

    const current = energyMixData[floorIndex];
    const next = energyMixData[floorIndex + 1];
    const yearValue = current.Year + (next.Year - current.Year) * fraction;
    const interpolatedFuelValues = FUEL_SERIES.reduce((acc, fuel) => {
      acc[fuel.key] = current[fuel.key] + (next[fuel.key] - current[fuel.key]) * fraction;
      return acc;
    }, {});

    return [
      ...base,
      {
        Year: yearValue,
        ...interpolatedFuelValues,
        Total: current.Total + (next.Total - current.Total) * fraction
      }
    ];
  }, [energyMixData, maxIndex, renderPlayhead]);

  const chartPercentData = useMemo(
    () =>
      chartData.map((row) => {
        const total = Number(row.Total || 0);
        return FUEL_SERIES.reduce(
          (acc, fuel) => {
            acc[fuel.key] = toPercent(row[fuel.key], total);
            return acc;
          },
          { ...row }
        );
      }),
    [chartData]
  );

  const pieCharts = useMemo(() => {
    const historicalFolderRows = energyMixFolderRows.filter((row) => row.Year < 2026);
    const historicalFiveYears = historicalFolderRows.slice(-5);
    const historicalRange =
      historicalFiveYears.length > 0
        ? `${historicalFiveYears[0].Year}-${historicalFiveYears[historicalFiveYears.length - 1].Year}`
        : 'No historical rows';
    const oemWeightedTotals = buildOemWeightedTotals(historicalFiveYears, topManufacturerSales);
    const historicalSummary = buildSliceDataFromRows(historicalFiveYears);
    const oemSummary = buildSliceDataFromTotals(oemWeightedTotals);

    return [
      {
        id: 'five-years',
        title: '5 Years',
        subtitle: `Energy mix folder summary (${historicalRange})`,
        clickable: historicalSummary.slices.length > 0,
        ...historicalSummary
      },
      {
        id: 'oem-five-years',
        title: 'OEM (5 years)',
        subtitle: `OEM-weighted folder summary (${historicalRange})`,
        clickable: oemSummary.slices.length > 0,
        ...oemSummary
      }
    ];
  }, [energyMixFolderRows, topManufacturerSales]);

  const consolidationGraphData = useMemo(
    () =>
      energyMixData.map((row) => ({
        Year: row.Year,
        Total: Number(row.Total || 0),
        fill: row.Year <= 2025 ? '#1FA856' : '#1FB7B0',
        phase: row.Year <= 2025 ? 'Historical' : 'Forecast',
      })),
    [energyMixData],
  );

  const consolidationTotal = useMemo(
    () => consolidationGraphData.reduce((sum, row) => sum + Number(row.Total || 0), 0),
    [consolidationGraphData],
  );

  const selectedRowShare = useMemo(() => {
    const total = Number(selectedRow?.Total || 0);
    return FUEL_SERIES.reduce((acc, fuel) => {
      acc[fuel.key] = toPercent(selectedRow?.[fuel.key], total);
      return acc;
    }, {});
  }, [selectedRow]);

  const pieBreakdownBars = useMemo(() => {
    if (!activePieBreakdown || !topManufacturerSales.length) {
      return [];
    }

    const weighted = topManufacturerSales.map((row) => ({
      manufacturer: row.manufacturer,
      score: row.sales2025 * getFuelBrandWeight(activePieBreakdown.fuelName, row.manufacturer)
    }));

    const totalScore = weighted.reduce((sum, row) => sum + row.score, 0) || 1;

    return weighted
      .map((row) => ({
        manufacturer: row.manufacturer,
        value: Math.round((row.score / totalScore) * activePieBreakdown.sliceValue)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [activePieBreakdown, topManufacturerSales]);

  const handleChartClick = (state) => {
    const clickedYear = Number(state?.activeLabel);
    const index = years.findIndex((year) => year === clickedYear);
    if (index >= 0) {
      setPlayhead(index);
      setIsPlaying(false);
    }
  };

  const handlePlayToggle = () => {
    if (!isPlaying && safePlayhead >= maxIndex) {
      setPlayhead(0);
    }
    setIsPlaying((current) => !current);
  };

  const handlePieSliceClick = (chart, slice) => {
    if (!chart.clickable || !slice?.name) {
      return;
    }

    setActivePieBreakdown({
      chartTitle: chart.title,
      fuelName: slice.name,
      sliceValue: Number(slice.value || 0),
      slicePercent: Number(slice.percent || 0)
    });
  };

  useEffect(() => {
    if (!isPlaying || maxIndex <= 0) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = null;
      lastTimeRef.current = null;
      return undefined;
    }

    const tick = (timestamp) => {
      if (lastTimeRef.current == null) {
        lastTimeRef.current = timestamp;
      }

      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      const deltaYears = delta / YEAR_DURATION_MS;

      setPlayhead((current) => {
        const next = current + deltaYears;
        if (next >= maxIndex) {
          setIsPlaying(false);
          return maxIndex;
        }
        return next;
      });

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = null;
      lastTimeRef.current = null;
    };
  }, [isPlaying, maxIndex]);

  if (!energyMixData.length) {
    return (
      <div className="space-y-6" data-testid="market-overview-page">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Market Overview</h1>
          <p className="text-muted-foreground mt-1">Energy sales mix visualization</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Energy Sales Mix</CardTitle>
            <CardDescription>No rows were found in input energy mix CSV files.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="market-overview-page">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Market Overview</h1>
        <p className="text-muted-foreground mt-1">
          Energy sales mix by fuel type with historical 2021-2025 data and forecast 2026-2030 drilldown
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Energy Sales Mix (Stacked)</CardTitle>
            <CardDescription>
              100% stacked view across historical and forecast data. Move the slider or click the chart to focus a year.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartPercentData} onClick={handleChartClick} margin={{ left: 8, right: 20, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="Year"
                    type="number"
                    domain={xAxisDomain}
                    ticks={years}
                    allowDataOverflow
                    tick={{ fill: '#64748B' }}
                    tickFormatter={formatYear}
                  />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748B' }} tickFormatter={formatPercent} width={72} />
                  <Tooltip content={<TooltipContent />} />
                  <Legend />
                  <ReferenceLine x={selectedYear} stroke="#0F172A" strokeDasharray="4 4" />
                  {FUEL_SERIES.map((fuel) => (
                    <Area
                      key={fuel.key}
                      type="linear"
                      dataKey={fuel.key}
                      name={fuel.label}
                      stackId="mix"
                      stroke={fuel.color}
                      fill={fuel.color}
                      fillOpacity={0.78}
                      isAnimationActive={false}
                      dot={createMilestoneDot(fuel.color)}
                      activeDot={false}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-border bg-gradient-to-b from-card to-secondary/70 px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={handlePlayToggle}
                    className="h-8 w-8 rounded-md"
                    aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </Button>
                  <span className="w-10 text-sm font-semibold text-foreground tabular-nums">{selectedYear}</span>
                </div>
                <span className="text-xs text-muted-foreground">Slide or play timeline</span>
              </div>
              <input
                type="range"
                min={0}
                max={maxIndex}
                step={0.001}
                value={safePlayhead}
                onChange={(event) => {
                  setPlayhead(Number(event.target.value));
                  setIsPlaying(false);
                }}
                style={{
                  background: `linear-gradient(90deg, #16A34A 0%, #16A34A ${progressPercent}%, #CBD5E1 ${progressPercent}%, #CBD5E1 100%)`
                }}
                className="h-2 w-full cursor-pointer appearance-none rounded-full [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow"
                aria-label="Energy sales year slider"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{years[0]}</span>
                <span>{years[maxIndex]}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{selectedYear} Breakdown</CardTitle>
              <CardDescription>Fuel share (%) for the selected year</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {FUEL_SERIES.map((fuel) => (
                <div key={fuel.key} className="flex items-center justify-between rounded-lg border border-border bg-secondary/70 px-3 py-2">
                  <span className="inline-flex items-center gap-2 text-sm text-foreground">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: fuel.color }} />
                    {fuel.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{formatPercent(selectedRowShare[fuel.key])}</span>
                </div>
              ))}

              <div className="mt-4 rounded-lg border border-border bg-card px-3 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total</span>
                  <span className="text-base font-bold text-foreground">{formatNumber(selectedRow.Total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle>Energy Sales Consolidation</CardTitle>
                  <CardDescription>
                    Forecast totals are normalized to the 2025 baseline for a like-for-like yearly view.
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Total</p>
                  <p className="text-xl font-semibold text-foreground">{formatNumber(consolidationTotal)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consolidationGraphData} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D9E3F0" vertical={false} />
                    <XAxis
                      dataKey="Year"
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      tickFormatter={formatYear}
                      axisLine={{ stroke: '#94A3B8' }}
                      tickLine={{ stroke: '#94A3B8' }}
                    />
                    <YAxis
                      width={64}
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      tickFormatter={formatCompactNumber}
                      axisLine={{ stroke: '#94A3B8' }}
                      tickLine={{ stroke: '#94A3B8' }}
                    />
                    <Tooltip
                      formatter={(value) => [formatNumber(value), 'Total sales']}
                      labelFormatter={(label, payload) => {
                        const point = payload?.[0]?.payload;
                        return point ? `${label} | ${point.phase}` : label;
                      }}
                    />
                    <Bar dataKey="Total" radius={[10, 10, 0, 0]} maxBarSize={34}>
                      {consolidationGraphData.map((entry) => (
                        <Cell key={`consolidation-${entry.Year}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#1FA856]" />
                  Historical
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#1FB7B0]" />
                  Forecast
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Energy Sales Mix - Pie Charts</CardTitle>
          <CardDescription>Historical mix summaries for folder and OEM-weighted views</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pieCharts.map((chart) => (
              <div key={chart.id} className="rounded-xl border border-border bg-card px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-foreground">{chart.title}</h3>
                  <span className="text-xs text-muted-foreground">Total: {formatNumber(chart.total)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-1">
                  {chart.clickable ? 'Click a fuel slice to view brand split' : 'Static summary view'}
                </p>

                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chart.slices}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={78}
                        innerRadius={34}
                        stroke="#FFFFFF"
                        strokeWidth={1.2}
                        onClick={(slice) => handlePieSliceClick(chart, slice)}
                        style={{ cursor: chart.clickable ? 'pointer' : 'default' }}
                      >
                        {chart.slices.map((slice) => (
                          <Cell key={`${chart.title}-${slice.name}`} fill={slice.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, item) => [
                          `${formatNumber(value)} (${formatPercent(item?.payload?.percent)})`,
                          name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 mt-2">
                  {chart.slices.map((slice) => (
                    <div key={`${chart.title}-${slice.name}-legend`} className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: slice.color }} />
                        {slice.name}
                      </span>
                      <span className="font-medium text-foreground">{formatPercent(slice.percent)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(activePieBreakdown)} onOpenChange={(open) => !open && setActivePieBreakdown(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {activePieBreakdown?.fuelName} Brand Split ({activePieBreakdown?.chartTitle})
            </DialogTitle>
            <DialogDescription>
              Estimated brand-wise sales distribution for selected slice: {formatNumber(activePieBreakdown?.sliceValue)} (
              {formatPercent(activePieBreakdown?.slicePercent)})
            </DialogDescription>
          </DialogHeader>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pieBreakdownBars} margin={{ left: 28, right: 20, top: 8, bottom: 36 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="manufacturer" angle={-20} textAnchor="end" interval={0} height={64} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis width={92} tick={{ fill: '#64748B' }} tickFormatter={formatNumber} />
                <Tooltip formatter={(value) => [formatNumber(value), 'Sales']} />
                <Bar dataKey="value" fill="#0E7490" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketOverview;
