import { ScoutingReport } from '../models/ScoutingReport';
import { Note } from '../models/Note';

export class ScoutingService {
    private reports: ScoutingReport[] = [];

    fetchReports(): ScoutingReport[] {
        return this.reports;
    }

    processReportData(data: any): ScoutingReport {
        const report = new ScoutingReport();
        report.id = data.id;
        report.playerId = data.playerId;
        report.notes = data.notes;
        report.createdAt = new Date();
        this.reports.push(report);
        return report;
    }
}