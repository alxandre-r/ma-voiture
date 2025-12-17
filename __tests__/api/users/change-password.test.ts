/**
 * @file __tests__/api/users/change-password.test.ts
 * @description Unit tests for the change password API endpoint.
 */

import { describe, expect, test, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/users/change-password/route';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

// Mock the Supabase client
vi.mock('@/lib/supabaseServer', () => ({
  createSupabaseServerClient: vi.fn(),
}));

describe('Change Password API', () => {
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

    const request = new Request('http://localhost/api/users/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: 'old123', newPassword: 'new123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Non autorisé - utilisateur non connecté');
  });

  test('should return 400 if passwords are missing', async () => {
    // Mock Supabase to return a user
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ 
          data: { user: { id: '123', email: 'test@example.com' } } 
        }),
      },
    };
    
    (createSupabaseServerClient as any).mockResolvedValue(mockSupabase);

    const request = new Request('http://localhost/api/users/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: '', newPassword: '' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Les deux mots de passe sont requis');
  });

  test('should return 400 if new password is too short', async () => {
    // Mock Supabase to return a user
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ 
          data: { user: { id: '123', email: 'test@example.com' } } 
        }),
      },
    };
    
    (createSupabaseServerClient as any).mockResolvedValue(mockSupabase);

    const request = new Request('http://localhost/api/users/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: 'old123', newPassword: 'short' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Le nouveau mot de passe doit contenir au moins 6 caractères');
  });

  test('should return 401 if old password is incorrect', async () => {
    // Mock Supabase to return a user and fail reauthentication
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ 
          data: { user: { id: '123', email: 'test@example.com' } } 
        }),
        signInWithPassword: vi.fn().mockResolvedValue({ 
          data: null,
          error: { message: 'Invalid credentials' }
        }),
      },
    };
    
    (createSupabaseServerClient as any).mockResolvedValue(mockSupabase);

    const request = new Request('http://localhost/api/users/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: 'wrong', newPassword: 'new123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Ancien mot de passe incorrect');
  });

  test('should return 200 and update password successfully', async () => {
    // Mock Supabase to return a user and successful update
    const mockUser = { id: '123', email: 'test@example.com' };
    const updatedUser = { ...mockUser };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        signInWithPassword: vi.fn().mockResolvedValue({ 
          data: { user: mockUser },
          error: null
        }),
        updateUser: vi.fn().mockResolvedValue({ 
          data: { user: updatedUser },
          error: null
        }),
      },
    };
    
    (createSupabaseServerClient as any).mockResolvedValue(mockSupabase);

    const request = new Request('http://localhost/api/users/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: 'old123', newPassword: 'new123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Mot de passe mis à jour avec succès');
    expect(data.user).toBeDefined();
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'old123',
    });
    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
      password: 'new123',
    });
  });

  test('should return 500 if Supabase update fails', async () => {
    // Mock Supabase to return an error during password update
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ 
          data: { user: { id: '123', email: 'test@example.com' } } 
        }),
        signInWithPassword: vi.fn().mockResolvedValue({ 
          data: { user: { id: '123', email: 'test@example.com' } },
          error: null
        }),
        updateUser: vi.fn().mockResolvedValue({ 
          data: null,
          error: { message: 'Database error' }
        }),
      },
    };
    
    (createSupabaseServerClient as any).mockResolvedValue(mockSupabase);

    const request = new Request('http://localhost/api/users/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: 'old123', newPassword: 'new123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Erreur lors de la mise à jour du mot de passe');
  });
});