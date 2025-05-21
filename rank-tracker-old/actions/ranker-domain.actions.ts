'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { getSession } from '@/modules/auth/lib/auth';

export async function createDomain({
  url,
  display_name,
}: {
  url: string;
  display_name: string;
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
    body: JSON.stringify({ url, display_name, team: team_id }),
  };

  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/domain/create/`,
      requestOptions,
    );
    const result = await response.json();
    revalidateTag('rank-tracker-domains');
    revalidatePath('/tool/rank-tracker-old');
    return result;
  } catch (error) {
    console.error(error);
    return { error: true };
  }
}

export async function updateDomain({
  id,
  url,
  display_name,
}: {
  id: string;
  url: string;
  display_name: string;
}) {
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
    body: JSON.stringify({ url, display_name, team: team_id }),
  };

  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/domain/update/${id}/`,
      requestOptions,
    );
    const result = await response.json();
    revalidateTag('rank-tracker-domains');
    revalidatePath('/tool/rank-tracker-old');
    return result;
  } catch (error) {
    console.error(error);
    return { error: true };
  }
}

export async function getDomain(id: string) {
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
      `${process.env.SERVER_URL}/api/keyword_app/domain/get/${id}/`,
      requestOptions,
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    return { error: true };
  }
}

export async function deleteDomain(id: string) {
  const session = await getSession();
  if (!session) return { error: true };

  const team_id = (await cookies()).get('team-id')?.value;
  if (!team_id) return { error: true };

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
      `${process.env.SERVER_URL}/api/keyword_app/domain/remove/${id}/`,
      requestOptions,
    );

    if (response.ok) {
      revalidateTag('rank-tracker-domains');
      revalidatePath('/tool/rank-tracker-old');
      return { success: true };
    }

    return { error: true };
  } catch (error) {
    console.error(error);
    return { error: true };
  }
}

export async function getDomainList() {
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
      `${process.env.SERVER_URL}/api/keyword_app/domain/list/?limit=1000`,
      {
        ...requestOptions,
        cache: 'no-store',
        next: { tags: ['rank-tracker-domains'] },
      },
    );
    const result = await response.json();

    return result?.results || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function viewDomain() {
  const session = await getSession();
  if (!session) return [];

  const team_id = (await cookies()).get('team-id')?.value;
  if (!team_id) return [];

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.user.tokens.access}`,
      Team: team_id,
    },
  };

  try {
    const response = await fetch(
      `${process.env.SERVER_URL}/api/keyword_app/domains/view/`,
      requestOptions,
    );
    const result = await response.json();
    return result?.results || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}
