/**
 * @file src/components/VehicleForm.tsx
 * @fileoverview Form component to add a new vehicle via the /api/vehicles/add endpoint.
 */

'use client';

import { useState } from 'react';

interface VehicleFormProps {
  onCancel?: () => void;
}

export default function VehicleForm({ onCancel }: VehicleFormProps) {
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
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création du véhicule');

      setMessage('✅ Véhicule ajouté avec succès !');
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
        setMessage('❌ Une erreur inconnue est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md p-6 rounded-lg bg-gray-800 text-white"
    >
      <input
        type="text"
        name="name"
        placeholder="Nom du véhicule"
        value={formData.name}
        onChange={handleChange}
        required
        className="w-full bg-gray-900 text-white border border-gray-700 hover:border-gray-600 placeholder-gray-400 p-2 rounded-md transition-colors focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />

      <input
        type="text"
        name="make"
        placeholder="Marque"
        value={formData.make}
        onChange={handleChange}
        className="w-full bg-gray-900 text-white border border-gray-700 hover:border-gray-600 placeholder-gray-400 p-2 rounded-md transition-colors focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      <input
        type="text"
        name="model"
        placeholder="Modèle"
        value={formData.model}
        onChange={handleChange}
        className="w-full bg-gray-900 text-white border border-gray-700 hover:border-gray-600 placeholder-gray-400 p-2 rounded-md transition-colors focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      <input
        type="number"
        name="year"
        placeholder="Année"
        value={formData.year}
        onChange={handleChange}
        className="w-full bg-gray-900 text-white border border-gray-700 hover:border-gray-600 placeholder-gray-400 p-2 rounded-md transition-colors focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      <input
        type="text"
        name="fuel_type"
        placeholder="Type de carburant"
        value={formData.fuel_type}
        onChange={handleChange}
        className="w-full bg-gray-900 text-white border border-gray-700 hover:border-gray-600 placeholder-gray-400 p-2 rounded-md transition-colors focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      <input
        type="number"
        step="0.01"
        name="manufacturer_consumption"
        placeholder="Consommation (L/100km)"
        value={formData.manufacturer_consumption}
        onChange={handleChange}
        className="w-full bg-gray-900 text-white border border-gray-700 hover:border-gray-600 placeholder-gray-400 p-2 rounded-md transition-colors focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      {/* Boutons alignés */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 cursor-pointer transition-colors"
        >
          {loading ? 'Enregistrement...' : 'Ajouter le véhicule'}
        </button>
      </div>

      {message && <p className="mt-2 text-sm">{message}</p>}
    </form>
  );
}
