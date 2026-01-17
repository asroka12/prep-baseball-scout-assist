import { Router } from 'express';
import ScoutingReportsController from '../controllers/scoutingReports';

const router = Router();
const scoutingReportsController = new ScoutingReportsController();

export function setScoutingReportsRoutes(app) {
    app.use('/api/scouting-reports', router);
    
    router.post('/', scoutingReportsController.createReport.bind(scoutingReportsController));
    router.get('/', scoutingReportsController.getReports.bind(scoutingReportsController));
    router.put('/:id', scoutingReportsController.updateReport.bind(scoutingReportsController));
    router.delete('/:id', scoutingReportsController.deleteReport.bind(scoutingReportsController));
}