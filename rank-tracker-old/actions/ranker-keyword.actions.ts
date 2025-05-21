'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { getSession } from '@/modules/auth/lib/auth';
import { Keyword } from '../types';

export async function createKeyword({
  title,
  domain,
  star_keyword,
  location,
  tags,
}: Partial<Keyword>) {
  const session = await getSession();
  if (!session) return;

  const team_id = (await cookies()).get('team-id')?.value;
  if (!team_id) return;

  const formattedTags = tags?.map((tag) => ({
    name: tag,
  }));

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.user.tokens.access}`,
      Team: team_id,
    },
    body: JSON.stringify({
      title,
      domain,
      team: team_id,
      star_keyword,
      location,
      tags: formattedTags,
    }),
  };

  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/keyword/create/`,
      requestOptions,
    );
    const result = await response.json();

    revalidateTag(`domain-keywords-view`);
    revalidatePath('/tool/rank-tracker-old');

    return { ...result, cacheKey: 'keywordCreate' };
  } catch (error) {
    console.error(error);
    return { error: true };
  }
}

/**
 * createKeywords - Creates multiple keywords and returns their IDs for tracking
 * @param options - Options for creating multiple keywords
 * @returns Object with success status and keyword IDs
 */
export async function createKeywords({
  domain,
  keywords,
  location,
  star_keyword,
  tags,
}: {
  domain: number;
  keywords: string[];
  location?: { country: string; device: string };
  star_keyword?: boolean;
  tags?: string[];
}): Promise<
  | {
      success: boolean;
      cacheKey?: string;
      error?: boolean;
      keywords?: number[];
      message?: string;
    }
  | undefined
> {
  const session = await getSession();
  if (!session) return;

  const team_id = (await cookies()).get('team-id')?.value;
  if (!team_id) return;

  // Filter out empty keywords
  const filteredKeywords = keywords.filter((keyword) => keyword.trim() !== '');

  if (filteredKeywords.length === 0) {
    return {
      success: false,
      error: true,
      message: 'Ingen gyldige søgeord angivet',
    };
  }

  // Map each keyword to include all required fields
  const keywordPayload = {
    keywords: filteredKeywords,
    domain: domain,
    star_keyword: star_keyword || false,
    location: location,
    tags: tags || [],
  };

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.user.tokens.access}`,
      Team: team_id,
    },
    body: JSON.stringify(keywordPayload),
  };

  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/keywords/multiple/create/`,
      requestOptions,
    );

    if (!response.ok) {
      console.error('Error creating multiple keywords:', response.statusText);
      return {
        error: true,
        success: false,
        message: 'Fejl ved oprettelse af søgeord',
      };
    }

    const data = await response.json();

    // Extract the keyword IDs from the response
    const keywordList = data.keyword_list || [];

    // More aggressive cache invalidation to ensure newly created keywords appear immediately
    revalidateTag(`domain-keywords-view`);
    revalidateTag(`rank-tracker-keywords`);
    revalidateTag(`rank-tracker-domains`);
    revalidatePath('/tool/rank-tracker-old');

    // Create sample data for immediate UI update
    try {
      // Filter out empty strings
      const filteredKeywords = keywords.filter((k) => k.trim());

      // Create temporary keyword objects with the necessary structure for display
      const tempKeywords = filteredKeywords.map((title, index) => {
        const id = keywordList[index] || -Math.floor(Math.random() * 10000);
        return {
          id: String(id),
          domain: domain,
          title: title,
          star_keyword: star_keyword || false,
          location: location || { country: 'DNK', device: 'all' },
          tags: tags ? tags.map((tag) => ({ name: tag })) : [],
          dateRange: 'date_range_0',
          latest_stats: [{ position: null, page: [] }],
          overall_stats: { clicks: 0, impressions: 0 },
          search_volume: { avg_searches: 0 },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      // Dispatch an event to tell tables to refresh their data
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('keyword-table-update', {
          detail: {
            domainId: String(domain),
            freshData: tempKeywords, // Include the temporary data objects
            timestamp: Date.now(),
            source: 'createKeywords',
            keywordIds: keywordList,
          },
        });

        console.log('Dispatching keyword-table-update event', {
          domainId: String(domain),
          keywordCount: tempKeywords.length,
          keywordIds: keywordList,
        });

        window.dispatchEvent(event);

        // Also trigger any registered refresh functions directly
        const refreshFn = (window as any)[`refreshKeywordTable_${domain}`];
        if (typeof refreshFn === 'function') {
          console.log('Calling direct refresh function for domain', domain);
          refreshFn();
        }

        // Set a global flag that will be checked when dialog closes
        (window as any).KEYWORD_TABLE_NEEDS_UPDATE = true;
        (window as any).KEYWORD_TABLE_UPDATE_DOMAIN = String(domain);
      }
    } catch (clientError) {
      // Catch client-side errors but don't fail the operation
      console.error('Error dispatching client-side event:', clientError);
    }

    return {
      success: true,
      cacheKey: 'keywordsCreate',
      keywords: keywordList,
      message: 'Søgeord tilføjet',
    };
  } catch (error) {
    console.error('Error creating keywords:', error);
    return {
      error: true,
      success: false,
      message: 'Fejl ved oprettelse af søgeord',
    };
  }
}

