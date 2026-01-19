import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Notes({ recipeId }) {
  const { user, isAuthenticated, updateRecipeNotes } = useAuth();
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [originalNote, setOriginalNote] = useState('');

  // Función memoizada para extraer la nota correspondiente al recipeId actual
  const extractNoteForRecipe = useCallback(() => {
    if (!user?.notes) return '';
    
    if (Array.isArray(user.notes)) {
      const found = user.notes.find(n => n.idRecipe === recipeId);
      return found ? found.note : '';
    } 
    
    if (typeof user.notes === 'object' && user.notes !== null) {
      return user.notes[recipeId] || '';
    }
    
    return '';
  }, [user, recipeId]);

  // Inicializar y actualizar las notas cuando cambia el usuario o el recipeId
  useEffect(() => {
    const currentNote = extractNoteForRecipe();
    setNotes(currentNote);
    setOriginalNote(currentNote);
  }, [extractNoteForRecipe]);

  const handleSaveNotes = useCallback(async () => {
    if (!isAuthenticated || notes === originalNote) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    try {
      await updateRecipeNotes(recipeId, notes);
      setOriginalNote(notes);
      setIsEditing(false);
    } catch (error) {
      console.error('Error al guardar las notas:', error);
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, notes, originalNote, recipeId, updateRecipeNotes]);

  const handleCancelEdit = useCallback(() => {
    setNotes(originalNote);
    setIsEditing(false);
  }, [originalNote]);

  const handleDeleteNote = useCallback(async () => {
    if (!isAuthenticated || !originalNote) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/auth/notes`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeId }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
      
      setNotes('');
      setOriginalNote('');
      setIsEditing(false);
    } catch (error) {
      console.error('Error al eliminar la nota:', error);
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, originalNote, recipeId]);

  const handleChange = useCallback((e) => {
    setNotes(e.target.value);
  }, []);

  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Determinar si el botón de guardar debería estar deshabilitado
  const isSaveDisabled = useMemo(() => {
    return isSaving || notes === originalNote;
  }, [isSaving, notes, originalNote]);

  // Si el usuario no está autenticado, no mostrar nada
  if (!isAuthenticated) return null;

  return (
    <div>
      <div className='pb-6 sm:py-8'>
      <div className='flex justify-between items-center pb-4 sm:pb-8'>
        <h3 className='text-green-500 text-xl sm:text-2xl font-bold'>My Notes</h3>
        <span className='text-gray-400 text-sm'>Visible only to you</span>
      </div>

      {isEditing ? (
        <div className='space-y-4'>
          <textarea
            value={notes}
            onChange={handleChange}
            className='w-full h-32 p-3 bg-neutral-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
            placeholder='Write your personal notes about this recipe...'
          />
          <div className='flex justify-end space-x-3'>
            <button
              onClick={handleCancelEdit}
              className='px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-500 transition-colors'
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteNote}
              className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
              disabled={isSaving || !originalNote}
            >
              Delete
            </button>
            <button
              onClick={handleSaveNotes}
              className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center'
              disabled={isSaveDisabled}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className='notes-section bg-neutral-800 rounded-lg p-4 border border-neutral-700'>
          {originalNote ? (
            <div>
              <p className='text-white whitespace-pre-wrap'>{originalNote}</p>
              <button
                onClick={startEditing}
                className='mt-4 text-green-500 hover:text-green-400 transition-colors'
              >
                Edit Note
              </button>
            </div>
          ) : (
            <div className='text-center py-6'>
              <p className='text-gray-400 mb-4'>{"Add your own tweaks, variations, or reminders here."}</p>
              <button
                onClick={startEditing}
                className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
              >
                Add Note
              </button>
            </div>
          )}
        </div>
      )}
    
    </div>
    <hr className='separator--silver-60' />
    </div>
  );
}