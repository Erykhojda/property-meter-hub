import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MediaIcon } from '@/components/MediaIcon';
import { Gauge, Plus, Trash2, Loader2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Lokal { id: string; numer: string; budynek_id: string; budynki?: { nazwa: string } | null; }
interface Miernik { id: string; device_id: string; typ: 'woda' | 'cieplo' | 'energia'; nazwa: string | null; data_instalacji: string | null; status: string; last_sync_at: string | null; lokal_id: string; lokale?: { numer: string; budynki?: { nazwa: string } | null } | null; }

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  active: { label: 'Aktywny', cls: 'bg-green-100 text-green-800' },
  inactive: { label: 'Nieaktywny', cls: 'bg-gray-100 text-gray-700' },
  error: { label: 'Błąd', cls: 'bg-red-100 text-red-800' },
};

export default function Urzadzenia() {
  const { toast } = useToast();
  const [mierniki, setMierniki] = useState<Miernik[]>([]);
  const [lokale, setLokale] = useState<Lokal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterLokal, setFilterLokal] = useState('all');
  const [form, setForm] = useState({ device_id: '', typ: 'woda', nazwa: '', data_instalacji: '', lokal_id: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [mRes, lRes] = await Promise.all([
      supabase.from('mierniki')
        .select('*, lokale(numer, budynki(nazwa))')
        .order('created_at', { ascending: false }),
      supabase.from('lokale')
        .select('id, numer, budynek_id, budynki(nazwa)')
        .order('numer'),
    ]);
    setMierniki(mRes.data as Miernik[] || []);
    setLokale(lRes.data as Lokal[] || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!form.device_id || !form.lokal_id) {
      toast({ title: 'Uzupełnij wymagane pola', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('mierniki').insert({
      device_id: form.device_id,
      typ: form.typ as 'woda' | 'cieplo' | 'energia',
      nazwa: form.nazwa || null,
      data_instalacji: form.data_instalacji || null,
      lokal_id: form.lokal_id,
    });
    if (error) {
      toast({ title: 'Błąd', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Dodano miernik' });
      setDialogOpen(false);
      setForm({ device_id: '', typ: 'woda', nazwa: '', data_instalacji: '', lokal_id: '' });
      fetchData();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('mierniki').delete().eq('id', id);
    if (error) {
      toast({ title: 'Błąd', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Usunięto miernik' });
      fetchData();
    }
  };

  const filtered = filterLokal === 'all' ? mierniki : mierniki.filter(m => m.lokal_id === filterLokal);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Urządzenia</h1>
          <p className="text-muted-foreground text-sm">Rejestr mierników Bmeters</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />Dodaj miernik
        </Button>
      </div>

      {/* Filter */}
      <Select value={filterLokal} onValueChange={setFilterLokal}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Filtruj po lokalu" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Wszystkie lokale</SelectItem>
          {lokale.map(l => (
            <SelectItem key={l.id} value={l.id}>
              {l.budynki?.nazwa} — Lokal {l.numer}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {filtered.length === 0 ? (
        <Card className="border shadow-sm">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Gauge className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Brak mierników</p>
            <p className="text-sm mt-1">Dodaj urządzenia Bmeters do lokali</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID Urządzenia</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Typ</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Lokal</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Instalacja</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ostatni odczyt</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const s = STATUS_LABELS[m.status] || STATUS_LABELS.inactive;
                return (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-medium">{m.device_id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <MediaIcon type={m.typ} className="w-4 h-4" />
                        <span className="capitalize">{m.typ === 'cieplo' ? 'Ciepło' : m.typ === 'energia' ? 'Energia' : 'Woda'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs">
                        <div className="font-medium">{m.lokale?.budynki?.nazwa}</div>
                        <div className="text-muted-foreground">Lokal {m.lokale?.numer}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {m.data_instalacji ? format(new Date(m.data_instalacji), 'dd MMM yyyy', { locale: pl }) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {m.last_sync_at ? (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {format(new Date(m.last_sync_at), 'dd MMM yyyy HH:mm', { locale: pl })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={`text-xs ${s.cls}`}>{s.label}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Usuń miernik</AlertDialogTitle>
                            <AlertDialogDescription>Usunąć miernik {m.device_id}? To usunie wszystkie odczyty.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Anuluj</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(m.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Usuń</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Meter Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Dodaj miernik</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>ID urządzenia Bmeters *</Label>
              <Input placeholder="np. BM-12345678" value={form.device_id} onChange={e => setForm(f => ({ ...f, device_id: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Typ medium *</Label>
              <Select value={form.typ} onValueChange={v => setForm(f => ({ ...f, typ: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="woda">Woda</SelectItem>
                  <SelectItem value="cieplo">Ciepło</SelectItem>
                  <SelectItem value="energia">Energia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Lokal *</Label>
              <Select value={form.lokal_id} onValueChange={v => setForm(f => ({ ...f, lokal_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Wybierz lokal" /></SelectTrigger>
                <SelectContent>
                  {lokale.map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.budynki?.nazwa} — Lokal {l.numer}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Nazwa (opcjonalna)</Label>
              <Input placeholder="np. Wodomierz pion A" value={form.nazwa} onChange={e => setForm(f => ({ ...f, nazwa: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Data instalacji</Label>
              <Input type="date" value={form.data_instalacji} onChange={e => setForm(f => ({ ...f, data_instalacji: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Anuluj</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Dodaj miernik
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
