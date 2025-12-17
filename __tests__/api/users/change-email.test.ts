/**
 * @file __tests__/api/users/change-email.test.ts
 * @description Unit tests for the change email API endpoint.
 */

import { describe, expect, test, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/users/change-email/route';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

// Mock the Supabase client
vi.mock('@/lib/supabaseServer', () => ({
  createSupabaseServerClient: vi.fn(),
}));

describe('Change Email API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return 401 if user is not authenticated', async () => {
    // Mock Supabase to return no user
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    };
    
    (createSupabaseServerClient as any).mockResolvedValue(mockSupabase);

    const request = new Request('http://localhost/api/users/change-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newEmail: 'test@example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Non autorisé - utilisateur non connecté');
  });

  test('should return 400 if email is invalid', async () => {
    // Mock Supabase to return a user
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ 
          data: { user: { id: '123', email: 'old@example.com' } } 
        }),
      },
    };
    
    (createSupabaseServerClient as any).mockResolvedValue(mockSupabase);

    const request = new Request('http://localhost/api/users/change-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newEmail: 'invalid-email' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Adresse email invalide');
  });

  test('should return 200 and update email successfully', async () => {
    // Mock Supabase to return a user and successful update
    const mockUser = { id: '123', email: 'old@example.com' };
    const updatedUser = { ...mockUser, email: 'new@example.com' };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        updateUser: vi.fn().mockResolvedValue({ 
          data: { user: updatedUser },
          error: null
        }),
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockResolvedValue({ data: [], error: null }),
        eq: vi.fn().mockReturnThis(),
      },
    };
    
    (createSupabaseServerClient as any).mockResolvedValue(mockSupabase);

    const request = new Request('http://localhost/api/users/change-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newEmail: 'new@example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Email mis à jour avec succès');
    expect(data.user.email).toBe('new@example.com');
    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
      email: 'new@example.com',
    });
  });

  test('should return 500 if Supabase update fails', async () => {
    // Mock Supabase to return an error
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ 
          data: { user: { id: '123', email: 'old@example.com' } } 
        }),
        updateUser: vi.fn().mockResolvedValue({ 
          data: null,
          error: { message: 'Database error' }
        }),
      },
    };
    
    (createSupabaseServerClient as any).mockResolvedValue(mockSupabase);

    const request = new Request('http://localhost/api/users/change-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newEmail: 'new@example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Erreur lors de la mise à jour de l\'email');
  });
});