import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Gauge, Crosshair, Trash2, AlertTriangle } from "lucide-react";
import { useAppStore, newId, Miernik, useManagerScope } from "@/data/store";
import { toast } from "sonner";

const mediaLabels: Record<Miernik["typ"], string> = { woda: "Woda", cieplo: "Ciepło", energia: "Energia" };
const statusBadge = (s: string) =>
  s === "active"
    ? <Badge className="bg-success/10 text-success border-success/20" variant="outline">Aktywny</Badge>
    : <Badge variant="outline" className="text-muted-foreground">Nieaktywny</Badge>;

const EMPTY_FORM = { device_id: "", nazwa: "", lokal_id: "", typ: "" as Miernik["typ"] | "", data_instalacji: new Date().toISOString().split("T")[0] };

export default function UrzadzeniaPage() {
  const { state, dispatch } = useAppStore();
  const { mierniki } = state;
  const { myBudynki, myLokale } = useManagerScope();

  // Derive punkty pomiarowe from current mierniki
  const punktyPomiarowe = mierniki.map((m) => ({
    id: `pp-${m.id}`,
    miernik_id: m.id,
    nazwa: `${m.nazwa} — PP`,
    typ: m.typ,
    jednostka: m.typ === "woda" ? "m³" : "kWh",
  }));

  const [selectedBuilding, setSelectedBuilding] = useState(myBudynki[0]?.id ?? "");
  const [showAddMeter, setShowAddMeter] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Miernik | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const activeBuildingId = selectedBuilding || myBudynki[0]?.id || "";
  const buildingLokale = myLokale.filter((l) => l.budynek_id === activeBuildingId);
  const buildingMierniki = mierniki.filter((m) => buildingLokale.some((l) => l.id === m.lokal_id));
  const buildingPP = punktyPomiarowe.filter((pp) => buildingMierniki.some((m) => m.id === pp.miernik_id));

  const setF = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleAdd = () => {
    if (!form.device_id.trim()) { toast.error("Podaj ID urządzenia"); return; }
    if (!form.lokal_id) { toast.error("Wybierz lokal"); return; }
    if (!form.typ) { toast.error("Wybierz typ medium"); return; }
    const now = new Date().toISOString();
    dispatch({
      type: "ADD_MIERNIK",
      payload: {
        id: newId("m"),
        lokal_id: form.lokal_id,
        device_id: form.device_id,
        typ: form.typ as Miernik["typ"],
        nazwa: form.nazwa || form.device_id,
        data_instalacji: form.data_instalacji,
        status: "active",
        last_sync_at: now,
        alarmDevice: false,
        alarmBattery: false,
        alarmDamagedCable: false,
        alarmOverflow: false,
        alarmReverseInstallation: false,
      },
    });
    toast.success("Miernik zarejestrowany");
    setShowAddMeter(false);
    setForm(EMPTY_FORM);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    dispatch({ type: "DELETE_MIERNIK", id: deleteTarget.id });
    toast.success("Miernik usunięty");
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Urządzenia</h1>
          <p className="text-muted-foreground">Rejestr mierników Bmeters i punktów pomiarowych</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {myBudynki.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.nazwa}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => { setForm(EMPTY_FORM); setShowAddMeter(true); }}>
            <Plus className="mr-2 h-4 w-4" />Dodaj miernik
          </Button>
        </div>
      </div>

      <Tabs defaultValue="mierniki">
        <TabsList>
          <TabsTrigger value="mierniki"><Gauge className="mr-2 h-4 w-4" />Mierniki ({buildingMierniki.length})</TabsTrigger>
          <TabsTrigger value="punkty"><Crosshair className="mr-2 h-4 w-4" />Punkty pomiarowe ({buildingPP.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="mierniki" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID urządzenia</TableHead>
                    <TableHead>Nazwa</TableHead>
                    <TableHead>Lokal</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Data instalacji</TableHead>
                    <TableHead>Ostatnia sync.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Alarmy</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buildingMierniki.map((m) => {
                    const lokal = myLokale.find((l) => l.id === m.lokal_id);
                    return (
                      <TableRow key={m.id}>
                        <TableCell className="font-mono text-sm">{m.device_id}</TableCell>
                        <TableCell>{m.nazwa}</TableCell>
                        <TableCell>{lokal?.numer}</TableCell>
                        <TableCell><Badge variant="secondary">{mediaLabels[m.typ]}</Badge></TableCell>
                        <TableCell>{m.data_instalacji}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {m.last_sync_at ? new Date(m.last_sync_at).toLocaleString("pl-PL") : "—"}
                        </TableCell>
                        <TableCell>{statusBadge(m.status!)}</TableCell>
                        <TableCell>
                          {(() => {
                            const cnt = [m.alarmDevice, m.alarmBattery, m.alarmDamagedCable, m.alarmOverflow, m.alarmReverseInstallation].filter(Boolean).length;
                            return cnt > 0 ? (
                              <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 text-xs">
                                <AlertTriangle className="h-3 w-3" />{cnt}
                              </Badge>
                            ) : <span className="text-xs text-muted-foreground/40">—</span>;
                          })()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setDeleteTarget(m)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {buildingMierniki.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        <Gauge className="mx-auto h-8 w-8 mb-2 opacity-40" />
                        Brak mierników w tym budynku
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="punkty" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Punkty pomiarowe (automatycznie tworzone)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID punktu</TableHead>
                    <TableHead>Nazwa</TableHead>
                    <TableHead>Miernik</TableHead>
                    <TableHead>Lokal</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Jednostka</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buildingPP.map((pp) => {
                    const m = mierniki.find((x) => x.id === pp.miernik_id);
                    const lok = myLokale.find((l) => l.id === m?.lokal_id);
                    return (
                      <TableRow key={pp.id}>
                        <TableCell className="font-mono text-sm">{pp.id}</TableCell>
                        <TableCell>{pp.nazwa}</TableCell>
                        <TableCell className="font-mono text-sm">{m?.device_id}</TableCell>
                        <TableCell>{lok?.numer}</TableCell>
                        <TableCell><Badge variant="secondary">{mediaLabels[pp.typ]}</Badge></TableCell>
                        <TableCell>{pp.jednostka}</TableCell>
                      </TableRow>
                    );
                  })}
                  {buildingPP.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        <Crosshair className="mx-auto h-8 w-8 mb-2 opacity-40" />
                        Brak punktów pomiarowych
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog: Dodaj miernik */}
      <Dialog open={showAddMeter} onOpenChange={setShowAddMeter}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rejestracja miernika</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ID urządzenia Bmeters *</Label>
              <Input placeholder="BM-X-000" value={form.device_id} onChange={(e) => setF("device_id", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nazwa</Label>
              <Input placeholder="Wodomierz zimna" value={form.nazwa} onChange={(e) => setF("nazwa", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lokal *</Label>
                <Select value={form.lokal_id} onValueChange={(v) => setF("lokal_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Wybierz lokal" /></SelectTrigger>
                  <SelectContent>
                    {buildingLokale.map((l) => (
                      <SelectItem key={l.id} value={l.id}>Lokal {l.numer} (piętro {l.pietro})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Typ *</Label>
                <Select value={form.typ} onValueChange={(v) => setF("typ", v)}>
                  <SelectTrigger><SelectValue placeholder="Typ medium" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="woda">Woda</SelectItem>
                    <SelectItem value="cieplo">Ciepło</SelectItem>
                    <SelectItem value="energia">Energia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Data instalacji</Label>
              <Input type="date" value={form.data_instalacji} onChange={(e) => setF("data_instalacji", e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground">
              Punkt pomiarowy zostanie automatycznie utworzony po rejestracji miernika.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMeter(false)}>Anuluj</Button>
            <Button onClick={handleAdd}>Zarejestruj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert: Usuń miernik */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usuń miernik</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć miernik „{deleteTarget?.device_id} — {deleteTarget?.nazwa}"? Tej operacji nie można cofnąć.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Usuń</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
