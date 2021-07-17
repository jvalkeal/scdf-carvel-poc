import { execYtt } from '../src/ytt';
import { findDeployment, findConfigMap } from '../src/k8s-helper';
import { BINDER_RABBIT_NAME, BINDER_KAFKA_NAME } from '../src/constants';

describe('binders', () => {
  it('should have rabbit settings', async () => {
    const result = await execYtt({ files: ['config', 'examples/minikube-oss-281-rabbit-mysql-values.yml'] });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const rabbitDeployment = findDeployment(yaml, BINDER_RABBIT_NAME);
    expect(rabbitDeployment).toBeTruthy();

    const kafkaDeployment = findDeployment(yaml, BINDER_KAFKA_NAME);
    expect(kafkaDeployment).toBeFalsy();

    const skipperConfigMap = findConfigMap(yaml, 'skipper');
    const applicationYaml = skipperConfigMap?.data ? skipperConfigMap.data['application.yaml'] : undefined;
    expect(applicationYaml).toContain('RABBIT');
  });

  it('should have kafka settings', async () => {
    const result = await execYtt({ files: ['config', 'examples/minikube-oss-281-kafka-postgres-values.yml'] });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const kafkaDeployment = findDeployment(yaml, BINDER_KAFKA_NAME);
    expect(kafkaDeployment).toBeTruthy();

    const rabbitDeployment = findDeployment(yaml, BINDER_RABBIT_NAME);
    expect(rabbitDeployment).toBeFalsy();

    const skipperConfigMap = findConfigMap(yaml, 'skipper');
    const applicationYaml = skipperConfigMap?.data ? skipperConfigMap.data['application.yaml'] : undefined;
    expect(applicationYaml).toContain('KAFKA');
  });

  it('should skip binder deploy if external rabbit settings given', async () => {
    const result = await execYtt({
      files: ['config', 'examples/cloud-oss-28x-extrabbit-mysql-values.yml']
    });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const kafkaDeployment = findDeployment(yaml, BINDER_KAFKA_NAME);
    expect(kafkaDeployment).toBeFalsy();

    const rabbitDeployment = findDeployment(yaml, BINDER_RABBIT_NAME);
    expect(rabbitDeployment).toBeFalsy();

    const skipperConfigMap = findConfigMap(yaml, 'skipper');
    const applicationYaml = skipperConfigMap?.data ? skipperConfigMap.data['application.yaml'] : undefined;
    expect(applicationYaml).toContain('localhost');
  });

  it('should skip binder deploy if external kafka settings given', async () => {
    const result = await execYtt({
      files: ['config', 'examples/cloud-oss-28x-extkafka-postgres-values.yml']
    });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const kafkaDeployment = findDeployment(yaml, BINDER_KAFKA_NAME);
    expect(kafkaDeployment).toBeFalsy();

    const rabbitDeployment = findDeployment(yaml, BINDER_RABBIT_NAME);
    expect(rabbitDeployment).toBeFalsy();

    const skipperConfigMap = findConfigMap(yaml, 'skipper');
    const applicationYaml = skipperConfigMap?.data ? skipperConfigMap.data['application.yaml'] : undefined;
    expect(applicationYaml).toContain('localhost');
  });
});
