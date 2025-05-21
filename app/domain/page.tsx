import { getDateRanges } from '@/modules/analytics/utils/helpers/getDateRanges';
import { LoadingTable } from '@/modules/core/components/loading-table';
import { cn } from '@/modules/core/lib/utils';
import { getDomain } from '@/modules/rank-tracker-old/actions/ranker-domain.actions';
import { getGSCKeywords } from '@/modules/rank-tracker-old/actions/ranker-keyword.actions';
import { listTags } from '@/modules/rank-tracker-old/actions/ranker-tags.actions';
import { createDomainKeywordsView } from '@/modules/rank-tracker-old/actions/ranker-views.actions';
import Dashboard from '@/modules/rank-tracker-old/components/keywords/dashboard';
import { KeywordFilter } from '@/modules/rank-tracker-old/components/keywords/keyword-filter';
import KeywordTableWrapper from '@/modules/rank-tracker-old/components/keywords/tables/keyword-table-wrapper';
import { TableSkeleton } from '@/modules/rank-tracker-old/components/keywords/tables/table-skeleton';
import { KeywordTabsTrigger } from '@/modules/rank-tracker-old/components/keywords/tabs-trigger';
import RankerActionBar from '@/modules/rank-tracker-old/components/ranker-action-bar';
import { Keyword } from '@/modules/rank-tracker-old/types/index';
import { Loader2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Suspense, cache } from 'react';

type Props = {
  searchParams: Promise<{
    domain?: string;
    tab?: string;
    range?: string;
    rangeCompare?: string;
    starred?: string;
    search?: string;
    tags?: string;
    landingPages?: string;
    country?: string;
    rankValue1?: string;
    rankValue2?: string;
    clicksType?: string;
    clicksValue1?: string;
    clicksValue2?: string;
    impressionsType?: string;
    impressionsValue1?: string;
    impressionsValue2?: string;
    redirect?: string;
  }>;
};

// Create custom cache key function for domain data
function getDomainCacheKey(domainId: string) {
  return `domain-${domainId}`;
}

// Create a custom cache key function for keyword view data
function getKeywordViewCacheKey(domainId: string, dateRanges: any[]) {
  const dateString = dateRanges
    .map((r) => `${r.start_date}_${r.end_date}`)
    .join('|');
  return `domain-keywords-${domainId}-${dateString}`;
}

// Use cache to prevent duplicate fetches during navigation
const cachedGetDomain = cache(async (domainId: string) => {
  const cacheKey = getDomainCacheKey(domainId);
  console.log(`Fetching domain with cache key: ${cacheKey}`);
  return getDomain(domainId);
});

const cachedCreateDomainKeywordsView = cache(
  async (params: { domainId: string; dateRanges: any[] }) => {
    const { domainId, dateRanges } = params;
    const cacheKey = getKeywordViewCacheKey(domainId, dateRanges);
    console.log(`Fetching keyword view with cache key: ${cacheKey}`);
    return createDomainKeywordsView(params);
  },
);

const cachedListTags = cache(listTags);
const cachedGetGSCKeywords = cache(getGSCKeywords);

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;

  const domainId = sp.domain;
  const currentTab = sp.tab || 'keyword';
  const { dateRanges } = getDateRanges({ searchParams: sp });
  const shouldRedirect = sp.redirect === 'true';

  if (!domainId) {
    redirect('/tool/rank-tracker-old');
  }

  // Create a simplified suspense key that only changes when critical data changes
  // Ignore filter parameters to prevent unnecessary re-renders
  const suspenseKey = `domain-${domainId}-tab-${currentTab}-range-${sp.range}-compare-${sp.rangeCompare}`;

  return (
    <Suspense key={suspenseKey} fallback={<Loading tab={currentTab} />}>
      <Content
        domainId={domainId}
        currentTab={currentTab}
        dateRanges={dateRanges}
        shouldRefresh={shouldRedirect}
        searchParams={sp}
      />
    </Suspense>
  );
}

