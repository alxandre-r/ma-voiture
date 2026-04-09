import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function downloadChartSVG(
  containerRef: React.RefObject<HTMLDivElement | null>,
  filename: string,
): void {
  const svg = containerRef.current?.querySelector('svg');
  if (!svg) return;

  // Clone to avoid mutating the live DOM
  const clone = svg.cloneNode(true) as SVGElement;

  // Ensure namespace is present for standalone SVG files
  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  const serialized = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${format(new Date(), 'yyyy-MM-dd', { locale: fr })}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}
