/**
 * @file app/(app)/family/join/page.tsx
 * @fileoverview Page for joining a family using an invitation token.
 */

import React from 'react';
import JoinFamilyClient from './JoinFamilyClient';

export default function JoinFamilyPage() {
  return (
    <div className="join-family-page-content">
      <JoinFamilyClient />
    </div>
  );
}