async function Content({
  domainId,
  currentTab,
  dateRanges,
  shouldRefresh,
  searchParams,
}: {
  domainId: string;
  currentTab: string;
  dateRanges: { start_date: string; end_date: string }[];
  shouldRefresh: boolean;
  searchParams: any;
}) {
  // Fetch domain and keywords view concurrently
  const [domain, keywordsView, tagsResponse] = await Promise.all([
    cachedGetDomain(domainId),
    cachedCreateDomainKeywordsView({ domainId, dateRanges }),
    cachedListTags(domainId),
  ]);

  if (!domain) {
    redirect('/tool/rank-tracker-old');
  }

  // Extract tags from the response - the API returns { results: [...] }
  // Make sure we handle both possible shapes: { results: [...] } or the array directly
  const tags = Array.isArray(tagsResponse)
    ? tagsResponse
    : tagsResponse?.results || [];

  // Format URL for GSC
  let formattedUrl = domain.url || '';
  if (!formattedUrl?.startsWith('http')) {
    formattedUrl = `sc-domain:${formattedUrl.replace(/^www\./, '')}`;
  }

  // Fetch GSC data
  const gscData = await cachedGetGSCKeywords(formattedUrl);

  const records =
    keywordsView?.records && Array.isArray(keywordsView.records)
      ? keywordsView.records
      : [];

  // Merge the view data with the keyword list
  const domainKeywords = records.map((keyword: Keyword) => {
    const viewKeyword = records.find(
      (view: any) => view.id === Number(keyword.id),
    );
    if (viewKeyword) {
      return {
        ...keyword,
        search_volume: viewKeyword.search_volume,
        clicks: viewKeyword.clicks,
        impressions: viewKeyword.impressions,
        ranking: viewKeyword.position,
        landing_page: viewKeyword.landing_page,
      };
    }
    return keyword;
  });

  // Convert the date ranges to DateRange format for the table
  const selectedDateRanges = dateRanges.map((range) => ({
    from: new Date(range.start_date),
    to: new Date(range.end_date),
  }));

  // Calculate if we need to show the refresh script
  // Only show it when we actually have a redirect parameter and are navigating to a domain
  const needsRefreshScript = shouldRefresh && domainId;

  return (
    <>
      {needsRefreshScript && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Set up globals to ensure table knows it needs to refresh
                window.KEYWORD_TABLE_NEEDS_UPDATE = true;
                window.KEYWORD_TABLE_UPDATE_DOMAIN = "${domainId}";
                
                // Trigger update event after a moment to ensure components are mounted
                setTimeout(() => {
                  try {
                    // Try direct function call first
                    if (window["refreshKeywordTable_${domainId}"]) {
                      window["refreshKeywordTable_${domainId}"]();
                    }
                    
                    // Then dispatch event
                    const updateEvent = new CustomEvent('keyword-table-update', {
                      detail: {
                        domainId: "${domainId}",
                        timestamp: Date.now(),
                        source: 'auto-refresh'
                      }
                    });
                    window.dispatchEvent(updateEvent);
                    
                    // Clean up the URL - remove the redirect parameter
                    if (window.history && window.history.replaceState) {
                      const url = new URL(window.location.href);
                      url.searchParams.delete('redirect');
                      window.history.replaceState({}, '', url.toString());
                    }
                  } catch (e) {
                    console.error('Error triggering keyword table refresh', e);
                  }
                }, 500);
              })();
            `,
          }}
        />
      )}
      <RankerActionBar
        keywords={domainKeywords}
        selectedDateRanges={selectedDateRanges}
        domain={domain}
        gscData={gscData}
      />
      <div className="mx-auto mb-16 max-w-9xl px-7">
        <h1 className="text-2xl font-medium">{domain.display_name}</h1>
        <p className="mb-8 text-sm text-black/60">{domain.url}</p>
        <div className="mb-6 flex items-center gap-2">
          <KeywordTabsTrigger />
          {currentTab !== 'dashboard' && <KeywordFilter initialTags={tags} />}
        </div>
        {currentTab === 'keyword' ? (
          <KeywordTableWrapper
            data={domainKeywords}
            domainId={domainId}
            className="w-full"
            pSize={20}
            sortColumn="keyword"
            disableBorder={false}
            hasPagination={true}
            selectedDateRanges={selectedDateRanges}
            gscData={gscData}
          />
        ) : (
          <Dashboard domainId={domainId} dateRanges={dateRanges} />
        )}
      </div>
    </>
  );
}

function Loading({ tab }: { tab: string }) {
  return (
    <>
      <RankerActionBar isLoading />
      <div className="mx-auto mb-16 max-w-9xl px-7">
        <h1 className="text-2xl font-medium">Indlæser...</h1>
        <p className="mb-8 text-sm text-black/60">Indlæser...</p>
        <div className="flex items-center gap-2">
          <KeywordTabsTrigger />
        </div>
        {tab === 'keyword' ? (
          <TableSkeleton rows={10} showSearch={true} />
        ) : (
          <div className="space-y-12">
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="flex h-[86px] w-full items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm"
                >
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              ))}
            </div>

            <LoadingSkeleton />
          </div>
        )}
      </div>
    </>
  );
}

function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-[296px] items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm',
        className,
      )}
    >
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
