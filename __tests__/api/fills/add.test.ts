/**
 * @file __tests__/api/fills/add.test.ts
 * @fileoverview Unit tests for the fill add API endpoint.
 * 
 * Tests the POST /api/fills/add endpoint functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/fills/add/route';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

// Mock the supabase client
vi.mock('@/lib/supabaseServer', () => ({
  createSupabaseServerClient: vi.fn(),
}));

describe('POST /api/fills/add', () => {
  let mockSupabase: any;
  
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
    
    // Mock supabase client
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    };
    
    // Mock the supabase client creation
    (createSupabaseServerClient as any).mockResolvedValue(mockSupabase);
  });

  it('should return 401 if user is not authenticated', async () => {
    // Mock auth.getUser to return error (no user)
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    });

    const request = new Request('http://localhost/api/fills/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle_id: 'test-vehicle-id',
        date: '2023-12-15',
        is_full: true,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Non autorisé - utilisateur non connecté');
  });

  it('should return 400 if vehicle_id is missing', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    const request = new Request('http://localhost/api/fills/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: '2023-12-15',
        is_full: true,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Le champ vehicle_id est requis');
  });

  it('should return 400 if date is missing', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    const request = new Request('http://localhost/api/fills/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle_id: 'test-vehicle-id',
        is_full: true,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Le champ date est requis');
  });

  it('should return 400 if is_full is missing', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    const request = new Request('http://localhost/api/fills/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle_id: 'test-vehicle-id',
        date: '2023-12-15',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Le champ is_full est requis');
  });

  it('should return 404 if vehicle is not found or user does not own it', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Mock the vehicle query to return no data (vehicle not found)
    const mockVehicleQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    
    mockSupabase.from.mockReturnValue(mockVehicleQuery);

    const request = new Request('http://localhost/api/fills/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle_id: 'non-existent-vehicle-id',
        date: '2023-12-15',
        is_full: true,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Véhicule non trouvé ou vous n&apos;êtes pas le propriétaire');
  });

  it('should successfully add a fill and update vehicle last_fill when all conditions are met', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Mock the vehicle verification query
    const mockVehicleQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'test-vehicle-id',
          name: 'Test Vehicle',
          make: 'Toyota',
          model: 'Corolla',
          fuel_type: 'Essence',
        },
        error: null,
      }),
    };

    // Mock the fill insert query
    const mockFillInsertQuery = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'test-fill-id',
          vehicle_id: 'test-vehicle-id',
          owner: 'test-user-id',
          date: '2023-12-15',
          odometer: 10000,
          liters: 45,
          amount: 75,
          price_per_liter: 1.67,
          is_full: true,
          notes: 'Test fill',
        },
        error: null,
      }),
    };

    // Mock the odometer update query
    const mockOdometerUpdateQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      error: null,
    };

    // Mock the last_fill update query
    const mockLastFillUpdateQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      error: null,
    };

    // Setup mockSupabase.from to return different query builders
    mockSupabase.from
      .mockReturnValueOnce(mockVehicleQuery) // First call for vehicle verification
      .mockReturnValueOnce(mockFillInsertQuery) // Second call for fill insert
      .mockReturnValueOnce(mockOdometerUpdateQuery) // Third call for odometer update
      .mockReturnValueOnce(mockLastFillUpdateQuery); // Fourth call for last_fill update

    const request = new Request('http://localhost/api/fills/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle_id: 'test-vehicle-id',
        date: '2023-12-15',
        odometer: 10000,
        liters: 45,
        amount: 75,
        price_per_liter: 1.67,
        is_full: true,
        notes: 'Test fill',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe('Plein ajouté avec succès');
    expect(data.fill).toBeDefined();
    expect(data.fill.vehicle_name).toBe('Test Vehicle');
    expect(data.fill.fuel_type).toBe('Essence');

    // Verify that the last_fill update was called with the correct date
    expect(mockLastFillUpdateQuery.update).toHaveBeenCalledWith({ last_fill: '2023-12-15' });
  });

  it('should handle errors gracefully when updating last_fill fails', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Mock the vehicle verification query
    const mockVehicleQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'test-vehicle-id',
          name: 'Test Vehicle',
          make: 'Toyota',
          model: 'Corolla',
          fuel_type: 'Essence',
        },
        error: null,
      }),
    };

    // Mock the fill insert query
    const mockFillInsertQuery = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'test-fill-id',
          vehicle_id: 'test-vehicle-id',
          owner: 'test-user-id',
          date: '2023-12-15',
          is_full: true,
        },
        error: null,
      }),
    };

    // Mock the last_fill update query to fail
    const mockLastFillUpdateQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      error: new Error('Database error'),
    };

    // Setup mockSupabase.from to return different query builders
    mockSupabase.from
      .mockReturnValueOnce(mockVehicleQuery) // First call for vehicle verification
      .mockReturnValueOnce(mockFillInsertQuery) // Second call for fill insert
      .mockReturnValueOnce(mockLastFillUpdateQuery); // Third call for last_fill update (will fail)

    const request = new Request('http://localhost/api/fills/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle_id: 'test-vehicle-id',
        date: '2023-12-15',
        is_full: true,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    // Should still succeed even if last_fill update fails
    expect(response.status).toBe(201);
    expect(data.message).toBe('Plein ajouté avec succès');
    expect(data.fill).toBeDefined();
  });
});