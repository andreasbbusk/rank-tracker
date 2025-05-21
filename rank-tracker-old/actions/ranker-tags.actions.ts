'use server';

import { cookies } from 'next/headers';
import { getSession } from '@/modules/auth/lib/auth';

/**
 * Henter alle tags for et domæne (server-side)
 * @param domainId - ID på domænet
 */
export async function listTags(domainId: string) {
  try {
    const session = await getSession();
    if (!session) return [];

    const team_id = (await cookies()).get('team-id')?.value;
    if (!team_id) return [];

    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/domain/${domainId}/tag/list/`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.user.tokens.access}`,
          Team: team_id,
        },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      throw new Error(`Fejl ved hentning af tags: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fejl ved hentning af tags:', error);
    return [];
  }
}

/**
 * Opdaterer et keyword-tag forhold (server-side)
 * @param tagId - ID på tag-relationen
 * @param data - Data der skal opdateres
 */
export async function updateKeywordTag(tagId: string, name: string) {
  try {
    const session = await getSession();
    if (!session) return false;

    const team_id = (await cookies()).get('team-id')?.value;
    if (!team_id) return false;

    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/keyword-tag/${tagId}/`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.user.tokens.access}`,
          Team: team_id,
        },
        body: JSON.stringify({ name }),
      },
    );

    if (!response.ok) {
      throw new Error(`Fejl ved opdatering af tag: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Fejl ved opdatering af tag:', error);
    return false;
  }
}

/**
 * Sletter et keyword-tag forhold (server-side)
 * @param tagId - ID på tag-relationen
 */
export async function deleteKeywordTag(tagId: string) {
  try {
    const session = await getSession();
    if (!session) return false;

    const team_id = (await cookies()).get('team-id')?.value;
    if (!team_id) return false;

    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/keyword-tag/${tagId}/`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.user.tokens.access}`,
          Team: team_id,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Fejl ved sletning af tag: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Fejl ved sletning af tag:', error);
    return false;
  }
}
