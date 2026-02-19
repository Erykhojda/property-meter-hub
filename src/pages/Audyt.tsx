import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Loader2, Clock, Search } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface AuditLog {
  id: string;
  user_id: string | null;
  akcja: string;
  encja: string;
  encja_id: string | null;
  szczegoly: Record<string, unknown> | null;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  INSERT: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  IMPORT_MOCK: 'bg-violet-100 text-violet-800',
  SYNC: 'bg-amber-100 text-amber-800',
};

export default function Audyt() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('audit_logi')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      setLogs((data || []) as AuditLog[]);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const actions = [...new Set(logs.map(l => l.akcja))];

  const filtered = logs.filter(l => {
    if (filterAction !== 'all' && l.akcja !== filterAction) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return l.encja.toLowerCase().includes(s) || l.akcja.toLowerCase().includes(s) || JSON.stringify(l.szczegoly).toLowerCase().includes(s);
    }
    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audyt</h1>
        <p className="text-muted-foreground text-sm">Dziennik zdarzeń systemowych (tylko odczyt)</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Szukaj..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Typ akcji" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie akcje</SelectItem>
            {actions.map(a => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            {filtered.length} zdarzeń
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Brak zdarzeń</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Data i godzina</th>
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Akcja</th>
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Encja</th>
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Szczegóły</th>
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Użytkownik</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(log => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-4 text-muted-foreground whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-xs">
                          <Clock className="w-3 h-3" />
                          {format(new Date(log.created_at), 'dd MMM yyyy, HH:mm:ss', { locale: pl })}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <Badge className={`text-xs ${ACTION_COLORS[log.akcja] || 'bg-gray-100 text-gray-700'}`}>
                          {log.akcja}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 font-medium">{log.encja}</td>
                      <td className="py-2.5 px-4 text-muted-foreground max-w-xs truncate text-xs font-mono">
                        {log.szczegoly ? JSON.stringify(log.szczegoly) : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-xs text-muted-foreground font-mono">
                        {log.user_id ? log.user_id.slice(0, 8) + '...' : 'system'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
