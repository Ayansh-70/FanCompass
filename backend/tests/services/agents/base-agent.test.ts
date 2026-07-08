const mockGenerateContent = jest.fn();

jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: (...args: any[]) => mockGenerateContent(...args)
        }
      };
    })
  };
});

import { safeGenerate } from '../../../src/services/agents/base-agent';

describe('base-agent timeout logic', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockGenerateContent.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should timeout after 8 seconds, retry once, and return the fallback value', async () => {
    // 1. Mock a promise that NEVER resolves (a hanging API call)
    mockGenerateContent.mockImplementation(() => new Promise(() => {}));

    // 2. Start the safeGenerate call
    const fallback = { status: 'fallback' };
    
    const resultPromise = safeGenerate('test prompt', fallback);

    // 3. Fast forward time by 8.5 seconds to trigger the FIRST timeout
    jest.advanceTimersByTime(8500);
    
    // Await immediate promise resolutions to allow the catch block and retry to execute
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    
    // 4. Fast forward time by 8.5 seconds again to trigger the SECOND (retry) timeout
    jest.advanceTimersByTime(8500);

    // 5. Await the final result
    const result = await resultPromise;

    // 6. Assert it returned the fallback because the mock never resolved
    expect(result).toEqual(fallback);
    
    // It should have tried exactly twice (initial + 1 retry)
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it('should return fallback when Gemini returns invalid JSON', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: 'This is not valid JSON'
    });

    const fallback = { status: 'fallback' };
    const result = await safeGenerate('test prompt', fallback);

    expect(result).toEqual(fallback);
  });
});
