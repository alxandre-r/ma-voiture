/**
 * Mobile UI Optimizations Tests
 * 
 * These tests verify the mobile-specific UI optimizations:
 * 1. Settings page grid layout on mobile vs list on desktop
 * 2. Vehicle card without identifier letter and with multi-line vehicle names
 */

import { render } from '@testing-library/react';
import SettingsPage from '@/app/(app)/settings/page';
import VehicleCard from '@/components/vehicle/VehicleCard';

describe('Mobile UI Optimizations', () => {
  test('Settings page should have grid layout on mobile and list on desktop', () => {
    // Mock the useTheme hook
    jest.mock('next-themes', () => ({
      useTheme: () => ({ theme: 'system', setTheme: jest.fn() })
    }));
    
    const { container } = render(<SettingsPage />);
    expect(container).toBeInTheDocument();
    
    // Verify mobile grid layout exists
    const mobileGrid = container.querySelector('.lg\:hidden.grid.grid-cols-2');
    expect(mobileGrid).toBeInTheDocument();
    
    // Verify desktop list layout exists
    const desktopList = container.querySelector('.hidden.lg\:block');
    expect(desktopList).toBeInTheDocument();
    
    // Verify grid buttons have proper structure
    const gridButtons = container.querySelectorAll('.lg\:hidden button');
    expect(gridButtons.length).toBeGreaterThan(0);
    
    // Verify each grid button has icon and label
    gridButtons.forEach(button => {
      const icon = button.querySelector('svg');
      const label = button.querySelector('span');
      expect(icon).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(label.classList.contains('text-xs')).toBe(true);
      expect(label.classList.contains('text-center')).toBe(true);
    });
  });

  test('VehicleCard should not show identifier letter on mobile', () => {
    const mockVehicle = {
      id: '1',
      owner: 'user1',
      name: 'Ma voiture avec un nom très long qui pourrait être tronqué',
      make: 'Renault',
      model: 'Clio',
      year: 2020,
      fuel_type: 'Essence',
      manufacturer_consumption: 5.5,
      odometer: 50000,
      plate: 'AB-123-CD',
      created_at: '2023-01-15T10:00:00Z'
    };
    
    const { container } = render(
      <VehicleCard
        vehicle={mockVehicle}
        onEditStart={() => {}}
        onDelete={() => {}}
        editingId={null}
        editData={null}
        onChangeField={() => {}}
        onSaveEdit={() => {}}
        onCancelEdit={() => {}}
        saving={false}
        deletingId={null}
      />
    );
    expect(container).toBeInTheDocument();
    
    // Verify identifier letter is hidden on mobile
    const identifierLetter = container.querySelector('.lg\:flex.hidden');
    expect(identifierLetter).toBeInTheDocument();
    
    // Verify vehicle name can break to multiple lines on mobile
    const vehicleName = container.querySelector('h3');
    expect(vehicleName).toBeInTheDocument();
    expect(vehicleName.classList.contains('break-words')).toBe(true);
    expect(vehicleName.classList.contains('sm:text-xl')).toBe(true);
    expect(vehicleName.classList.contains('lg:text-2xl')).toBe(true);
    
    // Verify vehicle name is not truncated on mobile
    expect(vehicleName.classList.contains('truncate')).toBe(false);
    expect(vehicleName.classList.contains('lg:truncate')).toBe(true);
    
    // Verify vehicle details can also break to multiple lines on mobile
    const vehicleDetails = container.querySelector('p');
    expect(vehicleDetails).toBeInTheDocument();
    expect(vehicleDetails.classList.contains('break-words')).toBe(true);
    expect(vehicleDetails.classList.contains('sm:truncate')).toBe(true);
  });

  test('VehicleCard should handle long vehicle names properly', () => {
    // Test with very long vehicle name
    const longNameVehicle = {
      id: '1',
      name: 'Ma voiture avec un nom extrêmement long qui devrait absolument être affiché sur plusieurs lignes pour éviter la troncature et permettre une meilleure lisibilité sur les appareils mobiles',
      make: 'Renault',
      model: 'Clio',
      odometer: 50000
    };
    
    const { container } = render(
      <VehicleCard
        vehicle={longNameVehicle}
        onEditStart={() => {}}
        onDelete={() => {}}
        editingId={null}
        editData={null}
        onChangeField={() => {}}
        onSaveEdit={() => {}}
        onCancelEdit={() => {}}
        saving={false}
        deletingId={null}
      />
    );
    
    const vehicleName = container.querySelector('h3');
    expect(vehicleName).toBeInTheDocument();
    expect(vehicleName.textContent).toContain(longNameVehicle.name);
    
    // Should not be truncated on mobile
    expect(vehicleName.classList.contains('truncate')).toBe(false);
    
    // Should break to multiple lines
    expect(vehicleName.classList.contains('break-words')).toBe(true);
  });

  test('Settings grid buttons should have proper accessibility', () => {
    // Mock the useTheme hook
    jest.mock('next-themes', () => ({
      useTheme: () => ({ theme: 'system', setTheme: jest.fn() })
    }));
    
    const { container } = render(<SettingsPage />);
    
    // Get all grid buttons
    const gridButtons = container.querySelectorAll('.lg\:hidden button');
    
    // Verify each button has proper accessibility attributes
    gridButtons.forEach(button => {
      expect(button.getAttribute('role')).toBe('button');
      expect(button.getAttribute('tabindex')).toBe('0');
      
      // Should have icon and label for accessibility
      const icon = button.querySelector('svg');
      const label = button.querySelector('span');
      expect(icon).toBeInTheDocument();
      expect(label).toBeInTheDocument();
    });
  });
});