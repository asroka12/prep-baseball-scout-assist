import { Request, Response } from 'express';
import { User } from '../models/User';

export class UsersController {
    public async createUser(req: Request, res: Response): Promise<Response> {
        const userData = req.body;
        const newUser = new User(userData);
        // Logic to save newUser to the database
        return res.status(201).json(newUser);
    }

    public async getUser(req: Request, res: Response): Promise<Response> {
        const userId = req.params.id;
        // Logic to retrieve user from the database by userId
        return res.status(200).json(user);
    }

    public async updateUser(req: Request, res: Response): Promise<Response> {
        const userId = req.params.id;
        const updatedData = req.body;
        // Logic to update user in the database
        return res.status(200).json(updatedUser);
    }

    public async deleteUser(req: Request, res: Response): Promise<Response> {
        const userId = req.params.id;
        // Logic to delete user from the database
        return res.status(204).send();
    }
}