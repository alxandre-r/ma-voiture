'use client';

import { useState } from 'react';

import { Card } from '@/components/common/ui/card';

interface StatisticsOverviewProps {
  totalCost: number;
  fillsCount: number;
  annualProjection: number;
  monthsWithData?: number;
  previousPeriodCost?: number;
  previousYearTotal?: number;
  selectedPeriod?: string;
  totalKilometers?: number;
  costPerKm?: number;
  annualKmProjection?: number;
}

interface TooltipData {
  title: string;
  details: string[];
}

type CardKey = 'cost' | 'consumption' | 'projection' | 'efficiency' | null;

interface StatItem {
  key: CardKey;
  title: string;
  value: string;
  valueUnit: string;
  trend?: string;
  trendIconPath?: string;
  trendColor?: string;
  valueTooltip: TooltipData;
  trendTooltip?: TooltipData;
}

export default function StatisticsOverview({
  totalCost,
  fillsCount,
  annualProjection,
  monthsWithData,
  previousPeriodCost,
  previousYearTotal = 0,
  selectedPeriod = '12m',
  totalKilometers = 0,
  costPerKm = 0,
  annualKmProjection = 0,
}: StatisticsOverviewProps) {
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [activeCard, setActiveCard] = useState<CardKey>(null);

  // Calculate period months for display
  // For "month" mode: use 1 (not average over year for display)
  // For other modes: use monthsWithData if available, otherwise fallback to default
  const displayPeriodMonths =
    selectedPeriod === 'month' ? 1 : monthsWithData || (selectedPeriod === 'year' ? 12 : 12);

  // Calculate trend if we have previous period cost
  const hasTrend = previousPeriodCost !== undefined && previousPeriodCost > 0;
  const trendPercentage = hasTrend
    ? ((totalCost - previousPeriodCost!) / previousPeriodCost!) * 100
    : 0;

  const showTooltip = (card: CardKey, data: TooltipData) => {
    setActiveCard(card);
    setTooltipData(data);
  };

  const toggleTooltip = (card: CardKey, data: TooltipData) => {
    if (activeCard === card) {
      setActiveCard(null);
      setTooltipData(null);
    } else {
      setActiveCard(card);
      setTooltipData(data);
    }
  };

  const hideTooltip = () => {
    setActiveCard(null);
    setTooltipData(null);
  };

  // Projection trend vs previous year
  const hasProjectionTrend = previousYearTotal > 0;
  const projectionTrendPercentage = hasProjectionTrend
    ? ((annualProjection - previousYearTotal) / previousYearTotal) * 100
    : 0;

  // Build stats based on period
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  const stats: StatItem[] = [
    // Card 1: Total expenses with trend
    {
      key: 'cost' as CardKey,
      title: 'Dépenses totales',
      value: `${totalCost.toLocaleString('fr-FR')}`,
      valueUnit: '€',
      trend: hasTrend
        ? `${trendPercentage > 0 ? '+' : ''}${trendPercentage.toFixed(1)}%`
        : undefined,
      trendIconPath: hasTrend
        ? trendPercentage > 0
          ? '/icons/trend-up-red.svg'
          : '/icons/trend-down-green.svg'
        : undefined,
      trendColor:
        trendPercentage > 0
          ? 'text-red-500'
          : trendPercentage < 0
            ? 'text-green-500'
            : 'text-gray-500',
      valueTooltip: {
        title: 'Dépenses totales',
        details: [
          ...(hasTrend
            ? [
                `Total: ${totalCost.toFixed(2)} €`,
                `Période précédente: ${previousPeriodCost?.toFixed(2)} €`,
                `Variation: ${trendPercentage > 0 ? '+' : ''}${trendPercentage.toFixed(1)}%`,
              ]
            : [`Total: ${totalCost.toFixed(2)} €`, `Nombre de dépenses: ${fillsCount}`]),
          ...(costPerKm > 0
            ? [
                `Distance parcourue : ${totalKilometers.toLocaleString('fr-FR')} km`,
                `Coût au km : ~${costPerKm.toFixed(3).replace('.', ',')} €/km`,
              ]
            : []),
        ],
      },
    },
    ...(selectedPeriod !== 'month'
      ? [
          {
            key: 'consumption' as CardKey,
            title: 'Moyenne / mois',
            value: `${(totalCost / displayPeriodMonths).toFixed(0)}`,
            valueUnit: '€/mois',
            trend: undefined,
            trendColor: 'text-gray-500',
            valueTooltip: {
              title: 'Moyenne mensuelle',
              details: [
                `Coût total: ${totalCost.toFixed(2)} €`,
                `Période: ${displayPeriodMonths} mois`,
                `Moyenne: ${(totalCost / displayPeriodMonths).toFixed(2)} €/mois`,
              ],
            },
          },
        ]
      : []),
    // Card 3: Projection - always based on current year, trend compared to last year.
    {
      key: 'projection' as CardKey,
      title: `Projection ${currentYear}`,
      value: `${Math.round(annualProjection).toLocaleString('fr-FR')}`,
      valueUnit: '€',
      trend: hasProjectionTrend
        ? `${projectionTrendPercentage > 0 ? '+' : ''}${projectionTrendPercentage.toFixed(1)}%`
        : undefined,
      trendIconPath: hasProjectionTrend
        ? projectionTrendPercentage > 0
          ? '/icons/trend-up-red.svg'
          : '/icons/trend-down-green.svg'
        : undefined,
      trendColor: hasProjectionTrend
        ? projectionTrendPercentage > 0
          ? 'text-red-500'
          : projectionTrendPercentage < 0
            ? 'text-green-500'
            : 'text-gray-500'
        : 'text-gray-500',
      valueTooltip: {
        title: `Projection (${currentYear})`,
        details: [
          `Moyenne mensuelle: ${(annualProjection / 12).toFixed(2)} €/mois`,
          `Projection: ${annualProjection.toFixed(2)} €`,
          ...(hasProjectionTrend
            ? [
                `${previousYear} (réel): ${previousYearTotal.toFixed(2)} €`,
                `Variation: ${projectionTrendPercentage > 0 ? '+' : ''}${projectionTrendPercentage.toFixed(1)}%`,
              ]
            : []),
          ...(annualKmProjection > 0
            ? [`Distance projetée : ~${Math.round(annualKmProjection).toLocaleString('fr-FR')} km`]
            : []),
        ],
      },
    },
    // Card 4: Cost per km - only shown when km data is available
    ...(costPerKm > 0
      ? [
          {
            key: 'efficiency' as CardKey,
            title: 'Coût au km',
            value: costPerKm.toFixed(2).replace('.', ','),
            valueUnit: '€/km',
            trend: undefined,
            trendColor: 'text-gray-500',
            valueTooltip: {
              title: 'Coût au kilomètre',
              details: [
                `Coût total: ${totalCost.toFixed(2)} €`,
                `Distance: ${totalKilometers.toLocaleString('fr-FR')} km`,
                `Coût au km: ${costPerKm.toFixed(3).replace('.', ',')} €/km`,
              ],
            },
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {stats.map((stat) => (
        <StatCard
          key={stat.key}
          stat={stat}
          activeCard={activeCard}
          tooltipData={tooltipData}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          toggleTooltip={toggleTooltip}
        />
      ))}
    </div>
  );
}

function StatCard({
  stat,
  activeCard,
  tooltipData,
  showTooltip,
  hideTooltip,
  toggleTooltip,
}: {
  stat: StatItem;
  activeCard: CardKey;
  tooltipData: TooltipData | null;
  showTooltip: (card: CardKey, data: TooltipData) => void;
  hideTooltip: () => void;
  toggleTooltip: (card: CardKey, data: TooltipData) => void;
}) {
  const hasTrend = !!(stat.trend || stat.trendIconPath);

  return (
    <div className="relative">
      <button
        onClick={() => toggleTooltip(stat.key, stat.valueTooltip)}
        className="w-full text-left"
        onMouseEnter={() => showTooltip(stat.key, stat.valueTooltip)}
        onMouseLeave={hideTooltip}
      >
        <Card className="p-4 h-full transition hover:shadow-sm active:scale-[0.98]">
          {/* Top row */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">{stat.title}</span>

            {hasTrend && (
              <span className={`text-xs font-semibold whitespace-nowrap ${stat.trendColor}`}>
                {stat.trend}
              </span>
            )}
          </div>

          {/* Value */}
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              {stat.value}
            </span>

            <span className="text-sm text-gray-500">{stat.valueUnit}</span>
          </div>
        </Card>
      </button>

      {activeCard === stat.key && tooltipData && <Tooltip tooltipData={tooltipData} />}
    </div>
  );
}

function Tooltip({ tooltipData }: { tooltipData: TooltipData }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50 w-52 sm:w-auto max-w-[calc(100vw-2rem)]">
      <div className="bg-gray-900 dark:bg-gray-700 text-white p-4 rounded-lg shadow-xl sm:max-w-xs">
        <p className="font-semibold text-sm mb-2">{tooltipData.title}</p>

        <ul className="text-xs text-gray-300 space-y-1">
          {tooltipData.details.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
