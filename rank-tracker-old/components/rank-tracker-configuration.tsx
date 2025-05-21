'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { useRankTrackerStore } from '@/modules/analytics/store';
import { Button } from '@/modules/core/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/modules/core/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/modules/core/components/ui/popover';
import { cn } from '@/modules/core/lib/utils';
import { usePathname } from 'next/navigation';
import { Domain } from '../types/index';

interface RankTrackerConfigurationProps {
  domains: Domain[];
}

export default function RankTrackerConfiguration({
  domains,
}: RankTrackerConfigurationProps) {
  const currentPath = usePathname();
  const [open, setOpen] = useState(false);

  const domain = useRankTrackerStore((state) => state.property);
  const changeDomain = useRankTrackerStore((state) => state.changeProperty);

  const handleDomainChange = (domainId: string) => {
    if (!domainId || !domains?.some((domain) => domain.id === domainId)) return;
    changeDomain(domainId);
    setOpen(false);
  };

  if (currentPath === '/tool/rank-tracker-old') {
    return null;
  }

  const selectedDomain = domains.find((d) => String(d.id) === String(domain));

  // Helper function to get keyword count from domain
  const getKeywordCount = (d: any) => {
    // Try different possible property names
    return d.total_keywords || d.keywords_count || '';
  };

  return (
    <div className="flex flex-1 flex-col justify-between gap-4 md:flex-row md:items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-10 w-full justify-between md:max-w-[300px]"
          >
            <div className="w-[calc(100%-24px)] truncate text-left">
              {selectedDomain ? (
                <div className="flex flex-col">
                  <span className="font-medium">
                    {selectedDomain.display_name}
                  </span>
                  {getKeywordCount(selectedDomain) && (
                    <span className="text-xs text-black/50">
                      {getKeywordCount(selectedDomain)} nøgleord
                    </span>
                  )}
                </div>
              ) : (
                'Vælg domæne...'
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Søg efter domæne..." />
            <CommandEmpty>Fandt ingen domæner.</CommandEmpty>
            <CommandGroup className="max-h-[400px] overflow-auto">
              {domains?.map((domainItem) => (
                <CommandItem
                  key={domainItem.id}
                  value={domainItem.id}
                  onSelect={() => handleDomainChange(domainItem.id || '')}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 min-w-4 max-w-4',
                      selectedDomain?.id === domainItem.id
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="truncate">{domainItem.display_name}</span>
                    {getKeywordCount(domainItem) && (
                      <span className="truncate text-xs text-black/50">
                        {getKeywordCount(domainItem)}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
