import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plug, Key, Eye, EyeOff, Play, CheckCircle2, XCircle, Clock, Loader2, RefreshCw } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { pl } from 'date-fns/locale';

interface SyncLog { id: string; status: string; budynki_count: number; rekordy_count: number; bledy_count: number; created_at: string; }
interface ValidationResult { budynek_id: string; nazwa: string; adres: string; valid: boolean; errors: string[]; }

export default function Integracja() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [validating, setValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [importing, setImporting] = useState(false);
  const [importDays, setImportDays] = useState('30');
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLogsLoading(true);
    const { data } = await supabase
      .from('sync_logi')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    setSyncLogs(data || []);
    setLogsLoading(false);
  };

  const handleTestConnection = async () => {
    if (!apiKey) { toast({ title: 'Wprowadź klucz API', variant: 'destructive' }); return; }
    setTesting(true);
    await new Promise(r => setTimeout(r, 1500)); // Simulate API test
    setConnectionStatus('ok');
    toast({ title: 'Połączenie nawiązane', description: 'Symulacja: API Bmeters odpowiada.' });
    setTesting(false);
  };

  const handleValidate = async () => {
    setValidating(true);
    const { data: budynki } = await supabase.from('budynki').select('id, nazwa, adres, kod_pocztowy');
    const { data: mierniki } = await supabase.from('mierniki').select('device_id, lokale!inner(budynek_id)');

    const results: ValidationResult[] = (budynki || []).map(b => {
      const errors: string[] = [];
      if (!b.adres || b.adres.length < 5) errors.push('Adres zbyt krótki lub brak');
      if (!b.kod_pocztowy) errors.push('Brak kodu pocztowego');
      const budMierniki = (mierniki || []).filter((m: any) => m.lokale?.budynek_id === b.id);
      budMierniki.forEach((m: any) => {
        if (!m.device_id.match(/^[A-Z0-9\-]{6,}/i)) errors.push(`Nieprawidłowy format ID: ${m.device_id}`);
      });
      if (budMierniki.length === 0) errors.push('Brak mierników w budynku');
      return { budynek_id: b.id, nazwa: b.nazwa, adres: b.adres, valid: errors.length === 0, errors };
    });

    setValidationResults(results);
    setValidating(false);
    toast({ title: 'Walidacja zakończona', description: `${results.filter(r => r.valid).length}/${results.length} budynków gotowych` });
  };

  const handleMockImport = async () => {
    setImporting(true);
    const { data: mierniki } = await supabase.from('mierniki').select('id');
    const { data: punkty } = await supabase.from('punkty_pomiarowe').select('id');

    if (!punkty?.length) {
      toast({ title: 'Brak punktów pomiarowych', description: 'Dodaj mierniki z punktami pomiarowymi.', variant: 'destructive' });
      setImporting(false);
      return;
    }

    const days = parseInt(importDays);
    const records: any[] = [];
    punkty.forEach(p => {
      for (let i = 0; i < days; i++) {
        const ts = subDays(new Date(), days - 1 - i);
        const qualities = ['validated', 'validated', 'validated', 'estimated', 'missing'];
        records.push({
          punkt_pomiarowy_id: p.id,
          wartosc: parseFloat((Math.random() * 15 + 5).toFixed(4)),
          timestamp: ts.toISOString(),
          jednostka: 'm3',
          jakosc_danych: qualities[Math.floor(Math.random() * qualities.length)],
        });
      }
    });

    // Insert in batches
    let imported = 0;
    for (let i = 0; i < records.length; i += 500) {
      const batch = records.slice(i, i + 500);
      const { error } = await supabase.from('odczyty').insert(batch);
      if (!error) imported += batch.length;
    }

    // Log the sync
    await supabase.from('sync_logi').insert({
      status: 'success',
      budynki_count: Math.ceil(mierniki?.length || 0 / 2),
      rekordy_count: imported,
      bledy_count: 0,
      szczegoly: { days, punkty_count: punkty.length },
    });

    await supabase.from('audit_logi').insert({
      akcja: 'IMPORT_MOCK',
      encja: 'odczyty',
      szczegoly: { rekordow: imported, dni: days },
    });

    toast({ title: 'Import zakończony', description: `Zaimportowano ${imported} odczytów za ${days} dni.` });
    fetchLogs();
    setImporting(false);
  };

  const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
    success: { label: 'Sukces', cls: 'bg-green-100 text-green-800' },
    partial: { label: 'Częściowy', cls: 'bg-amber-100 text-amber-800' },
    failed: { label: 'Błąd', cls: 'bg-red-100 text-red-800' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Integracja Bmeters</h1>
        <p className="text-muted-foreground text-sm">Konfiguracja API, walidacja i import danych</p>
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Ustawienia API</TabsTrigger>
          <TabsTrigger value="validation">Silnik walidacji</TabsTrigger>
          <TabsTrigger value="import">Symulacja importu</TabsTrigger>
          <TabsTrigger value="logs">Logi synchronizacji</TabsTrigger>
        </TabsList>

        {/* API Settings */}
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="w-4 h-4" />Klucz API Bmeters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      placeholder="Wprowadź klucz API Bmeters..."
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button onClick={handleTestConnection} disabled={testing} variant="outline">
                    {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                    Testuj połączenie
                  </Button>
                </div>
              </div>
              {connectionStatus === 'ok' && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md">
                  <CheckCircle2 className="w-4 h-4" />Połączenie aktywne (symulacja)
                </div>
              )}
              {connectionStatus === 'error' && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-md">
                  <XCircle className="w-4 h-4" />Błąd połączenia
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Klucz API jest używany do synchronizacji danych z platformy Bmeters. W trybie demo używana jest symulacja.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Engine */}
        <TabsContent value="validation" className="space-y-4 mt-4">
          <Card className="border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Walidacja przed synchronizacją</CardTitle>
                <Button onClick={handleValidate} disabled={validating} size="sm">
                  {validating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                  Uruchom walidację
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {validationResults.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Uruchom walidację, aby sprawdzić poprawność danych przed synchronizacją.
                </p>
              ) : (
                <div className="space-y-3">
                  {validationResults.map(r => (
                    <div key={r.budynek_id} className={`rounded-md border px-4 py-3 ${r.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <div className="flex items-center gap-2">
                        {r.valid
                          ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                          : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                        <span className="font-medium text-sm">{r.nazwa}</span>
                        <span className="text-xs text-muted-foreground">{r.adres}</span>
                        {r.valid
                          ? <Badge className="ml-auto text-xs bg-green-100 text-green-800">Gotowy</Badge>
                          : <Badge className="ml-auto text-xs bg-red-100 text-red-800">Błędy: {r.errors.length}</Badge>}
                      </div>
                      {r.errors.length > 0 && (
                        <ul className="mt-2 ml-6 space-y-0.5">
                          {r.errors.map((e, i) => (
                            <li key={i} className="text-xs text-red-700">• {e}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mock Import */}
        <TabsContent value="import" className="space-y-4 mt-4">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Symulacja importu danych</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-sm text-amber-800">
                Tryb demo: generuje realistyczne odczyty dla wszystkich zarejestrowanych punktów pomiarowych.
              </div>
              <div className="space-y-1.5">
                <Label>Zakres danych (dni wstecz)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={importDays}
                    onChange={e => setImportDays(e.target.value)}
                    className="w-28"
                  />
                  <span className="text-sm text-muted-foreground">dni</span>
                </div>
              </div>
              <Button onClick={handleMockImport} disabled={importing} className="w-full sm:w-auto">
                {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Symuluj import
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Logs */}
        <TabsContent value="logs" className="mt-4">
          <Card className="border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Historia synchronizacji</CardTitle>
                <Button size="sm" variant="ghost" onClick={fetchLogs}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : syncLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Brak historii synchronizacji</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Data</th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-right py-2 pr-4 font-medium text-muted-foreground">Budynki</th>
                        <th className="text-right py-2 pr-4 font-medium text-muted-foreground">Rekordy</th>
                        <th className="text-right py-2 font-medium text-muted-foreground">Błędy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {syncLogs.map(log => {
                        const sc = STATUS_CONFIG[log.status] || STATUS_CONFIG.failed;
                        return (
                          <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="py-2.5 pr-4 text-muted-foreground flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: pl })}
                            </td>
                            <td className="py-2.5 pr-4">
                              <Badge className={`text-xs ${sc.cls}`}>{sc.label}</Badge>
                            </td>
                            <td className="py-2.5 pr-4 text-right">{log.budynki_count}</td>
                            <td className="py-2.5 pr-4 text-right text-green-700 font-medium">{log.rekordy_count}</td>
                            <td className="py-2.5 text-right text-red-600">{log.bledy_count}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
