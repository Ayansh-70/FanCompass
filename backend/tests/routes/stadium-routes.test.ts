import request from 'supertest';
import app from '../../src/server';

describe('Stadium Routes', () => {
  it('should return 200 with the exact StadiumData shape on GET /api/stadium/gates', async () => {
    const res = await request(app).get('/api/stadium/gates');
    expect(res.status).toBe(200);
    
    // Check shape
    expect(res.body).toHaveProperty('gates');
    expect(Array.isArray(res.body.gates)).toBe(true);
    
    if (res.body.gates.length > 0) {
      const gate = res.body.gates[0];
      expect(gate).toHaveProperty('id');
      expect(gate).toHaveProperty('name');
      expect(gate).toHaveProperty('wheelchair_accessible');
      expect(gate).toHaveProperty('accommodations');
      expect(gate).toHaveProperty('current_crowd_level');
      expect(gate).toHaveProperty('last_update_minutes_ago');
    }
  });

  it('should apply rate limiting and eventually block requests', async () => {
    let rateLimited = false;
    // Make enough requests to exhaust the rate limit (limit is 20, we do 25 to be safe)
    for (let i = 0; i < 25; i++) {
      const res = await request(app).get('/api/stadium/gates');
      if (res.status === 429) {
        rateLimited = true;
        break;
      }
    }
    
    expect(rateLimited).toBe(true);
  }, 10000); // 10s timeout
});
