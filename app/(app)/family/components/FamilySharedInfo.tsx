/**
 * Static info box shown at the bottom of the family page.
 * Rendered immediately (no loading state needed).
 */
export default function FamilySharedInfo() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h5 className="font-bold text-gray-900 dark:text-gray-100">
            À propos des accès partagés
          </h5>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            Tous les membres de la famille ont accès aux véhicules et dépenses des autres membres.
            Cela permet à chaque membre de filtrer et d&apos;analyser les données de la famille dans
            son ensemble. Les propriétaires peuvent gérer les membres et les paramètres de la
            famille.
          </p>
        </div>
      </div>
    </div>
  );
}
