import { execYtt } from '../src/ytt';
import { findDeployment, deploymentContainer } from '../src/k8s-helper';
import { DB_MYSQL_NAME, DB_POSTGRES_NAME, DB_SKIPPER_NAME, DB_DATAFLOW_NAME } from '../src/constants';

describe('binders', () => {
  it('should setup mysql', async () => {
    const result = await execYtt({ files: ['config', 'examples/example-minikube-oss-28x-rabbit-mysql-values.yml'] });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const mysqlSkipperDeployment = findDeployment(yaml, DB_SKIPPER_NAME);
    expect(mysqlSkipperDeployment).toBeTruthy();
    const mysqlSkipperContainer = deploymentContainer(mysqlSkipperDeployment, DB_MYSQL_NAME);
    expect(mysqlSkipperContainer?.image).toContain('mysql');

    const mysqlDataflowDeployment = findDeployment(yaml, DB_DATAFLOW_NAME);
    expect(mysqlDataflowDeployment).toBeTruthy();
    const mysqlDataflowContainer = deploymentContainer(mysqlDataflowDeployment, DB_MYSQL_NAME);
    expect(mysqlDataflowContainer?.image).toContain('mysql');
  });

  it('should setup postgres', async () => {
    const result = await execYtt({ files: ['config', 'examples/example-minikube-oss-28x-kafka-postgres-values.yml'] });
    expect(result.success).toBeTruthy();
    const yaml = result.stdout;

    const postgresSkipperDeployment = findDeployment(yaml, DB_SKIPPER_NAME);
    expect(postgresSkipperDeployment).toBeTruthy();
    const postgresSkipperContainer = deploymentContainer(postgresSkipperDeployment, DB_POSTGRES_NAME);
    expect(postgresSkipperContainer?.image).toContain('postgres');

    const postgresDataflowDeployment = findDeployment(yaml, DB_DATAFLOW_NAME);
    expect(postgresDataflowDeployment).toBeTruthy();
    const postgresDataflowContainer = deploymentContainer(postgresDataflowDeployment, DB_POSTGRES_NAME);
    expect(postgresDataflowContainer?.image).toContain('postgres');
  });
});
