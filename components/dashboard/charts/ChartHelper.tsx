"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface Padding {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface MonthTick {
  id: string;
  x: number;
  label: string;
  showLabel: boolean;
  isVisible?: boolean;
}

export interface ContainerSize {
  width: number;
  height: number;
}

export function useContainerSize(initialSize: ContainerSize = { width: 600, height: 240 }): [ContainerSize, React.RefObject<HTMLDivElement>] {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<ContainerSize>(initialSize);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setSize({
          width: Math.max(300, cr.width),
          height: Math.max(200, cr.height),
        });
      }
    });
    
    ro.observe(el);
    const rect = el.getBoundingClientRect();
    setSize({
      width: Math.max(300, rect.width),
      height: Math.max(200, rect.height),
    });
    
    return () => ro.disconnect();
  }, []);

  return [size, containerRef];
}

export function useMonthTicks(
  minDate: Date,
  maxDate: Date,
  getX: (date: string | Date) => number,
  mobile: boolean = false,
  visiblePoints?: Array<{ date: string }>
): MonthTick[] {
  return useMemo(() => {
    const ticks: MonthTick[] = [];
    const d = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    let count = 0;

    while (d <= end) {
      const id = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleDateString("fr-FR", { month: "short" });
      const showLabel = mobile ? count % 2 === 0 : true;

      const isVisible = visiblePoints ? visiblePoints.some(b => {
        const bd = new Date(b.date);
        return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth();
      }) : true;

      ticks.push({ id, x: getX(d), label, showLabel, isVisible });

      d.setMonth(d.getMonth() + 1);
      count++;
    }

    return ticks;
  }, [minDate, maxDate, mobile, getX, visiblePoints]);
}

export function usePeriodFilter<T extends { date: string }>(
  data: Array<T>,
  selectedPeriod: string
): Array<T> {
  return useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case "3m": startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1); break;
      case "6m": startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1); break;
      case "12m": startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1); break;
      default: startDate = new Date(0);
    }

    return data.filter(item => {
      const d = new Date(item.date);
      return d >= startDate && d <= now;
    });
  }, [data, selectedPeriod]);
}

export function useDateRange(
  points: Array<{ date: string }>
): { minDate: Date; maxDate: Date } {
  return useMemo(() => {
    if (!points.length) return { minDate: new Date(), maxDate: new Date() };

    const dates = points.map(p => new Date(p.date).getTime());
    const minTime = Math.min(...dates);
    const maxTime = Math.max(...dates);

    const minDate = new Date(minTime);
    const maxDate = new Date(maxTime);

    // Normaliser au début et fin de mois
    const normalizedMinDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const normalizedMaxDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);

    return { minDate: normalizedMinDate, maxDate: normalizedMaxDate };
  }, [points]);
}

export function useMobileDetection(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 640);
      
      const handleResize = () => {
        setIsMobile(window.innerWidth < 640);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
    return () => {};
  }, []);

  return isMobile;
}

export function clampTooltipX(
  x: number,
  textLength: number,
  size: ContainerSize,
  padding: Padding
): number {
  const tooltipWidth = textLength * 6 + 8;
  return Math.min(Math.max(padding.left, x), size.width - padding.right - tooltipWidth);
}