/**
 * @file components/vehicle/VehicleFormField.tsx
 * @fileoverview Reusable form field component for vehicle forms.
 * 
 * This component provides a consistent input field with proper styling
 * and type handling for vehicle form fields.
 */

'use client';

interface VehicleFormFieldProps {
  type: string;
  name: string;
  placeholder: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  step?: string;
  className?: string;
}

/**
 * VehicleFormField Component
 * 
 * Reusable input field for vehicle forms with consistent styling.
 * Handles different input types and provides proper focus states.
 */
export default function VehicleFormField({
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  required = false,
  step,
  className = '',
}: VehicleFormFieldProps) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      step={step}
      className={`w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 p-3 rounded-md transition-colors focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:p-2 ${className}`}
    />
  );
}