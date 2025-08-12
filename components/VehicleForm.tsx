/**
 * @file src/components/VehicleForm.tsx
 * @fileoverview Form component to add a new vehicle via the /api/vehicles/add endpoint.
 */

'use client';

import { useState } from 'react';

export default function VehicleForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    make: '',
    model: '',
    year: '',
    fuel_type: '',
    manufacturer_consumption: ''
  });
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/vehicles/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          year: formData.year ? parseInt(formData.year, 10) : null,
          manufacturer_consumption: formData.manufacturer_consumption
            ? parseFloat(formData.manufacturer_consumption)
            : null
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error creating vehicle');

      setMessage('✅ Vehicle added successfully!');
      setFormData({
        name: '',
        make: '',
        model: '',
        year: '',
        fuel_type: '',
        manufacturer_consumption: ''
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`❌ ${err.message}`);
      } else {
        setMessage('❌ An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <input
        type="text"
        name="name"
        placeholder="Vehicle Name"
        value={formData.name}
        onChange={handleChange}
        required
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        name="make"
        placeholder="Make"
        value={formData.make}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        name="model"
        placeholder="Model"
        value={formData.model}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <input
        type="number"
        name="year"
        placeholder="Year"
        value={formData.year}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        name="fuel_type"
        placeholder="Fuel Type"
        value={formData.fuel_type}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <input
        type="number"
        step="0.01"
        name="manufacturer_consumption"
        placeholder="Consumption (L/100km)"
        value={formData.manufacturer_consumption}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Add Vehicle'}
      </button>

      {message && <p className="mt-2">{message}</p>}
    </form>
  );
}