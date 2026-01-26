/**
 * @file src/app/family/page.tsx
 * @fileoverview Family page allowing users to create or join a family.
 */
import React from 'react';
import FamilyClient from './FamilyClient';

export default function FamilyPage() {
    return (
      <div className="family-page-content pt-24">
        <FamilyClient />
      </div>
    );
  }