import YAML from 'yaml';
import { loadYaml, V1Deployment, V1Container } from '@kubernetes/client-node';
import { execYtt } from '../src/ytt';

describe('tests', () => {
  it('versions generated', async () => {
    const result = await execYtt(['-f', 'config', '-f', 'example-minikube-oss-28x-kafka-postgres-values.yml'], true);
    expect(result.success).toBeTruthy();
    const documents = YAML.parseAllDocuments(result.stdout);
    let container: V1Container | undefined;
    documents.forEach(d => {
      const node = loadYaml<V1Deployment>(d.toString());
      if (node?.kind === 'Deployment' && node?.metadata?.name === 'skipper') {
        container = node?.spec?.template?.spec?.containers.find(container => container.name === 'skipper');
      }
    });
    expect(container).toBeTruthy();
    expect(container?.image).toEqual('springcloud/spring-cloud-skipper-server:2.7.0-SNAPSHOT');
  });
});
