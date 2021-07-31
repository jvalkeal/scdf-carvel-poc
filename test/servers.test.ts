import { execYtt } from '../src/ytt';
import { findConfigMap, findDeployment, deploymentContainer, containerEnvValues } from '../src/k8s-helper';
import { SCDF_SERVER_NAME, SKIPPER_NAME } from '../src/constants';

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

  it('skipper should have default env values', async () => {
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

    const deployment = findDeployment(yaml, SKIPPER_NAME);
    const container = deploymentContainer(deployment, SKIPPER_NAME);
    const envs = containerEnvValues(container);
    expect(envs).toBeTruthy();
    expect(envs).toHaveLength(4);
    expect(envs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'SPRING_CLOUD_CONFIG_ENABLED',
          value: 'false'
        }),
        expect.objectContaining({
          name: 'SPRING_CLOUD_KUBERNETES_CONFIG_ENABLE_API',
          value: 'false'
        }),
        expect.objectContaining({
          name: 'SPRING_CLOUD_KUBERNETES_SECRETS_ENABLE_API',
          value: 'false'
        }),
        expect.objectContaining({
          name: 'SPRING_CLOUD_KUBERNETES_SECRETS_PATHS',
          value: '/etc/secrets'
        })
      ])
    );
  });

  it('skipper should have monitoring env values', async () => {
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
        'scdf.server.config.foo=bar',
        'scdf.feature.monitoring.grafana.enabled=true'
      ]
    });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const deployment = findDeployment(yaml, SKIPPER_NAME);
    const container = deploymentContainer(deployment, SKIPPER_NAME);
    const envs = containerEnvValues(container);
    expect(envs).toBeTruthy();
    expect(envs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'MANAGEMENT_METRICS_EXPORT_PROMETHEUS_ENABLED',
          value: 'true'
        }),
        expect.objectContaining({
          name: 'MANAGEMENT_METRICS_EXPORT_PROMETHEUS_RSOCKET_ENABLED',
          value: 'true'
        }),
        expect.objectContaining({
          name: 'MANAGEMENT_METRICS_EXPORT_PROMETHEUS_RSOCKET_HOST',
          value: 'prometheus-rsocket-proxy'
        }),
        expect.objectContaining({
          name: 'MANAGEMENT_METRICS_EXPORT_PROMETHEUS_RSOCKET_PORT',
          value: '7001'
        })
      ])
    );
  });

  it('dataflow should have default env values', async () => {
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

    const deployment = findDeployment(yaml, SCDF_SERVER_NAME);
    const container = deploymentContainer(deployment, SCDF_SERVER_NAME);
    const envs = containerEnvValues(container);
    expect(envs).toBeTruthy();
    expect(envs).toHaveLength(11);
    expect(envs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'KUBERNETES_NAMESPACE',
          valueFrom: {
            fieldRef: {
              fieldPath: 'metadata.namespace'
            }
          }
        }),
        expect.objectContaining({
          name: 'SPRING_CLOUD_CONFIG_ENABLED',
          value: 'false'
        }),
        expect.objectContaining({
          name: 'SPRING_CLOUD_DATAFLOW_FEATURES_ANALYTICS_ENABLED',
          value: 'true'
        }),
        expect.objectContaining({
          name: 'SPRING_CLOUD_DATAFLOW_FEATURES_SCHEDULES_ENABLED',
          value: 'true'
        }),
        expect.objectContaining({
          name: 'SPRING_CLOUD_DATAFLOW_TASK_COMPOSEDTASKRUNNER_URI',
          value: 'docker://springcloud/spring-cloud-dataflow-composed-task-runner:2.8.1'
        }),
        expect.objectContaining({
          name: 'SPRING_CLOUD_KUBERNETES_CONFIG_ENABLE_API',
          value: 'false'
        }),
        expect.objectContaining({
          name: 'SPRING_CLOUD_KUBERNETES_SECRETS_ENABLE_API',
          value: 'false'
        }),
        expect.objectContaining({
          name: 'SPRING_CLOUD_KUBERNETES_SECRETS_PATHS',
          value: '/etc/secrets'
        }),
        expect.objectContaining({
          name: 'SPRING_CLOUD_DATAFLOW_SERVER_URI'
        }),
        expect.objectContaining({
          name: 'SPRING_CLOUD_SKIPPER_CLIENT_SERVER_URI'
        }),
        expect.objectContaining({
          name: 'SPRING_APPLICATION_JSON'
        })
      ])
    );
  });

  it('dataflow should have monitoring env values', async () => {
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
        'scdf.server.config.foo=bar',
        'scdf.feature.monitoring.grafana.enabled=true'
      ]
    });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const deployment = findDeployment(yaml, SCDF_SERVER_NAME);
    const container = deploymentContainer(deployment, SCDF_SERVER_NAME);
    const envs = containerEnvValues(container);
    expect(envs).toBeTruthy();
    expect(envs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'MANAGEMENT_METRICS_EXPORT_PROMETHEUS_ENABLED',
          value: 'true'
        }),
        expect.objectContaining({
          name: 'MANAGEMENT_METRICS_EXPORT_PROMETHEUS_RSOCKET_ENABLED',
          value: 'true'
        }),
        expect.objectContaining({
          name: 'MANAGEMENT_METRICS_EXPORT_PROMETHEUS_RSOCKET_HOST',
          value: 'prometheus-rsocket-proxy'
        }),
        expect.objectContaining({
          name: 'MANAGEMENT_METRICS_EXPORT_PROMETHEUS_RSOCKET_PORT',
          value: '7001'
        }),
        expect.objectContaining({
          name: 'SPRING_CLOUD_DATAFLOW_METRICS_DASHBOARD_URL'
        })
      ])
    );
  });
});
