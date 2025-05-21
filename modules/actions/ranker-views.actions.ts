'use server';

import { cookies } from 'next/headers';
import { getSession } from '@/modules/auth/lib/auth';
import { DomainView } from '../types/index';

interface DateRange {
  start_date: string;
  end_date: string;
}

export async function createDashboardView(
  domainId: string,
  dateRanges?: DateRange[],
) {
  const session = await getSession();
  if (!session) return;

  const team_id = (await cookies()).get('team-id')?.value;
  if (!team_id) return;

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.user.tokens.access}`,
      Team: team_id,
    },
    body: JSON.stringify({
      domain: domainId,
      date_ranges: dateRanges?.map((range, index) => ({
        ...range,
        date_range_id: `date_range_${index}`,
      })),
    }),
  };

  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/domain/${domainId}/dashboard/view/`,
      requestOptions,
    );
    return await response.json();
  } catch (error) {
    console.error(error);
    return { error: true };
  }
}

export async function createDomainsView(
  dateRanges?: DateRange[],
): Promise<DomainView[] | null> {
  const session = await getSession();
  if (!session) return null;

  const team_id = (await cookies()).get('team-id')?.value;
  if (!team_id) return null;

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.user.tokens.access}`,
      Team: team_id,
    },
    body: JSON.stringify({
      date_ranges: dateRanges?.map((range) => ({
        start_date: range.start_date,
        end_date: range.end_date,
      })),
    }),
  };
  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/domains/view/`,
      requestOptions,
    );
    if (!response.ok) {
      throw new Error('Failed to fetch domains view');
    }
    const data = await response.json();
    return data?.records;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function createDomainKeywordsView({
  domainId,
  dateRanges,
  limit = 9999,
  page = 1,
}: {
  domainId: string;
  dateRanges?: DateRange[];
  limit?: number;
  page?: number;
}) {
  const session = await getSession();
  if (!session) return;

  const team_id = (await cookies()).get('team-id')?.value;
  if (!team_id) return;

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.user.tokens.access}`,
      Team: team_id,
    },
    body: JSON.stringify({
      date_ranges: dateRanges?.map((range, index) => ({
        start_date: range.start_date,
        end_date: range.end_date,
        date_range_id: `date_range_${index + 1}`,
      })),
    }),
  };

  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/domain/${domainId}/keywords/view/?limit=9999`,
      {
        ...requestOptions,
        cache: 'force-cache',
        next: { tags: [`domain-keywords-view`] },
      },
    );
    return await response.json();
  } catch (error) {
    console.error(error);
    return { error: true };
  }
}

export async function createKeywordModalView(
  keywordId: string,
  dateRanges?: DateRange[],
) {
  const session = await getSession();
  if (!session) return;

  const team_id = (await cookies()).get('team-id')?.value;
  if (!team_id) return;

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.user.tokens.access}`,
      Team: team_id,
    },
    body: JSON.stringify({
      date_ranges: dateRanges?.map((range, index) => ({
        start_date: range.start_date,
        end_date: range.end_date,
        date_range_id: `date_range_${index + 1}`,
      })),
    }),
  };

  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/keyword/${keywordId}/view/`,
      requestOptions,
    );
    return await response.json();
  } catch (error) {
    console.error(error);
    return { error: true };
  }
}
