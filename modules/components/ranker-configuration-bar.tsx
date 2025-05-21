'use client';

import {
  SidebarTrigger,
  useSidebar,
} from '@/modules/core/components/ui/sidebar';
import { cn } from '@/modules/core/lib/utils';
import Image from 'next/image';
import RankTrackerConfiguration from './rank-tracker-configuration';
import RankTrackerSearchParamsWrapper from './rank-tracker-searchparams-wrapper';

import DatePicker from '@/modules/analytics/components/date-picker';
import { useRankTrackerStore } from '@/modules/analytics/store';
import useStore from '@/modules/core/hooks/useStore';
import { Domain } from '../types';

interface RankerConfigurationBarProps {
  domains?: Domain[];
}

export default function RankerConfigurationBar({
  domains = [],
}: RankerConfigurationBarProps) {
  const { open } = useSidebar();

  const compareType = useStore(
    useRankTrackerStore,
    (state) => state.compareType,
  );
  const changeCompareType = useRankTrackerStore(
    (state) => state.changeCompareType,
  );

  return (
    <section
      className={cn(
        'ignore z-10 rounded-t-xl border-b border-b-black/10 bg-white transition-all duration-200 ease-linear lg:sticky lg:right-2 lg:top-0',
        open ? 'lg:left-[294px]' : 'lg:left-2',
      )}
    >
      <div className="mx-auto flex w-full max-w-9xl flex-col justify-between gap-4 px-4 py-3 md:px-6 xl:flex-row xl:items-center">
        <div className="flex gap-4">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <Image
              src="/images/icons/chart-bar.svg"
              alt="Rank tracker ikon"
              width={20}
              height={20}
              className="text-black"
            />
            <h2 className="font-medium">Rank Tracker</h2>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-end gap-4 md:flex-row md:items-center">
          <RankTrackerSearchParamsWrapper domains={domains}>
            <RankTrackerConfiguration domains={domains} />
          </RankTrackerSearchParamsWrapper>
          <DatePicker
            compareType={compareType}
            changeCompareType={changeCompareType}
          />
        </div>
      </div>
    </section>
  );
}
