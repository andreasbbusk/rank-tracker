'use client';

import {
  listTags,
  updateKeywordTag,
  deleteKeywordTag,
} from './ranker-tags.actions';

/**
 * Client-side wrapper for tags API calls
 */

/**
 * Henter alle tags for et domæne
 */
export async function listTagsClient(domainId: string) {
  try {
    const response = await listTags(domainId);
    if (!response) throw new Error('Fejl ved hentning af tags');
    return response;
  } catch (error) {
    console.error('Fejl ved hentning af tags:', error);
    throw error;
  }
}

/**
 * Opdaterer et keyword-tag forhold
 */
export async function updateKeywordTagClient(tagId: string, name: string) {
  try {
    const response = await updateKeywordTag(tagId, name);
    if (!response) throw new Error('Fejl ved opdatering af tag');
    return response;
  } catch (error) {
    console.error('Fejl ved opdatering af tag:', error);
    throw error;
  }
}

/**
 * Sletter et keyword-tag forhold
 */
export async function deleteKeywordTagClient(tagId: string) {
  try {
    const response = await deleteKeywordTag(tagId);
    if (!response) throw new Error('Fejl ved sletning af tag');
    return true;
  } catch (error) {
    console.error('Fejl ved sletning af tag:', error);
    throw error;
  }
}
