import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Building2, History, Edit, Trash2, Plus, X } from "lucide-react";
import { useAppStore, newId, Zarzadca } from "@/data/store";
import { toast } from "sonner";

const EMPTY_ZARZADCA = { full_name: "", email: "", telefon: "", firma: "", nip_firmy: "", status: "active" as const };

export default function ZarzadcyPage() {
  const { state, dispatch } = useAppStore();
  const { zarzadcy, zarzadcaPrzypisania, budynki } = state;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<Zarzadca | null>(null);
  const [form, setForm] = useState(EMPTY_ZARZADCA);
  const [assignBudynekId, setAssignBudynekId] = useState("");
  const [assignDataOd, setAssignDataOd] = useState(new Date().toISOString().split("T")[0]);

  const getAktywne = (zId: string) => zarzadcaPrzypisania.filter((p) => p.zarzadca_id === zId && !p.data_do);
  const getHistoryczne = (zId: string) => zarzadcaPrzypisania.filter((p) => p.zarzadca_id === zId && p.data_do);

  const openAdd = () => {
    setForm(EMPTY_ZARZADCA);
    setShowAddDialog(true);
  };

  const openEdit = (z: Zarzadca) => {
    setEditTarget(z);
    setForm({ full_name: z.full_name, email: z.email, telefon: z.telefon, firma: z.firma, nip_firmy: z.nip_firmy, status: z.status });
    setShowEditDialog(true);
  };

  const openDelete = (z: Zarzadca) => {
    setEditTarget(z);
    setShowDeleteDialog(true);
  };

  const openAssign = (z: Zarzadca) => {
    setEditTarget(z);
    setAssignBudynekId("");
    setAssignDataOd(new Date().toISOString().split("T")[0]);
    setShowAssignDialog(true);
  };

  const handleAdd = () => {
    if (!form.full_name.trim()) { toast.error("Podaj imię i nazwisko"); return; }
    dispatch({ type: "ADD_ZARZADCA", payload: { id: newId("z"), ...form } });
    toast.success("Zarządca dodany");
    setShowAddDialog(false);
  };

  const handleEdit = () => {
    if (!editTarget) return;
    dispatch({ type: "UPDATE_ZARZADCA", payload: { ...editTarget, ...form } });
    toast.success("Zarządca zaktualizowany");
    setShowEditDialog(false);
  };

  const handleDelete = () => {
    if (!editTarget) return;
    dispatch({ type: "DELETE_ZARZADCA", id: editTarget.id });
    toast.success("Zarządca usunięty");
    setShowDeleteDialog(false);
  };

  const handleAssign = () => {
    if (!editTarget || !assignBudynekId) { toast.error("Wybierz budynek"); return; }
    dispatch({
      type: "ADD_PRZYPISANIE",
      payload: { id: newId("zp"), zarzadca_id: editTarget.id, budynek_id: assignBudynekId, data_od: assignDataOd, data_do: null },
    });
    toast.success("Budynek przypisany");
    setShowAssignDialog(false);
  };

  const handleRemoveAssignment = (id: string) => {
    dispatch({ type: "REMOVE_PRZYPISANIE", id });
    toast.success("Przypisanie zakończone");
  };

  const setF = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Zarządcy</h1>
          <p className="text-muted-foreground">Zarządzanie kontami zarządców i przypisaniami budynków</p>
        </div>
        <Button onClick={openAdd}>
          <UserPlus className="mr-2 h-4 w-4" />
          Dodaj zarządcę
        </Button>
      </div>

      <div className="grid gap-4">
        {zarzadcy.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <UserPlus className="mx-auto h-10 w-10 mb-3 opacity-30" />
              <p>Brak zarządców. Kliknij „Dodaj zarządcę", by dodać pierwszego.</p>
            </CardContent>
          </Card>
        )}
        {zarzadcy.map((z) => {
          const aktywne = getAktywne(z.id);
          const historyczne = getHistoryczne(z.id);
          const isSelected = selectedId === z.id;

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
                    <Button variant="ghost" size="icon" onClick={() => openEdit(z)} title="Edytuj">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDelete(z)} title="Usuń">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedId(isSelected ? null : z.id)} title="Pokaż historię">
                      <History className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{z.email} • {z.telefon}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Aktywne przypisania:</p>
                  <Button variant="outline" size="sm" onClick={() => openAssign(z)}>
                    <Plus className="mr-1 h-3 w-3" />Przypisz budynek
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aktywne.map((p) => {
                    const b = budynki.find((x) => x.id === p.budynek_id);
                    return (
                      <Badge key={p.id} variant="secondary" className="gap-1 pr-1">
                        <Building2 className="h-3 w-3" />
                        {b?.nazwa ?? p.budynek_id} — od {p.data_od}
                        <button
                          onClick={() => handleRemoveAssignment(p.id)}
                          className="ml-1 rounded hover:bg-destructive/20 p-0.5"
                          title="Zakończ przypisanie"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
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
          <DialogHeader><DialogTitle>Nowy zarządca</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Imię i nazwisko *</Label>
                <Input placeholder="Jan Kowalski" value={form.full_name} onChange={(e) => setF("full_name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="jan@example.com" value={form.email} onChange={(e) => setF("email", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input placeholder="+48 600 000 000" value={form.telefon} onChange={(e) => setF("telefon", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Firma</Label>
                <Input placeholder="Nazwa firmy" value={form.firma} onChange={(e) => setF("firma", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>NIP firmy</Label>
              <Input placeholder="0000000000" value={form.nip_firmy} onChange={(e) => setF("nip_firmy", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Anuluj</Button>
            <Button onClick={handleAdd}>Zapisz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Edytuj zarządcę */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edytuj zarządcę</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Imię i nazwisko *</Label>
                <Input value={form.full_name} onChange={(e) => setF("full_name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setF("email", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input value={form.telefon} onChange={(e) => setF("telefon", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Firma</Label>
                <Input value={form.firma} onChange={(e) => setF("firma", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>NIP firmy</Label>
                <Input value={form.nip_firmy} onChange={(e) => setF("nip_firmy", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setF("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktywny</SelectItem>
                    <SelectItem value="inactive">Nieaktywny</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Anuluj</Button>
            <Button onClick={handleEdit}>Zapisz zmiany</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Przypisz budynek */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Przypisz budynek do: {editTarget?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Budynek</Label>
              <Select value={assignBudynekId} onValueChange={setAssignBudynekId}>
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
              <Input type="date" value={assignDataOd} onChange={(e) => setAssignDataOd(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Anuluj</Button>
            <Button onClick={handleAssign}>Przypisz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert: Usuń */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usuń zarządcę</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć „{editTarget?.full_name}"? Tej operacji nie można cofnąć.
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
