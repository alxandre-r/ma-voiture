/**
 * @file components/FillList.tsx
 * @fileoverview Wrapper component that imports the refactored FillList.
 * 
 * This file now serves as a wrapper to maintain backward compatibility
 * while using the new refactored fill components.
 */

'use client';

import FillList from './fill/FillList';

/**
 * FillList Wrapper Component
 * 
 * Wrapper that imports the refactored FillList component.
 * Maintains the same interface for backward compatibility.
 */
export default function FillListWrapper() {
  return <FillList />;
}

// Export the new FillList as default for direct imports
export { default as FillList } from './fill/FillList';
// Export other fill components
export { default as FillForm } from './fill/FillForm';
export { default as FillModal } from './fill/FillModal';
export { default as FillEditForm } from './fill/FillEditForm';
