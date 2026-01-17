export interface ScoutingReportType {
    id: string;
    playerId: string;
    notes: string;
    createdAt: Date;
}

export interface NoteType {
    id: string;
    userId: string;
    content: string;
    createdAt: Date;
}

export interface UserType {
    id: string;
    username: string;
    password: string;
    role: string;
}