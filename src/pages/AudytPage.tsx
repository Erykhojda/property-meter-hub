import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { auditLogi } from "@/data/mock-data";

const akcjaColor: Record<string, string> = {
  "Dodanie": "bg-success/10 text-success border-success/20",
  "Edycja": "bg-primary/10 text-primary border-primary/20",
  "Usunięcie": "bg-destructive/10 text-destructive border-destructive/20",
  "Import danych": "bg-warning/10 text-warning border-warning/20",
  "Przypisanie": "bg-primary/10 text-primary border-primary/20",
};

export default function AudytPage() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? auditLogi : auditLogi.filter((a) => a.akcja === filter);
  const uniqueActions = [...new Set(auditLogi.map((a) => a.akcja))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audyt</h1>
          <p className="text-muted-foreground">Historia zmian i operacji systemowych</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtruj akcje" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            {uniqueActions.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Użytkownik</TableHead>
                <TableHead>Akcja</TableHead>
                <TableHead>Encja</TableHead>
                <TableHead>Szczegóły</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-sm whitespace-nowrap">{new Date(a.created_at).toLocaleString("pl-PL")}</TableCell>
                  <TableCell className="font-medium">{a.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={akcjaColor[a.akcja] ?? ""}>
                      {a.akcja}
                    </Badge>
                  </TableCell>
                  <TableCell>{a.encja}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">{a.szczegoly}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
