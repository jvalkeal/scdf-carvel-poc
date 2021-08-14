import { parseDocument, parseAllDocuments, Document } from 'yaml';
import { loadYaml, V1Deployment, V1Container, V1ConfigMap, V1Secret, V1EnvVar } from '@kubernetes/client-node';

export function parseDocuments(yaml: string): string[] {
  return parseAllDocuments(yaml).map(d => d.toString());
}

export function parseYamlDocument(yaml: string): Document.Parsed {
  return parseDocument(yaml);
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

export function findConfigMap(yaml: string, name: string): V1ConfigMap | undefined {
  return parseDocuments(yaml)
    .map(d => loadYaml<V1ConfigMap>(d))
    .find(node => {
      if (node?.kind === 'ConfigMap' && node?.metadata?.name === name) {
        return node;
      }
    });
}

export function findSecret(yaml: string, name: string): V1Secret | undefined {
  return parseDocuments(yaml)
    .map(d => loadYaml<V1Secret>(d))
    .find(node => {
      if (node?.kind === 'Secret' && node?.metadata?.name === name) {
        return node;
      }
    });
}

export function deploymentContainer(deployment: V1Deployment | undefined, name: string): V1Container | undefined {
  return deployment?.spec?.template?.spec?.containers.find(container => container.name === name);
}

export function containerEnvValue(container: V1Container | undefined, name: string): string | undefined {
  return container?.env?.find(env => env.name === name)?.value;
}

export function containerEnvValues(container: V1Container | undefined): V1EnvVar[] | undefined {
  return container?.env;
}
