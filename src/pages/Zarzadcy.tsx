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
import { Users, Plus, Trash2, Building2, Calendar, Loader2, UserCheck } from 'lucide-react';

interface Profile { id: string; email: string | null; full_name: string | null; }
interface Budynek { id: string; nazwa: string; adres: string; }
interface Assignment { id: string; zarzadca_user_id: string; budynek_id: string; data_od: string; data_do: string | null; budynki: { nazwa: string; adres: string } | null; }
interface ZarzadcaUser extends Profile { assignments: Assignment[]; }

export default function Zarzadcy() {
  const { toast } = useToast();
  const [zarzadcy, setZarzadcy] = useState<ZarzadcaUser[]>([]);
  const [budynki, setBudynki] = useState<Budynek[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialog, setAssignDialog] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', full_name: '', password: '' });
  const [assignForm, setAssignForm] = useState({ budynek_id: '', data_od: new Date().toISOString().slice(0, 10), data_do: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [profilesRes, assignRes, budRes] = await Promise.all([
      supabase.from('user_roles').select('user_id, profiles!user_roles_user_id_fkey(id, email, full_name)').eq('role', 'zarzadca'),
      supabase.from('zarzadca_budynek').select('id, zarzadca_user_id, budynek_id, data_od, data_do, budynki(nazwa, adres)'),
      supabase.from('budynki').select('id, nazwa, adres').order('nazwa'),
    ]);

    const profiles: ZarzadcaUser[] = (profilesRes.data || []).map((r: any) => ({
      id: r.profiles?.id || r.user_id,
      email: r.profiles?.email || '',
      full_name: r.profiles?.full_name || '',
      assignments: (assignRes.data || []).filter((a: any) => a.zarzadca_user_id === r.user_id),
    }));

    setZarzadcy(profiles);
    setBudynki(budRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateZarzadca = async () => {
    setSaving(true);
    const { data, error } = await supabase.auth.admin?.createUser
      ? { data: null, error: { message: 'Użyj rejestracji i ręcznie przypisz rolę zarządcy.' } }
      : { data: null, error: { message: 'Użytkownik musi się zarejestrować.' } };

    toast({
      title: 'Informacja',
      description: 'Poproś użytkownika o rejestrację przez formularz logowania, a następnie ręcznie przypisz mu rolę "zarządca" w bazie danych.',
    });
    setDialogOpen(false);
    setSaving(false);
  };

  const handleAssignBuilding = async () => {
    if (!assignDialog || !assignForm.budynek_id) return;
    setSaving(true);
    const { error } = await supabase.from('zarzadca_budynek').insert({
      zarzadca_user_id: assignDialog,
      budynek_id: assignForm.budynek_id,
      data_od: assignForm.data_od,
      data_do: assignForm.data_do || null,
    });
    if (error) {
      toast({ title: 'Błąd', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Przypisano budynek' });
      setAssignDialog(null);
      fetchData();
    }
    setSaving(false);
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    const { error } = await supabase.from('zarzadca_budynek').delete().eq('id', assignmentId);
    if (error) {
      toast({ title: 'Błąd', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Usunięto przypisanie' });
      fetchData();
    }
  };

  const handleAssignRole = async (userId: string) => {
    const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'zarzadca' });
    if (error) {
      toast({ title: 'Błąd', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Przypisano rolę zarządcy' });
      fetchData();
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Zarządcy</h1>
          <p className="text-muted-foreground text-sm">Zarządzaj kontami zarządców i przypisaniami do budynków</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />Dodaj zarządcę
        </Button>
      </div>

      {zarzadcy.length === 0 ? (
        <Card className="border shadow-sm">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Brak zarządców</p>
            <p className="text-sm mt-1">Przypisz rolę zarządcy istniejącemu użytkownikowi</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {zarzadcy.map(z => (
            <Card key={z.id} className="border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{z.full_name || z.email}</div>
                      <div className="text-sm text-muted-foreground">{z.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Zarządca</Badge>
                    <Button size="sm" variant="outline" onClick={() => setAssignDialog(z.id)}>
                      <Building2 className="w-3.5 h-3.5 mr-1.5" />Przypisz budynek
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {z.assignments.length > 0 && (
                <CardContent>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Przypisane budynki</p>
                  <div className="space-y-2">
                    {z.assignments.map(a => (
                      <div key={a.id} className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50 text-sm">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium">{a.budynki?.nazwa}</span>
                          <span className="text-muted-foreground">{a.budynki?.adres}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            od {a.data_od}{a.data_do ? ` do ${a.data_do}` : ''}
                          </span>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:text-destructive">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Usuń przypisanie</AlertDialogTitle>
                                <AlertDialogDescription>Usunąć przypisanie budynku {a.budynki?.nazwa}?</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveAssignment(a.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Usuń</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Info dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Dodaj zarządcę</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Aby dodać zarządcę, użytkownik musi najpierw się zarejestrować przez formularz logowania.
              Następnie możesz przypisać mu rolę zarządcy poniżej.
            </p>
            <div className="space-y-1.5">
              <Label>ID użytkownika (z bazy danych)</Label>
              <Input placeholder="uuid użytkownika..." value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Anuluj</Button>
              <Button onClick={() => { handleAssignRole(form.email); setDialogOpen(false); }} disabled={!form.email}>
                Przypisz rolę zarządcy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign building dialog */}
      <Dialog open={!!assignDialog} onOpenChange={open => !open && setAssignDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Przypisz budynek</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Budynek *</Label>
              <Select value={assignForm.budynek_id} onValueChange={v => setAssignForm(f => ({ ...f, budynek_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz budynek" />
                </SelectTrigger>
                <SelectContent>
                  {budynki.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.nazwa} — {b.adres}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data od *</Label>
                <Input type="date" value={assignForm.data_od} onChange={e => setAssignForm(f => ({ ...f, data_od: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Data do</Label>
                <Input type="date" value={assignForm.data_do} onChange={e => setAssignForm(f => ({ ...f, data_do: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAssignDialog(null)}>Anuluj</Button>
              <Button onClick={handleAssignBuilding} disabled={saving || !assignForm.budynek_id}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Przypisz
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
