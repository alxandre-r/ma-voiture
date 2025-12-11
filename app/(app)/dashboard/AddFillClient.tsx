/**
 * @file app/(app)/dashboard/AddFillClient.tsx
 * @fileoverview Client component for adding fuel fill-ups.
 * 
 * This component provides a button that opens the FillModal for adding new
 * fuel fill-up records.
 */

'use client';

import { useState } from 'react';
import FillModal from '@/components/fill/FillModal';

interface AddFillClientProps {
  vehicles: Array<{
    id: number;
    name: string | null;
    make: string | null;
    model: string | null;
    odometer: number | null;
  }>;
}

/**
 * AddFillClient Component
 * 
 * Button component that triggers the fuel fill-up addition modal.
 */
export default function AddFillClient({ vehicles }: AddFillClientProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 hover:cursor-pointer flex items-center gap-2 transition-all duration-200 md:py-2 md:px-4 md:rounded"
        aria-label="Ajouter un plein"
      >
        <span className="text-lg md:text-base">➕</span>
        <span className="font-medium">Ajouter un plein</span>
      </button>

      <FillModal 
        open={open} 
        onClose={() => setOpen(false)} 
        vehicles={vehicles}
      />
    </>
  );
}