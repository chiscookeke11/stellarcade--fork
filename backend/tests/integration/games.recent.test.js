const request = require('supertest');
const express = require('express');

// Mock the database to prevent it from trying to connect and calling process.exit(1)
jest.mock('../../src/config/database', () => {
    const mock = jest.fn();
    mock.raw = jest.fn().mockResolvedValue({});
    return mock;
});

jest.mock('../../src/config/redis', () => {
    const mockClient = {
        get: jest.fn(),
        setEx: jest.fn().mockResolvedValue('OK'),
        connect: jest.fn().mockResolvedValue('OK'),
        on: jest.fn(),
        isOpen: true,
    };
    return { client: mockClient, connectPromise: Promise.resolve() };
});

const router = require('../../src/routes/games.routes');
const GameModel = require('../../src/models/Game.model');

// Mock the model to avoid DB connection issues in tests
jest.mock('../../src/models/Game.model');

jest.mock('../../src/middleware/auth.middleware', () => (req, res, next) => {
  req.user = { id: 1 };
  next();
});

// Create a standalone app for testing the routes
const app = express();
app.use(express.json());

// Mock middleware that might be needed
app.use((req, res, next) => {
    req.user = { id: 1 }; // Mock user for auth-protected routes
    next();
});

app.use('/api/games', router);

describe('GET /api/games', () => {
  test('returns catalog payload without missing-module errors', async () => {
    const res = await request(app).get('/api/games');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ games: [] });
  });
});

describe('POST /api/games/play', () => {
  test('returns success through game service', async () => {
    const res = await request(app)
      .post('/api/games/play')
      .send({ gameType: 'coin-flip' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });
});

describe('GET /api/games/recent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return recent games with default pagination', async () => {
        const mockGames = [
            { id: 1, game_type: 'coin-flip', bet_amount: 10, result: 'win' },
            { id: 2, game_type: 'trivia', bet_amount: 5, result: 'loss' }
        ];

        GameModel.findRecent.mockResolvedValue({
            items: mockGames,
            total: 2,
            page: 1,
            pageSize: 10,
        });

        const res = await request(app).get('/api/games/recent');

        expect(res.status).toBe(200);
        expect(res.body.items).toHaveLength(2);
        expect(res.body.total).toBe(2);
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(10);
        expect(res.body.totalPages).toBe(1);

        expect(GameModel.findRecent).toHaveBeenCalledWith(expect.objectContaining({
            page: 1,
            limit: 10
        }));
    });

    test('should support explicit limit and page pagination', async () => {
        GameModel.findRecent.mockResolvedValue({
            items: [],
            total: 5,
            page: 2,
            pageSize: 2,
        });

        const res = await request(app)
            .get('/api/games/recent')
            .query({ page: 2, limit: 2 });

        expect(res.status).toBe(200);
        expect(res.body.page).toBe(2);
        expect(res.body.pageSize).toBe(2);
        expect(res.body.total).toBe(5);
        expect(res.body.totalPages).toBe(3);

        expect(GameModel.findRecent).toHaveBeenCalledWith(expect.objectContaining({
            page: 2,
            limit: 2
        }));
    });

    test('should filter by gameType and status', async () => {
        GameModel.findRecent.mockResolvedValue({
            items: [],
            total: 0,
            page: 1,
            pageSize: 10,
        });

        const res = await request(app)
            .get('/api/games/recent')
            .query({ gameType: 'coin-flip', status: 'win' });

        expect(res.status).toBe(200);
        expect(GameModel.findRecent).toHaveBeenCalledWith(expect.objectContaining({
            gameType: 'coin-flip',
            status: 'win'
        }));
    });

    test('should support custom sorting', async () => {
        GameModel.findRecent.mockResolvedValue({
            items: [],
            total: 0,
            page: 1,
            pageSize: 10,
        });

        const res = await request(app)
            .get('/api/games/recent')
            .query({ sortBy: 'bet_amount', sortDir: 'asc' });

        expect(res.status).toBe(200);
        expect(GameModel.findRecent).toHaveBeenCalledWith(expect.objectContaining({
            sortBy: 'bet_amount',
            sortDir: 'asc'
        }));
    });

    test('should handle invalid pagination params gracefully by using defaults', async () => {
        GameModel.findRecent.mockResolvedValue({
            items: [],
            total: 0,
            page: 1,
            pageSize: 10,
        });

        const res = await request(app)
            .get('/api/games/recent')
            .query({ page: 'abc', limit: 'invalid' });

        expect(res.status).toBe(200);
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(10);
    });
});
