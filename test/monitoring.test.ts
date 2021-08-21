import { execYtt } from '../src/ytt';
import { findDeployment, findService, deploymentContainer } from '../src/k8s-helper';
import { GRAFANA_NAME, PROMETHEUS_NAME, PROMETHEUS_RSOCKET_PROXY_NAME } from '../src/constants';

describe('monitoring', () => {
  it('grafana monitoring', async () => {
    const result = await execYtt({
      files: ['config'],
      dataValueYamls: [
        'scdf.database.type=postgres',
        'scdf.server.image.tag=2.8.1',
        'scdf.skipper.image.tag=2.7.1',
        'scdf.ctr.image.tag=2.8.1',
        'scdf.feature.monitoring.grafana.enabled=true',
        'scdf.feature.monitoring.grafana.image.tag=1.2.3'
      ]
    });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const grafanaDeployment = findDeployment(yaml, GRAFANA_NAME);
    expect(grafanaDeployment).toBeTruthy();
    const grafanaContainer = deploymentContainer(grafanaDeployment, GRAFANA_NAME);
    expect(grafanaContainer?.image).toContain('springcloud/spring-cloud-dataflow-grafana-prometheus:1.2.3');

    const grafanaService = findService(yaml, GRAFANA_NAME);
    expect(grafanaService).toBeTruthy();
    expect(grafanaService?.spec?.type).toBe('NodePort');
  });

  it('grafana monitoring cloud', async () => {
    const result = await execYtt({
      files: ['config'],
      dataValueYamls: [
        'scdf.deploy.mode=cloud',
        'scdf.database.type=postgres',
        'scdf.server.image.tag=2.8.1',
        'scdf.skipper.image.tag=2.7.1',
        'scdf.ctr.image.tag=2.8.1',
        'scdf.feature.monitoring.grafana.enabled=true',
        'scdf.feature.monitoring.grafana.image.tag=1.2.3'
      ]
    });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const grafanaService = findService(yaml, GRAFANA_NAME);
    expect(grafanaService).toBeTruthy();
    expect(grafanaService?.spec?.type).toBe('LoadBalancer');
  });

  it('prometheus monitoring', async () => {
    const result = await execYtt({
      files: ['config'],
      dataValueYamls: [
        'scdf.database.type=postgres',
        'scdf.server.image.tag=2.8.1',
        'scdf.skipper.image.tag=2.7.1',
        'scdf.ctr.image.tag=2.8.1',
        'scdf.feature.monitoring.grafana.enabled=true',
        'scdf.feature.monitoring.prometheus.enabled=true',
        'scdf.feature.monitoring.prometheus.image.tag=1.2.3'
      ]
    });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const prometheusDeployment = findDeployment(yaml, PROMETHEUS_NAME);
    expect(prometheusDeployment).toBeTruthy();
    const prometheusContainer = deploymentContainer(prometheusDeployment, PROMETHEUS_NAME);
    expect(prometheusContainer?.image).toContain('prom/prometheus:1.2.3');
  });

  it('prometheus-rsocket-proxy monitoring', async () => {
    const result = await execYtt({
      files: ['config'],
      dataValueYamls: [
        'scdf.database.type=postgres',
        'scdf.server.image.tag=2.8.1',
        'scdf.skipper.image.tag=2.7.1',
        'scdf.ctr.image.tag=2.8.1',
        'scdf.feature.monitoring.grafana.enabled=true',
        'scdf.feature.monitoring.prometheusRsocketProxy.enabled=true'
      ]
    });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const prometheusRsocketProxyDeployment = findDeployment(yaml, PROMETHEUS_RSOCKET_PROXY_NAME);
    expect(prometheusRsocketProxyDeployment).toBeTruthy();
    const prometheusRsocketProxyContainer = deploymentContainer(
      prometheusRsocketProxyDeployment,
      PROMETHEUS_RSOCKET_PROXY_NAME
    );
    expect(prometheusRsocketProxyContainer?.image).toContain('micrometermetrics/prometheus-rsocket-proxy:1.0.0');
  });
});
