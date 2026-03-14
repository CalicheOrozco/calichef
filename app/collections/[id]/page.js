import { Suspense, use } from 'react';
import CollectionDetailClient from './CollectionDetailClient';

export default function CollectionDetailPage({ params }) {
  const resolvedParams = typeof params?.then === 'function' ? use(params) : params;
  const collectionId = resolvedParams?.id;

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CollectionDetailClient collectionId={collectionId} />
    </Suspense>
  );
}