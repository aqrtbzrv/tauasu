
import React from 'react';
import { useStore } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Zone, ZoneType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';

interface ZoneSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectZone: (zoneId: string) => void;
  selectedZoneId: string;
  availableZones: Zone[];
  isCustomZoneSelected: boolean;
}

const ZoneSelectionDialog = ({
  isOpen,
  onClose,
  onSelectZone,
  selectedZoneId,
  availableZones,
  isCustomZoneSelected
}: ZoneSelectionDialogProps) => {
  const selectedZoneType = useStore((state) => state.selectedZoneType);
  const setSelectedZoneType = useStore((state) => state.setSelectedZoneType);

  const zoneTypes: (ZoneType | 'all')[] = [
    'all',
    'Юрты',
    'Глэмпинг',
    'Беседки',
    'Хан-Шатыр',
    'Летний двор',
    'Террасы',
    'Тапчаны',
    'VIP беседка'
  ];

  const getDisplayName = (type: ZoneType | 'all') => {
    if (type === 'all') return 'Все зоны';
    return type;
  };

  const filteredZones = selectedZoneType === 'all' 
    ? availableZones 
    : availableZones.filter(zone => zone.type === selectedZoneType);

  const handleSelectZone = (zoneId: string) => {
    onSelectZone(zoneId);
    onClose();
  };

  const handleSelectCustomZone = () => {
    onSelectZone('other');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] w-[calc(100%-2rem)] mx-auto max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Выберите зону
          </DialogTitle>
        </DialogHeader>
        
        <div className="mb-6 overflow-x-auto py-2">
          <div className="flex space-x-2 min-w-max">
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
        </div>
        
        {filteredZones.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            Нет доступных зон данного типа на выбранную дату
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredZones.map((zone) => (
              <Button
                key={zone.id}
                variant="outline"
                className={cn(
                  "h-auto py-4 px-4 justify-between font-normal text-left",
                  selectedZoneId === zone.id && "border-2 border-primary"
                )}
                onClick={() => handleSelectZone(zone.id)}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{zone.name}</span>
                  <span className="text-xs text-muted-foreground">{zone.type}</span>
                </div>
                {selectedZoneId === zone.id && <CheckIcon className="h-4 w-4 text-primary" />}
              </Button>
            ))}
          </div>
        )}
        
        <div className="mt-6 border-t pt-4">
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between h-auto py-4",
              isCustomZoneSelected && "border-2 border-primary"
            )}
            onClick={handleSelectCustomZone}
          >
            <span className="font-medium">Другая зона (нет в списке)</span>
            {isCustomZoneSelected && <CheckIcon className="h-4 w-4 text-primary" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ZoneSelectionDialog;
