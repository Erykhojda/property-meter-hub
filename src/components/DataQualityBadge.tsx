import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DataQuality } from "@/data/mock-data";

const config: Record<DataQuality, { label: string; icon: typeof CheckCircle2; className: string }> = {
  validated: { label: "Zweryfikowane", icon: CheckCircle2, className: "bg-success/10 text-success border-success/20" },
  estimated: { label: "Oszacowane", icon: AlertTriangle, className: "bg-warning/10 text-warning border-warning/20" },
  missing: { label: "Brak", icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export function DataQualityBadge({ quality }: { quality: DataQuality }) {
  const c = config[quality];
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={`gap-1 text-xs ${c.className}`}>
      <Icon className="h-3 w-3" />
      {c.label}
    </Badge>
  );
}