export async function getKeyword(id: string): Promise<Keyword | undefined> {
  const session = await getSession();
  if (!session) return;

  const team_id = (await cookies()).get('team-id')?.value;
  if (!team_id) return;

  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.user.tokens.access}`,
      Team: team_id,
    },
  };

  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/keyword/${id}/`,
      requestOptions,
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

/**
 * deleteKeyword - Deletes a keyword with optimistic UI update support
 * @param id - Keyword ID to delete
 * @returns Object with success/error information
 */
export async function deleteKeyword(id: string) {
  const session = await getSession();
  if (!session) return { error: true, message: 'No session found' };

  const team_id = (await cookies()).get('team-id')?.value;
  if (!team_id) return { error: true, message: 'No team ID found' };

  const requestOptions = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.user.tokens.access}`,
      Team: team_id,
    },
  };

  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/keyword/remove/${id}/`,
      requestOptions,
    );

    if (!response.ok) {
      return {
        error: true,
        message: `Server returned error: ${response.status} ${response.statusText}`,
      };
    }

    // Revalidate using the same tags as new rank-tracker
    revalidateTag(`domain-keywords-view`);
    revalidateTag(`rank-tracker-keywords`);
    revalidateTag(`rank-tracker-domains`);
    revalidatePath('/tool/rank-tracker-old');

    return { success: true, id };
  } catch (error) {
    console.error('Delete keyword error:', error);
    return {
      error: true,
      message: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * updateKeyword - Updates a keyword with optimistic UI update support
 * @param options - Update payload including ID and fields to update
 * @returns Response from the server or error information
 */
export async function updateKeyword({
  id,
  title,
  domain,
  star_keyword,
  location,
  tags,
}: Partial<Keyword> & { id: string }) {
  const session = await getSession();
  if (!session) {
    console.error('No session found');
    return { error: true, message: 'No session found' };
  }

  const team_id = (await cookies()).get('team-id')?.value;
  if (!team_id) {
    console.error('No team ID found');
    return { error: true, message: 'No team ID found' };
  }

  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.user.tokens.access}`,
      Team: team_id,
    },
    body: JSON.stringify({
      title,
      domain,
      team: team_id,
      star_keyword,
      location,
      tags,
    }),
  };

  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/keyword/update/${id}/`,
      requestOptions,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update failed:', response.status, errorText);
      return {
        error: true,
        message: `Update failed: ${response.status} ${errorText}`,
      };
    }

    const result = await response.json();

    // Revalidate using the same tags as new rank-tracker
    revalidateTag(`domain-keywords-view`);
    revalidateTag(`rank-tracker-keywords`);
    revalidateTag(`rank-tracker-domains`);
    revalidatePath('/tool/rank-tracker-old');

    return { success: true, ...result };
  } catch (error) {
    console.error('Update error:', error);
    return {
      error: true,
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function getKeywordList() {
  try {
    const session = await getSession();
    if (!session) return { count: 0, next: null, previous: null, results: [] };

    const team_id = (await cookies()).get('team-id')?.value;
    if (!team_id) return { count: 0, next: null, previous: null, results: [] };

    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.user.tokens.access}`,
        Team: team_id,
      },
    };

    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/keyword/list/?limit=9999`,
      requestOptions,
    );

    if (!response.ok) {
      console.error('Failed to fetch keywords:', response.statusText);
      return { count: 0, next: null, previous: null, results: [] };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching keywords:', error);
    return { count: 0, next: null, previous: null, results: [] };
  }
}

export async function getKeywordStats() {
  const session = await getSession();
  if (!session) return [];

  const team_id = (await cookies()).get('team-id')?.value;
  if (!team_id) return [];

  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.user.tokens.access}`,
      Team: team_id,
    },
  };

  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/domain/1/keywords/stats/?offset=0&limit=20`,
      requestOptions,
    );
    const result = await response.json();
    return result?.results || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getLocations() {
  try {
    const session = await getSession();
    if (!session) return [];

    const team_id = (await cookies()).get('team-id')?.value;
    if (!team_id) return [];

    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.user.tokens.access}`,
        Team: team_id,
      },
    };

    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/location/list/`,
      requestOptions,
    );

    const result = await response.json();
    return result.results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function updateKeywordLocation(
  id: string,
  location: {
    country: string;
    device: string;
    lang_const: string;
    geo_const: string;
  },
) {
  const session = await getSession();
  if (!session) return;

  const team_id = (await cookies()).get('team-id')?.value;
  if (!team_id) return;

  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.user.tokens.access}`,
      Team: team_id,
    },
    body: JSON.stringify({
      ...location,
      team: team_id,
    }),
  };

  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/keyword/${id}/location/`,
      requestOptions,
    );

    if (!response.ok) {
      throw new Error('Failed to update location');
    }

    const result = await response.json();
    revalidateTag(`domain-keywords-view`);
    revalidatePath('/tool/rank-tracker-old');
    return result;
  } catch (error) {
    console.error('Update location error:', error);
    return null;
  }
}

