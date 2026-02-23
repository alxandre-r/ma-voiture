// app/components/dashboard/Charts/index.tsx
"use client";

import React from "react";
import FillChart from "./charts/FillChart";
import OdometerChart from "./charts/OdometerChart";
import FillChartSkeleton from "./charts/FillChartSkeleton";
import OdometerChartSkeleton from "./charts/OdometerChartSkeleton";

import { VehicleChartSeries } from "@/hooks/dashboard/useChartData";

type ChartsProps = {
  vehiclesForChart: VehicleChartSeries[];
};


export default function Charts({ vehiclesForChart }: ChartsProps) {
  if (!vehiclesForChart.length) return (
    <>
      <FillChartSkeleton />
      <OdometerChartSkeleton />
    </>
  )

  return (
    <>
      <FillChart vehicles={vehiclesForChart} />
      <OdometerChart vehicles={vehiclesForChart} />
    </>
  );
}
