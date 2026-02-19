import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Building2, ChevronRight, Plus, Pencil, Trash2, Home, MapPin, Loader2 } from 'lucide-react';

interface Inwestor { id: string; nazwa: string; nip?: string; adres?: string; }
interface Inwestycja { id: string; nazwa: string; inwestor_id: string; }
interface Budynek { id: string; nazwa: string; adres: string; miasto?: string; inwestycja_id: string; }
interface Lokal { id: string; numer: string; pietro?: number; powierzchnia?: number; budynek_id: string; }

export default function Struktura() {
  const { toast } = useToast();
  const [inwestorzy, setInwestorzy] = useState<Inwestor[]>([]);
  const [inwestycje, setInwestycje] = useState<Inwestycja[]>([]);
  const [budynki, setBudynki] = useState<Budynek[]>([]);
  const [lokale, setLokale] = useState<Lokal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInwestor, setSelectedInwestor] = useState<string | null>(null);
  const [selectedInwestycja, setSelectedInwestycja] = useState<string | null>(null);
  const [selectedBudynek, setSelectedBudynek] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [inv, inw, bud, lok] = await Promise.all([
      supabase.from('inwestorzy').select('*').order('nazwa'),
      supabase.from('inwestycje').select('*').order('nazwa'),
      supabase.from('budynki').select('*').order('nazwa'),
      supabase.from('lokale').select('*').order('numer'),
    ]);
    setInwestorzy(inv.data || []);
    setInwestycje(inw.data || []);
    setBudynki(bud.data || []);
    setLokale(lok.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openDialog = (type: string, parent?: string, item?: any) => {
    setDialogOpen(type);
    setEditItem(item || null);
    const defaults: Record<string, Record<string, string>> = {
      inwestor: { nazwa: '', nip: '', adres: '' },
      inwestycja: { nazwa: '', inwestor_id: parent || '' },
      budynek: { nazwa: '', adres: '', miasto: '', inwestycja_id: parent || '' },
      lokal: { numer: '', pietro: '0', powierzchnia: '', budynek_id: parent || '' },
    };
    setForm(item ? { ...defaults[type], ...item } : defaults[type]);
  };

  const handleSave = async () => {
    setSaving(true);
    const tables: Record<string, string> = {
      inwestor: 'inwestorzy', inwestycja: 'inwestycje', budynek: 'budynki', lokal: 'lokale'
    };
    const table = tables[dialogOpen!];
    const { error } = editItem
      ? await supabase.from(table as any).update(form).eq('id', editItem.id)
      : await supabase.from(table as any).insert(form);
    if (error) {
      toast({ title: 'Błąd', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Zapisano', description: 'Dane zostały zaktualizowane.' });
      setDialogOpen(null);
      fetchAll();
    }
    setSaving(false);
  };

  const handleDelete = async (table: string, id: string) => {
    const tables: Record<string, string> = {
      inwestor: 'inwestorzy', inwestycja: 'inwestycje', budynek: 'budynki', lokal: 'lokale'
    };
    const { error } = await supabase.from(tables[table] as any).delete().eq('id', id);
    if (error) {
      toast({ title: 'Błąd', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Usunięto' });
      fetchAll();
    }
  };

  const filteredInwestycje = inwestycje.filter(i => i.inwestor_id === selectedInwestor);
  const filteredBudynki = budynki.filter(b => b.inwestycja_id === selectedInwestycja);
  const filteredLokale = lokale.filter(l => l.budynek_id === selectedBudynek);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Struktura</h1>
          <p className="text-muted-foreground text-sm">Hierarchia: Inwestor → Inwestycja → Budynek → Lokal</p>
        </div>
      </div>

      {/* Breadcrumb */}
      {(selectedInwestor || selectedInwestycja || selectedBudynek) && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
          <button onClick={() => { setSelectedInwestor(null); setSelectedInwestycja(null); setSelectedBudynek(null); }}
            className="hover:text-foreground transition-colors">Inwestorzy</button>
          {selectedInwestor && <>
            <ChevronRight className="w-3 h-3" />
            <button onClick={() => { setSelectedInwestycja(null); setSelectedBudynek(null); }}
              className="hover:text-foreground transition-colors font-medium text-foreground">
              {inwestorzy.find(i => i.id === selectedInwestor)?.nazwa}
            </button>
          </>}
          {selectedInwestycja && <>
            <ChevronRight className="w-3 h-3" />
            <button onClick={() => setSelectedBudynek(null)}
              className="hover:text-foreground transition-colors font-medium text-foreground">
              {inwestycje.find(i => i.id === selectedInwestycja)?.nazwa}
            </button>
          </>}
          {selectedBudynek && <>
            <ChevronRight className="w-3 h-3" />
            <span className="font-medium text-foreground">{budynki.find(b => b.id === selectedBudynek)?.nazwa}</span>
          </>}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Inwestorzy */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Inwestorzy</CardTitle>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openDialog('inwestor')}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {inwestorzy.length === 0 && <p className="text-xs text-muted-foreground py-2">Brak inwestorów</p>}
            {inwestorzy.map(inv => (
              <div key={inv.id}
                className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer group transition-colors ${selectedInwestor === inv.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
                onClick={() => { setSelectedInwestor(inv.id); setSelectedInwestycja(null); setSelectedBudynek(null); }}>
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-sm truncate">{inv.nazwa}</span>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={e => { e.stopPropagation(); openDialog('inwestor', undefined, inv); }}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:text-destructive" onClick={e => e.stopPropagation()}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Usuń inwestora</AlertDialogTitle>
                        <AlertDialogDescription>Czy na pewno chcesz usunąć {inv.nazwa}? To usunie wszystkie powiązane dane.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete('inwestor', inv.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Usuń</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Inwestycje */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Inwestycje</CardTitle>
              {selectedInwestor && (
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openDialog('inwestycja', selectedInwestor)}>
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {!selectedInwestor && <p className="text-xs text-muted-foreground py-2">Wybierz inwestora</p>}
            {selectedInwestor && filteredInwestycje.length === 0 && <p className="text-xs text-muted-foreground py-2">Brak inwestycji</p>}
            {filteredInwestycje.map(inw => (
              <div key={inw.id}
                className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer group transition-colors ${selectedInwestycja === inw.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
                onClick={() => { setSelectedInwestycja(inw.id); setSelectedBudynek(null); }}>
                <span className="text-sm truncate">{inw.nazwa}</span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={e => { e.stopPropagation(); openDialog('inwestycja', undefined, inw); }}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:text-destructive" onClick={e => e.stopPropagation()}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Usuń inwestycję</AlertDialogTitle>
                        <AlertDialogDescription>Czy na pewno chcesz usunąć {inw.nazwa}?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete('inwestycja', inw.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Usuń</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Budynki */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Budynki</CardTitle>
              {selectedInwestycja && (
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openDialog('budynek', selectedInwestycja)}>
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {!selectedInwestycja && <p className="text-xs text-muted-foreground py-2">Wybierz inwestycję</p>}
            {selectedInwestycja && filteredBudynki.length === 0 && <p className="text-xs text-muted-foreground py-2">Brak budynków</p>}
            {filteredBudynki.map(bud => (
              <div key={bud.id}
                className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer group transition-colors ${selectedBudynek === bud.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
                onClick={() => setSelectedBudynek(bud.id)}>
                <div className="min-w-0">
                  <div className="text-sm truncate font-medium">{bud.nazwa}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />{bud.adres}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={e => { e.stopPropagation(); openDialog('budynek', undefined, bud); }}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:text-destructive" onClick={e => e.stopPropagation()}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Usuń budynek</AlertDialogTitle>
                        <AlertDialogDescription>Czy na pewno chcesz usunąć {bud.nazwa}?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete('budynek', bud.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Usuń</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Lokale */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Lokale</CardTitle>
              {selectedBudynek && (
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openDialog('lokal', selectedBudynek)}>
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {!selectedBudynek && <p className="text-xs text-muted-foreground py-2">Wybierz budynek</p>}
            {selectedBudynek && filteredLokale.length === 0 && <p className="text-xs text-muted-foreground py-2">Brak lokali</p>}
            {filteredLokale.map(lok => (
              <div key={lok.id}
                className="flex items-center justify-between px-2 py-1.5 rounded-md group hover:bg-muted transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <Home className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <div className="text-sm">Lokal {lok.numer}</div>
                    {lok.powierzchnia && <div className="text-xs text-muted-foreground">{lok.powierzchnia} m²</div>}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => openDialog('lokal', undefined, lok)}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Usuń lokal</AlertDialogTitle>
                        <AlertDialogDescription>Usuń lokal {lok.numer}?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete('lokal', lok.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Usuń</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <Dialog open={!!dialogOpen} onOpenChange={open => !open && setDialogOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editItem ? 'Edytuj' : 'Dodaj'}{' '}
              {{ inwestor: 'inwestora', inwestycja: 'inwestycję', budynek: 'budynek', lokal: 'lokal' }[dialogOpen!]}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {dialogOpen === 'inwestor' && <>
              <div className="space-y-1.5">
                <Label>Nazwa *</Label>
                <Input value={form.nazwa || ''} onChange={e => setForm(f => ({ ...f, nazwa: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>NIP</Label>
                <Input value={form.nip || ''} onChange={e => setForm(f => ({ ...f, nip: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Adres</Label>
                <Input value={form.adres || ''} onChange={e => setForm(f => ({ ...f, adres: e.target.value }))} />
              </div>
            </>}
            {dialogOpen === 'inwestycja' && <>
              <div className="space-y-1.5">
                <Label>Nazwa *</Label>
                <Input value={form.nazwa || ''} onChange={e => setForm(f => ({ ...f, nazwa: e.target.value }))} />
              </div>
            </>}
            {dialogOpen === 'budynek' && <>
              <div className="space-y-1.5">
                <Label>Nazwa *</Label>
                <Input value={form.nazwa || ''} onChange={e => setForm(f => ({ ...f, nazwa: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Adres *</Label>
                <Input value={form.adres || ''} onChange={e => setForm(f => ({ ...f, adres: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Miasto</Label>
                <Input value={form.miasto || ''} onChange={e => setForm(f => ({ ...f, miasto: e.target.value }))} />
              </div>
            </>}
            {dialogOpen === 'lokal' && <>
              <div className="space-y-1.5">
                <Label>Numer lokalu *</Label>
                <Input value={form.numer || ''} onChange={e => setForm(f => ({ ...f, numer: e.target.value }))} placeholder="np. 1A, 2B" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Piętro</Label>
                  <Input type="number" value={form.pietro || '0'} onChange={e => setForm(f => ({ ...f, pietro: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Powierzchnia (m²)</Label>
                  <Input type="number" step="0.01" value={form.powierzchnia || ''} onChange={e => setForm(f => ({ ...f, powierzchnia: e.target.value }))} />
                </div>
              </div>
            </>}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(null)}>Anuluj</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editItem ? 'Zapisz zmiany' : 'Dodaj'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
