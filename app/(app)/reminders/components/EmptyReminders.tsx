'use client';

import { Card, CardContent } from '@/components/common/ui/card';
import Icon from '@/components/common/ui/Icon';

interface EmptyRemindersProps {
  onAdd: () => void;
}

export default function EmptyReminders({ onAdd }: EmptyRemindersProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <Icon name="bell" size={48} className="opacity-30 mx-auto" />
        <div>
          <p className="font-medium text-gray-700 dark:text-gray-300">Aucun rappel actif</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Les rappels d&apos;entretien sont créés automatiquement. Vous pouvez aussi en ajouter
            manuellement.
          </p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-custom-2 hover:bg-custom-2-hover text-white rounded-md text-sm font-medium transition-colors cursor-pointer"
        >
          Créer un rappel
        </button>
      </CardContent>
    </Card>
  );
}
