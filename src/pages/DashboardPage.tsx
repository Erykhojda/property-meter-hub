import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataQualityBadge } from "@/components/DataQualityBadge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Droplets, Flame, Zap, TrendingUp, Eye } from "lucide-react";
import { budynki, lokale, buildingConsumption, apartmentConsumption, generateReadings, generateUnitReadings, mierniki, type DataQuality } from "@/data/mock-data";

const chartConfig = {
  woda: { label: "Woda (m³)", color: "hsl(200, 80%, 50%)" },
  cieplo: { label: "Ciepło (kWh)", color: "hsl(15, 90%, 55%)" },
  energia: { label: "Energia (kWh)", color: "hsl(48, 95%, 50%)" },
};

const mediaCards = [
  { key: "woda" as const, label: "Woda", unit: "m³", icon: Droplets, color: "text-primary" },
  { key: "cieplo" as const, label: "Ciepło", unit: "kWh", icon: Flame, color: "text-destructive" },
  { key: "energia" as const, label: "Energia", unit: "kWh", icon: Zap, color: "text-warning" },
];

const qualityColors: Record<DataQuality, string> = {
  validated: "hsl(142, 76%, 36%)",
  estimated: "hsl(38, 92%, 50%)",
  missing: "hsl(0, 84%, 60%)",
};

export default function DashboardPage() {
  const [selectedBuilding, setSelectedBuilding] = useState(budynki[0].id);
  const [dateRange, setDateRange] = useState("30");
  const [detailLokal, setDetailLokal] = useState<string | null>(null);

  const building = buildingConsumption.find((b) => b.budynek_id === selectedBuilding)!;
  const apartments = apartmentConsumption.filter((a) => a.budynek_id === selectedBuilding);
  const readings = generateReadings(Number(dateRange));

  // Unit detail data
  const detailLok = detailLokal ? lokale.find((l) => l.id === detailLokal) : null;
  const unitReadings = detailLokal ? generateUnitReadings(detailLokal, Number(dateRange)) : [];
  const unitMierniki = detailLokal ? mierniki.filter((m) => m.lokal_id === detailLokal) : [];

  // Aggregate unit readings for chart
  const unitChartData = detailLokal ? (() => {
    const byDate: Record<string, { date: string; woda: number; cieplo: number; energia: number; qualities: DataQuality[] }> = {};
    unitReadings.forEach((r) => {
      if (!byDate[r.date]) byDate[r.date] = { date: r.date, woda: 0, cieplo: 0, energia: 0, qualities: [] };
      byDate[r.date][r.typ] += r.wartosc;
      byDate[r.date].qualities.push(r.jakosc);
    });
    return Object.values(byDate);
  })() : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Przegląd zużycia mediów</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {budynki.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.nazwa}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dni</SelectItem>
              <SelectItem value="30">30 dni</SelectItem>
              <SelectItem value="90">90 dni</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {mediaCards.map((m) => (
          <Card key={m.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{m.label}</CardTitle>
              <m.icon className={`h-5 w-5 ${m.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{building[m.key]} {m.unit}</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />Bieżący okres
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quality overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Jakość danych — {building.nazwa}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-success" />
              <span>Zweryfikowane: {building.quality_ratio.validated}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-warning" />
              <span>Oszacowane: {building.quality_ratio.estimated}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive" />
              <span>Brak: {building.quality_ratio.missing}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time-series chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Zużycie mediów — trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={readings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="woda" stroke="var(--color-woda)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cieplo" stroke="var(--color-cieplo)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="energia" stroke="var(--color-energia)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Apartment drill-down */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lokale — {budynki.find((b) => b.id === selectedBuilding)?.nazwa}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lokal</TableHead>
                <TableHead>Piętro</TableHead>
                <TableHead className="text-right">Woda (m³)</TableHead>
                <TableHead className="text-right">Ciepło (kWh)</TableHead>
                <TableHead className="text-right">Energia (kWh)</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apartments.map((a) => (
                <TableRow key={a.lokal_id}>
                  <TableCell className="font-medium">{a.numer}</TableCell>
                  <TableCell>{a.pietro}</TableCell>
                  <TableCell className="text-right">
                    <span className="mr-2">{a.woda}</span>
                    <DataQualityBadge quality={a.woda_quality} />
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="mr-2">{a.cieplo}</span>
                    <DataQualityBadge quality={a.cieplo_quality} />
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="mr-2">{a.energia}</span>
                    <DataQualityBadge quality={a.energia_quality} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailLokal(a.lokal_id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {apartments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">Brak lokali w tym budynku</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Unit detail dialog */}
      <Dialog open={!!detailLokal} onOpenChange={(v) => !v && setDetailLokal(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Szczegóły zużycia — Lokal {detailLok?.numer}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Mierniki w lokalu */}
            <div>
              <p className="text-sm font-medium mb-2">Mierniki ({unitMierniki.length}):</p>
              <div className="flex flex-wrap gap-2">
                {unitMierniki.map((m) => (
                  <div key={m.id} className="rounded-md border px-3 py-1.5 text-xs">
                    <span className="font-mono">{m.device_id}</span> — {m.nazwa}
                  </div>
                ))}
                {unitMierniki.length === 0 && <span className="text-xs text-muted-foreground">Brak mierników</span>}
              </div>
            </div>

            {/* Chart */}
            {unitChartData.length > 0 && (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <LineChart data={unitChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="woda" stroke="var(--color-woda)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="cieplo" stroke="var(--color-cieplo)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="energia" stroke="var(--color-energia)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            )}

            {/* Per-reading table with quality */}
            <div className="max-h-[200px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead className="text-right">Wartość</TableHead>
                    <TableHead>Jednostka</TableHead>
                    <TableHead>Jakość</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unitReadings.slice(-20).reverse().map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">{r.date}</TableCell>
                      <TableCell className="text-sm capitalize">{r.typ}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{r.wartosc}</TableCell>
                      <TableCell className="text-sm">{r.jednostka}</TableCell>
                      <TableCell><DataQualityBadge quality={r.jakosc} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
