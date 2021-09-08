import { execYtt } from '../src/ytt';
import { findDeployment, findService, findConfigMap } from '../src/k8s-helper';
import { BINDER_RABBIT_NAME } from '../src/constants';

describe('rabbitmq', () => {
  it('should have default settings', async () => {
    const result = await execYtt({
      files: ['config/binder', 'config/values'],
      dataValueYamls: ['scdf.deploy.binder.type=rabbit']
    });

    expect(result.success, result.stderr).toBeTruthy();
    const yaml = result.stdout;

    const rabbitDeployment = findDeployment(yaml, BINDER_RABBIT_NAME);
    expect(rabbitDeployment).toBeTruthy();
    expect(rabbitDeployment?.spec?.replicas).toBe(1);
    expect(rabbitDeployment?.spec?.template?.spec?.containers.map(c => c.ports?.map(cp => cp.containerPort))).toEqual([
      [5672]
    ]);
    expect(rabbitDeployment?.spec?.template?.spec?.containers.map(c => c.volumeMounts?.map(vm => vm.name))).toEqual([
      ['rabbitmq-config-volume']
    ]);
    expect(rabbitDeployment?.spec?.template?.spec?.volumes?.map(v => v.name)).toEqual(['rabbitmq-config-volume']);

    const rabbitService = findService(yaml, BINDER_RABBIT_NAME);
    expect(rabbitService).toBeTruthy();
    expect(rabbitService?.spec?.ports).toHaveLength(1);
    expect(rabbitService?.spec?.ports?.map(sp => sp.port)).toEqual([5672]);

    const rabbitConfigMap = findConfigMap(yaml, `${BINDER_RABBIT_NAME}-config`);
    expect(rabbitConfigMap).toBeTruthy();
    const rabbitConf = rabbitConfigMap?.data ? rabbitConfigMap.data['rabbitmq.conf'] : '';
    expect(rabbitConf).toHaveLength(0);
  });

  it('should have config', async () => {
    const result = await execYtt({
      files: ['config/binder', 'config/values'],
      dataValueYamls: ['scdf.deploy.binder.type=rabbit', 'scdf.deploy.binder.rabbit.config.key1=value1']
    });

    expect(result.success, result.stderr).toBeTruthy();
    const yaml = result.stdout;

    const rabbitConfigMap = findConfigMap(yaml, `${BINDER_RABBIT_NAME}-config`);
    expect(rabbitConfigMap).toBeTruthy();
    const rabbitConf = rabbitConfigMap?.data ? rabbitConfigMap.data['rabbitmq.conf'] : '';
    expect(rabbitConf).toContain('key1 = value1');
  });
});
