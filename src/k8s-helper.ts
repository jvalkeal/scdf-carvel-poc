import YAML from 'yaml';
import { loadYaml, V1Deployment, V1Container } from '@kubernetes/client-node';

export function parseDocuments(yaml: string): string[] {
  return YAML.parseAllDocuments(yaml).map(d => d.toString());
}

export function findDeployment(yaml: string, name: string): V1Deployment | undefined {
  return parseDocuments(yaml)
    .map(d => loadYaml<V1Deployment>(d))
    .find(node => {
      if (node?.kind === 'Deployment' && node?.metadata?.name === name) {
        return node;
      }
    });
}

export function deploymentContainer(deployment: V1Deployment | undefined, name: string): V1Container | undefined {
  return deployment?.spec?.template?.spec?.containers.find(container => container.name === name);
}
