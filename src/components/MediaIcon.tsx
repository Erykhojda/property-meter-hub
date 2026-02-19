import { Droplets, Flame, Zap } from 'lucide-react';

type MediaType = 'woda' | 'cieplo' | 'energia';

const configs: Record<MediaType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; unit: string }> = {
  woda: { label: 'Woda', icon: Droplets, color: 'text-sky-500', unit: 'm³' },
  cieplo: { label: 'Ciepło', icon: Flame, color: 'text-orange-500', unit: 'GJ' },
  energia: { label: 'Energia', icon: Zap, color: 'text-violet-500', unit: 'kWh' },
};

export function MediaIcon({ type, className }: { type: MediaType; className?: string }) {
  const { icon: Icon, color } = configs[type];
  return <Icon className={`${color} ${className ?? 'w-4 h-4'}`} />;
}

export function getMediaConfig(type: MediaType) {
  return configs[type];
}
