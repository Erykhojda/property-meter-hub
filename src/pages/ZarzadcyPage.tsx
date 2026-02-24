import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Building2, History, Edit, Trash2, Plus } from "lucide-react";
import { zarzadcy, zarzadcaPrzypisania, budynki } from "@/data/mock-data";

export default function ZarzadcyPage() {
  const [selectedZarzadca, setSelectedZarzadca] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const getAktywne = (zId: string) =>
    zarzadcaPrzypisania.filter((p) => p.zarzadca_id === zId && !p.data_do);
  const getHistoryczne = (zId: string) =>
    zarzadcaPrzypisania.filter((p) => p.zarzadca_id === zId && p.data_do);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Zarządcy</h1>
          <p className="text-muted-foreground">Zarządzanie kontami zarządców i przypisaniami budynków</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Dodaj zarządcę
        </Button>
      </div>

      <div className="grid gap-4">
        {zarzadcy.map((z) => {
          const aktywne = getAktywne(z.id);
          const historyczne = getHistoryczne(z.id);
          const isSelected = selectedZarzadca === z.id;

          return (
            <Card key={z.id} className={isSelected ? "ring-2 ring-primary" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{z.full_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{z.firma} • NIP: {z.nip_firmy}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={z.status === "active" ? "bg-success/10 text-success border-success/20" : ""}>
                      {z.status === "active" ? "Aktywny" : "Nieaktywny"}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedZarzadca(isSelected ? null : z.id)}>
                      <History className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{z.email} • {z.telefon}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Aktywne przypisania:</p>
                  <Button variant="outline" size="sm" onClick={() => { setSelectedZarzadca(z.id); setShowAssignDialog(true); }}>
                    <Plus className="mr-1 h-3 w-3" />Przypisz budynek
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aktywne.map((p) => {
                    const b = budynki.find((x) => x.id === p.budynek_id);
                    return (
                      <Badge key={p.id} variant="secondary" className="gap-1">
                        <Building2 className="h-3 w-3" />
                        {b?.nazwa ?? p.budynek_id} — od {p.data_od}
                      </Badge>
                    );
                  })}
                  {aktywne.length === 0 && <span className="text-xs text-muted-foreground">Brak aktywnych przypisań</span>}
                </div>

                {isSelected && historyczne.length > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Historia przypisań:</p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Budynek</TableHead>
                          <TableHead className="text-xs">Od</TableHead>
                          <TableHead className="text-xs">Do</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyczne.map((h) => {
                          const b = budynki.find((x) => x.id === h.budynek_id);
                          return (
                            <TableRow key={h.id}>
                              <TableCell className="text-sm">{b?.nazwa}</TableCell>
                              <TableCell className="text-sm">{h.data_od}</TableCell>
                              <TableCell className="text-sm">{h.data_do}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog: Dodaj zarządcę */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nowy zarządca</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Imię i nazwisko</Label>
                <Input placeholder="Jan Kowalski" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="jan@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input placeholder="+48 600 000 000" />
              </div>
              <div className="space-y-2">
                <Label>Firma</Label>
                <Input placeholder="Nazwa firmy" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>NIP firmy</Label>
              <Input placeholder="0000000000" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Anuluj</Button>
            <Button onClick={() => setShowAddDialog(false)}>Zapisz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Przypisz budynek */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Przypisz budynek do zarządcy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Budynek</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Wybierz budynek" /></SelectTrigger>
                <SelectContent>
                  {budynki.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.nazwa} — {b.adres}, {b.miasto}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data rozpoczęcia</Label>
              <Input type="date" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Anuluj</Button>
            <Button onClick={() => setShowAssignDialog(false)}>Przypisz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
