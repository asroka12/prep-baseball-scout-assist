import { Request, Response } from 'express';
import { ScoutingService } from '../services/scoutingService';
import { ScoutingReport } from '../models/ScoutingReport';

export class ScoutingReportsController {
    private scoutingService: ScoutingService;

    constructor() {
        this.scoutingService = new ScoutingService();
    }

    public createReport = async (req: Request, res: Response): Promise<void> => {
        try {
            const reportData: ScoutingReport = req.body;
            const newReport = await this.scoutingService.createReport(reportData);
            res.status(201).json(newReport);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    public getReports = async (req: Request, res: Response): Promise<void> => {
        try {
            const reports = await this.scoutingService.fetchReports();
            res.status(200).json(reports);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    public updateReport = async (req: Request, res: Response): Promise<void> => {
        try {
            const reportId = req.params.id;
            const reportData: ScoutingReport = req.body;
            const updatedReport = await this.scoutingService.updateReport(reportId, reportData);
            res.status(200).json(updatedReport);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    public deleteReport = async (req: Request, res: Response): Promise<void> => {
        try {
            const reportId = req.params.id;
            await this.scoutingService.deleteReport(reportId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
}