import request from 'supertest';
import app from '../../src/server';
import { orchestrateStaffQuery } from '../../src/services/agents/orchestrator';

// Mock orchestrator entirely to avoid instantiating agents or hitting Gemini
jest.mock('../../src/services/agents/orchestrator', () => ({
  orchestrateStaffQuery: jest.fn()
}));

describe('Staff Routes', () => {
  const validPayload = {
    minutes_to_kickoff: 30,
    context: {
      gate_id: 'G1',
      requesting_role: 'volunteer'
    }
  };

  const mockResponse = {
    directive: 'Direct fans to Gate G2.',
    reasoning: ['Gate G1 is crowded.']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (orchestrateStaffQuery as jest.Mock).mockResolvedValue(mockResponse);
  });

  it('should return 400 on malformed staff context (missing gate_id)', async () => {
    const res = await request(app)
      .post('/api/staff/insight')
      .send({
        minutes_to_kickoff: 30,
        context: { requesting_role: 'volunteer' }
      });
    expect(res.status).toBe(400);
  });

  it('should return 400 on invalid gate_id', async () => {
    const res = await request(app)
      .post('/api/staff/insight')
      .send({
        minutes_to_kickoff: 30,
        context: { gate_id: 'INVALID_GATE', requesting_role: 'volunteer' }
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Gate INVALID_GATE not found.');
  });

  it('should return 200 with the CrowdIntelligenceResponse shape on valid request', async () => {
    const res = await request(app)
      .post('/api/staff/insight')
      .send(validPayload);
      
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResponse);
    expect(orchestrateStaffQuery).toHaveBeenCalledTimes(1);
  });
});
