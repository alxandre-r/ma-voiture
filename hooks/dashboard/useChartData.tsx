// app/hooks/dashboard/useFillChartData.ts
import { useMemo } from "react";
import { useFills } from "@/contexts/FillContext";
import { useVehicles } from "@/contexts/VehicleContext";

export function useFillChartData() {
  const { fills, selectedVehicleIds, getFilteredStats, getVehicleName } = useFills();
  const { vehicles } = useVehicles();

  const colorPalette = [
    "#7C3AED", // Violet
    "#4F46E5", // Indigo
    "#60A5FA", // Light Indigo
    "#8B5CF6", // Dark Violet
    "#C084FC", // Light violet
    "#1E293B" // Dark Indigo
  ];
  

  const vehiclesForChart = useMemo(() => {
    if (!vehicles || !fills) return [];

    return vehicles
      .filter(v => selectedVehicleIds.includes(v.vehicle_id))
      .map((v, index) => {
        const vehicleFills = fills
          .filter(f => f.vehicle_id === v.vehicle_id && f.odometer != null)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return {
          vehicleId: String(v.vehicle_id),
          vehicleName: getVehicleName(v.vehicle_id),
          color: v.color || colorPalette[index % colorPalette.length],
          points: vehicleFills.map(f => ({
            date: f.date,
            odometer: f.odometer!,
            amount: f.amount,
          })),
        };
      })
      .filter(v => v.points.length > 0);
  }, [vehicles, fills, selectedVehicleIds, getVehicleName]);

  const filteredStats = useMemo(() => {
    return getFilteredStats(selectedVehicleIds);
  }, [selectedVehicleIds, getFilteredStats]);

  const hasData = !!fills?.length && vehiclesForChart.length > 0;

  return { vehiclesForChart, filteredStats, hasData };
}