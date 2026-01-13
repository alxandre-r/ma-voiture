import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNotifications } from './NotificationContext'
import { useRouter } from 'next/navigation'

interface Family {
  id: string
  name: string
  owner: string
  created_at: string
  invite_token?: string
  invite_token_expires?: string
  invite_token_used?: boolean
}

interface FamilyMember {
  user_id: string
  full_name: string
  email: string | null
  role: string
  joined_at: string
}

interface FamilyContextType {
  families: Family[]
  currentFamily: Family | null
  currentFamilyRole: string | null
  familyMembers: FamilyMember[] | null
  isLoading: boolean
  error: string | null
  createFamily: (name: string) => Promise<Family | null>
  joinFamily: (code: string) => Promise<Family | null>
  leaveFamily: (familyId: string) => Promise<boolean>
  deleteFamily: (familyId: string) => Promise<boolean>
  updateFamily: (familyId: string, name: string) => Promise<Family | null>
  generateInviteCode: (familyId: string) => Promise<{ token: string; link: string } | null>
  updateMemberRole: (familyId: string, userId: string, role: string) => Promise<FamilyMember | null>
  removeMember: (familyId: string, userId: string) => Promise<boolean>
  loadFamilies: () => Promise<void>
  loadFamilyDetails: (familyId: string) => Promise<void>
  setCurrentFamily: (family: Family | null) => void
  refreshFamilies: () => Promise<void>
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined)

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showSuccess, showError } = useNotifications()
  const router = useRouter()
  
  const [families, setFamilies] = useState<Family[]>([])
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null)
  const [currentFamilyRole, setCurrentFamilyRole] = useState<string | null>(null)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // Load families from localStorage on initial load
  useEffect(() => {
    const savedFamilies = localStorage.getItem('families')
    const savedCurrentFamily = localStorage.getItem('currentFamily')
    
    if (savedFamilies) {
      try {
        setFamilies(JSON.parse(savedFamilies))
      } catch (e) {
        console.error('Failed to parse families from localStorage:', e)
      }
    }
    
    if (savedCurrentFamily) {
      try {
        setCurrentFamily(JSON.parse(savedCurrentFamily))
      } catch (e) {
        console.error('Failed to parse currentFamily from localStorage:', e)
      }
    }
    
    setIsLoading(false)
  }, [])
  
  // Save families and current family to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('families', JSON.stringify(families))
      localStorage.setItem('currentFamily', JSON.stringify(currentFamily))
    }
  }, [families, currentFamily, isLoading])
  
  const loadFamilies = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/families/list')
      
      if (!response.ok) {
        throw new Error('Failed to load families')
      }
      
      const data = await response.json()
      
      if (data.success && data.families) {
        setFamilies(data.families)
        
        // If no current family is set, set the first one as current
        if (!currentFamily && data.families.length > 0) {
          setCurrentFamily(data.families[0])
        }
      }
    } catch (err) {
      console.error('Error loading families:', err)
      setError(err instanceof Error ? err.message : 'Failed to load families')
      showError('Failed to load families')
    } finally {
      setIsLoading(false)
    }
  }, [currentFamily, showSuccess, showError])
  
  const loadFamilyDetails = useCallback(async (familyId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/families/${familyId}`)
      
      if (!response.ok) {
        throw new Error('Failed to load family details')
      }
      
      const data = await response.json()
      
      if (data.success) {
        const familyData = data.family
        setCurrentFamilyRole(data.current_user_role)
        setFamilyMembers(data.members)
        
        // Update the family in the families list
        setFamilies(prevFamilies => 
          prevFamilies.map(f => 
            f.id === familyId ? { ...f, ...familyData } : f
          )
        )
        
        return
      }
    } catch (err) {
      console.error('Error loading family details:', err)
      setError(err instanceof Error ? err.message : 'Failed to load family details')
      showError('Failed to load family details')
    } finally {
      setIsLoading(false)
    }
  }, [showSuccess, showError])
  
  const createFamily = useCallback(async (name: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/families/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create family')
      }
      
      const data = await response.json()
      
      if (data.success && data.family) {
        showSuccess('Family created successfully!')
        await loadFamilies()
        return data.family
      }
      
      return null
    } catch (err) {
      console.error('Error creating family:', err)
      setError(err instanceof Error ? err.message : 'Failed to create family')
      showError(err instanceof Error ? err.message : 'Failed to create family')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [loadFamilies, showSuccess, showError])
  
  const joinFamily = useCallback(async (code: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/families/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to join family')
      }
      
      const data = await response.json()
      
      if (data.success && data.family) {
        showSuccess('Successfully joined the family!')
        await loadFamilies()
        return data.family
      }
      
      return null
    } catch (err) {
      console.error('Error joining family:', err)
      setError(err instanceof Error ? err.message : 'Failed to join family')
      showError(err instanceof Error ? err.message : 'Failed to join family')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [loadFamilies, showSuccess, showError])
  
  const leaveFamily = useCallback(async (familyId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/families/${familyId}/leave`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to leave family')
      }
      
      const data = await response.json()
      
      if (data.success) {
        showSuccess('Successfully left the family')
        
        // Remove family from list and reset current family if needed
        setFamilies(prevFamilies => {
          const updatedFamilies = prevFamilies.filter(f => f.id !== familyId)
          
          if (currentFamily?.id === familyId) {
            setCurrentFamily(updatedFamilies.length > 0 ? updatedFamilies[0] : null)
          }
          
          return updatedFamilies
        })
        
        return true
      }
      
      return false
    } catch (err) {
      console.error('Error leaving family:', err)
      setError(err instanceof Error ? err.message : 'Failed to leave family')
      showError(err instanceof Error ? err.message : 'Failed to leave family')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [currentFamily, showSuccess, showError])
  
  const deleteFamily = useCallback(async (familyId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/families/${familyId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete family')
      }
      
      const data = await response.json()
      
      if (data.success) {
        showSuccess('Family deleted successfully')
        
        // Remove family from list and reset current family if needed
        setFamilies(prevFamilies => {
          const updatedFamilies = prevFamilies.filter(f => f.id !== familyId)
          
          if (currentFamily?.id === familyId) {
            setCurrentFamily(updatedFamilies.length > 0 ? updatedFamilies[0] : null)
          }
          
          return updatedFamilies
        })
        
        return true
      }
      
      return false
    } catch (err) {
      console.error('Error deleting family:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete family')
      showError(err instanceof Error ? err.message : 'Failed to delete family')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [currentFamily, showSuccess, showError])
  
  const updateFamily = useCallback(async (familyId: string, name: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/families/${familyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update family')
      }
      
      const data = await response.json()
      
      if (data.success && data.family) {
        showSuccess('Family updated successfully!')
        
        // Update family in the list
        setFamilies(prevFamilies => 
          prevFamilies.map(f => 
            f.id === familyId ? { ...f, name: data.family.name } : f
          )
        )
        
        // Update current family if it's the one being updated
        if (currentFamily?.id === familyId) {
          setCurrentFamily(prev => prev ? { ...prev, name: data.family.name } : null)
        }
        
        return data.family
      }
      
      return null
    } catch (err) {
      console.error('Error updating family:', err)
      setError(err instanceof Error ? err.message : 'Failed to update family')
      showError(err instanceof Error ? err.message : 'Failed to update family')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [currentFamily, showSuccess, showError])
  
  const generateInviteCode = useCallback(async (familyId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/families/${familyId}/invite`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate invite code')
      }
      
      const data = await response.json()
      
      if (data.success) {
        showSuccess('New invite code generated!')
        return {
          token: data.invite_token,
          link: data.invite_link
        }
      }
      
      return null
    } catch (err) {
      console.error('Error generating invite code:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate invite code')
      showError(err instanceof Error ? err.message : 'Failed to generate invite code')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [showSuccess, showError])
  
  const updateMemberRole = useCallback(async (familyId: string, userId: string, role: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/families/${familyId}/members/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update member role')
      }
      
      const data = await response.json()
      
      if (data.success && data.member) {
        showSuccess('Member role updated successfully!')
        
        // Update member in the members list
        setFamilyMembers(prevMembers => 
          prevMembers ? prevMembers.map(m => 
            m.user_id === userId ? { ...m, role: data.member.role } : m
          ) : null
        )
        
        return data.member
      }
      
      return null
    } catch (err) {
      console.error('Error updating member role:', err)
      setError(err instanceof Error ? err.message : 'Failed to update member role')
      showError(err instanceof Error ? err.message : 'Failed to update member role')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [showSuccess, showError])
  
  const removeMember = useCallback(async (familyId: string, userId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/families/${familyId}/members/${userId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove member')
      }
      
      const data = await response.json()
      
      if (data.success) {
        showSuccess('Member removed successfully')
        
        // Remove member from the members list
        setFamilyMembers(prevMembers => 
          prevMembers ? prevMembers.filter(m => m.user_id !== userId) : null
        )
        
        return true
      }
      
      return false
    } catch (err) {
      console.error('Error removing member:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove member')
      showError(err instanceof Error ? err.message : 'Failed to remove member')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [showSuccess, showError])
  
  const refreshFamilies = useCallback(async () => {
    await loadFamilies()
  }, [loadFamilies])
  
  const contextValue = {
    families,
    currentFamily,
    currentFamilyRole,
    familyMembers,
    isLoading,
    error,
    createFamily,
    joinFamily,
    leaveFamily,
    deleteFamily,
    updateFamily,
    generateInviteCode,
    updateMemberRole,
    removeMember,
    loadFamilies,
    loadFamilyDetails,
    setCurrentFamily,
    refreshFamilies
  }
  
  return (
    <FamilyContext.Provider value={contextValue}>
      {children}
    </FamilyContext.Provider>
  )
}

export const useFamily = () => {
  const context = useContext(FamilyContext)
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider')
  }
  return context
}