import { getDateRanges } from '@/modules/analytics/utils/helpers/getDateRanges';
import { getCurrentIntegrations } from '@/modules/auth/actions/auth.actions';
import Integrate from '@/modules/auth/components/integrate';
import { buttonVariants } from '@/modules/core/components/ui/button';
import { cn } from '@/modules/core/lib/utils';
import { createDomainsView } from '@/modules/rank-tracker-old/actions/ranker-views.actions';
import { DomainTable } from '@/modules/rank-tracker-old/components/domain/domain-table';
import { TableSkeleton } from '@/modules/rank-tracker-old/components/keywords/tables/table-skeleton';
import RankerActionBar from '@/modules/rank-tracker-old/components/ranker-action-bar';
import { domainColumns } from '@/modules/rank-tracker-old/constants';
import { DomainWithAnalytics } from '@/modules/rank-tracker-old/types/index';
import { processDomains } from '@/modules/rank-tracker-old/utils/proces-domains';
import { ColumnDef } from '@tanstack/react-table';
import { AlertCircle, Link } from 'lucide-react';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

type PageProps = {
  searchParams: Promise<{
    range?: string;
    rangeCompare?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;

  const key = `${sp?.range}-${sp?.rangeCompare}`;

  return (
    <Suspense
      key={key}
      fallback={
        <>
          <div className={cn('pointer-events-none select-none opacity-50')}>
            <RankerActionBar isLoading={true} />
          </div>
          <div className="mx-auto mb-16 max-w-9xl px-7">
            <TableSkeleton rows={10} showSearch={true} />
          </div>
        </>
      }
    >
      <Content searchParams={sp} />
    </Suspense>
  );
}

async function Content({
  searchParams,
}: {
  searchParams: Awaited<PageProps['searchParams']>;
}) {
  const { dateRanges } = getDateRanges({ searchParams });

  const [integrations, domains] = await Promise.all([
    getCurrentIntegrations(),
    createDomainsView(dateRanges),
  ]);

  const gscIntegration = integrations?.results?.find(
    (i) => i.platform === 'Google Search Console',
  );

  const isIntegrated =
    !!gscIntegration &&
    (gscIntegration.status_code === 200 || !gscIntegration.status_code);

  const processedDomains = await processDomains(domains, isIntegrated);

  // Create a map of GSC data by domain URL for easy access
  const gscDataMap = processedDomains.reduce(
    (acc, domain) => {
      if (domain.gscData && domain.gsc_url) {
        acc[domain.gsc_url] = domain.gscData;
      }
      return acc;
    },
    {} as { [key: string]: any },
  );

  return (
    <>
      <div
        className={cn(
          !isIntegrated && 'pointer-events-none select-none opacity-50',
        )}
      >
        <RankerActionBar
          isLoading={false}
          domains={processedDomains}
          selectedDateRanges={dateRanges.map((range) => ({
            from: new Date(range.start_date),
            to: new Date(range.end_date),
          }))}
        />
      </div>
      <div className="mx-auto mb-16 max-w-9xl px-7">
        <DomainTableWrapper
          isIntegrated={isIntegrated}
          domains={processedDomains}
          gscData={gscDataMap}
        />
      </div>
    </>
  );
}

function DomainTableWrapper({
  isIntegrated,
  domains,
  gscData,
}: {
  isIntegrated: boolean;
  domains: DomainWithAnalytics[] | null;
  gscData: { [key: string]: any };
}) {
  if (!isIntegrated) {
    return (
      <div className="flex w-full flex-row items-end justify-between gap-2 rounded-lg border bg-white p-6">
        <div className="flex flex-1 gap-2">
          <div className="flex h-full items-start justify-start">
            <AlertCircle className="h-6 w-6 shrink-0 fill-[#DE6F67] text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Image
                src="/images/icons/google-search-console.svg"
                alt="Google Search Console"
                width={20}
                height={20}
              />
              <h3 className="text-base font-medium">Google Search Console</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Forbind til Google Search Console før du kan bruge Rank Tracker
            </p>
          </div>
        </div>
        <Integrate
          provider="google"
          name="gsc_connection"
          className={buttonVariants({ variant: 'outline' })}
        >
          <Link className="mr-2 h-4 w-4" />
          Forbind datakilde
        </Integrate>
      </div>
    );
  }

  return (
    <DomainTable
      columns={domainColumns as ColumnDef<DomainWithAnalytics>[]}
      data={domains || []}
      pSize={10}
      sortColumn="display_name"
      gscData={gscData}
    />
  );
}
