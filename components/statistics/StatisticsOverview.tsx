'use client';

import Image from 'next/image';
import { useState } from 'react';

import { Card, CardHeader, CardTitle } from '@/components/common/ui/card';

interface StatisticsOverviewProps {
  totalCost: number;
  fillsCount: number;
  annualProjection: number;
  monthsWithData?: number;
  previousPeriodCost?: number;
  selectedPeriod?: string;
}

interface TooltipData {
  title: string;
  details: string[];
}

type CardKey = 'cost' | 'consumption' | 'projection' | null;

interface StatItem {
  key: CardKey;
  title: string;
  value: string;
  trend?: string;
  trendIconPath?: string;
  trendColor?: string;
  footer: string;
  valueTooltip: TooltipData;
  trendTooltip?: TooltipData;
}

export default function StatisticsOverview({
  totalCost,
  fillsCount,
  annualProjection,
  monthsWithData,
  previousPeriodCost,
  selectedPeriod = '12m',
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
  const trendLabel =
    selectedPeriod === 'month'
      ? 'vs mois dernier'
      : selectedPeriod === 'year'
        ? 'vs année dernière'
        : undefined;

  const showTooltip = (card: CardKey, data: TooltipData) => {
    setActiveCard(card);
    setTooltipData(data);
  };

  const hideTooltip = () => {
    setActiveCard(null);
    setTooltipData(null);
  };

  // Build stats based on period
  const currentYear = new Date().getFullYear();

  const stats: StatItem[] = [
    // Card 1: Total expenses with trend
    {
      key: 'cost' as CardKey,
      title: 'Dépenses totales',
      value: `${totalCost.toLocaleString('fr-FR')} €`,
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
            : 'text-slate-500',
      footer: trendLabel || `Total des ${fillsCount} dépenses`,
      valueTooltip: {
        title: 'Dépenses totales',
        details: hasTrend
          ? [
              `Total: ${totalCost.toFixed(2)} €`,
              `Période précédente: ${previousPeriodCost?.toFixed(2)} €`,
              `Variation: ${trendPercentage > 0 ? '+' : ''}${trendPercentage.toFixed(1)}%`,
            ]
          : [`Total: ${totalCost.toFixed(2)} €`, `Nombre de dépenses: ${fillsCount}`],
      },
    },
    ...(selectedPeriod !== 'month'
      ? [
          {
            key: 'consumption' as CardKey,
            title: 'Moyenne / mois',
            value: `${(totalCost / displayPeriodMonths).toFixed(0)} €/mois`,
            trend: undefined,
            trendColor: 'text-slate-500',
            footer: `Sur ${displayPeriodMonths} mois`,
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
    // Card 3: Projection - always based on current year
    {
      key: 'projection' as CardKey,
      title: `Projection ${currentYear}`,
      value: `${Math.round(annualProjection).toLocaleString('fr-FR')} €`,
      trendColor: 'text-slate-500',
      footer: 'Basée sur les mois passés',
      valueTooltip: {
        title: `Projection (${currentYear})`,
        details: [
          `Moyenne mensuelle: ${(annualProjection / 12).toFixed(2)} €/mois`,
          `Projection: ${annualProjection.toFixed(2)} €`,
        ],
      },
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((stat) => (
        <StatCard
          key={stat.key}
          stat={stat}
          activeCard={activeCard}
          tooltipData={tooltipData}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
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
}: {
  stat: StatItem;
  activeCard: CardKey;
  tooltipData: TooltipData | null;
  showTooltip: (card: CardKey, data: TooltipData) => void;
  hideTooltip: () => void;
}) {
  const hasTrend = !!(stat.trend || stat.trendIconPath);

  return (
    <div className="relative h-full">
      <Card className="h-full">
        <CardHeader className="p-3 flex flex-col h-full">
          <CardTitle className="text-xs text-gray-500">{stat.title}</CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-end gap-1 sm:gap-4 mt-1">
            <h3
              className="font-bold text-slate-900 dark:text-slate-100 cursor-help hover:underline decoration-dashed text-lg"
              onMouseEnter={() => showTooltip(stat.key, stat.valueTooltip)}
              onMouseLeave={hideTooltip}
            >
              {stat.value}
            </h3>
            {/* Always render a placeholder for trend to maintain alignment */}
            <div className={`text-xs min-h-[14px] ${hasTrend ? '' : 'invisible'}`}>
              {hasTrend && (
                <span
                  className={`inline-flex items-center font-semibold cursor-help ${stat.trendColor}`}
                  onMouseEnter={() => showTooltip(stat.key, stat.trendTooltip || stat.valueTooltip)}
                  onMouseLeave={hideTooltip}
                >
                  {stat.trendIconPath && (
                    <Image
                      src={stat.trendIconPath}
                      alt="trend"
                      width={14}
                      height={14}
                      className="mr-1"
                    />
                  )}
                  {stat.trend}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {activeCard === stat.key && tooltipData && <Tooltip tooltipData={tooltipData} />}
    </div>
  );
}

function Tooltip({ tooltipData }: { tooltipData: TooltipData }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50">
      <div className="bg-slate-900 dark:bg-slate-700 text-white p-4 rounded-lg shadow-xl max-w-xs">
        <p className="font-semibold text-sm mb-2">{tooltipData.title}</p>

        <ul className="text-xs text-slate-300 space-y-1">
          {tooltipData.details.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
