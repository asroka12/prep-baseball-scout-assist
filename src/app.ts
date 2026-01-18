import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import multer from 'multer';
import csv from 'csv-parser';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { db, connectToDatabase } from './database/connection';

dotenv.config();
const app = express();
const PORT: number = Number(process.env.PORT) || 3000;
const ORIGIN = process.env.ORIGIN || '*';

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"],
    }
  }
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({ origin: ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Basic rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use(limiter);

// Database connection
connectToDatabase();

// Multer setup for file uploads
const upload = multer({ dest: path.join(__dirname, '../uploads') });

// CSV Upload endpoint
app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results: any[] = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data: any) => results.push(data))
    .on('end', () => {
      // Flexible column mapper - tries multiple variations case-insensitively
      const findColumn = (obj: any, ...patterns: string[]): string => {
        const keys = Object.keys(obj);
        for (const pattern of patterns) {
          // Exact match (case-insensitive)
          const exact = keys.find(k => k.toLowerCase() === pattern.toLowerCase());
          if (exact && obj[exact]) return obj[exact].toString().trim();
          
          // Partial match (contains pattern)
          const partial = keys.find(k => k.toLowerCase().includes(pattern.toLowerCase()));
          if (partial && obj[partial]) return obj[partial].toString().trim();
        }
        return '';
      };

      for (const player of results) {
        // Parse Bats/Throws format (e.g., "R/R" -> bat: R, throw: R)
        const batsThrows = findColumn(player, 'bats/throws', 'bats', 'throw');
        let batHand = '';
        let throwHand = '';
        if (batsThrows && batsThrows.includes('/')) {
          const [bat, thr] = batsThrows.split('/').map(s => s.trim());
          batHand = bat || '';
          throwHand = thr || '';
        }

        db.run(
          `INSERT INTO players (firstName, lastName, school, gradYear, state, height, weight, commitment, batHand, throwHand, position)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            findColumn(player, 'first name', 'first', 'firstname'),
            findColumn(player, 'last name', 'last', 'lastname'),
            findColumn(player, 'high school', 'school', 'team'),
            findColumn(player, 'grad class', 'grad year', 'grad', 'year'),
            findColumn(player, 'state'),
            findColumn(player, 'height'),
            findColumn(player, 'weight'),
            findColumn(player, 'commitment'),
            batHand || findColumn(player, 'bat hand', 'bat'),
            throwHand || findColumn(player, 'throw hand', 'throw'),
            findColumn(player, 'primary', 'position', 'pos'),
          ],
          (err) => {
            if (err) console.error('Insert error:', err);
          }
        );
      }
      fs.unlink(req.file!.path, (err) => {
        if (err) console.error('File delete error:', err);
      });
      res.json({ success: true, message: `Uploaded ${results.length} players` });
    })
    .on('error', (error: any) => {
      console.error('Parse error:', error);
      res.status(500).json({ error: 'CSV parsing failed' });
    });
});

// Create scouting report
app.post('/api/reports', (req: Request, res: Response) => {
  const {
    playerName,
    playerSchool,
    eventDate,
    eventName,
    scoutName,
    overallGrade,
    reportType,
    // Showcase fields
    bodyNotes,
    hitNotes,
    hitGrade,
    powerNotes,
    powerGrade,
    fieldNotes,
    fieldGrade,
    armNotes,
    armGrade,
    scoutNotes,
    // Game fields
    gameNotes,
    formattedAtBats,
    atBats,
  } = req.body;

  const atBatsJson = atBats ? JSON.stringify(atBats) : null;

  db.run(
    `INSERT INTO reports (
      playerName, playerSchool, eventDate, eventName, scoutName, overallGrade,
      reportType, scoutNotes, gameNotes, formattedAtBats, atBatsJson
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      playerName, playerSchool, eventDate, eventName, scoutName, overallGrade,
      reportType || 'showcase', scoutNotes || bodyNotes || '', gameNotes || null, formattedAtBats || null, atBatsJson
    ],
    function (err) {
      if (err) {
        console.error('Report insert error:', err);
        return res.status(500).json({ error: 'Failed to create report', details: err.message });
      }
      res.json({ id: this.lastID, message: 'Report created' });
    }
  );
});

// Get all reports
app.get('/api/reports', (req: Request, res: Response) => {
  db.all('SELECT * FROM reports ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch reports' });
    }
    res.json(rows);
  });
});

