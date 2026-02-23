import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";
import { zarzadcy, budynki } from "@/data/mock-data";

export default function ZarzadcyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Zarządcy</h1>
          <p className="text-muted-foreground">Zarządzanie kontami zarządców i przypisaniami budynków</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Dodaj zarządcę
        </Button>
      </div>

      <div className="grid gap-4">
        {zarzadcy.map((z) => (
          <Card key={z.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{z.full_name}</CardTitle>
                <Badge variant="outline">{z.data_do ? "Nieaktywny" : "Aktywny"}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{z.email}</p>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">Przypisane budynki:</p>
              <div className="flex flex-wrap gap-2">
                {z.budynki.map((bid) => {
                  const b = budynki.find((x) => x.id === bid);
                  return (
                    <Badge key={bid} variant="secondary">
                      {b?.nazwa ?? bid} — od {z.data_od}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
