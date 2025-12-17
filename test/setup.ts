// Test setup file for Vitest
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

// Extend Vitest's expect with methods from react-testing-library
if (expect && matchers) {
  expect.extend(matchers);
}

// Run cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock Next.js specific features that aren't available in test environment
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js dynamic imports
vi.mock('next/dynamic', () => ({
  default: () => {
    const DynamicComponent = () => null;
    DynamicComponent.displayName = 'LoadableComponent';
    return DynamicComponent;
  },
}));