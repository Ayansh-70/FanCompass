import request from 'supertest';
import app from '../../src/server';
import { orchestrateFanQuery } from '../../src/services/agents/orchestrator';

// Mock orchestrator entirely to avoid instantiating agents or hitting Gemini
jest.mock('../../src/services/agents/orchestrator');

describe('Fan Routes', () => {
  const validContext = {
    language: 'en',
    seat_section: '101',
    minutes_to_kickoff: 30,
    accessibility_needs: []
  };

  const validPayload = {
    query: 'Where is my gate?',
    context: validContext
  };

  const mockResponse = {
    answer: 'Head to Gate B.',
    route_steps: ['Proceed to Gate B'],
    accessibility_notes: [],
    recommended_gate: 'G2',
    urgency_level: 'low',
    reasoning_trail: ['Selected Gate B']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (orchestrateFanQuery as jest.Mock).mockResolvedValue(mockResponse);
  });

  it('should return 400 on malformed payload (missing query)', async () => {
    const res = await request(app)
      .post('/api/fan/query')
      .send({ context: validContext });
    expect(res.status).toBe(400);
  });

  it('should return 400 on malformed context (missing language)', async () => {
    const res = await request(app)
      .post('/api/fan/query')
      .send({
        query: 'Where is my gate?',
        context: { seat_section: '101', minutes_to_kickoff: 30, accessibility_needs: [] }
      });
    expect(res.status).toBe(400);
  });

  it('should return 200 with the AssistantResponse shape on valid request', async () => {
    const res = await request(app)
      .post('/api/fan/query')
      .send(validPayload);
      
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResponse);
    expect(orchestrateFanQuery).toHaveBeenCalledTimes(1);
  });

  it('should serve repeated identical requests from the response cache', async () => {
    const uniquePayload = { ...validPayload, query: 'Cache test query' };
    
    // 1st request -> cache miss, orchestrator called
    const res1 = await request(app)
      .post('/api/fan/query')
      .send(uniquePayload);
    expect(res1.status).toBe(200);
    expect(orchestrateFanQuery).toHaveBeenCalledTimes(1);

    // 2nd request -> cache hit, orchestrator NOT called again
    const res2 = await request(app)
      .post('/api/fan/query')
      .send(uniquePayload);
    expect(res2.status).toBe(200);
    expect(res2.body).toEqual(mockResponse);
    expect(orchestrateFanQuery).toHaveBeenCalledTimes(1); // Still 1!
  });
});
