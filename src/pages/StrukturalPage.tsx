import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Building2, Home, Landmark, MapPin, Plus } from "lucide-react";
import { inwestorzy, inwestycje, budynki, lokale } from "@/data/mock-data";

type Level = "inwestorzy" | "inwestycje" | "budynki" | "lokale";

export default function StrukturalPage() {
  const [path, setPath] = useState<{ level: Level; id?: string; label?: string }[]>([
    { level: "inwestorzy", label: "Inwestorzy" },
  ]);

  const current = path[path.length - 1];

  const navigate = (level: Level, id: string, label: string) => {
    setPath([...path, { level, id, label }]);
  };

  const goTo = (index: number) => {
    setPath(path.slice(0, index + 1));
  };

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
            </CardContent>
          </Card>
        ));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Struktura</h1>
          <p className="text-muted-foreground">Hierarchia inwestycji i nieruchomości</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Dodaj
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
    </div>
  );
}
