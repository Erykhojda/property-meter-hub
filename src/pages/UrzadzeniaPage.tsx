import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Gauge } from "lucide-react";
import { useState } from "react";
import { mierniki, lokale, budynki } from "@/data/mock-data";

const mediaLabels = { woda: "Woda", cieplo: "Ciepło", energia: "Energia" };
const statusBadge = (s: string) =>
  s === "active" ? <Badge className="bg-success/10 text-success border-success/20" variant="outline">Aktywny</Badge>
    : <Badge variant="outline" className="text-muted-foreground">Nieaktywny</Badge>;

export default function UrzadzeniaPage() {
  const [selectedBuilding, setSelectedBuilding] = useState(budynki[0].id);

  const buildingLokale = lokale.filter((l) => l.budynek_id === selectedBuilding);
  const buildingMierniki = mierniki.filter((m) => buildingLokale.some((l) => l.id === m.lokal_id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Urządzenia</h1>
          <p className="text-muted-foreground">Rejestr mierników Bmeters</p>
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
          <Button><Plus className="mr-2 h-4 w-4" />Dodaj miernik</Button>
        </div>
      </div>

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
                  </TableRow>
                );
              })}
              {buildingMierniki.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    <Gauge className="mx-auto h-8 w-8 mb-2 opacity-40" />
                    Brak mierników w tym budynku
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
