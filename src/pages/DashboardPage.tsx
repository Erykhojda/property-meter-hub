import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataQualityBadge } from "@/components/DataQualityBadge";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Droplets, Flame, Zap, TrendingUp, TrendingDown, Eye,
  Building2, AlertTriangle, ArrowUpDown, ChevronUp, ChevronDown, FileDown, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getBmetersReadings } from "@/lib/bmetersApi";
import { toast } from "sonner";
import { downloadCsv } from "@/lib/exportUtils";

// ── Chart config ──
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

type SortKey = "numer" | "woda" | "cieplo" | "energia";
type SortDir = "asc" | "desc";

function QualityBar({ validated, estimated, missing }: { validated: number; estimated: number; missing: number }) {
  const total = validated + estimated + missing || 1;
  const pv = Math.round((validated / total) * 100);
  const pe = Math.round((estimated / total) * 100);
  const pm = Math.round((missing / total) * 100);

  return (
    <div className="flex gap-4 flex-wrap">
      <div className="flex items-center gap-2 text-sm">
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <span className="text-muted-foreground">Zweryfikowane</span>
        <span className="font-semibold">{pv}%</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
        <span className="text-muted-foreground">Oszacowane</span>
        <span className="font-semibold">{pe}%</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
        <span className="text-muted-foreground">Brak</span>
        <span className="font-semibold">{pm}%</span>
      </div>
      <div className="w-full flex h-2 rounded-full overflow-hidden gap-px mt-1">
        <div className="bg-emerald-500 transition-all" style={{ width: `${pv}%` }} />
        <div className="bg-amber-500 transition-all" style={{ width: `${pe}%` }} />
        <div className="bg-rose-500 transition-all" style={{ width: `${pm}%` }} />
      </div>
    </div>
  );
}

