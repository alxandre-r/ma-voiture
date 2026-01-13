/**
 * @file components/VehicleList.tsx
 * @fileoverview Wrapper component that imports the refactored VehicleList.
 * 
 * This file now serves as a wrapper to maintain backward compatibility
 * while using the new refactored vehicle components.
 */

'use client';

import VehicleList from './vehicle/old_VehicleList';

/**
 * VehicleList Wrapper Component
 * 
 * Wrapper that imports the refactored VehicleList component.
 * Maintains the same interface for backward compatibility.
 */
export default function VehicleListWrapper() {
  return <VehicleList />;
}

// Export the new VehicleList as default for direct imports
export { default as VehicleList } from './vehicle/old_VehicleList';