// Get reports by event
app.get('/api/reports/event/:eventName', (req: Request, res: Response) => {
  const { eventName } = req.params;
  db.all('SELECT * FROM reports WHERE eventName = ? ORDER BY createdAt DESC', [eventName], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch reports' });
    }
    res.json(rows);
  });
});

// Get all events
app.get('/api/events', (req: Request, res: Response) => {
  db.all(
    'SELECT DISTINCT eventName, eventDate FROM reports ORDER BY eventDate DESC',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch events' });
      }
      res.json(rows || []);
    }
  );
});

// Get all players
app.get('/api/players', (req: Request, res: Response) => {
  db.all('SELECT * FROM players ORDER BY lastName, firstName', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch players' });
    }
    res.json(rows || []);
  });
});

// Search players
app.get('/api/players/search', (req: Request, res: Response) => {
  const query = req.query.q as string;
  if (!query || query.length < 2) {
    return res.json([]);
  }

  const searchTerm = `%${query}%`;
  db.all(
    'SELECT firstName, lastName, school, position FROM players WHERE firstName LIKE ? OR lastName LIKE ? LIMIT 20',
    [searchTerm, searchTerm],
    (err, rows) => {
      if (err) {
        console.error('Search error:', err);
        return res.status(500).json({ error: 'Search failed' });
      }
      res.json(rows || []);
    }
  );
});


// Add player (manual quick add)
app.post('/api/players', (req: Request, res: Response) => {
  const { firstName, lastName, school, gradYear, state, height, weight, commitment, batHand, throwHand, position } = req.body;

  if (!firstName || !lastName || !school) {
    return res.status(400).json({ error: 'firstName, lastName, and school are required' });
  }

  db.run(
    `INSERT INTO players (firstName, lastName, school, gradYear, state, height, weight, commitment, batHand, throwHand, position)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [firstName, lastName, school, gradYear || '', state || '', height || '', weight || '', commitment || '', batHand || '', throwHand || '', position || ''],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add player' });
      }
      res.json({ id: this.lastID, message: 'Player added' });
    }
  );
});
// Export reports as text
app.post('/api/export-text', (req: Request, res: Response) => {
  const { eventName, eventDate } = req.body;
  db.all(
    'SELECT * FROM reports WHERE eventName = ? AND eventDate = ? ORDER BY playerName',
    [eventName, eventDate],
    (err, rows: any[]) => {
      if (err || !rows) {
        return res.status(500).json({ error: 'Export failed' });
      }

      let text = `${eventName} - ${eventDate}\n`;
      text += '='.repeat(50) + '\n\n';

      rows.forEach((report) => {
        text += `PLAYER: ${report.playerName} (${report.playerSchool})\n`;
        text += `SCOUT: ${report.scoutName}\n`;
        text += `GRADE: ${report.overallGrade}/10\n`;
        text += `\nMechanics:\n`;
        text += `  Stance: ${report.stance}\n`;
        text += `  Load: ${report.load}\n`;
        text += `  Swing Path: ${report.swingPath}\n`;
        text += `  Barrel Feel: ${report.barrelFeel}\n`;
        text += `\nVelocity:\n`;
        text += `  Bat Speed: ${report.batSpeed}\n`;
        text += `  Avg EV: ${report.avgEV}\n`;
        text += `  Max EV: ${report.maxEV}\n`;
        text += `  Max Distance: ${report.maxDist}\n`;
        text += `\nNotes:\n${report.scoutNotes}\n`;
        text += '-'.repeat(50) + '\n\n';
      });

      res.json({ text });
    }
  );
});

// Healthcheck
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server running and accessible on LAN at http://0.0.0.0:${PORT}`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    db.close((err) => {
      if (err) console.error('DB close error:', err);
      console.log('Shutdown complete');
      process.exit(0);
    });
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));