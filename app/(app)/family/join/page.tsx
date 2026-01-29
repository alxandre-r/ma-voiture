/**
 * @file app/(app)/family/join/page.tsx
 * @fileoverview Page for joining a family using an invitation token.
 */

import React, { Suspense } from 'react';
import JoinFamilyClient from './JoinFamilyClient';

export default function JoinFamilyPage() {
  return (
    <div className="join-family-page-content">
      <Suspense fallback={
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      }>
        <JoinFamilyClient />
      </Suspense>
    </div>
  );
}