function SortHead({ label, sortKey, current, dir, onSort }: {
  label: string; sortKey: SortKey; current: SortKey; dir: SortDir; onSort: (k: SortKey) => void;
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

const PAGE_SIZE = 8;

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState("30");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [detailLokal, setDetailLokal] = useState<string | null>(null);
  
  const [sortKey, setSortKey] = useState<SortKey>("numer");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);

  // Raw fetched data
  const [isLoading, setIsLoading] = useState(false);
  const [allReadings, setAllReadings] = useState<{ water: any[], heat: any[], allocator: any[] }>({ water: [], heat: [], allocator: [] });

  // 1. Fetch data from backend on mount or range change
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const from = new Date();
        from.setDate(from.getDate() - Number(dateRange));
        const fromStr = from.toISOString().split("T")[0];

        const [wReq, hReq, aReq] = await Promise.all([
          getBmetersReadings("water", { from: fromStr, limit: 5000 }),
          getBmetersReadings("heat", { from: fromStr, limit: 5000 }),
          getBmetersReadings("allocator", { from: fromStr, limit: 5000 })
        ]);

        if (isMounted) {
          setAllReadings({ water: wReq, heat: hReq, allocator: aReq });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        if (isMounted) toast.error("Błąd podczas pobierania danych z API");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [dateRange]);

  // 2. Extract unique buildings
  const buildings = useMemo(() => {
    const bSet = new Set<string>();
    [...allReadings.water, ...allReadings.heat, ...allReadings.allocator].forEach(r => {
      if (r.street_and_staircase) bSet.add(r.street_and_staircase);
    });
    const bList = Array.from(bSet).sort();
    
    // Auto-select first building if none selected
    if (bList.length > 0 && !bList.includes(selectedBuilding)) {
      setSelectedBuilding(bList[0]);
    }
    return bList;
  }, [allReadings, selectedBuilding]);

  // 3. Filter readings for active building
  const activeReadings = useMemo(() => {
    if (!selectedBuilding) return { water: [], heat: [], allocator: [] };
    return {
      water: allReadings.water.filter(r => r.street_and_staircase === selectedBuilding),
      heat: allReadings.heat.filter(r => r.street_and_staircase === selectedBuilding),
      allocator: allReadings.allocator.filter(r => r.street_and_staircase === selectedBuilding)
    };
  }, [allReadings, selectedBuilding]);

  // 4. Aggregate KPIs
  const buildingKPIs = useMemo(() => {
    let w = 0, h = 0, e = 0;
    let valid = 0, est = 0, miss = 0;

    activeReadings.water.forEach(r => { 
      w += (r.value || 0); 
      r.data_quality === "good" ? valid++ : est++; 
    });
    activeReadings.heat.forEach(r => { 
      h += (r.heat_energy || 0); 
      r.data_quality === "good" ? valid++ : est++; 
    });
    activeReadings.allocator.forEach(r => { 
      e += (r.actual_consumption || 0); 
      r.data_quality === "good" ? valid++ : est++; 
    });

    return { woda: w.toFixed(1), cieplo: h.toFixed(1), energia: e.toFixed(1), quality: { validated: valid, estimated: est, missing: miss } };
  }, [activeReadings]);

  // 5. Chart Data
  const chartData = useMemo(() => {
    const byDate: Record<string, any> = {};
    const add = (arr: any[], valKey: string, type: string) => {
      arr.forEach(r => {
        if (!r.timestamp) return;
        const d = r.timestamp.split("T")[0];
        if (!byDate[d]) byDate[d] = { date: d, woda: 0, cieplo: 0, energia: 0 };
        byDate[d][type] += (r[valKey] || 0);
      });
    };
    add(activeReadings.water, "value", "woda");
    add(activeReadings.heat, "heat_energy", "cieplo");
    add(activeReadings.allocator, "actual_consumption", "energia");
    
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [activeReadings]);

  // 6. Apartments Data
  const apartments = useMemo(() => {
    const apts: Record<string, any> = {};
    const add = (arr: any[], valKey: string, type: string) => {
      arr.forEach(r => {
        const flat = r.flat_number || "Nieznany";
        if (!apts[flat]) apts[flat] = { numer: flat, woda: 0, cieplo: 0, energia: 0, woda_q: "validated", cieplo_q: "validated", energia_q: "validated", raw: [] };
        apts[flat][type] += (r[valKey] || 0);
        if (r.data_quality !== "good") apts[flat][`${type}_q`] = "estimated";
        apts[flat].raw.push({ typ: type, dr: r });
      });
    };
    add(activeReadings.water, "value", "woda");
    add(activeReadings.heat, "heat_energy", "cieplo");
    add(activeReadings.allocator, "actual_consumption", "energia");
    
    return Object.values(apts).map(a => ({
      ...a, 
      woda: a.woda.toFixed(2), 
      cieplo: a.cieplo.toFixed(2), 
      energia: a.energia.toFixed(2)
    }));
  }, [activeReadings]);

  // Sort and Paginate
  const sortedApartments = useMemo(() => {
    return [...apartments].sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (sortKey === "numer") {
        return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      }
      return sortDir === "asc" ? Number(av) - Number(bv) : Number(bv) - Number(av);
    });
  }, [apartments, sortKey, sortDir]);

  const totalPages = Math.ceil(sortedApartments.length / PAGE_SIZE);
  const pagedApartments = sortedApartments.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
    setPage(0);
  };

  // CSV
  const handleCsvExport = () => {
    if (apartments.length === 0) {
      toast.error("Brak danych do eksportu");
      return;
    }
    const lines = ["Lokal,Woda (m3),Ciepło (kWh),Energia (kWh)"];
    apartments.forEach(a => {
      lines.push(`${a.numer},${a.woda},${a.cieplo},${a.energia}`);
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `eksport_${selectedBuilding}_${dateRange}dni.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isLoading && buildings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h2 className="text-lg font-semibold">Brak danych testowych Bmeters</h2>
        <p className="text-muted-foreground text-sm mt-1">
          W wybranym zakresie dat nie znaleziono żadnych odczytów w bazie systemu Bmeters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Bmeters</h1>
          <p className="text-sm text-muted-foreground">Dane na żywo z platformy</p>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />}
          <Select value={selectedBuilding} onValueChange={(v) => { setSelectedBuilding(v); setPage(0); }}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Wybierz budynek" /></SelectTrigger>
            <SelectContent>
              {buildings.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dni</SelectItem>
              <SelectItem value="30">30 dni</SelectItem>
              <SelectItem value="90">90 dni</SelectItem>
              <SelectItem value="365">12 miesięcy</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleCsvExport}>
            <FileDown className="mr-2 h-4 w-4" /> Eksportuj CSV
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {mediaCards.map(m => (
          <Card key={m.key} className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} pointer-events-none`} />
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{m.label}</span>
              <m.icon className={`h-4 w-4 ${m.color}`} />
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="text-3xl font-bold tabular-nums">
                {buildingKPIs[m.key]}
                <span className="text-base font-normal text-muted-foreground ml-1">{m.unit}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Quality + Chart ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Jakość danych</CardTitle>
          </CardHeader>
          <CardContent>
            <QualityBar validated={buildingKPIs.quality.validated} estimated={buildingKPIs.quality.estimated} missing={buildingKPIs.quality.missing} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Trend zużycia</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="gW" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(200,80%,50%)" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(200,80%,50%)" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(15,90%,55%)" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(15,90%,55%)" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(48,95%,50%)" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(48,95%,50%)" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => v.slice(5)} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area type="monotone" dataKey="woda" stroke="hsl(200,80%,50%)" fill="url(#gW)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="cieplo" stroke="hsl(15,90%,55%)" fill="url(#gC)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="energia" stroke="hsl(48,95%,50%)" fill="url(#gE)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm border-dashed border-2 rounded-lg m-2">
                Brak danych na wykresie
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Lokale table ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-sm font-semibold">Lokale — {selectedBuilding}</CardTitle>
            <span className="text-xs text-muted-foreground">{sortedApartments.length} lokali</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHead label="Lokal" sortKey="numer" current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortHead label="Woda (m³)" sortKey="woda" current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortHead label="Ciepło (kWh)" sortKey="cieplo" current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortHead label="Energia (kWh)" sortKey="energia" current={sortKey} dir={sortDir} onSort={handleSort} />
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedApartments.map((a) => (
                <TableRow key={a.numer} className="hover:bg-muted/40">
                  <TableCell className="font-medium">{a.numer}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="tabular-nums">{a.woda}</span>
                      <DataQualityBadge quality={a.woda_q} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="tabular-nums">{a.cieplo}</span>
                      <DataQualityBadge quality={a.cieplo_q} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="tabular-nums">{a.energia}</span>
                      <DataQualityBadge quality={a.energia_q} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailLokal(a.numer)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {pagedApartments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">Brak lokali dla wybranego budynku</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-xs text-muted-foreground">Strona {page + 1} z {totalPages}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Poprzednia</Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Następna</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Details Dialog ── */}
      <Dialog open={!!detailLokal} onOpenChange={(v) => !v && setDetailLokal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Szczegóły lokalu {detailLokal}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Tu znajdą się szczegółowe informacje o miernikach i historyczne zużycie dla lokalu {detailLokal}.</p>
            {/* Extended modal contents using `apartments.find(a => a.numer === detailLokal).raw` */}
            <div className="space-y-2">
              {apartments.find(a => a.numer === detailLokal)?.raw.map((r: any, i: number) => (
                 <div key={i} className="flex justify-between border-b pb-2 mb-2 text-sm">
                   <span className="capitalize">{r.typ}:</span>
                   <span>Urządzenie: <strong className="font-mono">{r.dr.device_number}</strong></span>
                   <span className="tabular-nums">
                     {r.dr.value || r.dr.heat_energy || r.dr.actual_consumption} 
                   </span>
                 </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
