import { Router } from 'express';
import { UsersController } from '../controllers/users';

const router = Router();
const usersController = new UsersController();

export function setUsersRoutes(app) {
    app.post('/users', usersController.createUser.bind(usersController));
    app.get('/users/:id', usersController.getUser.bind(usersController));
    app.put('/users/:id', usersController.updateUser.bind(usersController));
    app.delete('/users/:id', usersController.deleteUser.bind(usersController));
}