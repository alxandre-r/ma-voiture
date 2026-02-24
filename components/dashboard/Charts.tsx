// app/components/dashboard/Charts/index.tsx
'use client';

import React from 'react';

import FillChart from './charts/FillChart';
import FillChartSkeleton from './charts/FillChartSkeleton';
import OdometerChart from './charts/OdometerChart';
import OdometerChartSkeleton from './charts/OdometerChartSkeleton';

import type { VehicleChartSeries } from '@/hooks/dashboard/useChartData';

type ChartsProps = {
  vehiclesForChart: VehicleChartSeries[];
};

export default function Charts({ vehiclesForChart }: ChartsProps) {
  if (!vehiclesForChart.length)
    return (
      <>
        <FillChartSkeleton />
        <OdometerChartSkeleton />
      </>
    );

  return (
    <>
      <FillChart vehicles={vehiclesForChart} />
      <OdometerChart vehicles={vehiclesForChart} />
    </>
  );
}
