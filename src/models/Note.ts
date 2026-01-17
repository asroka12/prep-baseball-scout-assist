export class Note {
    id: string;
    userId: string;
    content: string;
    createdAt: Date;

    constructor(id: string, userId: string, content: string, createdAt: Date) {
        this.id = id;
        this.userId = userId;
        this.content = content;
        this.createdAt = createdAt;
    }
}