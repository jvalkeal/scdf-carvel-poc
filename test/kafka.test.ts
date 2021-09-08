import { execYtt } from '../src/ytt';
import { findDeployment, findService, findStatefulSet } from '../src/k8s-helper';
import { BINDER_KAFKA_NAME } from '../src/constants';

describe('kafka', () => {
  it('should have default settings', async () => {
    const result = await execYtt({
      files: ['config/binder', 'config/values'],
      dataValueYamls: ['scdf.deploy.binder.type=kafka']
    });

    expect(result.success, result.stderr).toBeTruthy();
    const yaml = result.stdout;

    const kafkaZkDeployment = findDeployment(yaml, `${BINDER_KAFKA_NAME}-zk`);
    expect(kafkaZkDeployment).toBeTruthy();

    const kafkaZkService = findService(yaml, `${BINDER_KAFKA_NAME}-zk`);
    expect(kafkaZkService).toBeTruthy();

    const kafkaBrokerSs = findStatefulSet(yaml, `${BINDER_KAFKA_NAME}-broker`);
    expect(kafkaBrokerSs).toBeTruthy();

    const kafkaBrokerService = findService(yaml, `${BINDER_KAFKA_NAME}-broker`);
    expect(kafkaBrokerService).toBeTruthy();
  });
});
