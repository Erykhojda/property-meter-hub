import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { getAuditLogs, type AuditLogEntry } from "@/lib/bmetersApi";

const akcjaColor: Record<string, string> = {
  "Dodanie": "bg-success/10 text-success border-success/20",
  "Edycja": "bg-primary/10 text-primary border-primary/20",
  "Usunięcie": "bg-destructive/10 text-destructive border-destructive/20",
  "Import danych": "bg-warning/10 text-warning border-warning/20",
  "Przypisanie": "bg-primary/10 text-primary border-primary/20",
  "Transfer struktury": "bg-primary/10 text-primary border-primary/20",
  "Konfiguracja": "bg-muted text-muted-foreground",
  "Walidacja": "bg-warning/10 text-warning border-warning/20",
};

export default function AudytPage() {
  const [filterAction, setFilterAction] = useState("all");
  const [filterEntity, setFilterEntity] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAuditLogs({ limit: 100 })
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setIsLoading(false));
  }, []);

  const uniqueActions = [...new Set(logs.map((a) => a.akcja || a.action || ""))].filter(Boolean);
  const uniqueEntities = [...new Set(logs.map((a) => a.encja || a.entity || ""))].filter(Boolean);

  const filtered = logs.filter((a) => {
    const action = a.akcja || a.action;
    const entity = a.encja || a.entity;
    if (filterAction !== "all" && action !== filterAction) return false;
    if (filterEntity !== "all" && entity !== filterEntity) return false;
    if (dateFrom && new Date(a.created_at) < new Date(dateFrom)) return false;
    if (dateTo && new Date(a.created_at) > new Date(dateTo + "T23:59:59")) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audyt</h1>
        <p className="text-muted-foreground">Historia zmian i operacji systemowych</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Akcja</Label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  {uniqueActions.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Encja</Label>
              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  {uniqueEntities.map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Data od</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Data do</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Pobieranie logów...</TableCell>
                </TableRow>
              ) : filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-sm whitespace-nowrap">{new Date(a.created_at).toLocaleString("pl-PL")}</TableCell>
                  <TableCell className="font-medium">{a.user || "System"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={akcjaColor[(a.akcja || a.action) as string] ?? ""}>
                      {a.akcja || a.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{a.encja || a.entity}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">{a.szczegoly || a.details}</TableCell>
                </TableRow>
              ))}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Brak wyników dla wybranych filtrów
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
