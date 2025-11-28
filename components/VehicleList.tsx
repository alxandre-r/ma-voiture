'use client';
import React, { useEffect, useState } from 'react';

type Vehicle = {
    id: string;
    owner?: string | null;
    name?: string | null;
    make?: string | null;
    model?: string | null;
    year?: number | null;
    fuel_type?: string | null;
    manufacturer_consumption?: number | null;
    plate?: string | null;
    created_at?: string | null;
    [key: string]: unknown;
};

export default function VehicleList(): React.ReactElement {
    const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<Vehicle> | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let mounted = true;
        async function fetchVehicles() {
            try {
                const res = await fetch('/api/vehicles/get');
                const body = await res.json().catch(() => ({}));
                if (!mounted) return;
                if (!res.ok) {
                    setError(body?.error ?? `Request failed (${res.status})`);
                    setVehicles([]);
                    return;
                }
                setVehicles(Array.isArray(body?.vehicles) ? body.vehicles : []);
            } catch (err) {
                setError((err as Error).message || 'Unknown error');
                setVehicles([]);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        fetchVehicles();
        return () => {
            mounted = false;
        };
    }, []);

    if (loading) return <div className="text-white">Chargement...</div>;
    if (error) return <div className="text-red-300">Erreur : {error}</div>;
    if (!vehicles || vehicles.length === 0)
        return <div className="text-white">Vous n’avez pas encore de véhicules.</div>;

    function startEdit(v: Vehicle) {
        setEditingId(v.id);
        // clone only known editable fields + plate
        setEditData({
            name: v.name ?? '',
            owner: v.owner ?? '',
            make: v.make ?? '',
            model: v.model ?? '',
            year: v.year ?? undefined,
            fuel_type: v.fuel_type ?? '',
            manufacturer_consumption: v.manufacturer_consumption ?? undefined,
            plate: v.plate ?? '',
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setEditData(null);
    }

    async function saveEdit(id: string) {
        if (!editData) return;
        setSaving(true);
        try {
            // call update endpoint (assumes backend)
            const res = await fetch('/api/vehicles/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...editData }),
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(body?.error ?? `Request failed (${res.status})`);
            }
            // optimistic local update
            setVehicles((prev) =>
                prev?.map((v) => (v.id === id ? { ...v, ...(editData as object) } : v)) ?? prev
            );
            cancelEdit();
        } catch (err) {
            // basic error handling
            setError((err as Error).message || 'Save failed');
        } finally {
            setSaving(false);
        }
    }

    function onChangeField<K extends keyof Vehicle | string>(key: K, value: unknown) {
        setEditData((prev) => ({ ...(prev ?? {}), [key]: value }));
    }

    function formatValue(value: unknown) {
        if (value === null || value === undefined || value === '') return '—';
        if (typeof value === 'number') return value;
        if (typeof value === 'string') return value;
        // fallback for objects/arrays
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }

    return (
        <ul className="list-none p-0 m-0 space-y-4">
            {vehicles.map((v) => (
                <li key={v.id}>
                    <div className="bg-gray-800 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-lg bg-white/5 flex items-center justify-center text-white/80 font-semibold">
                                        {((v.make ?? v.name ?? '') as string).charAt(0).toUpperCase() || 'V'}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-white text-xl font-semibold truncate">
                                            {v.name ?? `${v.make ?? 'Marque inconnue'} ${v.model ?? ''}`}
                                        </div>
                                        <div className="text-gray-300 text-sm truncate">
                                            {v.make ? `${v.make}${v.model ? ' • ' + v.model : ''}` : 'Détails indisponibles'}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-gray-300 text-xs">Propriétaire</span>
                                        <span className="text-white">{formatValue(v.owner)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-300 text-xs">Plaque</span>
                                        <span className="text-white">{formatValue(v.plate)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-300 text-xs">Année</span>
                                        <span className="text-white">{formatValue(v.year)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-300 text-xs">Carburant</span>
                                        <span className="text-white">{formatValue(v.fuel_type)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-300 text-xs">Consommation constructeur</span>
                                        <span className="text-white">
                                            {v.manufacturer_consumption != null ? `${v.manufacturer_consumption} L/100km` : '—'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-300 text-xs">Ajouté le</span>
                                        <span className="text-white">
                                            {v.created_at ? new Date(v.created_at).toLocaleString() : '—'}
                                        </span>
                                    </div>
                                </div>

                                {/* show any extra unknown fields */}
                                {Object.keys(v)
                                    .filter(
                                        (k) =>
                                            ![
                                                'id',
                                                'owner',
                                                'name',
                                                'make',
                                                'model',
                                                'year',
                                                'fuel_type',
                                                'manufacturer_consumption',
                                                'plate',
                                                'created_at',
                                            ].includes(k)
                                    )
                                    .length > 0 && (
                                    <div className="mt-3">
                                        <button
                                            onClick={() => setExpandedId((prev) => (prev === v.id ? null : v.id))}
                                            className="text-xs text-gray-300 hover:text-white transition"
                                            aria-expanded={expandedId === v.id}
                                        >
                                            {expandedId === v.id ? 'Masquer les infos supplémentaires' : 'Afficher les infos supplémentaires'}
                                        </button>

                                        {expandedId === v.id && (
                                            <pre className="mt-2 bg-white/5 p-3 rounded text-xs text-gray-200 overflow-auto">
                                                {JSON.stringify(
                                                    Object.fromEntries(
                                                        Object.entries(v).filter(([k]) =>
                                                            ![
                                                                'id',
                                                                'owner',
                                                                'name',
                                                                'make',
                                                                'model',
                                                                'year',
                                                                'fuel_type',
                                                                'manufacturer_consumption',
                                                                'plate',
                                                                'created_at',
                                                            ].includes(k)
                                                        )
                                                    ),
                                                    null,
                                                    2
                                                )}
                                            </pre>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startEdit(v)}
                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white text-sm transition"
                                        aria-label={`Modifier ${v.name ?? v.id}`}
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() =>
                                            navigator.clipboard?.writeText(v.id).catch(() => {
                                                /* ignore */
                                            })
                                        }
                                        className="inline-flex items-center px-3 py-2 rounded-md bg-transparent border border-white/10 text-gray-300 hover:text-white text-sm transition"
                                        title="Copier l'ID"
                                    >
                                        Copier ID
                                    </button>
                                </div>
                                <div className="text-xs text-gray-400">ID: <span className="text-gray-300 break-all">{v.id}</span></div>
                            </div>
                        </div>

                        {/* Inline edit panel */}
                        {editingId === v.id && editData && (
                            <div className="mt-5 bg-white/3 p-4 rounded-lg">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <label className="flex flex-col text-sm">
                                        <span className="text-gray-300 text-xs mb-1">Nom</span>
                                        <input
                                            value={(editData.name ?? '') as string}
                                            onChange={(e) => onChangeField('name', e.target.value)}
                                            className="bg-white/5 text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-gray-500"
                                        />
                                    </label>

                                    <label className="flex flex-col text-sm">
                                        <span className="text-gray-300 text-xs mb-1">Propriétaire</span>
                                        <input
                                            value={(editData.owner ?? '') as string}
                                            onChange={(e) => onChangeField('owner', e.target.value)}
                                            className="bg-white/5 text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-gray-500"
                                        />
                                    </label>

                                    <label className="flex flex-col text-sm">
                                        <span className="text-gray-300 text-xs mb-1">Marque</span>
                                        <input
                                            value={(editData.make ?? '') as string}
                                            onChange={(e) => onChangeField('make', e.target.value)}
                                            className="bg-white/5 text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-gray-500"
                                        />
                                    </label>

                                    <label className="flex flex-col text-sm">
                                        <span className="text-gray-300 text-xs mb-1">Modèle</span>
                                        <input
                                            value={(editData.model ?? '') as string}
                                            onChange={(e) => onChangeField('model', e.target.value)}
                                            className="bg-white/5 text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-gray-500"
                                        />
                                    </label>

                                    <label className="flex flex-col text-sm">
                                        <span className="text-gray-300 text-xs mb-1">Année</span>
                                        <input
                                            type="number"
                                            value={editData.year ?? ''}
                                            onChange={(e) => onChangeField('year', e.target.value ? Number(e.target.value) : undefined)}
                                            className="bg-white/5 text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-gray-500"
                                        />
                                    </label>

                                    <label className="flex flex-col text-sm">
                                        <span className="text-gray-300 text-xs mb-1">Carburant</span>
                                        <input
                                            value={(editData.fuel_type ?? '') as string}
                                            onChange={(e) => onChangeField('fuel_type', e.target.value)}
                                            className="bg-white/5 text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-gray-500"
                                        />
                                    </label>

                                    <label className="flex flex-col text-sm">
                                        <span className="text-gray-300 text-xs mb-1">Consommation (L/100km)</span>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={editData.manufacturer_consumption ?? ''}
                                            onChange={(e) =>
                                                onChangeField(
                                                    'manufacturer_consumption',
                                                    e.target.value ? Number(e.target.value) : undefined
                                                )
                                            }
                                            className="bg-white/5 text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-gray-500"
                                        />
                                    </label>

                                    <label className="flex flex-col text-sm">
                                        <span className="text-gray-300 text-xs mb-1">Plaque</span>
                                        <input
                                            value={(editData.plate ?? '') as string}
                                            onChange={(e) => onChangeField('plate', e.target.value)}
                                            className="bg-white/5 text-white px-3 py-2 rounded outline-none focus:ring-1 focus:ring-gray-500"
                                        />
                                    </label>
                                </div>

                                <div className="mt-4 flex gap-2 justify-end">
                                    <button
                                        onClick={cancelEdit}
                                        disabled={saving}
                                        className="px-4 py-2 rounded-md bg-transparent border border-white/10 text-gray-300 hover:text-white text-sm transition"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={() => saveEdit(v.id)}
                                        disabled={saving}
                                        className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white text-sm transition"
                                    >
                                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
}