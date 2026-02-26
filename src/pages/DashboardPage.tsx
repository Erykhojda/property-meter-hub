import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataQualityBadge } from "@/components/DataQualityBadge";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";
import {
  Droplets, Flame, Zap, TrendingUp, TrendingDown, Eye,
  Building2, AlertTriangle, Battery, Cpu, Cable,
  ArrowUpDown, ChevronUp, ChevronDown, FileDown,
} from "lucide-react";
import {
  buildingConsumption, apartmentConsumption,
  generateReadings, generateUnitReadings, generateMonthlyReadings,
  mierniki, lokale, type DataQuality,
} from "@/data/mock-data";
import { useManagerScope } from "@/data/store";
import { cn } from "@/lib/utils";
import { buildConsumptionCsvRows, downloadCsv } from "@/lib/exportUtils";

// ── Chart config ────────────────────────────────────────────────────────────

const chartConfig = {
  woda: { label: "Woda (m³)", color: "hsl(200, 80%, 50%)" },
  cieplo: { label: "Ciepło (kWh)", color: "hsl(15, 90%, 55%)" },
  energia: { label: "Energia (kWh)", color: "hsl(48, 95%, 50%)" },
};

type MediaKey = "woda" | "cieplo" | "energia";

const mediaCards: { key: MediaKey; label: string; unit: string; icon: React.ElementType; color: string; gradient: string }[] = [
  { key: "woda", label: "Woda", unit: "m³", icon: Droplets, color: "text-sky-500", gradient: "from-sky-500/20 to-sky-500/0" },
  { key: "cieplo", label: "Ciepło", unit: "kWh", icon: Flame, color: "text-orange-500", gradient: "from-orange-500/20 to-orange-500/0" },
  { key: "energia", label: "Energia", unit: "kWh", icon: Zap, color: "text-yellow-500", gradient: "from-yellow-500/20 to-yellow-500/0" },
];

type SortKey = "numer" | "pietro" | "woda" | "cieplo" | "energia";
type SortDir = "asc" | "desc";

// ── Alarm helpers ────────────────────────────────────────────────────────────

function getLokalAlarms(lokalId: string) {
  const lokalMierniki = mierniki.filter((m) => m.lokal_id === lokalId);
  const flags: string[] = [];
  lokalMierniki.forEach((m) => {
    if (m.alarmDevice) flags.push("Awaria urządzenia");
    if (m.alarmBattery) flags.push("Niski poziom baterii");
    if (m.alarmDamagedCable) flags.push("Uszkodzony przewód");
    if (m.alarmOverflow) flags.push("Przekroczenie Qmax");
    if (m.alarmReverseInstallation) flags.push("Odwrotna instalacja");
  });
  return [...new Set(flags)];
}

function getMiernikAlarmCount(m: typeof mierniki[number]) {
  return [m.alarmDevice, m.alarmBattery, m.alarmDamagedCable, m.alarmOverflow, m.alarmReverseInstallation]
    .filter(Boolean).length;
}

// ── Quality SegmentedBar ─────────────────────────────────────────────────────

function QualityBar({ validated, estimated, missing }: { validated: number; estimated: number; missing: number }) {
  return (
    <div className="flex gap-4 flex-wrap">
      <div className="flex items-center gap-2 text-sm">
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <span className="text-muted-foreground">Zweryfikowane</span>
        <span className="font-semibold">{validated}%</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
        <span className="text-muted-foreground">Oszacowane</span>
        <span className="font-semibold">{estimated}%</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
        <span className="text-muted-foreground">Brak</span>
        <span className="font-semibold">{missing}%</span>
      </div>
      <div className="w-full flex h-2 rounded-full overflow-hidden gap-px mt-1">
        <div className="bg-emerald-500 rounded-l-full transition-all" style={{ width: `${validated}%` }} />
        <div className="bg-amber-500 transition-all" style={{ width: `${estimated}%` }} />
        <div className="bg-rose-500 rounded-r-full transition-all" style={{ width: `${missing}%` }} />
      </div>
    </div>
  );
}

// ── Trend badge ───────────────────────────────────────────────────────────────

function TrendBadge({ value }: { value: number }) {
  const positive = value <= 0; // lower consumption is good
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 text-xs font-medium",
      positive ? "text-emerald-500" : "text-rose-500"
    )}>
      {positive ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
      {Math.abs(value)}%
    </span>
  );
}

// ── Sort header cell ──────────────────────────────────────────────────────────

