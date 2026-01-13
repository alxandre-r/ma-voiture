'use client';

import React from 'react'
import { useFamily } from '@/contexts/FamilyContext'

interface ContextSwitcherProps {
  onContextChange?: (context: 'user' | 'family', familyId?: string) => void
  currentContext: 'user' | 'family'
  currentFamilyId?: string | null
}

export const ContextSwitcher: React.FC<ContextSwitcherProps> = ({
  onContextChange,
  currentContext,
  currentFamilyId
}) => {
  const { families, currentFamily, setCurrentFamily, isLoading } = useFamily()
  
  const handleContextChange = (context: 'user' | 'family') => {
    if (context === 'user') {
      onContextChange?.('user')
    } else if (context === 'family' && families.length > 0) {
      // If no family is selected, select the first one
      const familyToUse = currentFamily || families[0]
      setCurrentFamily(familyToUse)
      onContextChange?.('family', familyToUse.id)
    }
  }
  
  const handleFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const familyId = e.target.value
    const selectedFamily = families.find(f => f.id === familyId)
    
    if (selectedFamily) {
      setCurrentFamily(selectedFamily)
      onContextChange?.('family', familyId)
    }
  }
  
  if (isLoading) {
    return <div className="loading-spinner">Chargement...</div>
  }
  
  // Only show the switcher if user has families
  if (families.length === 0) {
    return null
  }
  
  return (
    <div className="context-switcher">
      <div className="context-options">
        <button
          className={`context-button ${currentContext === 'user' ? 'active' : ''}`}
          onClick={() => handleContextChange('user')}
          disabled={currentContext === 'user'}
        >
          👤 Personnel
        </button>
        
        <button
          className={`context-button ${currentContext === 'family' ? 'active' : ''}`}
          onClick={() => handleContextChange('family')}
          disabled={currentContext === 'family'}
        >
          👨‍👩‍👧‍👦 Famille
        </button>
      </div>
      
      {currentContext === 'family' && families.length > 0 && (
        <div className="family-selector">
          <select
            value={currentFamilyId || ''}
            onChange={handleFamilyChange}
            className="family-select"
          >
            {families.map(family => (
              <option key={family.id} value={family.id}>
                {family.name} ({family.role === 'owner' ? 'Propriétaire' : 'Membre'})
              </option>
            ))}
          </select>
        </div>
      )}
      
      <style jsx>{`
        .context-switcher {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 0.5rem;
          background: var(--card-background);
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .context-options {
          display: flex;
          gap: 0.5rem;
        }
        
        .context-button {
          padding: 0.5rem 1rem;
          border: none;
          background: var(--button-background);
          color: var(--button-text);
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        
        .context-button:hover:not(:disabled) {
          background: var(--button-hover);
        }
        
        .context-button.active {
          background: var(--primary-color);
          color: white;
          font-weight: bold;
        }
        
        .context-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .family-selector {
          flex: 1;
        }
        
        .family-select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background: var(--input-background);
          color: var(--text-color);
          font-size: 0.9rem;
        }
        
        .family-select:focus {
          outline: none;
          border-color: var(--primary-color);
        }
      `}</style>
    </div>
  )
}