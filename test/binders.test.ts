import lodash from 'lodash';
import 'jest-extended';
import { execYtt } from '../src/ytt';
import {
  findDeployment,
  findConfigMap,
  parseYamlDocument,
  envStringToMap,
  deploymentVolume,
  deploymentContainer,
  containerVolumeMount
} from '../src/k8s-helper';
import { BINDER_RABBIT_NAME, BINDER_KAFKA_NAME, DEFAULT_REQUIRED_DATA_VALUES, SKIPPER_NAME } from '../src/constants';

describe('binders', () => {
  it('should have rabbit deployment', async () => {
    const result = await execYtt({
      files: ['config'],
      dataValues: [...DEFAULT_REQUIRED_DATA_VALUES, 'scdf.deploy.database.type=mysql', 'scdf.deploy.binder.type=rabbit']
    });

    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const rabbitDeployment = findDeployment(yaml, BINDER_RABBIT_NAME);
    expect(rabbitDeployment).toBeTruthy();

    const kafkaDeployment = findDeployment(yaml, BINDER_KAFKA_NAME);
    expect(kafkaDeployment).toBeFalsy();

    const skipperConfigMap = findConfigMap(yaml, 'skipper');
    const skipperApplicationYaml = skipperConfigMap?.data ? skipperConfigMap.data['application.yaml'] : '';
    const skipperDoc = parseYamlDocument(skipperApplicationYaml);
    const skipperJson = skipperDoc.toJSON();
    const platformDefEnv = lodash.get(
      skipperJson,
      'spring.cloud.skipper.server.platform.kubernetes.accounts.default.environmentVariables'
    ) as string;
    const envs = envStringToMap(platformDefEnv);
    expect(envs.get('SPRING_RABBITMQ_HOST')).toBe('${RABBITMQ_SERVICE_HOST}');
    expect(envs.get('SPRING_RABBITMQ_PORT')).toBe('${RABBITMQ_SERVICE_PORT}');
    expect(envs.get('SPRING_RABBITMQ_USERNAME')).toBe('${rabbitmq-user}');
    expect(envs.get('SPRING_RABBITMQ_PASSWORD')).toBe('${rabbitmq-password}');

    const skipperDeployment = findDeployment(yaml, SKIPPER_NAME);
    const skipperContainer = deploymentContainer(skipperDeployment, SKIPPER_NAME);
    const rabbitVolume = deploymentVolume(skipperDeployment, 'rabbitmq');
    expect(rabbitVolume?.secret?.secretName).toBe('rabbitmq');

    const rabbitVolumeMount = containerVolumeMount(skipperContainer, 'rabbitmq');
    expect(rabbitVolumeMount?.mountPath).toBe('/etc/secrets/rabbitmq');
  });

  it('should have kafka deployment', async () => {
    const result = await execYtt({
      files: ['config'],
      dataValues: [
        ...DEFAULT_REQUIRED_DATA_VALUES,
        'scdf.deploy.database.type=postgres',
        'scdf.deploy.binder.type=kafka'
      ]
    });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const kafkaDeployment = findDeployment(yaml, `${BINDER_KAFKA_NAME}-zk`);
    expect(kafkaDeployment).toBeTruthy();

    const rabbitDeployment = findDeployment(yaml, BINDER_RABBIT_NAME);
    expect(rabbitDeployment).toBeFalsy();

    const skipperConfigMap = findConfigMap(yaml, 'skipper');
    const applicationYaml = skipperConfigMap?.data ? skipperConfigMap.data['application.yaml'] : '';
    expect(applicationYaml).toContain('KAFKA');

    // kafka so no rabbit spesific secrets in volumes
    const skipperDeployment = findDeployment(yaml, SKIPPER_NAME);
    const skipperContainer = deploymentContainer(skipperDeployment, SKIPPER_NAME);
    const rabbitVolume = deploymentVolume(skipperDeployment, 'rabbitmq');
    expect(rabbitVolume).toBeFalsy();
    const rabbitVolumeMount = containerVolumeMount(skipperContainer, 'rabbitmq');
    expect(rabbitVolumeMount).toBeFalsy();
  });

  it('should skip binder deploy if external rabbit settings given', async () => {
    const result = await execYtt({
      files: ['config'],
      dataValueYamls: [
        ...DEFAULT_REQUIRED_DATA_VALUES,
        'scdf.deploy.mode=cloud',
        'scdf.deploy.database.type=mysql',
        'scdf.deploy.binder.enabled=false',
        'scdf.binder.rabbit.host=localhost',
        'scdf.binder.rabbit.port=1234',
        'scdf.binder.rabbit.username=user',
        'scdf.binder.rabbit.password=pass'
      ]
    });

    expect(result.success, result.stderr).toBeTruthy();
    const yaml = result.stdout;

    const kafkaDeployment = findDeployment(yaml, `${BINDER_KAFKA_NAME}-zk`);
    expect(kafkaDeployment).toBeFalsy();

    const rabbitDeployment = findDeployment(yaml, BINDER_RABBIT_NAME);
    expect(rabbitDeployment).toBeFalsy();

    const skipperConfigMap = findConfigMap(yaml, 'skipper');
    const skipperApplicationYaml = skipperConfigMap?.data ? skipperConfigMap.data['application.yaml'] : '';

    const skipperDoc = parseYamlDocument(skipperApplicationYaml);
    const skipperJson = skipperDoc.toJSON();
    const platformDefEnv = lodash.get(
      skipperJson,
      'spring.cloud.skipper.server.platform.kubernetes.accounts.default.environmentVariables'
    ) as string;
    const envs = envStringToMap(platformDefEnv);
    expect(envs.get('SPRING_RABBITMQ_HOST')).toBe('localhost');
    expect(envs.get('SPRING_RABBITMQ_PORT')).toBe('1234');
    expect(envs.get('SPRING_RABBITMQ_USERNAME')).toBe('user');
    expect(envs.get('SPRING_RABBITMQ_PASSWORD')).toBe('pass');
  });

  it('should skip binder deploy if external kafka settings given', async () => {
    const result = await execYtt({
      files: ['config'],
      dataValueYamls: [
        ...DEFAULT_REQUIRED_DATA_VALUES,
        'scdf.deploy.mode=cloud',
        'scdf.deploy.database.type=postgres',
        'scdf.deploy.binder.enabled=false',
        'scdf.binder.kafka.host=localhost',
        'scdf.binder.kafka.port=1234'
      ]
    });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const kafkaDeployment = findDeployment(yaml, `${BINDER_KAFKA_NAME}-zk`);
    expect(kafkaDeployment).toBeFalsy();

    const rabbitDeployment = findDeployment(yaml, BINDER_RABBIT_NAME);
    expect(rabbitDeployment).toBeFalsy();

    const skipperConfigMap = findConfigMap(yaml, 'skipper');
    const skipperApplicationYaml = skipperConfigMap?.data ? skipperConfigMap.data['application.yaml'] : '';

    const skipperDoc = parseYamlDocument(skipperApplicationYaml);
    const skipperJson = skipperDoc.toJSON();
    const skipperDatasourceUrl = lodash.get(
      skipperJson,
      'spring.cloud.skipper.server.platform.kubernetes.accounts.default.environmentVariables'
    ) as string;
    expect(skipperDatasourceUrl).toContain('SPRING_CLOUD_STREAM_KAFKA_BINDER_BROKERS=localhost');
  });
});
