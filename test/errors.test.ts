import { execYtt } from '../src/ytt';

describe('errors', () => {
  it('should get error with missing options', async () => {
    const result = await execYtt({ files: ['config'] });
    expect(result.success).toBeFalsy();
  });
});
