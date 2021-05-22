import { execYtt } from '../src/ytt';
import { deploymentContainer, findDeployment, containerEnvValue } from '../src/k8s-helper';

describe('tests', () => {
  it('versions generated', async () => {
    const result = await execYtt(['-f', 'config', '-f', 'example-minikube-oss-28x-kafka-postgres-values.yml'], true);
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const skipperDeployment = findDeployment(yaml, 'skipper');
    expect(skipperDeployment).toBeTruthy();

    const skipperContainer = deploymentContainer(skipperDeployment, 'skipper');
    expect(skipperContainer).toBeTruthy();
    expect(skipperContainer?.image).toEqual('springcloud/spring-cloud-skipper-server:2.7.0-SNAPSHOT');

    const dataflowDeployment = findDeployment(yaml, 'scdf-server');
    const dataflowContainer = deploymentContainer(dataflowDeployment, 'scdf-server');
    expect(dataflowContainer).toBeTruthy();
    expect(dataflowContainer?.image).toEqual('springcloud/spring-cloud-dataflow-server:2.8.0-SNAPSHOT');

    const ctrImage = containerEnvValue(dataflowContainer, 'SPRING_CLOUD_DATAFLOW_TASK_COMPOSEDTASKRUNNER_URI');
    expect(ctrImage).toEqual('docker://springcloud/spring-cloud-dataflow-composed-task-runner:2.8.0-SNAPSHOT');
  });
});
