/**
 * Mobile Chart Alignment Tests
 * 
 * These tests verify that charts are properly aligned on mobile devices
 * and that month labels are correctly positioned under bars.
 */

import { render } from '@testing-library/react';
import FillChart from '@/components/fill/FillChart';

describe('Mobile Chart Alignment Tests', () => {
  test('FillChart should have proper alignment on mobile', () => {
    const mockData = [
      { month: '2023-01', amount: 100, count: 2 },
      { month: '2023-02', amount: 150, count: 3 },
      { month: '2023-03', amount: 120, count: 2 },
      { month: '2023-04', amount: 180, count: 4 },
      { month: '2023-05', amount: 160, count: 3 }
    ];
    
    const { container } = render(<FillChart data={mockData} />);
    expect(container).toBeInTheDocument();
    
    // Verify horizontal scrolling is enabled
    const scrollContainer = container.querySelector('.overflow-x-auto');
    expect(scrollContainer).toBeInTheDocument();
    
    // Verify minimum width is set for better mobile display
    const chartContainer = container.querySelector('.min-w-\[350px\]');
    expect(chartContainer).toBeInTheDocument();
    
    // Verify proper gap spacing for alignment
    const barsRow = container.querySelector('.gap-1');
    expect(barsRow).toBeInTheDocument();
    
    // Verify month labels container exists
    const monthLabels = container.querySelectorAll('.text-center');
    expect(monthLabels.length).toBeGreaterThan(0);
    
    // Verify each month label has proper minimum width
    const minWidthLabels = container.querySelectorAll('.min-w-\[60px\]');
    expect(minWidthLabels.length).toBe(mockData.length);
  });

  test('FillChart should handle different data lengths', () => {
    // Test with minimal data
    const minimalData = [
      { month: '2023-01', amount: 100, count: 1 }
    ];
    
    const { container: minimalContainer } = render(<FillChart data={minimalData} />);
    expect(minimalContainer).toBeInTheDocument();
    
    // Test with many data points
    const extensiveData = Array.from({ length: 12 }, (_, i) => ({
      month: `2023-${String(i + 1).padStart(2, '0')}`,
      amount: 100 + i * 10,
      count: 1 + i % 3
    }));
    
    const { container: extensiveContainer } = render(<FillChart data={extensiveData} />);
    expect(extensiveContainer).toBeInTheDocument();
    
    // Should still have proper alignment classes
    const extensiveMonthLabels = extensiveContainer.querySelectorAll('.min-w-\[60px\]');
    expect(extensiveMonthLabels.length).toBe(extensiveData.length);
  });

  test('FillChart should have consistent bar and label alignment', () => {
    const mockData = [
      { month: '2023-01', amount: 100, count: 2 },
      { month: '2023-02', amount: 150, count: 3 }
    ];
    
    const { container } = render(<FillChart data={mockData} />);
    
    // Verify that both bars and labels use the same gap spacing
    const barsRow = container.querySelector('.flex.items-end.gap-1');
    const labelsRow = container.querySelector('.flex.gap-1');
    
    expect(barsRow).toBeInTheDocument();
    expect(labelsRow).toBeInTheDocument();
    
    // Verify that both use the same padding
    const barsWithPadding = container.querySelector('.flex.items-end.gap-1.pl-1');
    const labelsWithPadding = container.querySelector('.flex.gap-1.pl-1');
    
    expect(barsWithPadding).toBeInTheDocument();
    expect(labelsWithPadding).toBeInTheDocument();
  });
});