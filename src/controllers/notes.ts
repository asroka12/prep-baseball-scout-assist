import { Request, Response } from 'express';
import { NotesService } from '../services/notesService';

export class NotesController {
    private notesService: NotesService;

    constructor() {
        this.notesService = new NotesService();
    }

    public createNote = async (req: Request, res: Response): Promise<void> => {
        try {
            const noteData = req.body;
            const newNote = await this.notesService.createNote(noteData);
            res.status(201).json(newNote);
        } catch (error) {
            res.status(500).json({ message: 'Error creating note', error });
        }
    };

    public getNotes = async (req: Request, res: Response): Promise<void> => {
        try {
            const notes = await this.notesService.fetchNotes();
            res.status(200).json(notes);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching notes', error });
        }
    };

    public updateNote = async (req: Request, res: Response): Promise<void> => {
        try {
            const noteId = req.params.id;
            const noteData = req.body;
            const updatedNote = await this.notesService.updateNote(noteId, noteData);
            res.status(200).json(updatedNote);
        } catch (error) {
            res.status(500).json({ message: 'Error updating note', error });
        }
    };

    public deleteNote = async (req: Request, res: Response): Promise<void> => {
        try {
            const noteId = req.params.id;
            await this.notesService.deleteNote(noteId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error deleting note', error });
        }
    };
}