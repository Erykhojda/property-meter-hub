import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataQualityBadge } from '@/components/DataQualityBadge';
import { getMediaConfig } from '@/components/MediaIcon';
import { Building2, Home, Droplets, Flame, Zap, Loader2 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { format, subDays } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Building { id: string; nazwa: string; adres: string; }
interface Lokal { id: string; numer: string; powierzchnia: number | null; }

type MediaTyp = 'woda' | 'cieplo' | 'energia';

interface ConsumptionCard {
  typ: MediaTyp;
  value: number;
  unit: string;
  trend: number;
}

function getMediaBg(typ: MediaTyp) {
  if (typ === 'woda') return 'bg-sky-100';
  if (typ === 'cieplo') return 'bg-orange-100';
  return 'bg-violet-100';
}

export default function Dashboard() {
  const [budynki, setBudynki] = useState<Building[]>([]);
  const [selectedBudynek, setSelectedBudynek] = useState<string>('');
  const [lokale, setLokale] = useState<Lokal[]>([]);
  const [selectedLokal, setSelectedLokal] = useState<string>('');
  const [dateRange, setDateRange] = useState('30');
  const [cards, setCards] = useState<ConsumptionCard[]>([]);
  const [chartData, setChartData] = useState<Record<string, string | number>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudynki = async () => {
      const { data } = await supabase.from('budynki').select('id, nazwa, adres').order('nazwa');
      if (data) {
        setBudynki(data);
        if (data.length > 0) setSelectedBudynek(data[0].id);
      }
      setLoading(false);
    };
    fetchBudynki();
  }, []);

  useEffect(() => {
    if (!selectedBudynek) return;
    const fetchLokale = async () => {
      const { data } = await supabase
        .from('lokale')
        .select('id, numer, powierzchnia')
        .eq('budynek_id', selectedBudynek)
        .order('numer');
      if (data) {
        setLokale(data);
        setSelectedLokal('');
      }
    };
    fetchLokale();
    // Mock building-level consumption cards
    setCards([
      { typ: 'woda', value: 1247.5, unit: 'm³', trend: -3.2 },
      { typ: 'cieplo', value: 89.3, unit: 'GJ', trend: 12.1 },
      { typ: 'energia', value: 4832.0, unit: 'kWh', trend: -1.5 },
    ]);
  }, [selectedBudynek, dateRange]);

  useEffect(() => {
    if (!selectedLokal) { setChartData([]); return; }
    const days = parseInt(dateRange);
    const mockData = Array.from({ length: Math.min(days, 30) }, (_, i) => {
      const d = subDays(new Date(), Math.min(days, 30) - 1 - i);
      return {
        date: format(d, 'dd MMM', { locale: pl }),
        woda: parseFloat((Math.random() * 5 + 10).toFixed(2)),
        cieplo: parseFloat((Math.random() * 2 + 2).toFixed(2)),
        energia: parseFloat((Math.random() * 20 + 80).toFixed(2)),
      };
    });
    setChartData(mockData);
  }, [selectedLokal, dateRange]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  const qualityVariants = ['validated', 'estimated', 'missing'] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Przegląd zużycia mediów w budynkach</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <Select value={selectedBudynek} onValueChange={setSelectedBudynek}>
          <SelectTrigger className="w-64">
            <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Wybierz budynek" />
          </SelectTrigger>
          <SelectContent>
            {budynki.map(b => (
              <SelectItem key={b.id} value={b.id}>{b.nazwa} — {b.adres}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Ostatnie 7 dni</SelectItem>
            <SelectItem value="30">Ostatnie 30 dni</SelectItem>
            <SelectItem value="90">Ostatnie 90 dni</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />Zweryfikowane</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />Szacowane</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" />Brak danych</span>
      </div>

      {/* Consumption Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(card => {
          const cfg = getMediaConfig(card.typ);
          const Icon = cfg.icon;
          const isUp = card.trend > 0;
          return (
            <Card key={card.typ} className="border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{cfg.label}</CardTitle>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getMediaBg(card.typ)}`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {card.value.toLocaleString('pl-PL')}{' '}
                  <span className="text-sm font-normal text-muted-foreground">{card.unit}</span>
                </div>
                <div className={`text-xs mt-1 ${isUp ? 'text-red-500' : 'text-green-600'}`}>
                  {isUp ? '▲' : '▼'} {Math.abs(card.trend).toFixed(1)}% vs poprzedni okres
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Apartments table */}
      {lokale.length > 0 && (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="w-4 h-4" />Lokale w budynku
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Lokal</th>
                    <th className="text-right py-2 pr-4 font-medium text-muted-foreground">Woda (m³)</th>
                    <th className="text-right py-2 pr-4 font-medium text-muted-foreground">Ciepło (GJ)</th>
                    <th className="text-right py-2 pr-4 font-medium text-muted-foreground">Energia (kWh)</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Jakość</th>
                  </tr>
                </thead>
                <tbody>
                  {lokale.map((lokal, i) => (
                    <tr
                      key={lokal.id}
                      className={`border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors ${selectedLokal === lokal.id ? 'bg-accent' : ''}`}
                      onClick={() => setSelectedLokal(lokal.id === selectedLokal ? '' : lokal.id)}
                    >
                      <td className="py-2.5 pr-4 font-medium">Lokal {lokal.numer}</td>
                      <td className="py-2.5 pr-4 text-right text-sky-600">{(Math.random() * 15 + 5).toFixed(2)}</td>
                      <td className="py-2.5 pr-4 text-right text-orange-600">{(Math.random() * 3 + 1).toFixed(2)}</td>
                      <td className="py-2.5 pr-4 text-right text-violet-600">{(Math.random() * 120 + 80).toFixed(0)}</td>
                      <td className="py-2.5">
                        <DataQualityBadge quality={qualityVariants[i % 3]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart for selected lokal */}
      {selectedLokal && chartData.length > 0 && (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              Zużycie mediów — Lokal {lokale.find(l => l.id === selectedLokal)?.numer}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="woda" name="Woda (m³)" stroke="hsl(199 89% 48%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="cieplo" name="Ciepło (GJ)" stroke="hsl(25 95% 53%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="energia" name="Energia (kWh)" stroke="hsl(262 83% 58%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {budynki.length === 0 && (
        <Card className="border shadow-sm">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Brak budynków</p>
            <p className="text-sm mt-1">Dodaj strukturę w module Struktura</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
