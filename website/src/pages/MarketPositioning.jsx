import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import cleanEnergyMixRaw from '@/data/clean_energy_mix_data.csv?raw';
import cardekhoFullDatasetRaw from '@/data/cardekho_full_dataset.csv?raw';
import launches from '@/data/launches.json';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const POWERTRAINS = ['ICE', 'CNG', 'HEV', 'EV'];
const STATUS_FILTERS = ['All', 'Existing Market', 'Upcoming Launch'];
const PIE_COLORS = ['#16A34A', '#0EA5E9', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6'];
const BRAND_HINTS = [
  'Tata',
  'Mahindra',
  'Maruti',
  'Hyundai',
  'Toyota',
  'Honda',
  'MG',
  'BYD',
  'Renault',
  'Kia',
  'Skoda',
  'Nissan',
  'Jeep',
  'Citroen'
];
const CHAT_QUICK_PROMPTS = [
  'Give me a quick summary for the selected powertrain',
  'Top 5 brands by model count',
  'Highest battery capacity model',
  'Upcoming launches in this segment',
  'Compare EV vs HEV battery stats'
];
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const GRAPH_X_AXIS_LABELS = {
  brand: 'Brand',
  powertrain: 'Powertrain',
  launchStatus: 'Launch Status',
  launchYear: 'Launch Year'
};
const GRAPH_METRIC_CONFIG = {
  modelCount: { label: 'Model Count', unit: 'models', decimals: 0 },
  avgBattery: { label: 'Avg Battery (kWh)', unit: 'kWh', decimals: 2 },
  avgPower: { label: 'Avg Power (hp)', unit: 'hp', decimals: 1 },
  avgTorque: { label: 'Avg Torque (Nm)', unit: 'Nm', decimals: 1 }
};
const CAR_COMPARE_GRAPH_METRICS = [
  { key: 'power', label: 'Power', unit: 'hp' },
  { key: 'torque', label: 'Torque', unit: 'Nm' },
  { key: 'batteryKWh', label: 'Battery', unit: 'kWh' },
  { key: 'eMotorPower', label: 'E-Motor', unit: 'kW' }
];
const MAX_BAR_POINTS = 12;
const MAX_PIE_POINTS = 8;

const MARKET_DATA = {
  ICE: [
    {
      launchDate: '2024-08',
      brand: 'Tata',
      model: 'Nexon ICE',
      engineCapacity: '1.2L Turbo',
      technology: 'MPFi',
      power: 118,
      torque: 170,
      mileage: '17.4 km/l',
      batteryKWh: 0,
      launchStatus: 'Existing Market',
      source: 'Internal benchmark'
    },
    {
      launchDate: '2024-02',
      brand: 'Maruti',
      model: 'Brezza',
      engineCapacity: '1.5L',
      technology: 'DualJet',
      power: 102,
      torque: 137,
      mileage: '19.8 km/l',
      batteryKWh: 0,
      launchStatus: 'Existing Market',
      source: 'Internal benchmark'
    },
    {
      launchDate: '2023-11',
      brand: 'Mahindra',
      model: 'XUV300 Turbo',
      engineCapacity: '1.2L TGDi',
      technology: 'GDi',
      power: 128,
      torque: 230,
      mileage: '18.2 km/l',
      batteryKWh: 0,
      launchStatus: 'Existing Market',
      source: 'Internal benchmark'
    }
  ],
  CNG: [
    {
      launchDate: '2024-05',
      brand: 'Maruti',
      model: 'WagonR CNG',
      engineCapacity: '1.0L',
      technology: 'S-CNG',
      power: 56,
      torque: 82,
      mileage: '34.0 km/kg',
      batteryKWh: 0,
      launchStatus: 'Existing Market',
      source: 'Internal benchmark'
    },
    {
      launchDate: '2024-01',
      brand: 'Tata',
      model: 'Altroz iCNG',
      engineCapacity: '1.2L',
      technology: 'iCNG',
      power: 73,
      torque: 103,
      mileage: '26.2 km/kg',
      batteryKWh: 0,
      launchStatus: 'Existing Market',
      source: 'Internal benchmark'
    },
    {
      launchDate: '2023-12',
      brand: 'Hyundai',
      model: 'Aura CNG',
      engineCapacity: '1.2L',
      technology: 'Bi-fuel',
      power: 68,
      torque: 95,
      mileage: '28.0 km/kg',
      batteryKWh: 0,
      launchStatus: 'Existing Market',
      source: 'Internal benchmark'
    }
  ],
  HEV: [
    {
      launchDate: '2024-06',
      brand: 'Toyota',
      model: 'Urban Cruiser Hyryder',
      engineCapacity: '1.5L Hybrid',
      technology: 'Strong HEV',
      power: 114,
      torque: 141,
      mileage: '27.9 km/l',
      batteryKWh: 0.76,
      eMotorPower: 59,
      range: '700+ km (combined)',
      launchStatus: 'Existing Market',
      source: 'Internal benchmark'
    },
    {
      launchDate: '2024-03',
      brand: 'Honda',
      model: 'City e:HEV',
      engineCapacity: '1.5L Hybrid',
      technology: 'i-MMD',
      power: 126,
      torque: 253,
      mileage: '26.5 km/l',
      batteryKWh: 0.72,
      eMotorPower: 80,
      range: '650+ km (combined)',
      launchStatus: 'Existing Market',
      source: 'Internal benchmark'
    },
    {
      launchDate: '2023-10',
      brand: 'Maruti',
      model: 'Grand Vitara Hybrid',
      engineCapacity: '1.5L Hybrid',
      technology: 'Strong HEV',
      power: 114,
      torque: 141,
      mileage: '27.9 km/l',
      batteryKWh: 0.76,
      eMotorPower: 59,
      range: '700+ km (combined)',
      launchStatus: 'Existing Market',
      source: 'Internal benchmark'
    }
  ],
  EV: [
    {
      launchDate: '2025-01',
      brand: 'Tata',
      model: 'Punch EV Long Range',
      engineCapacity: 'N/A',
      technology: 'Permanent Magnet Motor',
      power: 121,
      torque: 190,
      mileage: 'N/A',
      batteryKWh: 35.0,
      eMotorPower: 90,
      range: '421 km',
      launchStatus: 'Existing Market',
      source: 'Internal benchmark'
    },
    {
      launchDate: '2024-11',
      brand: 'Mahindra',
      model: 'XUV400 EL Pro',
      engineCapacity: 'N/A',
      technology: 'Permanent Magnet Motor',
      power: 148,
      torque: 310,
      mileage: 'N/A',
      batteryKWh: 39.4,
      eMotorPower: 110,
      range: '456 km',
      launchStatus: 'Existing Market',
      source: 'Internal benchmark'
    },
    {
      launchDate: '2024-09',
      brand: 'MG',
      model: 'ZS EV',
      engineCapacity: 'N/A',
      technology: 'Synchronous Motor',
      power: 174,
      torque: 280,
      mileage: 'N/A',
      batteryKWh: 50.3,
      eMotorPower: 130,
      range: '461 km',
      launchStatus: 'Existing Market',
      source: 'Internal benchmark'
    }
  ]
};

const getLaunchYear = (launchDate) => {
  const match = String(launchDate || '').match(/(20\d{2})/);
  return match ? match[1] : 'TBA';
};

const mapPowertrainToType = (powertrain = '') => {
  const text = powertrain.toLowerCase();
  if (text.includes('ev') || text.includes('electric')) return 'EV';
  if (text.includes('hybrid') || text.includes('hev')) return 'HEV';
  if (text.includes('cng')) return 'CNG';
  return 'ICE';
};

const normalizeRow = (row, powertrain) => ({
  ...row,
  powertrain,
  launchYear: getLaunchYear(row.launchDate)
});

const formatAverage = (values, decimals = 2) => {
  if (!values.length) return null;
  const total = values.reduce((sum, value) => sum + value, 0);
  return (total / values.length).toFixed(decimals);
};

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const extractBrandFilters = (promptText, knownBrands) => {
  const prompt = String(promptText || '').toLowerCase();
  if (!prompt.trim()) return [];
  return knownBrands.filter((brand) => {
    const normalizedBrand = String(brand || '').toLowerCase().trim();
    if (!normalizedBrand) return false;
    const pattern = new RegExp(`\\b${escapeRegExp(normalizedBrand).replace(/\\ /g, '\\s+')}\\b`, 'i');
    return pattern.test(prompt);
  });
};

const parseCsvRows = (csvText) => {
  const lines = String(csvText || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const parseCsvLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      if (char === '"') {
        if (inQuotes && line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  };

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((acc, header, index) => {
      const rawValue = values[index] ?? '';
      const numberValue = Number(rawValue);
      acc[header] = Number.isFinite(numberValue) && rawValue !== '' ? numberValue : rawValue;
      return acc;
    }, {});
  });
};

const parsePowerFromText = (value) => {
  const text = String(value || '');
  const unitMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:bhp|hp|ps)\b/i);
  if (unitMatch) return Number(unitMatch[1]);
  const fallbackMatch = text.match(/(\d+(?:\.\d+)?)/);
  return fallbackMatch ? Number(fallbackMatch[1]) : null;
};

const parseTorqueFromText = (value) => {
  const text = String(value || '');
  const unitMatch = text.match(/(\d+(?:\.\d+)?)\s*nm\b/i);
  if (unitMatch) return Number(unitMatch[1]);
  const fallbackMatch = text.match(/(\d+(?:\.\d+)?)/);
  return fallbackMatch ? Number(fallbackMatch[1]) : null;
};

const parseBatteryKwhFromRow = (row) => {
  const text = `${row['Displacement'] || ''} ${row['Engine Type'] || ''} ${row['Variant'] || ''}`;
  const match = text.match(/(\d+(?:\.\d+)?)\s*kwh\b/i);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  // Some rows encode decimals as 345/394 instead of 34.5/39.4.
  if (value > 120 && value < 1000) return Number((value / 10).toFixed(1));
  return Number(value.toFixed(2));
};

