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
import { inwestorzy, inwestycje, budynki, lokale } from "@/data/mock-data";

type Level = "inwestorzy" | "inwestycje" | "budynki" | "lokale";

const levelLabels: Record<Level, string> = {
  inwestorzy: "inwestora",
  inwestycje: "inwestycję",
  budynki: "budynek",
  lokale: "lokal",
};

export default function StrukturalPage() {
  const [path, setPath] = useState<{ level: Level; id?: string; label?: string }[]>([
    { level: "inwestorzy", label: "Inwestorzy" },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const current = path[path.length - 1];

  const navigate = (level: Level, id: string, label: string) => {
    setPath([...path, { level, id, label }]);
  };

  const goTo = (index: number) => setPath(path.slice(0, index + 1));

  const handleEdit = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setEditItem(item);
    setShowEdit(true);
  };

  const handleDelete = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setEditItem(item);
    setShowDelete(true);
  };

  const renderActions = (item: any) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleEdit(e, item)}>
        <Edit className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => handleDelete(e, item)}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  const renderContent = () => {
    switch (current.level) {
      case "inwestorzy":
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
        return inwestycje.filter((i) => i.inwestor_id === current.id).map((inw) => (
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
        return budynki.filter((b) => b.inwestycja_id === current.id).map((bud) => (
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
        return lokale.filter((l) => l.budynek_id === current.id).map((lok) => (
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

  const renderAddForm = () => {
    switch (current.level) {
      case "inwestorzy":
        return (
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nazwa</Label><Input placeholder="Nazwa inwestora" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>NIP</Label><Input placeholder="0000000000" /></div>
              <div className="space-y-2"><Label>Kontakt</Label><Input placeholder="email@example.com" /></div>
            </div>
            <div className="space-y-2"><Label>Adres</Label><Input placeholder="ul. Przykładowa 1, Miasto" /></div>
          </div>
        );
      case "inwestycje":
        return (
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nazwa inwestycji</Label><Input placeholder="Osiedle..." /></div>
            <div className="space-y-2"><Label>Opis</Label><Input placeholder="Krótki opis" /></div>
          </div>
        );
      case "budynki":
        return (
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nazwa budynku</Label><Input placeholder="Budynek X" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Adres</Label><Input placeholder="ul. Przykładowa 1" /></div>
              <div className="space-y-2"><Label>Miasto</Label><Input placeholder="Kraków" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Kod pocztowy</Label><Input placeholder="00-000" /></div>
              <div className="space-y-2"><Label>Liczba lokali</Label><Input type="number" placeholder="0" /></div>
            </div>
          </div>
        );
      case "lokale":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Numer lokalu</Label><Input placeholder="1A" /></div>
              <div className="space-y-2"><Label>Piętro</Label><Input type="number" placeholder="0" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Powierzchnia (m²)</Label><Input type="number" placeholder="50" /></div>
              <div className="space-y-2">
                <Label>Typ</Label>
                <Select>
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
        <Button onClick={() => setShowAdd(true)}>
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
          <DialogHeader>
            <DialogTitle>Dodaj {levelLabels[current.level]}</DialogTitle>
          </DialogHeader>
          {renderAddForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Anuluj</Button>
            <Button onClick={() => setShowAdd(false)}>Zapisz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Edytuj */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edytuj {editItem?.nazwa ?? editItem?.numer ?? ""}</DialogTitle>
          </DialogHeader>
          {renderAddForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>Anuluj</Button>
            <Button onClick={() => setShowEdit(false)}>Zapisz zmiany</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert: Usuń */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potwierdź usunięcie</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć „{editItem?.nazwa ?? editItem?.numer}"? Ta operacja jest nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={() => setShowDelete(false)}>Usuń</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
