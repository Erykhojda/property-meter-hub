import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, ShieldCheck, RefreshCw, Play, Send, Clock, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { syncLogi, budynki, walidacjaWyniki, strukturaTransfery, harmonogramImportu } from "@/data/mock-data";
import type { TransferStatus, ValidationResult } from "@/data/mock-data";

const statusConfig = {
  success: { label: "Sukces", className: "bg-success/10 text-success border-success/20" },
  partial: { label: "Częściowy", className: "bg-warning/10 text-warning border-warning/20" },
  failed: { label: "Błąd", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const transferStatusConfig: Record<TransferStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "Oczekujący", className: "bg-muted text-muted-foreground", icon: Clock },
  sent: { label: "Wysłany", className: "bg-primary/10 text-primary border-primary/20", icon: Send },
  accepted: { label: "Zaakceptowany", className: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  rejected: { label: "Odrzucony", className: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

export default function IntegracjaPage() {
  const [importRunning, setImportRunning] = useState(false);
  const [schedule, setSchedule] = useState(harmonogramImportu);

  const handleSimulateImport = () => {
    setImportRunning(true);
    setTimeout(() => setImportRunning(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integracja Bmeters</h1>
        <p className="text-muted-foreground">Konfiguracja API, walidacja, transfer struktury i import danych</p>
      </div>

      <Tabs defaultValue="settings">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" />Ustawienia</TabsTrigger>
          <TabsTrigger value="validation"><ShieldCheck className="mr-2 h-4 w-4" />Walidacja</TabsTrigger>
          <TabsTrigger value="transfer"><Send className="mr-2 h-4 w-4" />Transfer</TabsTrigger>
          <TabsTrigger value="import"><Play className="mr-2 h-4 w-4" />Import</TabsTrigger>
          <TabsTrigger value="sync"><RefreshCw className="mr-2 h-4 w-4" />Logi sync</TabsTrigger>
        </TabsList>

        {/* === USTAWIENIA === */}
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Połączenie API Bmeters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Klucz API</Label>
                <div className="flex gap-3">
                  <Input type="password" placeholder="Wprowadź klucz API..." defaultValue="sk_bm_*****_demo" className="flex-1" />
                  <Button variant="outline">Testuj połączenie</Button>
                </div>
                <p className="text-xs text-muted-foreground">Klucz jest przechowywany w bezpieczny sposób i nigdy nie jest ujawniany.</p>
              </div>
              <div className="space-y-2">
                <Label>Endpoint URL</Label>
                <Input placeholder="https://api.bmeters.com/v2" defaultValue="https://api.bmeters.com/v2" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium text-sm">Status połączenia</p>
                  <p className="text-xs text-muted-foreground">Ostatni test: 20.02.2025 10:30</p>
                </div>
                <Badge className="bg-success/10 text-success border-success/20" variant="outline">
                  <CheckCircle2 className="mr-1 h-3 w-3" />Połączony
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === WALIDACJA === */}
        <TabsContent value="validation" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Silnik walidacji struktury</CardTitle>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-3 w-3" />Uruchom walidację
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Sprawdzenie kompletności struktury, adresów budynków i identyfikatorów mierników przed synchronizacją z Bmeters.
              </p>
              <div className="space-y-3">
                {walidacjaWyniki.map((v) => {
                  const allOk = v.adres_ok && v.lokale_ok && v.mierniki_ok;
                  return (
                    <div key={v.budynek_id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{v.budynek_nazwa}</p>
                          <p className="text-xs text-muted-foreground">{budynki.find(b => b.id === v.budynek_id)?.adres}</p>
                        </div>
                        <Badge className={allOk ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"} variant="outline">
                          {allOk ? "✓ Poprawny" : `✗ ${v.bledy.length} błędów`}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span className={v.adres_ok ? "text-success" : "text-destructive"}>
                          {v.adres_ok ? "✓" : "✗"} Adres
                        </span>
                        <span className={v.lokale_ok ? "text-success" : "text-destructive"}>
                          {v.lokale_ok ? "✓" : "✗"} Lokale
                        </span>
                        <span className={v.mierniki_ok ? "text-success" : "text-destructive"}>
                          {v.mierniki_ok ? "✓" : "✗"} Mierniki
                        </span>
                      </div>
                      {v.bledy.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {v.bledy.map((b, i) => (
                            <p key={i} className="text-xs text-destructive flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />{b}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === TRANSFER STRUKTURY === */}
        <TabsContent value="transfer" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Przekazanie struktury do Bmeters</CardTitle>
              <Button size="sm">
                <Send className="mr-2 h-3 w-3" />Wyślij strukturę
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Status przekazania struktury budynków i adresów do systemu Bmeters.
              </p>
              <div className="space-y-3">
                {strukturaTransfery.map((t) => {
                  const b = budynki.find((x) => x.id === t.budynek_id);
                  const cfg = transferStatusConfig[t.status];
                  const Icon = cfg.icon;
                  return (
                    <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium text-sm">{b?.nazwa}</p>
                        <p className="text-xs text-muted-foreground">{t.szczegoly}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(t.data).toLocaleString("pl-PL")}
                        </p>
                      </div>
                      <Badge className={cfg.className} variant="outline">
                        <Icon className="mr-1 h-3 w-3" />{cfg.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === IMPORT DANYCH === */}
        <TabsContent value="import" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Harmonogram importu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Automatyczny import</p>
                  <p className="text-xs text-muted-foreground">Cykliczne pobieranie danych z Bmeters</p>
                </div>
                <Switch checked={schedule.aktywny} onCheckedChange={(v) => setSchedule({ ...schedule, aktywny: v })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Częstotliwość</Label>
                  <Select value={schedule.czestotliwosc} onValueChange={(v: any) => setSchedule({ ...schedule, czestotliwosc: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="co_godzine">Co godzinę</SelectItem>
                      <SelectItem value="co_6h">Co 6 godzin</SelectItem>
                      <SelectItem value="codziennie">Codziennie</SelectItem>
                      <SelectItem value="co_tydzien">Co tydzień</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Godzina</Label>
                  <Input type="time" value={schedule.godzina} onChange={(e) => setSchedule({ ...schedule, godzina: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Retry (max prób)</Label>
                  <Input type="number" value={schedule.retry_count} onChange={(e) => setSchedule({ ...schedule, retry_count: +e.target.value })} />
                </div>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground border-t pt-3">
                <span>Ostatni import: {new Date(schedule.ostatni_import).toLocaleString("pl-PL")}</span>
                <span>Następny: {new Date(schedule.nastepny_import).toLocaleString("pl-PL")}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Import ręczny / symulacja</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Generuj realistyczne odczyty dla wszystkich zarejestrowanych mierników (dane demo) lub uruchom import ręczny.
              </p>
              <div className="flex gap-3">
                <Button onClick={handleSimulateImport} disabled={importRunning}>
                  {importRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                  {importRunning ? "Importowanie..." : "Symuluj import"}
                </Button>
                <Button variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />Import z API
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === LOGI SYNC === */}
        <TabsContent value="sync" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historia synchronizacji</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Budynki</TableHead>
                    <TableHead className="text-right">Rekordy</TableHead>
                    <TableHead className="text-right">Błędy</TableHead>
                    <TableHead className="text-right">Czas (ms)</TableHead>
                    <TableHead>Szczegóły</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncLogi.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-sm whitespace-nowrap">{new Date(s.created_at).toLocaleString("pl-PL")}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig[s.status].className}>
                          {statusConfig[s.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{s.budynki_count}</TableCell>
                      <TableCell className="text-right">{s.rekordy_count}</TableCell>
                      <TableCell className="text-right">{s.bledy_count}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{s.czas_ms}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{s.szczegoly}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