const inferPowertrainFromCardekho = (row) => {
  const engineType = String(row['Engine Type'] || '').toLowerCase();
  const rowText = `${engineType} ${row['Variant'] || ''} ${row['Model'] || ''} ${row['Displacement'] || ''}`.toLowerCase();
  const hasBatteryCapacity = Number(parseBatteryKwhFromRow(row)) > 0;
  const hasPackMention =
    /\bbattery\s*pack\b/i.test(rowText) ||
    /\bpack\s*size\b/i.test(rowText) ||
    /\bpack\s*(?:one|two|three|1|2|3)\b/i.test(rowText);

  // EV override rules from user: any battery capacity or battery-pack wording.
  if (hasBatteryCapacity || hasPackMention) return 'EV';

  const sourceText = engineType || rowText;
  if (sourceText.includes('electric') || /\bev\b/i.test(sourceText)) return 'EV';
  if (sourceText.includes('cng')) return 'CNG';
  if (
    sourceText.includes('mhev') ||
    sourceText.includes('mild hybrid') ||
    sourceText.includes('strong hybrid') ||
    sourceText.includes('hybrid') ||
    sourceText.includes('hev') ||
    sourceText.includes('e:hev')
  ) {
    return 'HEV';
  }
  if (sourceText.includes('petrol') || sourceText.includes('diesel') || sourceText.includes('disel')) return 'ICE';
  return 'ICE';
};

const hpToKw = (horsepower) => (Number.isFinite(horsepower) ? Number((horsepower * 0.7457).toFixed(1)) : null);

const normalizeVehicleText = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/\b20\d{2}(?:-\d{2,4})?\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const scoreModelMatch = (left = '', right = '') => {
  if (!left || !right) return 0;
  if (left === right) return 10;
  if (left.includes(right) || right.includes(left)) return 8;

  const leftTokens = left.split(' ').filter((token) => token.length > 2);
  const rightTokens = new Set(right.split(' ').filter((token) => token.length > 2));
  return leftTokens.filter((token) => rightTokens.has(token)).length;
};

const BENCHMARK_SPEC_ROWS = Object.entries(MARKET_DATA).flatMap(([powertrain, rows]) =>
  rows.map((row) => ({
    ...row,
    powertrain,
    normalizedBrand: normalizeVehicleText(row.brand),
    normalizedModel: normalizeVehicleText(row.model),
  })),
);

