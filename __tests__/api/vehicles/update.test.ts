/**
 * @file __tests__/api/vehicles/update.test.ts
 * @fileoverview Unit tests for the vehicle update API endpoint.
 * 
 * Tests the PATCH /api/vehicles/update endpoint functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PATCH } from '@/app/api/vehicles/update/route';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

// Mock the supabase client
vi.mock('@/lib/supabaseServer', () => ({
  createSupabaseServerClient: vi.fn(),
}));

describe('PATCH /api/vehicles/update', () => {
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

    const request = new Request('http://localhost/api/vehicles/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'test-vehicle-id', name: 'Updated Vehicle' }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 if vehicle ID is missing', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    const request = new Request('http://localhost/api/vehicles/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Vehicle' }), // No ID
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Vehicle ID is required');
  });

  it('should return 400 if no update data is provided', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    const request = new Request('http://localhost/api/vehicles/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'test-vehicle-id' }), // No update data
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('No update data provided');
  });

  it('should return 404 if vehicle is not found or user does not own it', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Mock the vehicle query to return no data (vehicle not found)
    const mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    
    mockSupabase.from.mockReturnValue(mockQueryBuilder);

    const request = new Request('http://localhost/api/vehicles/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'non-existent-vehicle-id', name: 'Updated Vehicle' }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Vehicle not found or you do not have permission to update it');
  });

  it('should successfully update a vehicle when all conditions are met', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Mock the vehicle verification query
    const mockVerificationQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: 'test-vehicle-id', owner: 'test-user-id' },
        error: null,
      }),
    };

    // Mock the update query
    const mockUpdateQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'test-vehicle-id',
          owner: 'test-user-id',
          name: 'Updated Vehicle',
          make: 'Toyota',
          model: 'Corolla',
          year: 2023,
          fuel_type: 'Essence',
          manufacturer_consumption: 6.5,
          plate: 'ABC123',
          last_fill: null,
        },
        error: null,
      }),
    };

    // Mock the fills query to return no data (no fills exist)
    const mockFillsQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    };

    // Setup mockSupabase.from to return different query builders based on call
    mockSupabase.from
      .mockReturnValueOnce(mockVerificationQuery) // First call for verification
      .mockReturnValueOnce(mockFillsQuery) // Second call for fills query
      .mockReturnValueOnce(mockUpdateQuery); // Third call for update

    const request = new Request('http://localhost/api/vehicles/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: 'test-vehicle-id', 
        name: 'Updated Vehicle',
        make: 'Toyota',
        model: 'Corolla',
        year: 2023,
      }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Vehicle updated successfully');
    expect(data.vehicle).toBeDefined();
    expect(data.vehicle.name).toBe('Updated Vehicle');
  });

  it('should return 500 if there is an error during vehicle verification', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Mock the vehicle query to return an error
    const mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ 
        data: null, 
        error: new Error('Database error'),
      }),
    };
    
    mockSupabase.from.mockReturnValue(mockQueryBuilder);

    const request = new Request('http://localhost/api/vehicles/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'test-vehicle-id', name: 'Updated Vehicle' }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to verify vehicle ownership');
  });

  it('should return 500 if there is an error during vehicle update', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Mock the vehicle verification query (successful)
    const mockVerificationQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: 'test-vehicle-id', owner: 'test-user-id' },
        error: null,
      }),
    };

    // Mock the update query to return an error
    const mockUpdateQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Update failed'),
      }),
    };

    // Setup mockSupabase.from to return different query builders
    mockSupabase.from
      .mockReturnValueOnce(mockVerificationQuery) // First call for verification
      .mockReturnValueOnce(mockUpdateQuery); // Second call for update

    const request = new Request('http://localhost/api/vehicles/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'test-vehicle-id', name: 'Updated Vehicle' }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Update failed');
  });

  it('should filter out invalid fields and only update valid ones', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Mock the vehicle verification query
    const mockVerificationQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: 'test-vehicle-id', owner: 'test-user-id' },
        error: null,
      }),
    };

    // Mock the fills query to return no data (no fills exist)
    const mockFillsQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    };

    // Mock the update query - should only receive valid fields
    const mockUpdateQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'test-vehicle-id',
          owner: 'test-user-id',
          name: 'Updated Vehicle',
          make: 'Toyota',
          // plate field should be filtered out and not included in the update
        },
        error: null,
      }),
    };

    // Setup mockSupabase.from to return different query builders
    mockSupabase.from
      .mockReturnValueOnce(mockVerificationQuery) // First call for verification
      .mockReturnValueOnce(mockFillsQuery) // Second call for fills query
      .mockReturnValueOnce(mockUpdateQuery); // Third call for update

    // Send request with both valid and invalid fields (plate is now valid, but invalidField should be filtered out)
    const request = new Request('http://localhost/api/vehicles/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: 'test-vehicle-id', 
        name: 'Updated Vehicle',
        make: 'Toyota',
        plate: 'ABC123', // This should now be included (plate field was added to schema)
        invalidField: 'should-be-ignored', // This should be filtered out
      }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Vehicle updated successfully');
    expect(data.vehicle).toBeDefined();
    expect(data.vehicle.name).toBe('Updated Vehicle');
    expect(data.vehicle.plate).toBe('ABC123'); // Verify plate field was updated
  });

  it('should automatically update last_fill with most recent fill date when not explicitly provided', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Mock the vehicle verification query
    const mockVerificationQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: 'test-vehicle-id', owner: 'test-user-id' },
        error: null,
      }),
    };

    // Mock the fills query to return a most recent fill
    const mockFillsQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { date: '2023-12-15' },
        error: null,
      }),
    };

    // Mock the update query - should include the automatic last_fill
    const mockUpdateQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'test-vehicle-id',
          owner: 'test-user-id',
          name: 'Updated Vehicle',
          last_fill: '2023-12-15', // Should be automatically set from most recent fill
        },
        error: null,
      }),
    };

    // Setup mockSupabase.from to return different query builders
    mockSupabase.from
      .mockReturnValueOnce(mockVerificationQuery) // First call for verification
      .mockReturnValueOnce(mockFillsQuery) // Second call for fills query
      .mockReturnValueOnce(mockUpdateQuery); // Third call for update

    const request = new Request('http://localhost/api/vehicles/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: 'test-vehicle-id', 
        name: 'Updated Vehicle',
        // Note: last_fill is NOT provided, so it should be automatically set
      }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Vehicle updated successfully');
    expect(data.vehicle).toBeDefined();
    expect(data.vehicle.name).toBe('Updated Vehicle');
    expect(data.vehicle.last_fill).toBe('2023-12-15'); // Verify automatic last_fill was set
  });

  it('should not override explicit last_fill value when provided', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Mock the vehicle verification query
    const mockVerificationQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: 'test-vehicle-id', owner: 'test-user-id' },
        error: null,
      }),
    };

    // Mock the fills query to return a most recent fill
    const mockFillsQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { date: '2023-12-15' },
        error: null,
      }),
    };

    // Mock the update query - should use the explicit last_fill value
    const mockUpdateQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'test-vehicle-id',
          owner: 'test-user-id',
          name: 'Updated Vehicle',
          last_fill: '2023-12-20', // Should use the explicit value, not the fill date
        },
        error: null,
      }),
    };

    // Setup mockSupabase.from to return different query builders
    mockSupabase.from
      .mockReturnValueOnce(mockVerificationQuery) // First call for verification
      .mockReturnValueOnce(mockFillsQuery) // Second call for fills query
      .mockReturnValueOnce(mockUpdateQuery); // Third call for update

    const request = new Request('http://localhost/api/vehicles/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: 'test-vehicle-id', 
        name: 'Updated Vehicle',
        last_fill: '2023-12-20', // Explicit last_fill value provided
      }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Vehicle updated successfully');
    expect(data.vehicle).toBeDefined();
    expect(data.vehicle.name).toBe('Updated Vehicle');
    expect(data.vehicle.last_fill).toBe('2023-12-20'); // Verify explicit value was used
  });
});