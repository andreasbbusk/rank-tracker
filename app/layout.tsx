import { getDomainList } from '@/modules/rank-tracker-old/actions/ranker-domain.actions';
import RankerConfigurationBar from '@/modules/rank-tracker-old/components/ranker-configuration-bar';
import { ClientPendingKeywordWrapper } from '@/modules/rank-tracker-old/components/client-pending-keyword-wrapper';
import { getSession } from '@/modules/auth/lib/auth';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Rank Tracker - Overvåg dine søgeordspositioner | Conversio Hub',
  description:
    'Hold øje med dine søgeord og få detaljeret indblik i din synlighed på Google. Gratis værktøj til at tracke dine rankings.',
};

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/sign-in');

  const domains = await getDomainList();

  return (
    <div className="min-h-screen bg-background">
      <ClientPendingKeywordWrapper>
        <RankerConfigurationBar domains={domains} />
        {children}
      </ClientPendingKeywordWrapper>
    </div>
  );
}
