/**
 * @file __tests__/api/fills/delete.test.ts
 * @fileoverview Unit tests for the fill delete API endpoint.
 * 
 * Tests the DELETE /api/fills/delete endpoint functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DELETE } from '@/app/api/fills/delete/route';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

// Mock the supabase client
vi.mock('@/lib/supabaseServer', () => ({
  createSupabaseServerClient: vi.fn(),
}));

describe('DELETE /api/fills/delete', () => {
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

    const request = new Request('http://localhost/api/fills/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fillId: 'test-fill-id' }),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Non autorisé - utilisateur non connecté');
  });

  it('should return 400 if fillId is missing', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    const request = new Request('http://localhost/api/fills/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}), // No fillId
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Le champ fillId est requis');
  });

  it('should return 404 if fill is not found', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Mock the fill verification query to return no data (fill not found)
    const mockFillVerificationQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    
    mockSupabase.from.mockReturnValue(mockFillVerificationQuery);

    const request = new Request('http://localhost/api/fills/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fillId: 'non-existent-fill-id' }),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Plein non trouvé');
  });

  it('should return 403 if user does not own the fill', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Mock the fill verification query - but with different owner
    const mockFillVerificationQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { 
          id: 'test-fill-id', 
          vehicle_id: 'test-vehicle-id',
          date: '2023-12-15',
          owner: 'other-user-id' // Different owner
        },
        error: null,
      }),
    };
    
    mockSupabase.from.mockReturnValue(mockFillVerificationQuery);

    const request = new Request('http://localhost/api/fills/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fillId: 'test-fill-id' }),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Vous n&apos;êtes pas autorisé à supprimer ce plein');
  });

  it('should successfully delete a fill and update last_fill when it was the most recent fill', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Mock the fill verification query (now includes vehicle_id and date)
    const mockFillVerificationQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { 
          id: 'test-fill-id', 
          vehicle_id: 'test-vehicle-id',
          date: '2023-12-15',
          owner: 'test-user-id'
        },
        error: null,
      }),
    };

    // Mock the delete query
    const mockDeleteQuery = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      error: null,
    };

    // Mock the most recent fill query (finds a different fill)
    const mockRecentFillQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { date: '2023-11-20' }, // Different date than the deleted fill
        error: null,
      }),
    };

    // Mock the last_fill update query
    const mockLastFillUpdateQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      error: null,
    };

    // Setup mockSupabase.from to return different query builders
    mockSupabase.from
      .mockReturnValueOnce(mockFillVerificationQuery) // First call for fill verification
      .mockReturnValueOnce(mockDeleteQuery) // Second call for delete
      .mockReturnValueOnce(mockRecentFillQuery) // Third call for most recent fill
      .mockReturnValueOnce(mockLastFillUpdateQuery); // Fourth call for last_fill update

    const request = new Request('http://localhost/api/fills/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fillId: 'test-fill-id' }),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Plein supprimé avec succès');
    expect(data.fillId).toBe('test-fill-id');

    // Verify that the last_fill update was called with the new most recent fill date
    expect(mockLastFillUpdateQuery.update).toHaveBeenCalledWith({ last_fill: '2023-11-20' });
  });

  it('should set last_fill to null when deleting the last remaining fill', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Mock the fill data query (to get vehicle_id)
    const mockFillDataQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { 
          id: 'test-fill-id', 
          vehicle_id: 'test-vehicle-id',
          date: '2023-12-15',
          owner: 'test-user-id'
        },
        error: null,
      }),
    };

    // Mock the delete query
    const mockDeleteQuery = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      error: null,
    };

    // Mock the most recent fill query (no fills remain)
    const mockRecentFillQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null, // No fills remain
        error: null,
      }),
    };

    // Mock the last_fill update query
    const mockLastFillUpdateQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      error: null,
    };

    // Setup mockSupabase.from to return different query builders
    mockSupabase.from
      .mockReturnValueOnce(mockFillDataQuery) // First call for fill data
      .mockReturnValueOnce(mockDeleteQuery) // Second call for delete
      .mockReturnValueOnce(mockRecentFillQuery) // Third call for most recent fill (none found)
      .mockReturnValueOnce(mockLastFillUpdateQuery); // Fourth call for last_fill update

    const request = new Request('http://localhost/api/fills/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fillId: 'test-fill-id' }),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Plein supprimé avec succès');
    expect(data.fillId).toBe('test-fill-id');

    // Verify that the last_fill update was called with null (no fills remain)
    expect(mockLastFillUpdateQuery.update).toHaveBeenCalledWith({ last_fill: null });
  });

  it('should handle errors gracefully when updating last_fill fails', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Mock the fill data query (to get vehicle_id)
    const mockFillDataQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { 
          id: 'test-fill-id', 
          vehicle_id: 'test-vehicle-id',
          date: '2023-12-15',
          owner: 'test-user-id'
        },
        error: null,
      }),
    };

    // Mock the delete query
    const mockDeleteQuery = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      error: null,
    };

    // Mock the most recent fill query
    const mockRecentFillQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { date: '2023-11-20' },
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
      .mockReturnValueOnce(mockFillDataQuery) // First call for fill data
      .mockReturnValueOnce(mockDeleteQuery) // Second call for delete
      .mockReturnValueOnce(mockRecentFillQuery) // Third call for most recent fill
      .mockReturnValueOnce(mockLastFillUpdateQuery); // Fourth call for last_fill update (will fail)

    const request = new Request('http://localhost/api/fills/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fillId: 'test-fill-id' }),
    });

    const response = await DELETE(request);
    const data = await response.json();

    // Should still succeed even if last_fill update fails
    expect(response.status).toBe(200);
    expect(data.message).toBe('Plein supprimé avec succès');
    expect(data.fillId).toBe('test-fill-id');
  });

  it('should handle errors when getting fill data fails', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Mock the fill data query to fail
    const mockFillDataQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      }),
    };
    
    mockSupabase.from.mockReturnValue(mockFillDataQuery);

    const request = new Request('http://localhost/api/fills/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fillId: 'test-fill-id' }),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Plein non trouvé');
  });
});