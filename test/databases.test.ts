import lodash from 'lodash';
import { execYtt } from '../src/ytt';
import { findDeployment, findConfigMap, findSecret, deploymentContainer, parseYamlDocument } from '../src/k8s-helper';
import {
  DB_MYSQL_NAME,
  DB_POSTGRES_NAME,
  DB_SKIPPER_NAME,
  DB_DATAFLOW_NAME,
  SCDF_SERVER_NAME,
  SKIPPER_NAME
} from '../src/constants';

describe('databases', () => {
  it('should default to postgres', async () => {
    const result = await execYtt({
      files: ['config'],
      dataValues: ['scdf.server.image.tag=2.8.1', 'scdf.skipper.image.tag=2.7.1', 'scdf.ctr.image.tag=2.8.1']
    });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const postgresSkipperDeployment = findDeployment(yaml, DB_SKIPPER_NAME);
    expect(postgresSkipperDeployment).toBeTruthy();
    const postgresSkipperContainer = deploymentContainer(postgresSkipperDeployment, DB_POSTGRES_NAME);
    expect(postgresSkipperContainer?.image).toContain('postgres');
    const postgresSkipperSecret = findSecret(yaml, DB_SKIPPER_NAME);
    expect(postgresSkipperSecret).toBeTruthy();
    const postgresSkipperSecretData = postgresSkipperSecret?.data || {};
    expect(postgresSkipperSecretData['postgres-user']).toBe('ZGF0YWZsb3c=');
    expect(postgresSkipperSecretData['postgres-password']).toBe('c2VjcmV0');

    const postgresDataflowDeployment = findDeployment(yaml, DB_DATAFLOW_NAME);
    expect(postgresDataflowDeployment).toBeTruthy();
    const postgresDataflowContainer = deploymentContainer(postgresDataflowDeployment, DB_POSTGRES_NAME);
    expect(postgresDataflowContainer?.image).toContain('postgres');
    const postgresDataflowSecret = findSecret(yaml, DB_SKIPPER_NAME);
    expect(postgresDataflowSecret).toBeTruthy();
    const postgresDataflowSecretData = postgresDataflowSecret?.data || {};
    expect(postgresDataflowSecretData['postgres-user']).toBe('ZGF0YWZsb3c=');
    expect(postgresDataflowSecretData['postgres-password']).toBe('c2VjcmV0');
  });

  it('should deploy mysql', async () => {
    const result = await execYtt({
      files: ['config'],
      dataValues: [
        'scdf.server.image.tag=2.8.1',
        'scdf.skipper.image.tag=2.7.1',
        'scdf.ctr.image.tag=2.8.1',
        'scdf.deploy.database.type=mysql'
      ]
    });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const mysqlSkipperDeployment = findDeployment(yaml, DB_SKIPPER_NAME);
    expect(mysqlSkipperDeployment).toBeTruthy();
    const mysqlSkipperContainer = deploymentContainer(mysqlSkipperDeployment, DB_MYSQL_NAME);
    expect(mysqlSkipperContainer?.image).toContain('mysql');
    const mysqlSkipperSecret = findSecret(yaml, DB_SKIPPER_NAME);
    expect(mysqlSkipperSecret).toBeTruthy();
    const mysqlSkipperSecretData = mysqlSkipperSecret?.data || {};
    expect(mysqlSkipperSecretData['mysql-user']).toBe('ZGF0YWZsb3c=');
    expect(mysqlSkipperSecretData['mysql-root-password']).toBe('c2VjcmV0');

    const mysqlDataflowDeployment = findDeployment(yaml, DB_DATAFLOW_NAME);
    expect(mysqlDataflowDeployment).toBeTruthy();
    const mysqlDataflowContainer = deploymentContainer(mysqlDataflowDeployment, DB_MYSQL_NAME);
    expect(mysqlDataflowContainer?.image).toContain('mysql');
    const mysqlDataflowSecret = findSecret(yaml, DB_DATAFLOW_NAME);
    expect(mysqlDataflowSecret).toBeTruthy();
    const mysqlDataflowSecretData = mysqlDataflowSecret?.data || {};
    expect(mysqlDataflowSecretData['mysql-user']).toBe('ZGF0YWZsb3c=');
    expect(mysqlDataflowSecretData['mysql-root-password']).toBe('c2VjcmV0');
  });

  it('should deploy postgres', async () => {
    const result = await execYtt({
      files: ['config'],
      dataValues: [
        'scdf.server.image.tag=2.8.1',
        'scdf.skipper.image.tag=2.7.1',
        'scdf.ctr.image.tag=2.8.1',
        'scdf.deploy.database.type=postgres'
      ]
    });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const postgresSkipperDeployment = findDeployment(yaml, DB_SKIPPER_NAME);
    expect(postgresSkipperDeployment).toBeTruthy();
    const postgresSkipperContainer = deploymentContainer(postgresSkipperDeployment, DB_POSTGRES_NAME);
    expect(postgresSkipperContainer?.image).toContain('postgres');
    const postgresSkipperSecret = findSecret(yaml, DB_SKIPPER_NAME);
    expect(postgresSkipperSecret).toBeTruthy();
    const postgresSkipperSecretData = postgresSkipperSecret?.data || {};
    expect(postgresSkipperSecretData['postgres-user']).toBe('ZGF0YWZsb3c=');
    expect(postgresSkipperSecretData['postgres-password']).toBe('c2VjcmV0');

    const postgresDataflowDeployment = findDeployment(yaml, DB_DATAFLOW_NAME);
    expect(postgresDataflowDeployment).toBeTruthy();
    const postgresDataflowContainer = deploymentContainer(postgresDataflowDeployment, DB_POSTGRES_NAME);
    expect(postgresDataflowContainer?.image).toContain('postgres');
    const postgresDataflowSecret = findSecret(yaml, DB_SKIPPER_NAME);
    expect(postgresDataflowSecret).toBeTruthy();
    const postgresDataflowSecretData = postgresDataflowSecret?.data || {};
    expect(postgresDataflowSecretData['postgres-user']).toBe('ZGF0YWZsb3c=');
    expect(postgresDataflowSecretData['postgres-password']).toBe('c2VjcmV0');
  });

  it('should deploy mysql with custom username and password', async () => {
    const result = await execYtt({
      files: ['config'],
      dataValues: [
        'scdf.server.image.tag=2.8.1',
        'scdf.skipper.image.tag=2.7.1',
        'scdf.ctr.image.tag=2.8.1',
        'scdf.deploy.database.type=mysql',
        'scdf.deploy.database.username=user',
        'scdf.deploy.database.password=pass'
      ]
    });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const mysqlSkipperDeployment = findDeployment(yaml, DB_SKIPPER_NAME);
    expect(mysqlSkipperDeployment).toBeTruthy();
    const mysqlSkipperContainer = deploymentContainer(mysqlSkipperDeployment, DB_MYSQL_NAME);
    expect(mysqlSkipperContainer?.image).toContain('mysql');
    const mysqlSkipperSecret = findSecret(yaml, DB_SKIPPER_NAME);
    expect(mysqlSkipperSecret).toBeTruthy();
    const mysqlSkipperSecretData = mysqlSkipperSecret?.data || {};
    expect(mysqlSkipperSecretData['mysql-user']).toBe('user');
    expect(mysqlSkipperSecretData['mysql-root-password']).toBe('pass');

    const mysqlDataflowDeployment = findDeployment(yaml, DB_DATAFLOW_NAME);
    expect(mysqlDataflowDeployment).toBeTruthy();
    const mysqlDataflowContainer = deploymentContainer(mysqlDataflowDeployment, DB_MYSQL_NAME);
    expect(mysqlDataflowContainer?.image).toContain('mysql');
    const mysqlDataflowSecret = findSecret(yaml, DB_DATAFLOW_NAME);
    expect(mysqlDataflowSecret).toBeTruthy();
    const mysqlDataflowSecretData = mysqlDataflowSecret?.data || {};
    expect(mysqlDataflowSecretData['mysql-user']).toBe('user');
    expect(mysqlDataflowSecretData['mysql-root-password']).toBe('pass');
  });

  it('should deploy postgres with custom username and password', async () => {
    const result = await execYtt({
      files: ['config'],
      dataValues: [
        'scdf.server.image.tag=2.8.1',
        'scdf.skipper.image.tag=2.7.1',
        'scdf.ctr.image.tag=2.8.1',
        'scdf.deploy.database.type=postgres',
        'scdf.deploy.database.username=user',
        'scdf.deploy.database.password=pass'
      ]
    });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const postgresSkipperDeployment = findDeployment(yaml, DB_SKIPPER_NAME);
    expect(postgresSkipperDeployment).toBeTruthy();
    const postgresSkipperContainer = deploymentContainer(postgresSkipperDeployment, DB_POSTGRES_NAME);
    expect(postgresSkipperContainer?.image).toContain('postgres');
    const postgresSkipperSecret = findSecret(yaml, DB_SKIPPER_NAME);
    expect(postgresSkipperSecret).toBeTruthy();
    const postgresSkipperSecretData = postgresSkipperSecret?.data || {};
    expect(postgresSkipperSecretData['postgres-user']).toBe('user');
    expect(postgresSkipperSecretData['postgres-password']).toBe('pass');

    const postgresDataflowDeployment = findDeployment(yaml, DB_DATAFLOW_NAME);
    expect(postgresDataflowDeployment).toBeTruthy();
    const postgresDataflowContainer = deploymentContainer(postgresDataflowDeployment, DB_POSTGRES_NAME);
    expect(postgresDataflowContainer?.image).toContain('postgres');
    const postgresDataflowSecret = findSecret(yaml, DB_SKIPPER_NAME);
    expect(postgresDataflowSecret).toBeTruthy();
    const postgresDataflowSecretData = postgresDataflowSecret?.data || {};
    expect(postgresDataflowSecretData['postgres-user']).toBe('user');
    expect(postgresDataflowSecretData['postgres-password']).toBe('pass');
  });

  it('should configure external db settings', async () => {
    const result = await execYtt({
      files: ['config'],
      dataValueYamls: [
        'scdf.deploy.database.enabled=false',
        'scdf.server.image.tag=2.8.1',
        'scdf.server.database.url=fakeurl1',
        'scdf.skipper.image.tag=2.7.1',
        'scdf.skipper.database.url=fakeurl2',
        'scdf.ctr.image.tag=2.8.1'
      ]
    });
    expect(result.success, result.stderr).toBeTruthy();
    const yaml = result.stdout;

    const postgresSkipperDeployment = findDeployment(yaml, DB_SKIPPER_NAME);
    expect(postgresSkipperDeployment).toBeFalsy();

    const postgresDataflowDeployment = findDeployment(yaml, DB_DATAFLOW_NAME);
    expect(postgresDataflowDeployment).toBeFalsy();

    const dataflowConfigMap = findConfigMap(yaml, SCDF_SERVER_NAME);
    const skipperConfigMap = findConfigMap(yaml, SKIPPER_NAME);
    const dataflowApplicationYaml = dataflowConfigMap?.data ? dataflowConfigMap.data['application.yaml'] : '';
    const skipperApplicationYaml = skipperConfigMap?.data ? skipperConfigMap.data['application.yaml'] : '';

    const dataflowDoc = parseYamlDocument(dataflowApplicationYaml);
    const dataflowJson = dataflowDoc.toJSON();
    const dataflowDatasourceUrl = lodash.get(dataflowJson, 'spring.datasource.url') as string;
    expect(dataflowDatasourceUrl).toBe('fakeurl1');

    const skipperDoc = parseYamlDocument(skipperApplicationYaml);
    const skipperJson = skipperDoc.toJSON();
    const skipperDatasourceUrl = lodash.get(skipperJson, 'spring.datasource.url') as string;
    expect(skipperDatasourceUrl).toBe('fakeurl2');
  });
});
