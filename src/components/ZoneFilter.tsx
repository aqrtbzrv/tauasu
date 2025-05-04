
import React from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ZoneType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const ZoneFilter = () => {
  const selectedZoneType = useStore((state) => state.selectedZoneType);
  const setSelectedZoneType = useStore((state) => state.setSelectedZoneType);

  // Updated to ensure all zone types match the ZoneType type
  const zoneTypes: (ZoneType | 'all')[] = [
    'all',
    'Юрты',
    'Глэмпинг',
    'Беседки',
    'Хан-Шатыр',
    'Летний двор',
    'Террасы',
    'Тапчаны',
    'ВИП беседка 1',
    'ВИП беседка 2',
    'ВИП беседка 3',
  ];

  const getDisplayName = (type: ZoneType | 'all') => {
    if (type === 'all') return 'Все зоны';
    return type;
  };

  return (
    <div className="mb-6 overflow-x-auto py-2">
      <ScrollArea className="w-full">
        <div className="flex space-x-2 min-w-max px-1">
          {zoneTypes.map((type) => (
            <Button
              key={type}
              variant={selectedZoneType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedZoneType(type)}
              className={cn(
                "whitespace-nowrap transition-all",
                selectedZoneType === type && "animate-scale-in"
              )}
            >
              {getDisplayName(type)}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ZoneFilter;
