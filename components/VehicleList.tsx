import React, { useEffect, useState } from 'react';

// Component that displays, if user has any car, the list of vehicles data
// use the api/vehicles/get route to fetch vehicles data from authenticated user

'use client';
type Vehicle = {
    id: string;
    make?: string | null;
    model?: string | null;
    plate?: string | null;
    created_at?: string | null;
    [key: string]: any;
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

    if (loading) return <div>Loading vehicles…</div>;
    if (error) return <div style={{ color: 'var(--error, #c00)' }}>Error: {error}</div>;
    if (!vehicles || vehicles.length === 0)
        return <div>You don’t have any vehicles yet.</div>;

    return (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {vehicles.map((v) => (
                <li
                    key={v.id}
                    style={{
                        padding: '12px',
                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                    }}
                >
                    <div style={{ fontWeight: 600 }}>
                        {v.make ?? 'Unknown make'} {v.model ?? ''}
                    </div>
                    {v.plate && <div style={{ color: 'rgba(0,0,0,0.6)' }}>Plate: {v.plate}</div>}
                    {v.created_at && (
                        <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: '0.9em' }}>
                            Added: {new Date(v.created_at).toLocaleString()}
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
}