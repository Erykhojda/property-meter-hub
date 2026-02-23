import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, ShieldCheck, RefreshCw, Play } from "lucide-react";
import { syncLogi, budynki } from "@/data/mock-data";

const statusConfig = {
  success: { label: "Sukces", className: "bg-success/10 text-success border-success/20" },
  partial: { label: "Częściowy", className: "bg-warning/10 text-warning border-warning/20" },
  failed: { label: "Błąd", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function IntegracjaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integracja Bmeters</h1>
        <p className="text-muted-foreground">Konfiguracja API, walidacja i import danych</p>
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" />Ustawienia</TabsTrigger>
          <TabsTrigger value="validation"><ShieldCheck className="mr-2 h-4 w-4" />Walidacja</TabsTrigger>
          <TabsTrigger value="sync"><RefreshCw className="mr-2 h-4 w-4" />Status synchronizacji</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Klucz API Bmeters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input type="password" placeholder="Wprowadź klucz API..." defaultValue="sk_bm_*****_demo" className="flex-1" />
                <Button variant="outline">Testuj połączenie</Button>
              </div>
              <p className="text-xs text-muted-foreground">Klucz jest przechowywany w bezpieczny sposób i nigdy nie jest ujawniany.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Symuluj import</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Generuj realistyczne odczyty dla wszystkich zarejestrowanych mierników (dane demo).</p>
              <Button>
                <Play className="mr-2 h-4 w-4" />
                Symuluj import
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Silnik walidacji</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Sprawdź, czy adresy budynków i identyfikatory mierników spełniają wymagania Bmeters.</p>
              <div className="space-y-3">
                {budynki.map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium text-sm">{b.nazwa}</p>
                      <p className="text-xs text-muted-foreground">{b.adres}, {b.miasto}</p>
                    </div>
                    <Badge className="bg-success/10 text-success border-success/20" variant="outline">✓ Poprawny</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Budynki</TableHead>
                    <TableHead className="text-right">Rekordy</TableHead>
                    <TableHead className="text-right">Błędy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncLogi.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-sm">{new Date(s.created_at).toLocaleString("pl-PL")}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig[s.status].className}>
                          {statusConfig[s.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{s.budynki_count}</TableCell>
                      <TableCell className="text-right">{s.rekordy_count}</TableCell>
                      <TableCell className="text-right">{s.bledy_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
