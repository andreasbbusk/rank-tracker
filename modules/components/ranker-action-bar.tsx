import { getSession } from '@/modules/auth/lib/auth';
import { getRole } from '@/modules/settings/actions/team.actions';
import { cookies } from 'next/headers';
import RankerActionClient from './ranker-action-client';
import {
  Keyword,
  Domain,
  DomainWithAnalytics,
} from '@/modules/rank-tracker-old/types/index';

interface DateRange {
  from: Date;
  to: Date;
}

type Props = {
  isLoading?: boolean;
  keywords?: Keyword[];
  domains?: DomainWithAnalytics[];
  selectedDateRanges?: DateRange[];
  domain?: Domain;
  gscData?: any;
};

export default async function RankerActionBar({
  isLoading,
  keywords = [],
  domains = [],
  selectedDateRanges = [],
  domain,
  gscData,
}: Props) {
  const role = await getRole();
  const session = await getSession();
  const team_id = (await cookies()).get('team-id')?.value;

  return (
    <RankerActionClient
      isLoading={isLoading}
      role={role}
      session={session}
      team_id={team_id}
      data={domain ? keywords : domains}
      selectedDateRanges={selectedDateRanges}
      domain={domain}
      gscData={gscData}
    />
  );
}
