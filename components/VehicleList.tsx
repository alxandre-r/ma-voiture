'use client';
import React, { useEffect, useState } from 'react';

// Component that displays, if user has any car, the list of vehicles data
// use the api/vehicles/get route to fetch vehicles data from authenticated user


type Vehicle = {
    id: string;
    make?: string | null;
    model?: string | null;
    plate?: string | null;
    created_at?: string | null;
    [key: string]: unknown;
};

export default function VehicleList(): React.ReactElement {
    const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    return (
        <ul className="list-none p-0 m-0 divide-y divide-white/10">
            {vehicles.map((v) => (
                <li key={v.id} className="py-3">
                    <div className="font-semibold text-white">
                        {v.make ?? 'Marque inconnue'} {v.model ?? ''}
                    </div>
                    {v.plate && <div className="text-white/80">Plaque : {v.plate}</div>}

                    {v.created_at && (
                        <div className="text-white/70 text-sm">
                            Ajouté le : {new Date(v.created_at).toLocaleString()}
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
}