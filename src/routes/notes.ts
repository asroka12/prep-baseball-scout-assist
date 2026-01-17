import { Router } from 'express';
import { NotesController } from '../controllers/notes';

const router = Router();
const notesController = new NotesController();

export function setNotesRoutes(app) {
    app.use('/api/notes', router);
    router.post('/', notesController.createNote.bind(notesController));
    router.get('/', notesController.getNotes.bind(notesController));
    router.put('/:id', notesController.updateNote.bind(notesController));
    router.delete('/:id', notesController.deleteNote.bind(notesController));
}