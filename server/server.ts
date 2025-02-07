import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import apiRoutes from './routes/api';

const app = express();
const port = process.env.PORT || 3001;

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use(cors());
app.use(express.json());

// Register API routes with JSON Content-Type before static middleware
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    res.set('Content-Type', 'application/json');
    next();
});
app.use('/api', apiRoutes);

// Static file serving (after API routes)
app.use(express.static('public', { dotfiles: 'deny' }));

// Error handling middleware that returns JSON
app.use((err: Express.Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    if (!res.headersSent) {
        res.status(err.status || 500)
           .set('Content-Type', 'application/json')
           .json({ error: err.message || 'Internal server error', path: req.path });
    }
});

// Catch-all 404 for API endpoints (returns JSON)
app.use('*', (req: Request, res: Response) => {
    if (req.originalUrl.startsWith('/api/')) {
        res.status(404).set('Content-Type', 'application/json')
           .json({ error: 'API endpoint not found', path: req.path });
    } else {
        res.status(404).send('Not found');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
