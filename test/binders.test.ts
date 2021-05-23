import { execYtt } from '../src/ytt';
import { findDeployment } from '../src/k8s-helper';
import { BINDER_RABBIT_NAME, BINDER_KAFKA_NAME } from '../src/constans';

describe('binders', () => {
  it('should have rabbit settings', async () => {
    const result = await execYtt({ files: ['config', 'example-minikube-oss-28x-rabbit-mysql-values.yml'] });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const rabbitDeployment = findDeployment(yaml, BINDER_RABBIT_NAME);
    expect(rabbitDeployment).toBeTruthy();

    const kafkaDeployment = findDeployment(yaml, BINDER_KAFKA_NAME);
    expect(kafkaDeployment).toBeFalsy();
  });

  it('should have kafka settings', async () => {
    const result = await execYtt({ files: ['config', 'example-minikube-oss-28x-kafka-postgres-values.yml'] });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const kafkaDeployment = findDeployment(yaml, BINDER_KAFKA_NAME);
    expect(kafkaDeployment).toBeTruthy();

    const rabbitDeployment = findDeployment(yaml, BINDER_RABBIT_NAME);
    expect(rabbitDeployment).toBeFalsy();
  });
});
