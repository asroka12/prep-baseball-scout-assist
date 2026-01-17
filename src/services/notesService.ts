import { Note } from '../models/Note';

export class NotesService {
    private notes: Note[] = [];

    fetchNotes(): Note[] {
        return this.notes;
    }

    processNoteData(noteData: Partial<Note>): Note {
        const newNote: Note = {
            id: this.notes.length + 1,
            userId: noteData.userId || 0,
            content: noteData.content || '',
            createdAt: new Date(),
        };
        this.notes.push(newNote);
        return newNote;
    }

    updateNote(id: number, updatedData: Partial<Note>): Note | null {
        const noteIndex = this.notes.findIndex(note => note.id === id);
        if (noteIndex === -1) return null;

        const updatedNote = { ...this.notes[noteIndex], ...updatedData };
        this.notes[noteIndex] = updatedNote;
        return updatedNote;
    }

    deleteNote(id: number): boolean {
        const noteIndex = this.notes.findIndex(note => note.id === id);
        if (noteIndex === -1) return false;

        this.notes.splice(noteIndex, 1);
        return true;
    }
}