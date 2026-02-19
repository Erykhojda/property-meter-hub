import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

type Quality = 'validated' | 'estimated' | 'missing';

export function DataQualityBadge({ quality }: { quality: Quality }) {
  const configs = {
    validated: {
      label: 'Zweryfikowane',
      icon: CheckCircle2,
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    estimated: {
      label: 'Szacowane',
      icon: AlertCircle,
      className: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    missing: {
      label: 'Brak danych',
      icon: XCircle,
      className: 'bg-red-100 text-red-800 border-red-200',
    },
  };
  const { label, icon: Icon, className } = configs[quality];
  return (
    <Badge variant="outline" className={`gap-1 text-xs font-medium ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}