const findBenchmarkSpec = ({ brand, model, powertrain }) => {
  const normalizedBrand = normalizeVehicleText(brand);
  const normalizedModel = normalizeVehicleText(model);

  const matches = BENCHMARK_SPEC_ROWS
    .filter(
      (row) =>
        row.powertrain === powertrain &&
        row.normalizedBrand === normalizedBrand,
    )
    .map((row) => ({
      ...row,
      score: scoreModelMatch(normalizedModel, row.normalizedModel),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  return matches[0] || null;
};

const inferSupplementalRange = ({ powertrain, model, variant, batteryKWh, benchmarkSpec }) => {
  if (benchmarkSpec?.range && benchmarkSpec.range !== 'N/A') {
    return benchmarkSpec.range;
  }

  const text = normalizeVehicleText(`${model} ${variant}`);

  if (powertrain === 'HEV') {
    if (/hyryder|grand vitara/.test(text)) return '700+ km (combined)';
    if (/city/.test(text) && /hev/.test(text)) return '650+ km (combined)';
  }

  if (powertrain === 'EV') {
    if (/punch ev/.test(text)) return Number(batteryKWh) >= 35 ? '421 km' : '315 km';
    if (/xuv400/.test(text)) return Number(batteryKWh) >= 39 ? '456 km' : '375 km';
    if (/zs ev/.test(text)) return '461 km';
    if (/ioniq 5/.test(text)) return '631 km';
    if (/seal/.test(text)) {
      if (/performance/.test(text)) return '580 km';
      if (/premium/.test(text)) return '650 km';
      return '510 km';
    }
  }

  return 'N/A';
};

const inferSupplementalMileage = ({ powertrain, model, variant, benchmarkSpec }) => {
  if (benchmarkSpec?.mileage && benchmarkSpec.mileage !== 'N/A') {
    return benchmarkSpec.mileage;
  }

  const text = normalizeVehicleText(`${model} ${variant}`);

  if (powertrain === 'HEV') {
    if (/hyryder|grand vitara/.test(text)) return '27.9 km/l';
    if (/city/.test(text) && /hev/.test(text)) return '26.5 km/l';
  }

  return 'N/A';
};

const resolveSupplementalCarSpecs = ({ row, powertrain, power, batteryKWh }) => {
  const brand = row['Brand'] || 'Unknown';
  const model = row['Model'] || '';
  const variant = row['Variant'] || '';
  const benchmarkSpec = findBenchmarkSpec({ brand, model, powertrain });

  const resolvedBatteryKWh =
    Number.isFinite(Number(batteryKWh)) && Number(batteryKWh) > 0
      ? Number(batteryKWh)
      : Number(benchmarkSpec?.batteryKWh) > 0
        ? Number(benchmarkSpec.batteryKWh)
        : null;

  const resolvedEMotorPower =
    Number(benchmarkSpec?.eMotorPower) > 0
      ? Number(benchmarkSpec.eMotorPower)
      : powertrain === 'EV'
        ? hpToKw(power)
        : null;

  return {
    batteryKWh: resolvedBatteryKWh,
    eMotorPower: resolvedEMotorPower,
    mileage: inferSupplementalMileage({ powertrain, model, variant, benchmarkSpec }),
    range: inferSupplementalRange({
      powertrain,
      model,
      variant,
      batteryKWh: resolvedBatteryKWh,
      benchmarkSpec,
    }),
  };
};

const mapCardekhoRowsToMarketRows = (rows) =>
  rows
    .map((row) => {
      const powertrain = inferPowertrainFromCardekho(row);
      const power = parsePowerFromText(row['Max Power']);
      const batteryKWh = parseBatteryKwhFromRow(row);
      const supplementalSpecs = resolveSupplementalCarSpecs({
        row,
        powertrain,
        power,
        batteryKWh,
      });
      const model = [row['Model'], row['Variant']]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      return {
        launchDate: 'N/A',
        brand: row['Brand'] || 'Unknown',
        model: model || 'Unknown Model',
        engineCapacity: row['Displacement'] || 'N/A',
        technology: row['Engine Type'] || row['Transmission Type'] || row['Gearbox'] || 'N/A',
        power,
        torque: parseTorqueFromText(row['Max Torque']),
        mileage: supplementalSpecs.mileage,
        batteryKWh: supplementalSpecs.batteryKWh,
        eMotorPower: supplementalSpecs.eMotorPower,
        range: supplementalSpecs.range,
        launchStatus: 'Existing Market',
        source: 'CarDekho',
        powertrain,
        launchYear: 'TBA'
      };
    })
    .sort((a, b) => {
      const brandCompare = String(a.brand).localeCompare(String(b.brand));
      if (brandCompare !== 0) return brandCompare;
      return String(a.model).localeCompare(String(b.model));
    });

const getGraphMetricRowValue = (row, metric) => {
  if (metric === 'avgBattery') return Number(row.batteryKWh);
  if (metric === 'avgPower') return Number(row.power);
  if (metric === 'avgTorque') return Number(row.torque);
  return 1;
};

const formatGraphMetricValue = (metric, value) => {
  const config = GRAPH_METRIC_CONFIG[metric] || GRAPH_METRIC_CONFIG.modelCount;
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 'N/A';
  if (metric === 'modelCount') return `${Math.round(numericValue)} ${config.unit}`;
  return `${numericValue.toFixed(config.decimals)} ${config.unit}`;
};

const inferPowertrainFromPrompt = (text) => {
  if (/\b(?:mhev|hev|hybrid|e:hev|strong hybrid|mild hybrid)\b/i.test(text)) return 'HEV';
  if (/\b(?:ev|electric)\b/i.test(text)) return 'EV';
  if (/\bcng\b/i.test(text)) return 'CNG';
  if (/\b(?:ice|petrol|diesel|disel)\b/i.test(text)) return 'ICE';
  return 'all';
};

const getRowCompletenessScore = (row) => {
  let score = 0;
  if (row.launchStatus === 'Existing Market') score += 2;
  if (row.engineCapacity && row.engineCapacity !== 'N/A') score += 1;
  if (row.technology && row.technology !== 'N/A') score += 1;
  if (Number(row.power) > 0) score += 1;
  if (Number(row.torque) > 0) score += 1;
  if (Number(row.batteryKWh) > 0) score += 1;
  if (Number(row.eMotorPower) > 0) score += 1;
  if (row.range && row.range !== 'N/A' && row.range !== 'TBA') score += 1;
  if (row.mileage && row.mileage !== 'N/A') score += 1;
  return score;
};

const buildComparableCars = (rows = []) => {
  const existingRows = rows.filter((row) => row.launchStatus === 'Existing Market');
  const byKey = new Map();

  existingRows.forEach((row) => {
    const brand = String(row.brand || '').trim();
    const model = String(row.model || '').trim();
    const powertrain = String(row.powertrain || '').trim();
    if (!brand || !model || !powertrain) return;

    const key = `${powertrain.toLowerCase()}|${brand.toLowerCase()}|${model.toLowerCase()}`;
    const current = byKey.get(key);
    if (!current || getRowCompletenessScore(row) > getRowCompletenessScore(current)) {
      byKey.set(key, row);
    }
  });

  return Array.from(byKey.entries())
    .map(([id, row]) => ({ id, ...row }))
    .sort((a, b) => {
      const brandCompare = String(a.brand).localeCompare(String(b.brand));
      if (brandCompare !== 0) return brandCompare;
      return String(a.model).localeCompare(String(b.model));
    });
};

const formatCarComparisonValue = (car, field) => {
  if (!car) return 'N/A';
  if (field === 'power') return Number(car.power) > 0 ? `${Number(car.power)} hp` : 'N/A';
  if (field === 'torque') return Number(car.torque) > 0 ? `${Number(car.torque)} Nm` : 'N/A';
  if (field === 'batteryKWh') return Number(car.batteryKWh) > 0 ? `${Number(car.batteryKWh)} kWh` : 'N/A';
  if (field === 'eMotorPower') return Number(car.eMotorPower) > 0 ? `${Number(car.eMotorPower)} kW` : 'N/A';
  const value = car[field];
  return value === undefined || value === null || value === '' ? 'N/A' : value;
};

const MarketPositioning = () => {
  const [selectedType, setSelectedType] = useState('ICE');
  const [tableOpen, setTableOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: 'Ask me about selected powertrain insights, top brands, battery stats, upcoming launches, or direct EV/HEV comparisons.'
    }
  ]);
  const [graphPrompt, setGraphPrompt] = useState('');
  const [graphType, setGraphType] = useState('bar');
  const [graphXAxis, setGraphXAxis] = useState('brand');
  const [graphMetric, setGraphMetric] = useState('modelCount');
  const [graphScope, setGraphScope] = useState('all');
  const [graphPowertrain, setGraphPowertrain] = useState('all');
  const [graphPanelMode, setGraphPanelMode] = useState('carCompare');
  const [compareMetricPreset, setCompareMetricPreset] = useState('auto');
  const [generatedGraph, setGeneratedGraph] = useState(null);
  const [graphDrilldown, setGraphDrilldown] = useState(null);
  const [leftCompareType, setLeftCompareType] = useState('all');
  const [leftCompareBrand, setLeftCompareBrand] = useState('all');
  const [leftCompareCarId, setLeftCompareCarId] = useState('');
  const [rightCompareType, setRightCompareType] = useState('all');
  const [rightCompareBrand, setRightCompareBrand] = useState('all');
  const [rightCompareCarId, setRightCompareCarId] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const cleanEnergyMix = useMemo(
    () => parseCsvRows(cleanEnergyMixRaw).sort((a, b) => Number(b.Year || 0) - Number(a.Year || 0)),
    []
  );
  const latestEnergyMix = cleanEnergyMix[0] || null;
  const cardekhoRows = useMemo(() => mapCardekhoRowsToMarketRows(parseCsvRows(cardekhoFullDatasetRaw)), []);

  const existingRows = useMemo(
    () => Object.entries(MARKET_DATA).flatMap(([powertrain, rows]) => rows.map((row) => normalizeRow(row, powertrain))),
    []
  );

  const upcomingRows = useMemo(
    () =>
      launches.map((item) => ({
        launchDate: item.launch_date,
        brand: item.brand,
        model: item.model,
        engineCapacity: 'N/A',
        technology: item.powertrain,
        power: null,
        torque: null,
        mileage: 'N/A',
        batteryKWh: null,
        eMotorPower: null,
        range: 'TBA',
        launchStatus: 'Upcoming Launch',
        source: item.source,
        powertrain: mapPowertrainToType(item.powertrain),
        launchYear: getLaunchYear(item.launch_date)
      })),
    []
  );

  const allRows = useMemo(() => [...existingRows, ...upcomingRows], [existingRows, upcomingRows]);
  const powertrainOptionRows = useMemo(
    () => [...existingRows, ...cardekhoRows, ...upcomingRows],
    [existingRows, cardekhoRows, upcomingRows]
  );
  const knownBrands = useMemo(() => {
    const fromRows = [...new Set(powertrainOptionRows.map((row) => row.brand).filter(Boolean))];
    BRAND_HINTS.forEach((brand) => {
      if (!fromRows.some((item) => item.toLowerCase() === brand.toLowerCase())) {
        fromRows.push(brand);
      }
    });
    return fromRows;
  }, [powertrainOptionRows]);

  const selectedRows = useMemo(() => {
    const rows = powertrainOptionRows.filter((row) => row.powertrain === selectedType);
    if (statusFilter === 'All') return rows;
    return rows.filter((row) => row.launchStatus === statusFilter);
  }, [powertrainOptionRows, selectedType, statusFilter]);

  const comparableCars = useMemo(() => buildComparableCars(powertrainOptionRows), [powertrainOptionRows]);
  const leftTypeCars = useMemo(
    () => comparableCars.filter((car) => leftCompareType === 'all' || car.powertrain === leftCompareType),
    [comparableCars, leftCompareType]
  );
  const leftBrandOptions = useMemo(
    () => [...new Set(leftTypeCars.map((car) => car.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [leftTypeCars]
  );
  const leftModelOptions = useMemo(
    () => leftTypeCars.filter((car) => leftCompareBrand === 'all' || car.brand === leftCompareBrand),
    [leftTypeCars, leftCompareBrand]
  );
  const selectedLeftCar = useMemo(
    () => leftModelOptions.find((car) => car.id === leftCompareCarId) || null,
    [leftModelOptions, leftCompareCarId]
  );

  const rightTypeCars = useMemo(
    () => comparableCars.filter((car) => rightCompareType === 'all' || car.powertrain === rightCompareType),
    [comparableCars, rightCompareType]
  );
  const rightBrandOptions = useMemo(
    () => [...new Set(rightTypeCars.map((car) => car.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [rightTypeCars]
  );
  const rightModelOptions = useMemo(
    () => rightTypeCars.filter((car) => rightCompareBrand === 'all' || car.brand === rightCompareBrand),
    [rightTypeCars, rightCompareBrand]
  );
  const selectedRightCar = useMemo(
    () => rightModelOptions.find((car) => car.id === rightCompareCarId) || null,
    [rightModelOptions, rightCompareCarId]
  );
  const leftCarGraphLabel = selectedLeftCar ? `${selectedLeftCar.brand} ${selectedLeftCar.model}` : 'Car A';
  const rightCarGraphLabel = selectedRightCar ? `${selectedRightCar.brand} ${selectedRightCar.model}` : 'Car B';
  const compareGraphRows = useMemo(() => {
    if (!selectedLeftCar || !selectedRightCar) return [];

    const selectedMetricKeys =
      compareMetricPreset === 'performance'
        ? ['power', 'torque']
        : compareMetricPreset === 'electric'
          ? ['batteryKWh', 'eMotorPower']
          : compareMetricPreset === 'all'
            ? CAR_COMPARE_GRAPH_METRICS.map((item) => item.key)
            : CAR_COMPARE_GRAPH_METRICS.filter(
                (item) => Number(selectedLeftCar[item.key]) > 0 || Number(selectedRightCar[item.key]) > 0
              ).map((item) => item.key);

    return CAR_COMPARE_GRAPH_METRICS.filter((item) => selectedMetricKeys.includes(item.key))
      .map((item) => {
        const leftRaw = Number(selectedLeftCar[item.key] || 0);
        const rightRaw = Number(selectedRightCar[item.key] || 0);
        const maxValue = Math.max(leftRaw, rightRaw, 0);
        if (maxValue <= 0) return null;
        return {
          metric: item.label,
          unit: item.unit,
          leftRaw,
          rightRaw,
          leftScore: Number(((leftRaw / maxValue) * 100).toFixed(1)),
          rightScore: Number(((rightRaw / maxValue) * 100).toFixed(1)),
          winner: leftRaw === rightRaw ? 'tie' : leftRaw > rightRaw ? 'left' : 'right'
        };
      })
      .filter(Boolean);
  }, [selectedLeftCar, selectedRightCar, compareMetricPreset]);
  const compareGraphHeight = useMemo(() => Math.max(240, compareGraphRows.length * 58), [compareGraphRows.length]);
  const compareGraphSummary = useMemo(() => {
    let leftWins = 0;
    let rightWins = 0;
    let ties = 0;

    compareGraphRows.forEach((row) => {
      if (row.winner === 'left') leftWins += 1;
      else if (row.winner === 'right') rightWins += 1;
      else ties += 1;
    });

    return { leftWins, rightWins, ties };
  }, [compareGraphRows]);

  const batteryComparison = useMemo(() => {
    const batteryRows = selectedRows.filter((item) => Number(item.batteryKWh) > 0 && item.brand);

    if (!batteryRows.length) {
      return {
        title: `${selectedType} Battery Capacity by Brand`,
        subtitle: `No battery capacity values are available for ${selectedType} in current powertrain selection.`,
        values: []
      };
    }

    const grouped = batteryRows.reduce((acc, item) => {
      const key = String(item.brand);
      if (!acc[key]) {
        acc[key] = { brand: key, modelCount: 0, batteryValues: [], rows: [] };
      }
      acc[key].modelCount += 1;
      acc[key].batteryValues.push(Number(item.batteryKWh));
      acc[key].rows.push(item);
      return acc;
    }, {});

    const values = Object.values(grouped)
      .map((entry) => ({
        brand: entry.brand,
        label: `${entry.brand} (${entry.modelCount})`,
        avgBatteryKWh: Number(formatAverage(entry.batteryValues, 2)),
        modelCount: entry.modelCount,
        drilldownRows: entry.rows
      }))
      .sort((a, b) => b.avgBatteryKWh - a.avgBatteryKWh)
      .slice(0, 10);

    return {
      title: `${selectedType} Battery Capacity by Brand`,
      subtitle: 'Average battery size (kWh); number in brackets shows model count from powertrain section data.',
      values
    };
  }, [selectedRows, selectedType]);
  const batteryChartHeight = useMemo(() => Math.max(300, batteryComparison.values.length * 42), [batteryComparison.values.length]);
  const generatedGraphHeight = useMemo(() => {
    if (!generatedGraph) return 260;
    if (generatedGraph.type === 'pie') return 320;
    return Math.max(260, generatedGraph.data.length * 42);
  }, [generatedGraph]);
  const graphDrilldownHeight = useMemo(() => {
    const count = graphDrilldown?.values?.length || 0;
    if (count === 0) return 260;
    return Math.max(360, Math.min(540, 320 + count * 8));
  }, [graphDrilldown]);
  const graphDrilldownBottomMargin = useMemo(() => {
    const count = graphDrilldown?.values?.length || 0;
    return Math.min(210, 70 + count * 6);
  }, [graphDrilldown]);
  const graphDrilldownContextText = useMemo(() => {
    if (!graphDrilldown) return '';
    if (graphDrilldown.contextText) return graphDrilldown.contextText;
    const metricText = generatedGraph?.metricLabel ? `Metric: ${generatedGraph.metricLabel}` : '';
    const scopeText = `Scope: ${graphScope}`;
    const powertrainText = graphPowertrain !== 'all' ? `Powertrain: ${graphPowertrain}` : 'Powertrain: All';
    const sectionText = generatedGraph?.xAxis ? `Section: ${GRAPH_X_AXIS_LABELS[generatedGraph.xAxis] || generatedGraph.xAxis}` : '';
    return [sectionText, metricText, scopeText, powertrainText].filter(Boolean).join(' | ');
  }, [graphDrilldown, generatedGraph, graphPowertrain, graphScope]);

  const getFilteredGraphRows = (scope, typeFilter = 'all', brandFilters = []) => {
    const scopeRows =
      scope === 'existing'
        ? allRows.filter((row) => row.launchStatus === 'Existing Market')
        : scope === 'upcoming'
          ? allRows.filter((row) => row.launchStatus === 'Upcoming Launch')
          : allRows;
    const powertrainRows =
      typeFilter && typeFilter !== 'all' ? scopeRows.filter((row) => row.powertrain === typeFilter) : scopeRows;
    if (!brandFilters.length) return powertrainRows;

    const brandSet = new Set(brandFilters.map((brand) => String(brand).toLowerCase()));
    return powertrainRows.filter((row) => brandSet.has(String(row.brand || '').toLowerCase()));
  };

  const buildGraphFromConfig = (type, xAxis, metric, scope, typeFilter = 'all', brandFilters = []) => {
    const rows = getFilteredGraphRows(scope, typeFilter, brandFilters);
    const requestedType = type;
    const resolvedType = type === 'pie' && metric !== 'modelCount' ? 'bar' : type;
    if (requestedType !== resolvedType) {
      setGraphType(resolvedType);
    }
    const grouped = rows.reduce((acc, row) => {
      const key = xAxis === 'launchYear' ? row.launchYear : row[xAxis];
      const safeKey = key || 'Unknown';
      if (!acc[safeKey]) {
        acc[safeKey] = {
          key: safeKey,
          modelCount: 0,
          metricSum: 0,
          metricCount: 0,
          sourceRows: []
        };
      }
      acc[safeKey].modelCount += 1;
      acc[safeKey].sourceRows.push(row);

      if (metric === 'modelCount') {
        acc[safeKey].metricSum += 1;
        acc[safeKey].metricCount += 1;
      } else {
        const metricValue = getGraphMetricRowValue(row, metric);
        if (Number.isFinite(metricValue) && metricValue > 0) {
          acc[safeKey].metricSum += metricValue;
          acc[safeKey].metricCount += 1;
        }
      }
      return acc;
    }, {});

    const groupedEntries = Object.values(grouped);
    const excludedGroups = groupedEntries.filter((entry) => metric !== 'modelCount' && entry.metricCount === 0).length;

    const data = groupedEntries
      .map((entry) => {
        const config = GRAPH_METRIC_CONFIG[metric] || GRAPH_METRIC_CONFIG.modelCount;
        const computedMetric =
          metric === 'modelCount'
            ? entry.modelCount
            : entry.metricCount > 0
              ? Number((entry.metricSum / entry.metricCount).toFixed(config.decimals))
              : null;

        return {
          label: String(entry.key),
          rawLabel: entry.key,
          modelCount: entry.modelCount,
          validValueCount: entry.metricCount,
          drilldownRows: entry.sourceRows,
          [metric]: computedMetric
        };
      })
      .filter((entry) => entry[metric] !== null && Number(entry[metric]) > 0);

    data.sort((a, b) => {
      if (xAxis === 'launchYear') return Number(a.rawLabel || 0) - Number(b.rawLabel || 0);
      return Number(b[metric] || 0) - Number(a[metric] || 0) || String(a.label).localeCompare(String(b.label));
    });

    const maxPoints = resolvedType === 'pie' ? MAX_PIE_POINTS : xAxis === 'launchYear' ? Number.MAX_SAFE_INTEGER : MAX_BAR_POINTS;
    let trimmedData = data;
    let hiddenItems = 0;

    if (data.length > maxPoints) {
      hiddenItems = data.length - maxPoints;
      if (resolvedType === 'pie' && metric === 'modelCount') {
        const topData = data.slice(0, maxPoints - 1);
        const remaining = data.slice(maxPoints - 1);
        const othersCount = remaining.reduce((sum, item) => sum + Number(item.modelCount || 0), 0);
        const othersMetric = remaining.reduce((sum, item) => sum + Number(item[metric] || 0), 0);
        const othersRows = remaining.flatMap((item) => item.drilldownRows || []);
        trimmedData = [
          ...topData,
          {
            label: 'Others',
            rawLabel: 'Others',
            modelCount: othersCount,
            validValueCount: othersCount,
            drilldownRows: othersRows,
            [metric]: othersMetric
          }
        ];
      } else {
        trimmedData = data.slice(0, maxPoints);
      }
    }

    const missingBrands =
      xAxis === 'brand' && brandFilters.length > 0
        ? brandFilters.filter((brand) => !rows.some((row) => String(row.brand).toLowerCase() === String(brand).toLowerCase()))
        : [];
    const qualityNotes = [];
    if (requestedType === 'pie' && resolvedType === 'bar') {
      qualityNotes.push('Pie chart was switched to bar because averages are not part-to-whole metrics.');
    }
    if (metric !== 'modelCount' && excludedGroups > 0) {
      qualityNotes.push(`Excluded ${excludedGroups} group(s) with no valid ${GRAPH_METRIC_CONFIG[metric].label.toLowerCase()} values.`);
    }
    if (hiddenItems > 0) {
      qualityNotes.push(`Showing top ${trimmedData.length} groups by ${GRAPH_METRIC_CONFIG[metric].label.toLowerCase()}.`);
    }

    setGraphDrilldown(null);
    setGeneratedGraph({
      type: resolvedType,
      metric,
      metricLabel: GRAPH_METRIC_CONFIG[metric].label,
      xAxis,
      data: trimmedData,
      title: `${GRAPH_METRIC_CONFIG[metric].label} by ${GRAPH_X_AXIS_LABELS[xAxis] || xAxis}`,
      brandFilters,
      missingBrands,
      powertrainFilter: typeFilter,
      qualityNotes,
      totalRows: rows.length
    });
  };

  const applyPromptToGraph = () => {
    const text = graphPrompt.toLowerCase();
    const asksDistribution = /\b(pie|distribution|share|composition|percentage)\b/i.test(text);
    const suggestedType = asksDistribution ? 'pie' : 'bar';
    const suggestedXAxis = /\b(powertrain|fuel)\b/i.test(text)
      ? 'powertrain'
      : /\b(status|upcoming|existing|launch status)\b/i.test(text)
        ? 'launchStatus'
        : /\b(year|launch year)\b/i.test(text)
          ? 'launchYear'
          : 'brand';
    const suggestedMetric = /\b(count|models|volume|share|distribution|percentage|composition)\b/i.test(text)
      ? 'modelCount'
      : /\b(battery|kwh)\b/i.test(text)
        ? 'avgBattery'
        : /\b(power|hp|bhp)\b/i.test(text)
          ? 'avgPower'
          : /\b(torque|nm)\b/i.test(text)
            ? 'avgTorque'
            : 'modelCount';
    const suggestedScope = text.includes('upcoming') ? 'upcoming' : text.includes('existing') ? 'existing' : 'all';
    const typeFilter = inferPowertrainFromPrompt(text);
    const brandFilters = extractBrandFilters(text, knownBrands);

    setGraphType(suggestedType);
    setGraphXAxis(suggestedXAxis);
    setGraphMetric(suggestedMetric);
    setGraphScope(suggestedScope);
    setGraphPowertrain(typeFilter);
    buildGraphFromConfig(suggestedType, suggestedXAxis, suggestedMetric, suggestedScope, typeFilter, brandFilters);
  };

  const openBrandModelDrilldown = (brandName, sourceRows = [], preferredMetric = 'auto', contextText = '') => {
    const selectedBrand = String(brandName || '').trim();
    const safeBrand = selectedBrand || 'Selected brand';
    const normalizedBrand = selectedBrand.toLowerCase();
    const filteredByBrand = sourceRows.filter((row) => String(row.brand || '').toLowerCase() === normalizedBrand);
    const scopedRows = filteredByBrand.filter((row) => row.launchStatus === 'Existing Market');
    const rows = scopedRows.length ? scopedRows : filteredByBrand;

    if (!rows.length) {
      setGraphDrilldown({
        categoryLabel: safeBrand,
        metricKey: null,
        metricLabel: null,
        unit: null,
        contextText,
        values: [],
        message: `No model-level rows available for ${safeBrand} in this selected section.`
      });
      return;
    }

    const grouped = rows.reduce((acc, row) => {
      const modelLabel = String(row.model || '').trim() || 'Unknown Model';
      if (!acc[modelLabel]) {
        acc[modelLabel] = {
          model: modelLabel,
          batteryValues: [],
          powerValues: [],
          torqueValues: [],
          records: 0
        };
      }
      acc[modelLabel].records += 1;
      if (Number(row.batteryKWh) > 0) acc[modelLabel].batteryValues.push(Number(row.batteryKWh));
      if (Number(row.power) > 0) acc[modelLabel].powerValues.push(Number(row.power));
      if (Number(row.torque) > 0) acc[modelLabel].torqueValues.push(Number(row.torque));
      return acc;
    }, {});

    const modelRows = Object.values(grouped);
    const hasBattery = modelRows.some((entry) => entry.batteryValues.length > 0);
    const hasPower = modelRows.some((entry) => entry.powerValues.length > 0);
    const hasTorque = modelRows.some((entry) => entry.torqueValues.length > 0);

    const forcedBattery = preferredMetric === 'battery' && hasBattery;
    const forcedPower = preferredMetric === 'power' && hasPower;
    const forcedTorque = preferredMetric === 'torque' && hasTorque;
    const metricConfig = forcedBattery
      ? { metricKey: 'battery', metricLabel: 'Battery Capacity', unit: 'kWh' }
      : forcedPower
        ? { metricKey: 'power', metricLabel: 'Power', unit: 'hp' }
        : forcedTorque
          ? { metricKey: 'torque', metricLabel: 'Torque', unit: 'Nm' }
          : hasBattery
            ? { metricKey: 'battery', metricLabel: 'Battery Capacity', unit: 'kWh' }
            : hasPower
              ? { metricKey: 'power', metricLabel: 'Power', unit: 'hp' }
              : hasTorque
                ? { metricKey: 'torque', metricLabel: 'Torque', unit: 'Nm' }
                : null;

    if (!metricConfig) {
      setGraphDrilldown({
        categoryLabel: safeBrand,
        metricKey: null,
        metricLabel: null,
        unit: null,
        contextText,
        values: [],
        message: `No battery, power, or torque values are available for ${safeBrand}.`
      });
      return;
    }

    const values = modelRows
      .map((entry) => {
        const metricValues =
          metricConfig.metricKey === 'battery'
            ? entry.batteryValues
            : metricConfig.metricKey === 'power'
              ? entry.powerValues
              : entry.torqueValues;
        if (!metricValues.length) return null;
        const avgValue = metricValues.reduce((sum, value) => sum + value, 0) / metricValues.length;
        return {
          model: entry.model,
          value: Number(avgValue.toFixed(2)),
          records: entry.records
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);

    setGraphDrilldown({
      categoryLabel: safeBrand,
      metricKey: metricConfig.metricKey,
      metricLabel: metricConfig.metricLabel,
      unit: metricConfig.unit,
      contextText,
      values,
      message: values.length ? null : `No model-level values found for ${safeBrand}.`
    });
  };

  const handleBatteryBrandBarClick = (clickedPoint) => {
    const point = clickedPoint?.payload || clickedPoint;
    if (!point) return;
    const selectedBrand = String(point.brand || point.label || '').replace(/\s*\(\d+\)\s*$/, '').trim();
    if (!selectedBrand) return;

    openBrandModelDrilldown(
      selectedBrand,
      Array.isArray(point.drilldownRows) ? point.drilldownRows : selectedRows,
      'battery',
      `Section: ${selectedType} Battery Capacity by Brand | Status: ${statusFilter}`
    );
  };

  const handleGraphPointSelect = (clickedPoint) => {
    const point = clickedPoint?.payload || clickedPoint;
    if (!point || !Array.isArray(point.drilldownRows)) return;
    if (generatedGraph?.xAxis !== 'brand') {
      setGraphDrilldown({
        categoryLabel: point.label || 'Selected category',
        metricKey: null,
        metricLabel: null,
        unit: null,
        contextText: generatedGraph?.title || '',
        values: [],
        message: 'To compare cars within a brand, set X-Axis to Brand and click a brand bar.'
      });
      return;
    }

    const selectedBrand = String(point.rawLabel || point.label || '').trim();
    if (!selectedBrand || selectedBrand.toLowerCase() === 'others') {
      setGraphDrilldown({
        categoryLabel: selectedBrand || 'Selected category',
        metricKey: null,
        metricLabel: null,
        unit: null,
        contextText: generatedGraph?.title || '',
        values: [],
        message: 'Please click a specific brand bar (not "Others") for model-level comparison.'
      });
      return;
    }

    openBrandModelDrilldown(
      selectedBrand,
      point.drilldownRows,
      'auto',
      `Section: ${generatedGraph?.title || 'Market Insights'} | Scope: ${graphScope} | Powertrain: ${
        graphPowertrain !== 'all' ? graphPowertrain : 'All'
      }`
    );
  };

  const respondToChat = (question) => {
    const q = String(question || '').toLowerCase().trim();
    if (!q) return 'Please type a question so I can help with data-backed insights.';

    const mentionsAllPowertrains =
      /\b(all powertrains|overall|whole market|entire market|across all)\b/i.test(q) ||
      /\boverall summary\b/i.test(q);
    const explicitPowertrain = inferPowertrainFromPrompt(q);
    const scopedPowertrain = mentionsAllPowertrains ? 'all' : explicitPowertrain !== 'all' ? explicitPowertrain : selectedType;
    const brandFilters = extractBrandFilters(q, knownBrands);
    const chatRows = powertrainOptionRows;

    const baseRows =
      scopedPowertrain === 'all' ? chatRows : chatRows.filter((row) => row.powertrain === scopedPowertrain);
    const rows =
      brandFilters.length > 0
        ? baseRows.filter((row) => brandFilters.some((brand) => String(row.brand).toLowerCase() === String(brand).toLowerCase()))
        : baseRows;
    const existing = rows.filter((row) => row.launchStatus === 'Existing Market');
    const upcoming = rows.filter((row) => row.launchStatus === 'Upcoming Launch');
    const contextLabel =
      scopedPowertrain === 'all'
        ? 'all powertrains'
        : `${scopedPowertrain}${brandFilters.length ? `, brands: ${brandFilters.join(', ')}` : ''}`;

    const countByBrand = (inputRows) =>
      Object.entries(
        inputRows.reduce((acc, row) => {
          const brand = row.brand || 'Unknown';
          acc[brand] = (acc[brand] || 0) + 1;
          return acc;
        }, {})
      )
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([brand, count]) => ({ brand, count }));

    const topBrands = (inputRows, limit = 5) =>
      countByBrand(inputRows)
        .slice(0, limit)
        .map((item) => `${item.brand} (${item.count})`);

    const getAverageFromRows = (inputRows, key, decimals = 2) => {
      const values = inputRows.map((row) => Number(row[key])).filter((value) => Number.isFinite(value) && value > 0);
      if (!values.length) return null;
      return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(decimals);
    };

    const asksForShare = q.includes('share') || q.includes('market share') || q.includes('percentage');
    if (asksForShare && latestEnergyMix) {
      const petrol = Number(latestEnergyMix.Petrol || 0);
      const diesel = Number(latestEnergyMix.Diesel || 0);
      const cng = Number(latestEnergyMix.CNG || 0);
      const ev = Number(latestEnergyMix.EV || 0);
      const total = petrol + diesel + cng + ev;
      if (total > 0) {
        const year = Number(latestEnergyMix.Year);
        const roundShare = (value) => ((value / total) * 100).toFixed(2);
        const iceShare = roundShare(petrol + diesel);
        if (q.includes('ice') || q.includes('petrol') || q.includes('diesel')) {
          return `Fuel share snapshot (${year}): ICE is ${iceShare}% (Petrol ${roundShare(petrol)}%, Diesel ${roundShare(diesel)}%).`;
        }
        if (q.includes('cng')) return `Fuel share snapshot (${year}): CNG is ${roundShare(cng)}%.`;
        if (q.includes('ev') || q.includes('electric')) return `Fuel share snapshot (${year}): EV is ${roundShare(ev)}%.`;
        return `Fuel share snapshot (${year}): ICE ${iceShare}%, CNG ${roundShare(cng)}%, EV ${roundShare(ev)}%.`;
      }
    }

    if (/^(hi|hello|hey)\b/i.test(q) || q.includes('help') || q.includes('what can you')) {
      return `I can answer from ${contextLabel} data: totals, top brands, engine specs, battery stats, power/torque trends, upcoming launches, and EV vs HEV comparisons. Try: "top brands", "highest battery", "upcoming launches", or "compare EV vs HEV".`;
    }

    if (q.includes('summary') || q.includes('overview') || q.includes('snapshot')) {
      const topBrandText = topBrands(existing, 5).join(', ');
      return `Quick summary for ${contextLabel}: ${existing.length} existing models and ${upcoming.length} upcoming launches (${rows.length} total). Top existing brands: ${topBrandText || 'N/A'}.`;
    }

    if (q.includes('compare') && q.includes('ev') && q.includes('hev')) {
      const evRows = chatRows.filter((row) => row.powertrain === 'EV' && row.launchStatus === 'Existing Market');
      const hevRows = chatRows.filter((row) => row.powertrain === 'HEV' && row.launchStatus === 'Existing Market');
      const evBattery = getAverageFromRows(evRows, 'batteryKWh', 2);
      const hevBattery = getAverageFromRows(hevRows, 'batteryKWh', 2);
      const evPower = getAverageFromRows(evRows, 'power', 1);
      const hevPower = getAverageFromRows(hevRows, 'power', 1);
      return `EV vs HEV (existing market): models ${evRows.length} vs ${hevRows.length}; avg battery ${evBattery || 'N/A'} kWh vs ${hevBattery || 'N/A'} kWh; avg power ${evPower || 'N/A'} hp vs ${hevPower || 'N/A'} hp.`;
    }

    if (q.includes('how many') || q.includes('count') || q.includes('number of')) {
      if (q.includes('upcoming')) return `Upcoming launches in ${contextLabel}: ${upcoming.length}.`;
      if (q.includes('existing')) return `Existing market models in ${contextLabel}: ${existing.length}.`;
      return `Model counts for ${contextLabel}: ${existing.length} existing, ${upcoming.length} upcoming, ${rows.length} total.`;
    }

    if (
      q.includes('top brand') ||
      q.includes('leading brand') ||
      q.includes('most models') ||
      (q.includes('brand') && (q.includes('top') || q.includes('rank')))
    ) {
      const list = topBrands(existing, 6);
      return list.length ? `Top brands in ${contextLabel} (existing market): ${list.join(', ')}.` : `No brand ranking data found for ${contextLabel}.`;
    }

    if (q.includes('upcoming') || q.includes('launch')) {
      if (!upcoming.length) return `No upcoming launches found for ${contextLabel}.`;
      const launchList = upcoming
        .slice()
        .sort((a, b) => String(a.launchDate || '').localeCompare(String(b.launchDate || '')))
        .slice(0, 8)
        .map((row) => `${row.brand} ${row.model} (${row.launchDate || 'TBA'})`);
      return `Upcoming launches for ${contextLabel}: ${launchList.join(', ')}.`;
    }

    if (q.includes('engine') || q.includes('displacement')) {
      const engineRows = existing.filter((row) => row.engineCapacity && row.engineCapacity !== 'N/A');
      if (!engineRows.length) return `No engine-capacity values are available for ${contextLabel}.`;
      const sample = engineRows.slice(0, 8).map((row) => `${row.brand} ${row.model} (${row.engineCapacity})`);
      return `Engine capacity samples for ${contextLabel}: ${sample.join(', ')}.`;
    }

    if (q.includes('battery')) {
      const batteries = existing.filter((row) => Number(row.batteryKWh) > 0);
      if (!batteries.length) return `No battery capacity values are available for ${contextLabel}.`;

      const sorted = batteries
        .slice()
        .sort((a, b) => Number(b.batteryKWh || 0) - Number(a.batteryKWh || 0));
      const avgBattery = getAverageFromRows(sorted, 'batteryKWh', 2);
      const highest = sorted[0];
      const sample = sorted.slice(0, 5).map((row) => `${row.brand} ${row.model} (${row.batteryKWh} kWh)`);

      if (q.includes('highest') || q.includes('max') || q.includes('largest')) {
        return `Highest battery in ${contextLabel}: ${highest.brand} ${highest.model} at ${highest.batteryKWh} kWh. Top entries: ${sample.join(', ')}.`;
      }
      return `Battery insights for ${contextLabel}: ${batteries.length} models with battery data, average ${avgBattery} kWh. Top entries: ${sample.join(', ')}.`;
    }

    if (q.includes('power') || q.includes('hp') || q.includes('bhp')) {
      const powerRows = existing.filter((row) => Number(row.power) > 0);
      if (!powerRows.length) return `No power values are available for ${contextLabel}.`;
      const highest = powerRows.slice().sort((a, b) => Number(b.power) - Number(a.power))[0];
      const avgPower = getAverageFromRows(powerRows, 'power', 1);
      return `Power insights for ${contextLabel}: average ${avgPower} hp, highest ${highest.power} hp (${highest.brand} ${highest.model}).`;
    }

    if (q.includes('torque') || q.includes('nm')) {
      const torqueRows = existing.filter((row) => Number(row.torque) > 0);
      if (!torqueRows.length) return `No torque values are available for ${contextLabel}.`;
      const highest = torqueRows.slice().sort((a, b) => Number(b.torque) - Number(a.torque))[0];
      const avgTorque = getAverageFromRows(torqueRows, 'torque', 1);
      return `Torque insights for ${contextLabel}: average ${avgTorque} Nm, highest ${highest.torque} Nm (${highest.brand} ${highest.model}).`;
    }

    if (q.includes('mileage')) {
      const mileageRows = existing.filter((row) => row.mileage && row.mileage !== 'N/A');
      if (!mileageRows.length) return `No mileage values are available for ${contextLabel}.`;
      const sample = mileageRows.slice(0, 6).map((row) => `${row.brand} ${row.model} (${row.mileage})`);
      return `Mileage samples for ${contextLabel}: ${sample.join(', ')}.`;
    }

    return `I can answer from ${contextLabel} data. Try: "summary", "top brands", "highest battery", "upcoming launches", "average power", or "compare EV vs HEV".`;
  };

  const fetchLiveChatAnswer = async (question) => {
    if (!BACKEND_URL) return null;
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          messages: chatMessages.slice(-8),
          context: {
            page: 'market-positioning',
            selectedPowertrain: selectedType,
            statusFilter,
            selectedRowCount: selectedRows.length
          }
        })
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (typeof data === 'string') return data;
      return data.answer || data.response || data.message || null;
    } catch (error) {
      console.warn('Live chat API unavailable, using local data-driven fallback.', error);
      return null;
    }
  };

  const askChatQuestion = async (rawQuestion) => {
    const question = String(rawQuestion || '').trim();
    if (!question || chatLoading) return;
    setChatLoading(true);
    const fallbackAnswer = respondToChat(question);
    const liveAnswer = await fetchLiveChatAnswer(question);
    const answer = liveAnswer || fallbackAnswer;
    setChatMessages((prev) => [...prev, { role: 'user', text: question }, { role: 'assistant', text: answer }]);
    setChatInput('');
    setChatLoading(false);
  };

  const submitChat = async () => {
    await askChatQuestion(chatInput);
  };

  const comparisonFields = [
    { key: 'brand', label: 'Brand' },
    { key: 'model', label: 'Model' },
    { key: 'powertrain', label: 'Car Type' },
    { key: 'launchStatus', label: 'Market Status' },
    { key: 'launchDate', label: 'Launch Date' },
    { key: 'engineCapacity', label: 'Engine Capacity' },
    { key: 'technology', label: 'Technology' },
    { key: 'power', label: 'Power' },
    { key: 'torque', label: 'Torque' },
    { key: 'batteryKWh', label: 'Battery' },
    { key: 'eMotorPower', label: 'E-Motor' },
    { key: 'range', label: 'Range' },
    { key: 'mileage', label: 'Mileage' },
    { key: 'source', label: 'Source' }
  ];
  const numericComparisonKeys = new Set(['power', 'torque', 'batteryKWh', 'eMotorPower']);

  const getNumericComparisonClass = (field, side) => {
    if (!numericComparisonKeys.has(field) || !selectedLeftCar || !selectedRightCar) return '';
    const leftValue = Number(selectedLeftCar[field]);
    const rightValue = Number(selectedRightCar[field]);
    if (!(leftValue > 0) || !(rightValue > 0)) return '';
    if (leftValue === rightValue) return 'font-semibold text-slate-900';
    if (side === 'left') return leftValue > rightValue ? 'font-semibold text-emerald-700' : 'text-slate-500';
    return rightValue > leftValue ? 'font-semibold text-emerald-700' : 'text-slate-500';
  };

  return (
    <div className="space-y-6" data-testid="market-positioning-page">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Market Positioning</h1>
        <p className="text-muted-foreground mt-1">
          Click a powertrain option to open its comparison table and review battery-size trends.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Powertrain Options</CardTitle>
          <CardDescription>
            Selecting any option opens a detailed table similar to your sample concept.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            {POWERTRAINS.map((type) => (
              <Button
                key={type}
                type="button"
                onClick={() => {
                  setSelectedType(type);
                  setStatusFilter('All');
                  setTableOpen(true);
                }}
                className={`h-14 text-base font-semibold ${
                  type === selectedType
                    ? 'bg-emerald-200 text-emerald-800 border border-emerald-300 ring-2 ring-offset-2 ring-emerald-500/45 scale-[1.01]'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200'
                }`}
              >
                {type}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{batteryComparison.title}</CardTitle>
          <CardDescription>{batteryComparison.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          {batteryComparison.values.length === 0 ? (
            <p className="text-sm text-muted-foreground">No battery chart to display for the selected filter.</p>
          ) : (
            <ResponsiveContainer width="100%" height={batteryChartHeight}>
              <BarChart data={batteryComparison.values} layout="vertical" margin={{ left: 32, right: 32, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `${value} kWh`} />
                <YAxis type="category" dataKey="label" width={180} />
                <Tooltip formatter={(value) => [`${value} kWh`, 'Average Battery']} />
                <Bar dataKey="avgBatteryKWh" fill="#16A34A" radius={[0, 6, 6, 0]} onClick={handleBatteryBrandBarClick} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>AI Insights Chatbot</CardTitle>
            <CardDescription className="text-slate-700">
              Ask data questions by selected powertrain, brand, launches, battery, power, torque, and comparisons.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 space-y-3 shadow-inner">
              {chatMessages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`max-w-[92%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    message.role === 'assistant'
                      ? 'bg-white/95 border border-slate-300 text-slate-900 mr-auto'
                      : 'bg-emerald-100 text-slate-900 ml-auto border border-emerald-300 font-medium'
                  }`}
                >
                  <span className={`font-semibold mr-2 ${message.role === 'assistant' ? 'text-emerald-700' : 'text-emerald-800'}`}>
                    {message.role === 'assistant' ? 'AI:' : 'You:'}
                  </span>
                  {message.text}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {CHAT_QUICK_PROMPTS.map((prompt) => (
                <Button
                  key={prompt}
                  type="button"
                  variant="outline"
                  className="text-xs h-8 px-3"
                  disabled={chatLoading}
                  onClick={() => askChatQuestion(prompt)}
                >
                  {prompt}
                </Button>
              ))}
              <Button
                type="button"
                variant="ghost"
                className="text-xs h-8 px-3 text-slate-600"
                disabled={chatLoading}
                onClick={() =>
                  setChatMessages([
                    {
                      role: 'assistant',
                      text: 'Chat reset. Ask me for summary, top brands, battery stats, launches, or EV vs HEV insights.'
                    }
                  ])
                }
              >
                Clear Chat
              </Button>
            </div>
            <div className="flex gap-2 items-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <Input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder={`Ask from ${selectedType} context or say 'overall' for all powertrains...`}
                className="bg-transparent border-0 shadow-none text-slate-900 placeholder:text-slate-500 focus-visible:border-0 focus-visible:shadow-none"
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !chatLoading) submitChat();
                }}
              />
              <Button
                type="button"
                onClick={submitChat}
                disabled={chatLoading}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 disabled:opacity-70"
              >
                {chatLoading ? 'Thinking...' : 'Ask'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Graph Generator</CardTitle>
            <CardDescription>
              Interactive graph studio for both market insights and car-vs-car visuals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={graphPanelMode === 'carCompare' ? 'default' : 'outline'}
                onClick={() => setGraphPanelMode('carCompare')}
              >
                Car vs Car Graph
              </Button>
              <Button
                type="button"
                variant={graphPanelMode === 'market' ? 'default' : 'outline'}
                onClick={() => setGraphPanelMode('market')}
              >
                Market Insights Graph
              </Button>
            </div>

            {graphPanelMode === 'carCompare' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-emerald-200 bg-white p-4 space-y-3">
                    <p className="text-sm font-semibold text-emerald-900">Graph Car A</p>
                    <select
                      value={leftCompareType}
                      onChange={(event) => {
                        setLeftCompareType(event.target.value);
                        setLeftCompareBrand('all');
                        setLeftCompareCarId('');
                      }}
                      className="input"
                    >
                      <option value="all">Car Type: All</option>
                      <option value="ICE">Car Type: ICE</option>
                      <option value="CNG">Car Type: CNG</option>
                      <option value="HEV">Car Type: HEV</option>
                      <option value="EV">Car Type: EV</option>
                    </select>
                    <select
                      value={leftCompareBrand}
                      onChange={(event) => {
                        setLeftCompareBrand(event.target.value);
                        setLeftCompareCarId('');
                      }}
                      className="input"
                      disabled={leftBrandOptions.length === 0}
                    >
                      <option value="all">Brand: All</option>
                      {leftBrandOptions.map((brand) => (
                        <option key={`graph-left-brand-${brand}`} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                    <select
                      value={leftCompareCarId}
                      onChange={(event) => setLeftCompareCarId(event.target.value)}
                      className="input"
                      disabled={leftModelOptions.length === 0}
                    >
                      <option value="">Select Car A</option>
                      {leftModelOptions.map((car) => (
                        <option key={`graph-left-model-${car.id}`} value={car.id}>
                          {car.model}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-white p-4 space-y-3">
                    <p className="text-sm font-semibold text-blue-900">Graph Car B</p>
                    <select
                      value={rightCompareType}
                      onChange={(event) => {
                        setRightCompareType(event.target.value);
                        setRightCompareBrand('all');
                        setRightCompareCarId('');
                      }}
                      className="input"
                    >
                      <option value="all">Car Type: All</option>
                      <option value="ICE">Car Type: ICE</option>
                      <option value="CNG">Car Type: CNG</option>
                      <option value="HEV">Car Type: HEV</option>
                      <option value="EV">Car Type: EV</option>
                    </select>
                    <select
                      value={rightCompareBrand}
                      onChange={(event) => {
                        setRightCompareBrand(event.target.value);
                        setRightCompareCarId('');
                      }}
                      className="input"
                      disabled={rightBrandOptions.length === 0}
                    >
                      <option value="all">Brand: All</option>
                      {rightBrandOptions.map((brand) => (
                        <option key={`graph-right-brand-${brand}`} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                    <select
                      value={rightCompareCarId}
                      onChange={(event) => setRightCompareCarId(event.target.value)}
                      className="input"
                      disabled={rightModelOptions.length === 0}
                    >
                      <option value="">Select Car B</option>
                      {rightModelOptions.map((car) => (
                        <option key={`graph-right-model-${car.id}`} value={car.id}>
                          {car.model}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <select value={compareMetricPreset} onChange={(event) => setCompareMetricPreset(event.target.value)} className="input max-w-xs">
                    <option value="auto">Metric Set: Auto</option>
                    <option value="performance">Metric Set: Performance</option>
                    <option value="electric">Metric Set: Electric</option>
                    <option value="all">Metric Set: All Numeric</option>
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const nextLeftType = rightCompareType;
                      const nextLeftBrand = rightCompareBrand;
                      const nextLeftCarId = rightCompareCarId;
                      setRightCompareType(leftCompareType);
                      setRightCompareBrand(leftCompareBrand);
                      setRightCompareCarId(leftCompareCarId);
                      setLeftCompareType(nextLeftType);
                      setLeftCompareBrand(nextLeftBrand);
                      setLeftCompareCarId(nextLeftCarId);
                    }}
                  >
                    Swap Cars
                  </Button>
                </div>

                {selectedLeftCar && selectedRightCar ? (
                  compareGraphRows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No comparable numeric specs found for these two cars.</p>
                  ) : (
                    <div className="border border-border rounded-lg p-3 bg-white space-y-3">
                      <p className="text-sm font-semibold">
                        {leftCarGraphLabel} vs {rightCarGraphLabel}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Values are normalized per metric (0-100) for clean cross-metric visual comparison.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Wins: {leftCarGraphLabel} {compareGraphSummary.leftWins} | {rightCarGraphLabel} {compareGraphSummary.rightWins}
                        {compareGraphSummary.ties > 0 ? ` | Ties ${compareGraphSummary.ties}` : ''}
                      </p>
                      <ResponsiveContainer width="100%" height={compareGraphHeight}>
                        <BarChart data={compareGraphRows} layout="vertical" margin={{ left: 24, right: 20, top: 8, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                          <YAxis type="category" dataKey="metric" width={150} />
                          <Tooltip
                            formatter={(value, name, item) => {
                              const row = item?.payload;
                              if (!row) return [value, name];
                              if (name === leftCarGraphLabel) return [`${row.leftRaw} ${row.unit}`, `${name} (raw)`];
                              return [`${row.rightRaw} ${row.unit}`, `${name} (raw)`];
                            }}
                          />
                          <Legend />
                          <Bar dataKey="leftScore" name={leftCarGraphLabel} fill="#2563EB" radius={[0, 6, 6, 0]} />
                          <Bar dataKey="rightScore" name={rightCarGraphLabel} fill="#16A34A" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select one model in both Graph Car A and Graph Car B to generate interactive comparison visuals.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  value={graphPrompt}
                  onChange={(event) => setGraphPrompt(event.target.value)}
                  placeholder="Example: Show EV model count share by brand for existing market"
                  className="min-h-20 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus-visible:border-primary"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2">
                  <select value={graphType} onChange={(event) => setGraphType(event.target.value)} className="input">
                    <option value="bar">Volume/Bar</option>
                    <option value="pie">Pie</option>
                  </select>
                  <select value={graphXAxis} onChange={(event) => setGraphXAxis(event.target.value)} className="input">
                    <option value="brand">X-Axis: Brand</option>
                    <option value="powertrain">X-Axis: Powertrain</option>
                    <option value="launchStatus">X-Axis: Launch Status</option>
                    <option value="launchYear">X-Axis: Launch Year</option>
                  </select>
                  <select value={graphMetric} onChange={(event) => setGraphMetric(event.target.value)} className="input">
                    <option value="modelCount">Y-Axis: Model Count</option>
                    <option value="avgBattery">Y-Axis: Avg Battery</option>
                    <option value="avgPower">Y-Axis: Avg Power</option>
                    <option value="avgTorque">Y-Axis: Avg Torque</option>
                  </select>
                  <select value={graphScope} onChange={(event) => setGraphScope(event.target.value)} className="input">
                    <option value="all">Scope: All</option>
                    <option value="existing">Scope: Existing</option>
                    <option value="upcoming">Scope: Upcoming</option>
                  </select>
                  <select value={graphPowertrain} onChange={(event) => setGraphPowertrain(event.target.value)} className="input">
                    <option value="all">Powertrain: All</option>
                    <option value="ICE">Powertrain: ICE</option>
                    <option value="CNG">Powertrain: CNG</option>
                    <option value="HEV">Powertrain: HEV</option>
                    <option value="EV">Powertrain: EV</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="button" onClick={applyPromptToGraph} variant="outline">
                    Auto from Prompt
                  </Button>
                  <Button type="button" onClick={() => buildGraphFromConfig(graphType, graphXAxis, graphMetric, graphScope, graphPowertrain)}>
                    Generate Graph
                  </Button>
                </div>
                {generatedGraph && (
                  <div className="border border-border rounded-lg p-3">
                    <p className="text-sm font-medium mb-2">{generatedGraph.title}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Rows considered: {generatedGraph.totalRows}
                      {generatedGraph.powertrainFilter && generatedGraph.powertrainFilter !== 'all'
                        ? ` | Powertrain: ${generatedGraph.powertrainFilter}`
                        : ''}
                    </p>
                    {generatedGraph.brandFilters?.length > 0 && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Applied brands: {generatedGraph.brandFilters.join(', ')}
                        {generatedGraph.missingBrands?.length > 0 ? ` | No data for: ${generatedGraph.missingBrands.join(', ')}` : ''}
                      </p>
                    )}
                {generatedGraph.qualityNotes?.length > 0 && (
                  <div className="mb-2 rounded-md border border-blue-200 bg-blue-50 p-2">
                    {generatedGraph.qualityNotes.map((note, index) => (
                      <p key={`${note}-${index}`} className="text-xs text-blue-900">
                        {note}
                      </p>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-500 mb-2">
                  Click a brand bar/slice to compare models within that brand.
                </p>
                {generatedGraph.data.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No graph points match this filter combination.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={generatedGraphHeight}>
                    {generatedGraph.type === 'pie' ? (
                      <PieChart>
                        <Pie
                          data={generatedGraph.data}
                          dataKey={generatedGraph.metric}
                          nameKey="label"
                          outerRadius={100}
                          labelLine={false}
                          label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                          onClick={handleGraphPointSelect}
                        >
                          {generatedGraph.data.map((entry, index) => (
                            <Cell key={`cell-${entry.label}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                            <Tooltip
                              formatter={(value, _name, item) => [
                                formatGraphMetricValue(generatedGraph.metric, value),
                                generatedGraph.metricLabel
                              ]}
                              labelFormatter={(label, payload) => {
                                const point = payload?.[0]?.payload;
                                const countText = point ? ` | Models: ${point.modelCount}` : '';
                                return `${label}${countText}`;
                              }}
                            />
                            <Legend />
                          </PieChart>
                        ) : (
                          <BarChart data={generatedGraph.data} layout="vertical" margin={{ left: 24, right: 20, top: 8, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              type="number"
                              tickFormatter={(value) =>
                                generatedGraph.metric === 'modelCount'
                                  ? `${Math.round(Number(value || 0))}`
                                  : Number(value || 0).toFixed(GRAPH_METRIC_CONFIG[generatedGraph.metric].decimals)
                              }
                            />
                            <YAxis type="category" dataKey="label" width={160} />
                            <Tooltip
                              formatter={(value) => [formatGraphMetricValue(generatedGraph.metric, value), generatedGraph.metricLabel]}
                              labelFormatter={(label, payload) => {
                                const point = payload?.[0]?.payload;
                                const countText = point ? ` | Models: ${point.modelCount}` : '';
                                return `${label}${countText}`;
                              }}
                            />
                            <Bar
                              dataKey={generatedGraph.metric}
                              fill="#0EA5E9"
                              radius={[0, 6, 6, 0]}
                              onClick={handleGraphPointSelect}
                            />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-200 bg-blue-50/40">
        <CardHeader>
          <CardTitle className="text-lg">Car Comparison</CardTitle>
          <CardDescription>
            Compare two cars interactively by car type, brand, and model.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg border border-blue-100 bg-white p-4 space-y-3">
              <p className="text-sm font-semibold text-blue-900">Car A</p>
              <select
                value={leftCompareType}
                onChange={(event) => {
                  setLeftCompareType(event.target.value);
                  setLeftCompareBrand('all');
                  setLeftCompareCarId('');
                }}
                className="input"
              >
                <option value="all">Car Type: All</option>
                <option value="ICE">Car Type: ICE</option>
                <option value="CNG">Car Type: CNG</option>
                <option value="HEV">Car Type: HEV</option>
                <option value="EV">Car Type: EV</option>
              </select>
              <select
                value={leftCompareBrand}
                onChange={(event) => {
                  setLeftCompareBrand(event.target.value);
                  setLeftCompareCarId('');
                }}
                className="input"
                disabled={leftBrandOptions.length === 0}
              >
                <option value="all">Brand: All</option>
                {leftBrandOptions.map((brand) => (
                  <option key={`left-brand-${brand}`} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              <select
                value={leftCompareCarId}
                onChange={(event) => setLeftCompareCarId(event.target.value)}
                className="input"
                disabled={leftModelOptions.length === 0}
              >
                <option value="">Select Car A</option>
                {leftModelOptions.map((car) => (
                  <option key={`left-model-${car.id}`} value={car.id}>
                    {car.model}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-lg border border-blue-100 bg-white p-4 space-y-3">
              <p className="text-sm font-semibold text-blue-900">Car B</p>
              <select
                value={rightCompareType}
                onChange={(event) => {
                  setRightCompareType(event.target.value);
                  setRightCompareBrand('all');
                  setRightCompareCarId('');
                }}
                className="input"
              >
                <option value="all">Car Type: All</option>
                <option value="ICE">Car Type: ICE</option>
                <option value="CNG">Car Type: CNG</option>
                <option value="HEV">Car Type: HEV</option>
                <option value="EV">Car Type: EV</option>
              </select>
              <select
                value={rightCompareBrand}
                onChange={(event) => {
                  setRightCompareBrand(event.target.value);
                  setRightCompareCarId('');
                }}
                className="input"
                disabled={rightBrandOptions.length === 0}
              >
                <option value="all">Brand: All</option>
                {rightBrandOptions.map((brand) => (
                  <option key={`right-brand-${brand}`} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              <select
                value={rightCompareCarId}
                onChange={(event) => setRightCompareCarId(event.target.value)}
                className="input"
                disabled={rightModelOptions.length === 0}
              >
                <option value="">Select Car B</option>
                {rightModelOptions.map((car) => (
                  <option key={`right-model-${car.id}`} value={car.id}>
                    {car.model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const nextLeftType = rightCompareType;
                const nextLeftBrand = rightCompareBrand;
                const nextLeftCarId = rightCompareCarId;
                setRightCompareType(leftCompareType);
                setRightCompareBrand(leftCompareBrand);
                setRightCompareCarId(leftCompareCarId);
                setLeftCompareType(nextLeftType);
                setLeftCompareBrand(nextLeftBrand);
                setLeftCompareCarId(nextLeftCarId);
              }}
            >
              Swap Cars
            </Button>
          </div>

          {selectedLeftCar && selectedRightCar ? (
            <div className="overflow-auto border border-border rounded-lg bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-3 text-left font-semibold">Specification</th>
                    <th className="p-3 text-left font-semibold">
                      {selectedLeftCar.brand} {selectedLeftCar.model}
                    </th>
                    <th className="p-3 text-left font-semibold">
                      {selectedRightCar.brand} {selectedRightCar.model}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFields.map((field) => (
                    <tr key={`compare-${field.key}`} className="border-t border-border even:bg-slate-50">
                      <td className="p-3 font-medium text-slate-700">{field.label}</td>
                      <td className={`p-3 ${getNumericComparisonClass(field.key, 'left')}`}>
                        {formatCarComparisonValue(selectedLeftCar, field.key)}
                      </td>
                      <td className={`p-3 ${getNumericComparisonClass(field.key, 'right')}`}>
                        {formatCarComparisonValue(selectedRightCar, field.key)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select one model in both Car A and Car B to view side-by-side comparison.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(graphDrilldown)}
        onOpenChange={(open) => {
          if (!open) setGraphDrilldown(null);
        }}
      >
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>
              {graphDrilldown ? `${graphDrilldown.categoryLabel} Model Comparison` : 'Brand Model Comparison'}
            </DialogTitle>
            <DialogDescription>
              {graphDrilldownContextText || 'Model-level comparison for the selected brand and section.'}
            </DialogDescription>
          </DialogHeader>
          {graphDrilldown?.values?.length > 0 ? (
            <ResponsiveContainer width="100%" height={graphDrilldownHeight}>
              <BarChart data={graphDrilldown.values} margin={{ left: 8, right: 20, top: 8, bottom: graphDrilldownBottomMargin }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" angle={-20} textAnchor="end" interval={0} height={graphDrilldownBottomMargin} />
                <YAxis tickFormatter={(value) => Number(value || 0).toLocaleString('en-IN')} />
                <Tooltip
                  formatter={(value, _name, item) => [
                    `${Number(value || 0).toFixed(2)} ${graphDrilldown.unit || ''}`.trim(),
                    graphDrilldown.metricLabel || 'Value'
                  ]}
                  labelFormatter={(label, payload) => {
                    const point = payload?.[0]?.payload;
                    const recordText = point?.records > 1 ? ` | Records: ${point.records}` : '';
                    return `${label}${recordText}`;
                  }}
                />
                <Bar dataKey="value" fill="#0E7490" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">
              {graphDrilldown?.message || 'No brand-level model comparison data available for this selection.'}
            </p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={tableOpen} onOpenChange={setTableOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{selectedType} Market Comparison</DialogTitle>
            <DialogDescription>
              Existing market models and upcoming launches for selected powertrain.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((status) => (
              <Button
                key={status}
                type="button"
                variant={statusFilter === status ? 'default' : 'outline'}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>
          <div className="overflow-auto max-h-[65vh] border border-border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-blue-800 text-white sticky top-0">
                <tr>
                  <th className="p-3 text-left font-semibold">Status</th>
                  <th className="p-3 text-left font-semibold">Launch Date</th>
                  <th className="p-3 text-left font-semibold">Brand</th>
                  <th className="p-3 text-left font-semibold">Model</th>
                  <th className="p-3 text-left font-semibold">Eng Capacity</th>
                  <th className="p-3 text-left font-semibold">Technology</th>
                  <th className="p-3 text-left font-semibold">Power</th>
                  <th className="p-3 text-left font-semibold">Torque</th>
                  {(selectedType === 'HEV' || selectedType === 'EV') && (
                    <>
                      <th className="p-3 text-left font-semibold">Battery</th>
                      <th className="p-3 text-left font-semibold">E-Motor</th>
                      <th className="p-3 text-left font-semibold">Range</th>
                    </>
                  )}
                  <th className="p-3 text-left font-semibold">Mileage</th>
                  <th className="p-3 text-left font-semibold">Source</th>
                </tr>
              </thead>
              <tbody>
                {selectedRows.map((item, index) => (
                  <tr key={`${item.brand}-${item.model}-${item.launchDate}-${index}`} className="border-t border-border even:bg-slate-50">
                    <td className="p-3">{item.launchStatus}</td>
                    <td className="p-3">{item.launchDate}</td>
                    <td className="p-3">{item.brand}</td>
                    <td className="p-3 font-medium">{item.model}</td>
                    <td className="p-3">{item.engineCapacity}</td>
                    <td className="p-3">{item.technology}</td>
                    <td className="p-3">{item.power ? `${item.power} hp` : 'N/A'}</td>
                    <td className="p-3">{item.torque ? `${item.torque} Nm` : 'N/A'}</td>
                    {(selectedType === 'HEV' || selectedType === 'EV') && (
                      <>
                        <td className="p-3">{item.batteryKWh ? `${item.batteryKWh} kWh` : 'N/A'}</td>
                        <td className="p-3">{item.eMotorPower ? `${item.eMotorPower} kW` : 'N/A'}</td>
                        <td className="p-3">{item.range}</td>
                      </>
                    )}
                    <td className="p-3">{item.mileage}</td>
                    <td className="p-3">{item.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketPositioning;

