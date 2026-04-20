import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ENGINE_SYSTEMS,
  TOTAL_RESEARCH_ENTRIES,
  TOTAL_TRACKED_PARTS,
  TREND_LEVERS,
} from '@/data/technologyRoadmapData';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  BookOpen,
  Cog,
  Database,
  ExternalLink,
  FileText,
  Gauge,
  Layers3,
  Wrench,
} from 'lucide-react';
import { useState } from 'react';

const SUMMARY_STATS = [
  { label: 'Engine systems', value: ENGINE_SYSTEMS.length, icon: Layers3 },
  { label: 'Tracked parts', value: TOTAL_TRACKED_PARTS, icon: Cog },
  { label: 'Research papers', value: TOTAL_RESEARCH_ENTRIES, icon: BookOpen },
  { label: 'Trend levers', value: TREND_LEVERS.length, icon: Gauge },
];

const EXPLORER_STEPS = [
  'Click any main engine system to open its tracked parts.',
  'Use the dialog to choose a sub-part and inspect the structured content.',
  'Review the data points, content summary, competitor signals, and classified research papers for that part.',
];

const SURFACE_PANEL_CLASS = 'rounded-[24px] border border-slate-200 bg-white p-5 sm:p-6';
const MUTED_PANEL_CLASS = 'rounded-[24px] border border-slate-200 bg-slate-50/90 p-4 sm:p-5 lg:p-6';
const DETAIL_PANEL_CLASS = 'rounded-[24px] border border-slate-200 bg-slate-50 p-5';

