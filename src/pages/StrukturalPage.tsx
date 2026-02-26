import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronRight, Building2, Home, Landmark, MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { useAppStore, newId, Inwestor, Inwestycja, Budynek, Lokal, useManagerScope } from "@/data/store";
import { toast } from "sonner";

type Level = "inwestorzy" | "inwestycje" | "budynki" | "lokale";

const levelLabels: Record<Level, string> = {
  inwestorzy: "inwestora",
  inwestycje: "inwestycję",
  budynki: "budynek",
  lokale: "lokal",
};

export default function StrukturalPage() {
  const { state, dispatch } = useAppStore();
  const { inwestorzy, inwestycje, budynki, lokale } = state;
  const { myBudynkiIds } = useManagerScope();

  const [path, setPath] = useState<{ level: Level; id?: string; label?: string }[]>([
    { level: "inwestorzy", label: "Inwestorzy" },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  // Form state — single object covering all levels
  const [form, setForm] = useState<Record<string, string>>({});
  const setF = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const current = path[path.length - 1];
  const navigate = (level: Level, id: string, label: string) => setPath([...path, { level, id, label }]);
  const goTo = (index: number) => setPath(path.slice(0, index + 1));

  const openAdd = () => {
    setForm({});
    setShowAdd(true);
  };

  const openEdit = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setEditItem(item);
    setForm(Object.fromEntries(Object.entries(item).map(([k, v]) => [k, String(v ?? "")])));
    setShowEdit(true);
  };

  const openDelete = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setEditItem(item);
    setShowDelete(true);
  };

  // ── Add ──────────────────────────────────────────────────────────────────────
  const handleAdd = () => {
    switch (current.level) {
      case "inwestorzy": {
        if (!form.nazwa?.trim()) { toast.error("Podaj nazwę inwestora"); return; }
        dispatch({ type: "ADD_INWESTOR", payload: { id: newId("inv"), nazwa: form.nazwa, nip: form.nip ?? "", adres: form.adres ?? "", kontakt: form.kontakt ?? "" } });
        toast.success("Inwestor dodany");
        break;
      }
      case "inwestycje": {
        if (!form.nazwa?.trim()) { toast.error("Podaj nazwę inwestycji"); return; }
        dispatch({ type: "ADD_INWESTYCJA", payload: { id: newId("inw"), inwestor_id: current.id!, nazwa: form.nazwa, opis: form.opis ?? "" } });
        toast.success("Inwestycja dodana");
        break;
      }
      case "budynki": {
        if (!form.nazwa?.trim()) { toast.error("Podaj nazwę budynku"); return; }
        dispatch({ type: "ADD_BUDYNEK", payload: { id: newId("bud"), inwestycja_id: current.id!, nazwa: form.nazwa, adres: form.adres ?? "", miasto: form.miasto ?? "", kod_pocztowy: form.kod_pocztowy ?? "", liczba_lokali: Number(form.liczba_lokali) || 0 } });
        toast.success("Budynek dodany");
        break;
      }
      case "lokale": {
        if (!form.numer?.trim()) { toast.error("Podaj numer lokalu"); return; }
        dispatch({ type: "ADD_LOKAL", payload: { id: newId("lok"), budynek_id: current.id!, numer: form.numer, pietro: Number(form.pietro) || 0, powierzchnia: Number(form.powierzchnia) || 0, typ: form.typ || "mieszkanie" } });
        toast.success("Lokal dodany");
        break;
      }
    }
    setShowAdd(false);
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const handleEdit = () => {
    if (!editItem) return;
    switch (current.level) {
      case "inwestorzy":
        dispatch({ type: "UPDATE_INWESTOR", payload: { ...editItem, nazwa: form.nazwa ?? editItem.nazwa, nip: form.nip ?? editItem.nip, adres: form.adres ?? editItem.adres, kontakt: form.kontakt ?? editItem.kontakt } });
        toast.success("Inwestor zaktualizowany");
        break;
      case "inwestycje":
        dispatch({ type: "UPDATE_INWESTYCJA", payload: { ...editItem, nazwa: form.nazwa ?? editItem.nazwa, opis: form.opis ?? editItem.opis } });
        toast.success("Inwestycja zaktualizowana");
        break;
      case "budynki":
        dispatch({ type: "UPDATE_BUDYNEK", payload: { ...editItem, nazwa: form.nazwa ?? editItem.nazwa, adres: form.adres ?? editItem.adres, miasto: form.miasto ?? editItem.miasto, kod_pocztowy: form.kod_pocztowy ?? editItem.kod_pocztowy, liczba_lokali: Number(form.liczba_lokali) || editItem.liczba_lokali } });
        toast.success("Budynek zaktualizowany");
        break;
      case "lokale":
        dispatch({ type: "UPDATE_LOKAL", payload: { ...editItem, numer: form.numer ?? editItem.numer, pietro: Number(form.pietro) ?? editItem.pietro, powierzchnia: Number(form.powierzchnia) ?? editItem.powierzchnia, typ: form.typ ?? editItem.typ } });
        toast.success("Lokal zaktualizowany");
        break;
    }
    setShowEdit(false);
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = () => {
    if (!editItem) return;
    switch (current.level) {
      case "inwestorzy": dispatch({ type: "DELETE_INWESTOR", id: editItem.id }); toast.success("Inwestor usunięty"); break;
      case "inwestycje": dispatch({ type: "DELETE_INWESTYCJA", id: editItem.id }); toast.success("Inwestycja usunięta"); break;
      case "budynki": dispatch({ type: "DELETE_BUDYNEK", id: editItem.id }); toast.success("Budynek usunięty"); break;
      case "lokale": dispatch({ type: "DELETE_LOKAL", id: editItem.id }); toast.success("Lokal usunięty"); break;
    }
    setShowDelete(false);
  };

  // ── Actions row ───────────────────────────────────────────────────────────────
  const renderActions = (item: any) => (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => openEdit(e, item)}>
        <Edit className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => openDelete(e, item)}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  // ── Content ───────────────────────────────────────────────────────────────────
  const renderContent = () => {
    switch (current.level) {
      case "inwestorzy":
        if (inwestorzy.length === 0) return <EmptyState icon={<Landmark />} text={'Brak inwestor\u00f3w. Kliknij „Dodaj inwestora“.'} />;
        return inwestorzy.map((inv) => (
          <Card key={inv.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("inwestycje", inv.id, inv.nazwa)}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Landmark className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{inv.nazwa}</p>
                  <p className="text-sm text-muted-foreground">NIP: {inv.nip} • {inv.adres}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{inwestycje.filter((i) => i.inwestor_id === inv.id).length} inwestycji</Badge>
                {renderActions(inv)}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ));

      case "inwestycje":
        const filtInw = inwestycje.filter((i) => i.inwestor_id === current.id);
        if (filtInw.length === 0) return <EmptyState icon={<MapPin />} text={'Brak inwestycji. Kliknij „Dodaj inwestycj\u0119“.'} />;
        return filtInw.map((inw) => (
          <Card key={inw.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("budynki", inw.id, inw.nazwa)}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{inw.nazwa}</p>
                  <p className="text-sm text-muted-foreground">{inw.opis}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{budynki.filter((b) => b.inwestycja_id === inw.id).length} budynków</Badge>
                {renderActions(inw)}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ));

      case "budynki":
        const filtBud = budynki.filter((b) => b.inwestycja_id === current.id && myBudynkiIds.has(b.id));
        if (filtBud.length === 0) return <EmptyState icon={<Building2 />} text={'Brak budynk\u00f3w. Kliknij „Dodaj budynek“.'} />;
        return filtBud.map((bud) => (
          <Card key={bud.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("lokale", bud.id, bud.nazwa)}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{bud.nazwa}</p>
                  <p className="text-sm text-muted-foreground">{bud.adres}, {bud.miasto} {bud.kod_pocztowy}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{bud.liczba_lokali} lokali</Badge>
                {renderActions(bud)}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ));

      case "lokale":
        const filtLok = lokale.filter((l) => l.budynek_id === current.id);
        if (filtLok.length === 0) return <EmptyState icon={<Home />} text={'Brak lokali. Kliknij „Dodaj lokal“.'} />;
        return filtLok.map((lok) => (
          <Card key={lok.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Lokal {lok.numer}</p>
                  <p className="text-sm text-muted-foreground">Piętro {lok.pietro} • {lok.powierzchnia} m² • {lok.typ}</p>
                </div>
              </div>
              {renderActions(lok)}
            </CardContent>
          </Card>
        ));
    }
  };

  // ── Add form per level ────────────────────────────────────────────────────────
  const renderAddForm = () => {
    switch (current.level) {
      case "inwestorzy":
        return (
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nazwa *</Label><Input placeholder="Nazwa inwestora" value={form.nazwa ?? ""} onChange={(e) => setF("nazwa", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>NIP</Label><Input placeholder="0000000000" value={form.nip ?? ""} onChange={(e) => setF("nip", e.target.value)} /></div>
              <div className="space-y-2"><Label>Kontakt</Label><Input placeholder="email@example.com" value={form.kontakt ?? ""} onChange={(e) => setF("kontakt", e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Adres</Label><Input placeholder="ul. Przykładowa 1, Miasto" value={form.adres ?? ""} onChange={(e) => setF("adres", e.target.value)} /></div>
          </div>
        );
      case "inwestycje":
        return (
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nazwa inwestycji *</Label><Input placeholder="Osiedle..." value={form.nazwa ?? ""} onChange={(e) => setF("nazwa", e.target.value)} /></div>
            <div className="space-y-2"><Label>Opis</Label><Input placeholder="Krótki opis" value={form.opis ?? ""} onChange={(e) => setF("opis", e.target.value)} /></div>
          </div>
        );
      case "budynki":
        return (
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nazwa budynku *</Label><Input placeholder="Budynek X" value={form.nazwa ?? ""} onChange={(e) => setF("nazwa", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Adres</Label><Input placeholder="ul. Przykładowa 1" value={form.adres ?? ""} onChange={(e) => setF("adres", e.target.value)} /></div>
              <div className="space-y-2"><Label>Miasto</Label><Input placeholder="Kraków" value={form.miasto ?? ""} onChange={(e) => setF("miasto", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Kod pocztowy</Label><Input placeholder="00-000" value={form.kod_pocztowy ?? ""} onChange={(e) => setF("kod_pocztowy", e.target.value)} /></div>
              <div className="space-y-2"><Label>Liczba lokali</Label><Input type="number" placeholder="0" value={form.liczba_lokali ?? ""} onChange={(e) => setF("liczba_lokali", e.target.value)} /></div>
            </div>
          </div>
        );
      case "lokale":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Numer lokalu *</Label><Input placeholder="1A" value={form.numer ?? ""} onChange={(e) => setF("numer", e.target.value)} /></div>
              <div className="space-y-2"><Label>Piętro</Label><Input type="number" placeholder="0" value={form.pietro ?? ""} onChange={(e) => setF("pietro", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Powierzchnia (m²)</Label><Input type="number" placeholder="50" value={form.powierzchnia ?? ""} onChange={(e) => setF("powierzchnia", e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Typ</Label>
                <Select value={form.typ ?? "mieszkanie"} onValueChange={(v) => setF("typ", v)}>
                  <SelectTrigger><SelectValue placeholder="Wybierz typ" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mieszkanie">Mieszkanie</SelectItem>
                    <SelectItem value="apartament">Apartament</SelectItem>
                    <SelectItem value="uzytkowy">Użytkowy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Struktura</h1>
          <p className="text-muted-foreground">Hierarchia inwestycji i nieruchomości</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Dodaj {levelLabels[current.level]}
        </Button>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-sm">
        {path.map((p, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            <button
              onClick={() => goTo(i)}
              className={`hover:text-primary ${i === path.length - 1 ? "font-medium text-foreground" : "text-muted-foreground"}`}
            >
              {p.label}
            </button>
          </span>
        ))}
      </div>

      <div className="space-y-3">{renderContent()}</div>

      {/* Dialog: Dodaj */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Dodaj {levelLabels[current.level]}</DialogTitle></DialogHeader>
          {renderAddForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Anuluj</Button>
            <Button onClick={handleAdd}>Zapisz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Edytuj */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edytuj {editItem?.nazwa ?? `Lokal ${editItem?.numer}`}</DialogTitle></DialogHeader>
          {renderAddForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>Anuluj</Button>
            <Button onClick={handleEdit}>Zapisz zmiany</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert: Usuń */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potwierdź usunięcie</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć „{editItem?.nazwa ?? editItem?.numer}"? Tej operacji nie można cofnąć.
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

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center text-muted-foreground">
        <div className="mx-auto h-10 w-10 mb-3 opacity-30 flex items-center justify-center [&>svg]:h-10 [&>svg]:w-10">{icon}</div>
        <p>{text}</p>
      </CardContent>
    </Card>
  );
}
