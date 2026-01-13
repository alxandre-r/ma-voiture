/**
 * @file app/(app)/families/page.tsx
 * @fileoverview Modern family management page.
 * 
 * This page provides a simplified and intuitive interface for family management
 * with dropdown actions and clean member display.
 */

import { FamilyPageContent } from '@/components/family/FamilyPageContent';

/**
 * Family Management Page
 * 
 * Modern family page with clean UI and user-friendly actions.
 */
export default function FamilyManagementPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <FamilyPageContent />
    </div>
  );
}