export async function deleteKeywordLocation(id: string) {
  const session = await getSession();
  if (!session) return;

  const team_id = (await cookies()).get('team-id')?.value;
  if (!team_id) return;

  const requestOptions = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.user.tokens.access}`,
      Team: team_id,
    },
  };

  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/keyword-location/${id}/`,
      requestOptions,
    );

    if (!response.ok) {
      throw new Error('Failed to delete location');
    }

    revalidateTag(`domain-keywords-view`);
    revalidatePath('/tool/rank-tracker-old');
    return true;
  } catch (error) {
    console.error('Delete location error:', error);
    return false;
  }
}

export async function getGSCKeywords(siteUrl: string) {
  const session = await getSession();
  if (!session) {
    return { records: [], error: 'Ingen session fundet' };
  }

  const team_id = (await cookies()).get('team-id')?.value;
  if (!team_id) {
    return { records: [], error: 'Intet team ID fundet' };
  }

  // Get current date and date 30 days ago
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.user.tokens.access}`,
      Team: team_id,
    },
    body: JSON.stringify({
      site_url: siteUrl,
      dimensions: ['query'], // Required field - we want to get data by search query
      date_ranges: [
        {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        },
      ],
    }),
  };

  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/analytics_app/gsc/search-analytics/`,
      { ...requestOptions, cache: 'force-cache' },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GSC API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return { records: [], error: errorText };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching GSC keywords:', error);
    return {
      records: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * getKeywordStatus - Checks the processing status of newly added keywords
 * @param keyword_list - Array of keyword IDs to check status for
 * @returns Status information including whether all keywords have been processed
 */
export async function getKeywordStatus(keyword_list: number[]): Promise<{
  keywords_status?: {
    latest_fetch?: string | null;
    status?: 'processed' | 'pending' | 'error';
  }[];
  status?: boolean;
  error?: string | null;
} | null> {
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
      keyword_list,
    }),
  };

  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/keywords/status/`,
      requestOptions,
    );

    // Process response regardless of status code - API might return 200 with error message
    const data = await response.json();

    if (!data?.keywords_status) {
      return null;
    }

    // Only revalidate and cache when status is true (all keywords are processed)
    if (data?.status) {
      console.log('Keywords processing completed - revalidating data');

      // Server-side revalidation
      revalidateTag(`domain-keywords-view`);
      revalidateTag(`rank-tracker-keywords`);
      revalidateTag(`rank-tracker-domains`);
      revalidatePath('/tool/rank-tracker-old');

      // Client-side event (for browser context)
      if (typeof window !== 'undefined') {
        const domainId = (window as any).KEYWORD_TABLE_UPDATE_DOMAIN;

        if (domainId) {
          console.log(
            'Dispatching client-side update event for domain:',
            domainId,
          );
          const event = new CustomEvent('keyword-table-update', {
            detail: {
              domainId: domainId,
              timestamp: Date.now(),
              source: 'keywordStatusFromAction',
              keywordIds: keyword_list,
            },
          });
          window.dispatchEvent(event);

          // Also try to call the refresh function directly
          const refreshFn = (window as any)[`refreshKeywordTable_${domainId}`];
          if (typeof refreshFn === 'function') {
            console.log('Calling direct refresh function for domain', domainId);
            refreshFn();
          }
        }
      }
    }

    return data;
  } catch (error) {
    console.error('Error checking keyword status:', error);
    return null;
  }
}
