import type { Metadata } from 'next';
import { PrismWordPrivateGate } from '@/features/scripture/components/PrismWordPrivateGate';
import { PrismWordErrorBoundary } from '@/features/scripture/components/PrismWordErrorBoundary';

export const metadata: Metadata = {
  title: "Prism Word | Private Family Sanctuary",
  description: "Private Bible study sanctuary restricted to authorised accounts.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ScripturePage() {
  return (
    <PrismWordErrorBoundary>
      <PrismWordPrivateGate />
    </PrismWordErrorBoundary>
  );
}
