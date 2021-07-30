import { execYtt } from '../src/ytt';
import { findConfigMap } from '../src/k8s-helper';
import { SCDF_SERVER_NAME } from '../src/constants';

describe('servers', () => {
  it('no additional dataflow server config', async () => {
    const result = await execYtt({
      files: ['config'],
      dataValueYamls: [
        'scdf.deploy.mode=cloud',
        'scdf.database.type=postgres',
        'scdf.server.image.tag=2.8.1',
        'scdf.skipper.image.tag=2.7.1',
        'scdf.ctr.image.tag=2.8.1',
        'scdf.binder.kafka.host=localhost',
        'scdf.binder.kafka.port=1234'
      ]
    });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const skipperConfigMap = findConfigMap(yaml, SCDF_SERVER_NAME);
    const applicationYaml = skipperConfigMap?.data ? skipperConfigMap.data['application.yaml'] : undefined;
    expect(applicationYaml).toContain('spring');
  });

  it('additional dataflow server config', async () => {
    const result = await execYtt({
      files: ['config'],
      dataValueYamls: [
        'scdf.deploy.mode=cloud',
        'scdf.database.type=postgres',
        'scdf.server.image.tag=2.8.1',
        'scdf.skipper.image.tag=2.7.1',
        'scdf.ctr.image.tag=2.8.1',
        'scdf.binder.kafka.host=localhost',
        'scdf.binder.kafka.port=1234',
        'scdf.server.config.foo=bar'
      ]
    });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const skipperConfigMap = findConfigMap(yaml, SCDF_SERVER_NAME);
    const applicationYaml = skipperConfigMap?.data ? skipperConfigMap.data['application.yaml'] : undefined;
    expect(applicationYaml).toContain('spring');
    expect(applicationYaml).toContain('bar');
  });
});
