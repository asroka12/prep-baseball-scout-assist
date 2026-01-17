export class ScoutingReport {
    id: string;
    playerId: string;
    notes: string[];
    createdAt: Date;

    constructor(id: string, playerId: string, notes: string[], createdAt: Date) {
        this.id = id;
        this.playerId = playerId;
        this.notes = notes;
        this.createdAt = createdAt;
    }
}