function SortHead({ label, sortKey, current, dir, onSort }: {
  label: string; sortKey: SortKey;
  current: SortKey; dir: SortDir; onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <TableHead
      className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {active ? (
          dir === "asc" ? <ChevronUp className="h-3 w-3 text-primary" /> : <ChevronDown className="h-3 w-3 text-primary" />
        ) : (
          <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />
        )}
      </div>
    </TableHead>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const RANGE_OPTIONS = [
  { value: "7", label: "7 dni" },
  { value: "30", label: "30 dni" },
  { value: "90", label: "90 dni" },
  { value: "365", label: "12 miesięcy" },
];

const PAGE_SIZE = 8;

export default function DashboardPage() {
  const { myBudynki } = useManagerScope();
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [dateRange, setDateRange] = useState("30");
  const [detailLokal, setDetailLokal] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("numer");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);
  const [showAlarmOnly, setShowAlarmOnly] = useState(false);
  const [showCsvDialog, setShowCsvDialog] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const [csvDateFrom, setCsvDateFrom] = useState(thirtyDaysAgo);
  const [csvDateTo, setCsvDateTo] = useState(today);

  const activeBuildingId = selectedBuilding || myBudynki[0]?.id || "";
  const building = buildingConsumption.find((b) => b.budynek_id === activeBuildingId);

  // Chart data
  const dailyData = useMemo(() => generateReadings(Number(dateRange)), [dateRange]);
  const monthlyData = useMemo(() => generateMonthlyReadings(), []);
  const isMonthly = dateRange === "365";
  const chartData = isMonthly ? monthlyData : dailyData;
  const xKey = isMonthly ? "month" : "date";

  // Lokale table
  const apartments = apartmentConsumption.filter((a) => a.budynek_id === activeBuildingId);

  const sortedApartments = useMemo(() => {
    let list = [...apartments];
    if (showAlarmOnly) {
      list = list.filter((a) => getLokalAlarms(a.lokal_id).length > 0);
    }
    list.sort((a, b) => {
      let av: number | string = a[sortKey as keyof typeof a] as any;
      let bv: number | string = b[sortKey as keyof typeof b] as any;
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return list;
  }, [apartments, sortKey, sortDir, showAlarmOnly]);

  const totalPages = Math.ceil(sortedApartments.length / PAGE_SIZE);
  const pagedApartments = sortedApartments.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
    setPage(0);
  };

  // Detail modal data
  const detailLok = detailLokal ? lokale.find((l) => l.id === detailLokal) : null;
  const unitReadings = useMemo(
    () => detailLokal ? generateUnitReadings(detailLokal, 30) : [],
    [detailLokal]
  );
  const unitMierniki = detailLokal ? mierniki.filter((m) => m.lokal_id === detailLokal) : [];
  const unitChartData = useMemo(() => {
    if (!detailLokal) return [];
    const byDate: Record<string, { date: string; woda: number; cieplo: number; energia: number }> = {};
    unitReadings.forEach((r) => {
      if (!byDate[r.date]) byDate[r.date] = { date: r.date, woda: 0, cieplo: 0, energia: 0 };
      byDate[r.date][r.typ] += r.wartosc;
    });
    return Object.values(byDate);
  }, [unitReadings, detailLokal]);

  // Building-wide alarm count
  const buildingAlarmsCount = useMemo(() => {
    const lokalIds = new Set(apartments.map((a) => a.lokal_id));
    return mierniki.filter((m) => lokalIds.has(m.lokal_id))
      .reduce((acc, m) => acc + getMiernikAlarmCount(m), 0);
  }, [apartments]);

  // EPC-05: CSV export handler
  const handleCsvExport = () => {
    if (!csvDateFrom || !csvDateTo || csvDateFrom > csvDateTo) {
      return;
    }
    const aptRows = apartments.map((a) => ({ lokal_id: a.lokal_id, numer: a.numer }));
    const rows = buildConsumptionCsvRows(
      aptRows,
      mierniki,
      generateUnitReadings,
      csvDateFrom,
      csvDateTo
    );
    const buildingName = myBudynki.find((b) => b.id === activeBuildingId)?.nazwa ?? "budynek";
    const safeName = buildingName.toLowerCase().replace(/\s+/g, "-");
    downloadCsv(rows, `zuzucie_${safeName}_${csvDateFrom}_${csvDateTo}.csv`);
    setShowCsvDialog(false);
  };

  if (myBudynki.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h2 className="text-lg font-semibold">Brak przypisanych budynków</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Nie masz przypisanych żadnych budynków. Skontaktuj się z administratorem.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Przegląd zużycia mediów</p>
        </div>
        <div className="flex gap-2">
          <Select value={activeBuildingId} onValueChange={(v) => { setSelectedBuilding(v); setPage(0); }}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {myBudynki.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.nazwa}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setShowCsvDialog(true)}>
            <FileDown className="mr-2 h-4 w-4" />
            Eksportuj CSV
          </Button>
        </div>
      </div>

      {/* ── Alarm banner ── */}
      {buildingAlarmsCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <span className="font-semibold">{buildingAlarmsCount} aktywnych alarmów</span> w tym budynku — sprawdź urządzenia.
          </p>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {mediaCards.map((m) => (
          <Card key={m.key} className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} pointer-events-none`} />
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{m.label}</span>
              <m.icon className={`h-4 w-4 ${m.color}`} />
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="text-3xl font-bold tabular-nums">
                {building?.[m.key] ?? "—"}
                <span className="text-base font-normal text-muted-foreground ml-1">{m.unit}</span>
              </div>
              {building?.vs_prev?.[m.key] !== undefined && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TrendBadge value={building.vs_prev[m.key]} />
                  <span>vs poprzedni okres</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Quality + Chart ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Quality bar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Jakość danych</CardTitle>
          </CardHeader>
          <CardContent>
            {building && (
              <QualityBar
                validated={building.quality_ratio.validated}
                estimated={building.quality_ratio.estimated}
                missing={building.quality_ratio.missing}
              />
            )}
            <p className="text-xs text-muted-foreground mt-4">
              Ostatnia synchronizacja z Bmeters: <span className="font-medium">dziś, 03:00</span>
            </p>
          </CardContent>
        </Card>

        {/* Area chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Trend zużycia</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="gradWoda" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(200,80%,50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(200,80%,50%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradCieplo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(15,90%,55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(15,90%,55%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradEnergia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(48,95%,50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(48,95%,50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis
                  dataKey={xKey}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => isMonthly ? v : v.slice(5)}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area type="monotone" dataKey="woda" stroke="hsl(200,80%,50%)" fill="url(#gradWoda)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="cieplo" stroke="hsl(15,90%,55%)" fill="url(#gradCieplo)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="energia" stroke="hsl(48,95%,50%)" fill="url(#gradEnergia)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Lokale table ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-sm font-semibold">
              Lokale — {myBudynki.find((b) => b.id === activeBuildingId)?.nazwa}
            </CardTitle>
            <div className="flex items-center gap-2">
              {buildingAlarmsCount > 0 && (
                <Button
                  variant={showAlarmOnly ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => { setShowAlarmOnly((v) => !v); setPage(0); }}
                >
                  <AlertTriangle className="h-3 w-3" />
                  {showAlarmOnly ? "Pokaż wszystkie" : "Tylko alarmy"}
                </Button>
              )}
              <span className="text-xs text-muted-foreground">
                {sortedApartments.length} lokali
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHead label="Lokal" sortKey="numer" current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortHead label="Piętro" sortKey="pietro" current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortHead label="Woda" sortKey="woda" current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortHead label="Ciepło" sortKey="cieplo" current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortHead label="Energia" sortKey="energia" current={sortKey} dir={sortDir} onSort={handleSort} />
                <TableHead>Alarmy</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedApartments.map((a) => {
                const alarms = getLokalAlarms(a.lokal_id);
                return (
                  <TableRow key={a.lokal_id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{a.numer}</TableCell>
                    <TableCell className="text-muted-foreground">{a.pietro === 0 ? "Parter" : `P${a.pietro}`}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="tabular-nums">{a.woda}</span>
                        <DataQualityBadge quality={a.woda_quality} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="tabular-nums">{a.cieplo}</span>
                        <DataQualityBadge quality={a.cieplo_quality} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="tabular-nums">{a.energia}</span>
                        <DataQualityBadge quality={a.energia_quality} />
                      </div>
                    </TableCell>
                    <TableCell>
                      {alarms.length > 0 ? (
                        <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 text-xs">
                          <AlertTriangle className="h-3 w-3" />
                          {alarms.length}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setDetailLokal(a.lokal_id)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {pagedApartments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    {showAlarmOnly ? "Brak lokali z alarmami" : "Brak lokali w tym budynku"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-xs text-muted-foreground">
                Strona {page + 1} z {totalPages}
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Poprzednia
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                  Następna
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Unit detail dialog ── */}
      <Dialog open={!!detailLokal} onOpenChange={(v) => !v && setDetailLokal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Lokal {detailLok?.numer}
              {getLokalAlarms(detailLokal ?? "").length > 0 && (
                <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {getLokalAlarms(detailLokal ?? "").length} alarm{getLokalAlarms(detailLokal ?? "").length > 1 ? "y" : ""}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Mierniki z alarmami */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mierniki</p>
              <div className="space-y-2">
                {unitMierniki.map((m) => {
                  const alarmCount = getMiernikAlarmCount(m);
                  return (
                    <div key={m.id} className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2.5 gap-3",
                      alarmCount > 0 && "border-amber-500/30 bg-amber-500/5"
                    )}>
                      <div className="flex items-center gap-2 min-w-0">
                        {m.typ === "woda" ? <Droplets className="h-4 w-4 text-sky-500 shrink-0" /> :
                          m.typ === "cieplo" ? <Flame className="h-4 w-4 text-orange-500 shrink-0" /> :
                            <Zap className="h-4 w-4 text-yellow-500 shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{m.nazwa}</p>
                          <p className="text-xs text-muted-foreground font-mono">{m.device_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {m.alarmBattery && (
                          <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 text-xs">
                            <Battery className="h-3 w-3" />Bateria
                          </Badge>
                        )}
                        {m.alarmDevice && (
                          <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 gap-1 text-xs">
                            <Cpu className="h-3 w-3" />Awaria
                          </Badge>
                        )}
                        {m.alarmDamagedCable && (
                          <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 gap-1 text-xs">
                            <Cable className="h-3 w-3" />Przewód
                          </Badge>
                        )}
                        <Badge variant={m.status === "active" ? "outline" : "secondary"} className={cn(
                          "text-xs",
                          m.status === "active" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        )}>
                          {m.status === "active" ? "Aktywny" : "Nieaktywny"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mini chart */}
            {unitChartData.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Zużycie — ostatnie 30 dni</p>
                <ChartContainer config={chartConfig} className="h-[180px] w-full">
                  <AreaChart data={unitChartData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                    <defs>
                      <linearGradient id="ugW" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(200,80%,50%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(200,80%,50%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ugC" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(15,90%,55%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(15,90%,55%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ugE" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(48,95%,50%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(48,95%,50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => v.slice(5)} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="woda" stroke="hsl(200,80%,50%)" fill="url(#ugW)" strokeWidth={1.5} dot={false} />
                    <Area type="monotone" dataKey="cieplo" stroke="hsl(15,90%,55%)" fill="url(#ugC)" strokeWidth={1.5} dot={false} />
                    <Area type="monotone" dataKey="energia" stroke="hsl(48,95%,50%)" fill="url(#ugE)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ChartContainer>
              </div>
            )}

            {/* Readings table */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ostatnie odczyty</p>
              <div className="max-h-[160px] overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Data</TableHead>
                      <TableHead className="text-xs">Typ</TableHead>
                      <TableHead className="text-xs text-right">Wartość</TableHead>
                      <TableHead className="text-xs">Jedn.</TableHead>
                      <TableHead className="text-xs">Jakość</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unitReadings.slice(-15).reverse().map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs">{r.date}</TableCell>
                        <TableCell className="text-xs capitalize">{r.typ}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{r.wartosc}</TableCell>
                        <TableCell className="text-xs">{r.jednostka}</TableCell>
                        <TableCell><DataQualityBadge quality={r.jakosc} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── EPC-05: CSV Export Dialog ── */}
      <Dialog open={showCsvDialog} onOpenChange={setShowCsvDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5 text-primary" />
              Eksportuj dane do CSV
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Pobierz odczyty zużycia mediów dla wszystkich lokali w budynku
            <span className="font-medium text-foreground"> {myBudynki.find((b) => b.id === activeBuildingId)?.nazwa}</span>.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="csv-date-from">Data od</Label>
              <Input
                id="csv-date-from"
                type="date"
                value={csvDateFrom}
                onChange={(e) => setCsvDateFrom(e.target.value)}
                max={csvDateTo}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="csv-date-to">Data do</Label>
              <Input
                id="csv-date-to"
                type="date"
                value={csvDateTo}
                onChange={(e) => setCsvDateTo(e.target.value)}
                min={csvDateFrom}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Kolumny: Nr lokalu, Nr seryjny miernika, Poprzedni odczyt, Aktualny odczyt, Zużycie łącznie, Status jakości.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCsvDialog(false)}>Anuluj</Button>
            <Button
              onClick={handleCsvExport}
              disabled={!csvDateFrom || !csvDateTo || csvDateFrom > csvDateTo}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Pobierz CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
