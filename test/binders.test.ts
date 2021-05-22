import { execYtt } from '../src/ytt';
import { findDeployment } from '../src/k8s-helper';

describe('binders', () => {
  it('should have rabbit settings', async () => {
    const result = await execYtt(['-f', 'config', '-f', 'example-minikube-oss-28x-rabbit-mysql-values.yml'], true);
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const rabbitDeployment = findDeployment(yaml, 'rabbitmq');
    expect(rabbitDeployment).toBeTruthy();

    const kafkaDeployment = findDeployment(yaml, 'kafka-zk');
    expect(kafkaDeployment).toBeFalsy();
  });

  it('should have kafka settings', async () => {
    const result = await execYtt(['-f', 'config', '-f', 'example-minikube-oss-28x-kafka-postgres-values.yml'], true);
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const kafkaDeployment = findDeployment(yaml, 'kafka-zk');
    expect(kafkaDeployment).toBeTruthy();

    const rabbitDeployment = findDeployment(yaml, 'rabbitmq');
    expect(rabbitDeployment).toBeFalsy();
  });
});
