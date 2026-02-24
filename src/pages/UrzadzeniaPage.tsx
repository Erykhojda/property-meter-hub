import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Gauge, Crosshair, Trash2 } from "lucide-react";
import { mierniki, lokale, budynki, punktyPomiarowe } from "@/data/mock-data";

const mediaLabels = { woda: "Woda", cieplo: "Ciepło", energia: "Energia" };
const statusBadge = (s: string) =>
  s === "active"
    ? <Badge className="bg-success/10 text-success border-success/20" variant="outline">Aktywny</Badge>
    : <Badge variant="outline" className="text-muted-foreground">Nieaktywny</Badge>;

export default function UrzadzeniaPage() {
  const [selectedBuilding, setSelectedBuilding] = useState(budynki[0].id);
  const [showAddMeter, setShowAddMeter] = useState(false);

  const buildingLokale = lokale.filter((l) => l.budynek_id === selectedBuilding);
  const buildingMierniki = mierniki.filter((m) => buildingLokale.some((l) => l.id === m.lokal_id));
  const buildingPP = punktyPomiarowe.filter((pp) => buildingMierniki.some((m) => m.id === pp.miernik_id));

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
              {budynki.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.nazwa}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowAddMeter(true)}><Plus className="mr-2 h-4 w-4" />Dodaj miernik</Button>
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
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buildingMierniki.map((m) => {
                    const lokal = lokale.find((l) => l.id === m.lokal_id);
                    return (
                      <TableRow key={m.id}>
                        <TableCell className="font-mono text-sm">{m.device_id}</TableCell>
                        <TableCell>{m.nazwa}</TableCell>
                        <TableCell>{lokal?.numer}</TableCell>
                        <TableCell><Badge variant="secondary">{mediaLabels[m.typ]}</Badge></TableCell>
                        <TableCell>{m.data_instalacji}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(m.last_sync_at!).toLocaleString("pl-PL")}</TableCell>
                        <TableCell>{statusBadge(m.status!)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
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
                    const lok = lokale.find((l) => l.id === m?.lokal_id);
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
          <DialogHeader>
            <DialogTitle>Rejestracja miernika</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ID urządzenia Bmeters</Label>
              <Input placeholder="BM-X-000" />
            </div>
            <div className="space-y-2">
              <Label>Nazwa</Label>
              <Input placeholder="Wodomierz zimna" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lokal</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Wybierz lokal" /></SelectTrigger>
                  <SelectContent>
                    {buildingLokale.map((l) => (
                      <SelectItem key={l.id} value={l.id}>Lokal {l.numer} (piętro {l.pietro})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Typ</Label>
                <Select>
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
              <Input type="date" />
            </div>
            <p className="text-xs text-muted-foreground">
              Punkt pomiarowy zostanie automatycznie utworzony po rejestracji miernika.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMeter(false)}>Anuluj</Button>
            <Button onClick={() => setShowAddMeter(false)}>Zarejestruj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
