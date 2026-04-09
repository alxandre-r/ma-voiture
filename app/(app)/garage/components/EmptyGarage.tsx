'use client';

/**
 * @file EmptyGarage.tsx
 * @fileoverview Empty state component for garage when no vehicles exist.
 */
import Icon from '@/components/common/ui/Icon';

interface EmptyGarageProps {
  onAddVehicle: () => void;
}

export default function EmptyGarage({ onAddVehicle }: EmptyGarageProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-24 h-24 bg-custom-1 rounded-full flex items-center justify-center mb-6">
        <Icon name="car" size={48} className="text-white" />
      </div>
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Votre garage est vide
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl">
        Ajoutez votre premier véhicule pour commencer à suivre vos dépenses.
      </p>
      <button
        onClick={onAddVehicle}
        className="inline-flex items-center gap-2 px-8 py-4 bg-custom-2 hover:bg-custom-2-hover text-white rounded-lg font-semibold transition-all duration-200"
      >
        <Icon name="add" size={20} />
        Ajouter un véhicule
      </button>
    </div>
  );
}