function SummaryCard({ label, value, icon: Icon }) {
  return (
    <div className="h-full rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div className="mt-3 text-2xl font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function BulletList({ items, className, markerClassName = 'bg-primary' }) {
  return (
    <ul className={cn('space-y-3', className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-7 text-slate-600">
          <span className={cn('mt-2 h-1.5 w-1.5 shrink-0 rounded-full', markerClassName)} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SystemHotspotButton({ system, isActive, onFocus, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(system.id)}
      onMouseEnter={() => onFocus(system.id)}
      onFocus={() => onFocus(system.id)}
      className={cn(
        'absolute flex w-[172px] flex-col gap-1 rounded-[20px] border px-4 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 2xl:w-[188px]',
        system.positionClass,
        isActive
          ? 'border-transparent bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]'
          : 'border-slate-200 bg-white/95 text-slate-900 shadow-sm hover:border-slate-300 hover:shadow-md',
      )}
    >
      <span className="text-sm font-semibold leading-5">{system.title}</span>
      <span className={cn('text-xs leading-5', isActive ? 'text-slate-300' : 'text-slate-500')}>
        {system.parts.length} tracked parts
      </span>
    </button>
  );
}

function SystemListButton({ system, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(system.id)}
      className={cn(
        'flex w-full items-start justify-between gap-3 rounded-[22px] border px-4 py-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isActive
          ? 'border-slate-950 bg-slate-950 text-white shadow-sm'
          : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-100',
      )}
    >
      <div className="min-w-0">
        <div className="text-sm font-semibold leading-5">{system.title}</div>
        <div className={cn('mt-1 text-xs leading-5', isActive ? 'text-slate-300' : 'text-slate-500')}>
          {system.parts.length} tracked parts
        </div>
      </div>
      <ArrowRight className={cn('mt-1 h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
    </button>
  );
}

function PartButton({ part, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-[22px] border px-4 py-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isActive
          ? 'border-slate-950 bg-slate-950 text-white shadow-lg'
          : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-100',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="text-sm font-semibold leading-5">{part.title}</div>
          <div className={cn('text-sm leading-6', isActive ? 'text-slate-300' : 'text-slate-600')}>
            {part.description}
          </div>
        </div>
        <ArrowRight className={cn('mt-1 h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {part.levers.map((lever) => (
          <span
            key={lever}
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-medium',
              isActive ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700',
            )}
          >
            {lever}
          </span>
        ))}
      </div>
    </button>
  );
}

function PartInsightCard({ icon: Icon, title, children, className }) {
  return (
    <div className={cn(DETAIL_PANEL_CLASS, className)}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">{title}</h4>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function ResearchPaperList({ entries = [], totalMatches = 0 }) {
  if (!entries.length) {
    return (
      <div className="rounded-[18px] border border-dashed border-slate-300 bg-white p-4">
        <p className="text-sm leading-7 text-slate-600">
          No directly matched research entry was classified for this part yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[18px] border border-primary/15 bg-white p-4">
        <p className="text-sm font-medium leading-7 text-slate-700">
          Classified from <span className="font-semibold">technology_radar_data.json</span> using
          topic, keyword, and lever alignment. Showing top {entries.length} of {totalMatches} matched
          studies.
        </p>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-[18px] border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h5 className="text-sm font-semibold leading-6 text-slate-900">{entry.title}</h5>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                    {entry.researchTopic}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                    {entry.researchLever}
                  </span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                    Impact {entry.impactScore}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                    {entry.year || 'Year n/a'}
                  </span>
                </div>
              </div>

              {entry.url ? (
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Open
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-600">{entry.excerpt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EngineIllustration({ accent }) {
  return (
    <svg
      viewBox="0 0 420 360"
      className="h-full w-full drop-shadow-[0_34px_50px_rgba(15,23,42,0.22)]"
      role="img"
      aria-label="Stylized engine illustration"
    >
      <defs>
        <linearGradient id="engine-metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="50%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
        <linearGradient id="engine-dark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <radialGradient id="engine-glow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="210" cy="180" r="148" fill="url(#engine-glow)" />

      <g>
        <rect x="132" y="82" width="158" height="165" rx="40" fill="url(#engine-metal)" />
        <rect x="91" y="118" width="70" height="138" rx="22" fill="url(#engine-dark)" />
        <rect x="270" y="106" width="68" height="118" rx="22" fill="url(#engine-dark)" />
        <rect x="124" y="78" width="58" height="32" rx="16" fill="url(#engine-dark)" />
        <rect x="186" y="60" width="56" height="40" rx="18" fill="url(#engine-dark)" />
        <rect x="246" y="72" width="52" height="34" rx="16" fill="url(#engine-dark)" />
        <rect x="150" y="134" width="122" height="22" rx="11" fill="#94A3B8" />
        <rect x="145" y="168" width="132" height="24" rx="12" fill="#CBD5E1" />
        <rect x="147" y="204" width="116" height="22" rx="11" fill="#94A3B8" />
        <rect x="116" y="247" width="84" height="50" rx="18" fill="url(#engine-dark)" />
        <circle cx="299" cy="258" r="58" fill="#E2E8F0" />
        <circle cx="299" cy="258" r="42" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="16" />
        <circle cx="299" cy="258" r="16" fill={accent} />
        <circle cx="129" cy="113" r="12" fill="#F59E0B" />
        <rect x="307" y="97" width="28" height="36" rx="10" fill="#111827" />
        <rect x="314" y="90" width="42" height="22" rx="10" fill="#1E293B" />
        <rect x="168" y="262" width="56" height="28" rx="14" fill="#0F172A" />
        <rect x="228" y="227" width="42" height="54" rx="18" fill="#1E293B" />
      </g>

      <g fill="none" stroke={accent} strokeLinecap="round" strokeWidth="6">
        <path d="M118 113 L86 98" />
        <path d="M222 68 L222 34" />
        <path d="M328 106 L362 90" />
        <path d="M301 214 L344 210" />
        <path d="M185 287 L146 320" />
      </g>

      <g fill={accent}>
        <circle cx="86" cy="98" r="7" />
        <circle cx="222" cy="34" r="7" />
        <circle cx="362" cy="90" r="7" />
        <circle cx="344" cy="210" r="7" />
        <circle cx="146" cy="320" r="7" />
      </g>
    </svg>
  );
}

const TechnologyRoadmap = () => {
  const [activeSystemId, setActiveSystemId] = useState(ENGINE_SYSTEMS[0].id);
  const [activePartId, setActivePartId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const selectedSystem =
    ENGINE_SYSTEMS.find((system) => system.id === activeSystemId) ?? ENGINE_SYSTEMS[0];
  const selectedPart =
    selectedSystem.parts.find((part) => part.id === activePartId) ?? null;

  const handleSystemFocus = (systemId) => {
    setActiveSystemId(systemId);
    setActivePartId(null);
  };

  const handleSystemOpen = (systemId) => {
    handleSystemFocus(systemId);
    setDialogOpen(true);
  };

  const handleDialogChange = (open) => {
    setDialogOpen(open);
    if (!open) {
      setActivePartId(null);
    }
  };

  return (
    <div className="space-y-8" data-testid="roadmap-page">
      <section className="space-y-4">
        <Badge className="w-fit rounded-full bg-primary/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
          Dashboard 4
        </Badge>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] xl:items-end">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-foreground">Technology Roadmap</h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              AI-enabled product and competitor intelligence dashboard for engine systems, sub-parts,
              and technology levers.
            </p>
          </div>

          <p className="max-w-2xl text-sm leading-7 text-slate-600 xl:justify-self-end">
            Click a major engine system, open its parts list, and then inspect the detailed content for
            each sub-part without changing the existing dashboard style.
          </p>
        </div>
      </section>

      <Card className="relative overflow-hidden border-slate-200/80 bg-white">
        <div className="pointer-events-none absolute left-8 top-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-12 top-16 h-40 w-40 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-8 left-1/3 h-40 w-40 rounded-full bg-cyan-100/40 blur-3xl" />

        <CardHeader className="relative space-y-4 pb-0">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl text-slate-950">Engine Systems Explorer</CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-7">
                The central engine is the entry point. Each system opens a focused list of sub-parts, and
                each sub-part reveals the data, content, and signals you want to track.
              </CardDescription>
            </div>

            <Badge className="w-fit rounded-full bg-slate-950 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
              Progressive drill-down
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6 pt-6 sm:space-y-7">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {SUMMARY_STATS.map((stat) => (
              <SummaryCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className={cn(MUTED_PANEL_CLASS, 'overflow-hidden')}>
            <div className="hidden xl:block">
              <div className="relative h-[620px] overflow-hidden rounded-[22px] bg-white/70">
                <div className="pointer-events-none absolute inset-x-1/4 top-1/2 h-44 -translate-y-1/2 rounded-full bg-white/90 blur-2xl" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-slate-300/70" />

                {ENGINE_SYSTEMS.map((system) => (
                  <SystemHotspotButton
                    key={system.id}
                    system={system}
                    isActive={selectedSystem.id === system.id}
                    onFocus={handleSystemFocus}
                    onOpen={handleSystemOpen}
                  />
                ))}

                <div className="absolute left-1/2 top-1/2 flex h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 items-center justify-center 2xl:h-[360px] 2xl:w-[360px]">
                  <EngineIllustration accent={selectedSystem.accent} />
                </div>
              </div>
            </div>

            <div className="hidden md:grid md:grid-cols-[minmax(260px,300px)_minmax(0,1fr)] md:items-center md:gap-6 xl:hidden">
              <div className="mx-auto flex h-[280px] w-full max-w-[280px] items-center justify-center">
                <EngineIllustration accent={selectedSystem.accent} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {ENGINE_SYSTEMS.map((system) => (
                  <SystemListButton
                    key={system.id}
                    system={system}
                    isActive={selectedSystem.id === system.id}
                    onClick={handleSystemOpen}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-5 md:hidden">
              <div className="mx-auto flex h-[260px] w-[260px] items-center justify-center">
                <EngineIllustration accent={selectedSystem.accent} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {ENGINE_SYSTEMS.map((system) => (
                  <SystemListButton
                    key={system.id}
                    system={system}
                    isActive={selectedSystem.id === system.id}
                    onClick={handleSystemOpen}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className={SURFACE_PANEL_CLASS}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: selectedSystem.accent }}
                    />
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Selected system
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-slate-950">{selectedSystem.title}</h3>
                    <p className="max-w-3xl text-sm leading-7 text-slate-600">{selectedSystem.summary}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full justify-center rounded-full border-slate-300 bg-transparent sm:w-auto"
                  onClick={() => handleSystemOpen(selectedSystem.id)}
                >
                  Open Parts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5">
                {selectedSystem.parts.map((part) => (
                  <Badge
                    key={part.id}
                    variant="outline"
                    className="rounded-full border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
                  >
                    {part.title}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-950 bg-slate-950 p-5 text-white sm:p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Interaction flow
                  </p>
                  <h3 className="text-lg font-semibold text-white">Structured drill-down</h3>
                </div>

                <ol className="space-y-3">
                  {EXPLORER_STEPS.map((step, index) => (
                    <li key={step} className="flex items-start gap-3 text-sm leading-7 text-slate-200">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="w-[96vw] max-w-6xl overflow-hidden border-slate-200 p-0">
          <div className="max-h-[90vh] overflow-y-auto lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 p-5 sm:p-6 lg:max-h-[90vh] lg:overflow-y-auto lg:border-b-0 lg:border-r">
              <DialogHeader className="text-left">
                <div
                  className="inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
                  style={{
                    backgroundColor: `${selectedSystem.accent}1A`,
                    color: selectedSystem.accent,
                  }}
                >
                  System explorer
                </div>
                <DialogTitle className="text-2xl text-slate-950">{selectedSystem.title}</DialogTitle>
                <DialogDescription className="text-sm leading-7 text-slate-600">
                  {selectedSystem.summary}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-3">
                {selectedSystem.parts.map((part) => (
                  <PartButton
                    key={part.id}
                    part={part}
                    isActive={part.id === activePartId}
                    onClick={() => setActivePartId(part.id)}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 lg:max-h-[90vh] lg:overflow-y-auto">
              {selectedPart ? (
                <div className="space-y-6">
                  <div className="border-b border-slate-200 pb-6">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                          Part intelligence
                        </p>
                        <h3 className="text-2xl font-semibold text-slate-950">{selectedPart.title}</h3>
                        <p className="max-w-3xl text-sm leading-7 text-slate-600">
                          {selectedPart.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {selectedPart.levers.map((lever) => (
                          <Badge key={lever} className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                            {lever}
                          </Badge>
                        ))}
                        <Badge className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                          Research {selectedPart.researchMatchCount || 0}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <PartInsightCard icon={Database} title="Data and sources">
                      <BulletList items={selectedPart.dataPoints} />
                    </PartInsightCard>

                    <PartInsightCard icon={FileText} title="Content to surface">
                      <BulletList items={selectedPart.contentHighlights} />
                    </PartInsightCard>

                    <PartInsightCard icon={Wrench} title="Competitor signals">
                      <BulletList items={selectedPart.competitiveSignals} />
                    </PartInsightCard>

                    <PartInsightCard icon={BookOpen} title="Research papers and journals">
                      <ResearchPaperList
                        entries={selectedPart.researchEntries}
                        totalMatches={selectedPart.researchMatchCount}
                      />
                    </PartInsightCard>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[420px] items-center justify-center">
                  <div className="max-w-md rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <Database className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-slate-950">Choose a sub-part</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      The first click opens the system. The next click selects a part and reveals its
                      data points, summary content, and competitor intelligence prompts.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TechnologyRoadmap;
