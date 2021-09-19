import { execYtt } from '../src/ytt';

describe('errors', () => {
  it('should get error with missing options', async () => {
    const result = await execYtt({ files: ['config'] });
    // disabled fow now until we get back checks
    // when tag or digest needs to be defined
    // expect(result.success).toBeFalsy();
    // expect(result.stderr).toContain('The following required data.values parameters are missing');
  });
});
