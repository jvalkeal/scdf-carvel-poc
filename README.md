# SCDF Carvel POC

This is a POC repo to create full [carvel dance](https://carvel.dev) with scdf.

- Template k8s deployment files with `ytt`
- Create packages and package repos for `kapp-controller`.
- Have examples to:
  - Manage deployment with package and package repos
  - Manually deploy with `kapp`

NOTE: You need to have tools `kapp`, `kbld`, `ytt` and `imgpkg` installed from https://carvel.dev

You can pick different routes to use this POC. Firstly have your _k8s_ environment running
on _minikube_ or a proper _cloud environment_, secondly choose how you want to deploy which would
be via `kapp-controller`, `kapp` or `kubectl`, and thirdly choose combination of _database_,
_binder_ and optional _features_ like monitoring.

## Examples
We go through few common examples how to deploy and manage dataflow.

### Deploy via kapp-controller
`kapp-controller` is a most sophisticated way to handle lifecycle of a
_dataflow_ deployment on _k8s_ environment as existing _packages_ and
_package repos_ for a dataflow handles heavy lifting of where things
will get provisioned into an environment. It focuces on to just deploy
while allowing to customise deployed things with various options.

NOTE: If your starting from an empty _k8s_ environment never been prepared
for `kapp-controller` you need to do it before continuing.

Install `kapp-controller`:

Deploy controller:
```
$ kapp deploy -y -a default-ns-rbac -f https://raw.githubusercontent.com/vmware-tanzu/carvel-kapp-controller/develop/examples/rbac/default-ns.yml

$ kapp deploy -y -a kc -f https://raw.githubusercontent.com/jvalkeal/scdf-carvel-poc/main/examples/kapp-controller-ghcr.yml
```

After `kapp-controller` has been deployed you can deploy repositories for different stages
of a dataflow development and release channels like `snapshot`, `milestone` or `release`.

Deploy repository:
```
$ kapp deploy -a scdf-repo-snapshot -f examples/scdf-repo-snapshot-ghcr.yml -y

$ kapp deploy -a scdf-repo-release -f examples/scdf-repo-release-ghcr.yml -y

$ kubectl get packagerepositories
NAME                         AGE   DESCRIPTION
scdf-release.tanzu.vmware    23s   Reconcile succeeded
scdf-snapshot.tanzu.vmware   60s   Reconcile succeeded

$ kubectl get packages
NAME                                   PACKAGEMETADATA NAME    VERSION          AGE
scdf.tanzu.vmware.com.2.8.0            scdf.tanzu.vmware.com   2.8.0            8s
scdf.tanzu.vmware.com.2.8.1            scdf.tanzu.vmware.com   2.8.1            8s
scdf.tanzu.vmware.com.2.8.2-SNAPSHOT   scdf.tanzu.vmware.com   2.8.2-SNAPSHOT   28s
scdf.tanzu.vmware.com.2.9.0-SNAPSHOT   scdf.tanzu.vmware.com   2.9.0-SNAPSHOT   28s
```

NOTE: Above package and package repos are defined within public repos on a
VMWare space so you don't get trouble with rate limiting(which would be
a case with dockerhub).

Install `2.8.1` with `postgres` and `rabbit`:
```
$ kubectl get packageinstalls
NAME        PACKAGE NAME            PACKAGE VERSION   DESCRIPTION   AGE
scdf-demo   scdf.tanzu.vmware.com   2.8.1             Reconciling   12s

$ kubectl get packageinstalls
NAME        PACKAGE NAME            PACKAGE VERSION   DESCRIPTION           AGE
scdf-demo   scdf.tanzu.vmware.com   2.8.1             Reconcile succeeded   2m44s
```

Cleanup:
```
kapp delete -a scdf-demo -y

kapp delete -a scdf-repo-main -y
```

### Deploy via kapp
Just using `kapp` and bypassing `kapp-controller` is a more straighforward way to deploy
things into _k8s_ without having a need to setup a controller environment. Essentially
it's just throwing out _k8s_ files into a cluster with some better control of what
`kapp` itself provides what comes for a deployment lifecycle. Essentially it is a step
above `kubectl` itself.

```
$ kapp -y deploy -a scdf-demo -f <(ytt -f config -f examples/kapp-290-snapshot-monitoring.yml)
```

When you've done delete deployment
```
$ kapp -y delete -a scdf-demo
```

### Deploy via kubectl
Most low level of a deployment as you are essentially just _templating_ files via
`ytt` and throwing those into an environment. While deployment probably works as
is but you're then responsible to handle further actions like manually deleting
everything if that needs to be done or handle all other scenarious when things
are changed. Not really a recommended way unless you need to work with very
low level deployment files.

## Project
Development notes about this POC.

### Configuration API
Main point of a _carvel_ is to provide a clear _API_ for consuming and using
its features. From a user point of view this means that there is a set of
options user can set which then drives k8s deployment files templating
and deployment into an environment. This sections documents these options
user as a consumer can use. Essentially this means that you will set
options with either plain properties of combine those into fully set of
yaml document.

| Parameter                                                       | Type                    | Default                                                | Description                                   |
|-----------------------------------------------------------------|-------------------------|--------------------------------------------------------|-----------------------------------------------|
| scdf.deploy.mode                                                | enum(minikube,cloud)    | minikube                                               | To ease deployment to minikube using nodeport |
| scdf.deploy.binder                                              | enum(rabbit,kafka)      | rabbit                                                 | Binder type type to use with apps             |
| scdf.database.type                                              | enum(mysql,postgres)    | mysql                                                  | Database type to use                          |
| scdf.database.username                                          | string(base64)          | dataflow                                               | Database username                             |
| scdf.database.password                                          | string(base64)          | secret                                                 | Database password                             |
| scdf.server.image.repository                                    | string(image repo base) | springcloud/spring-cloud-dataflow-server               |                                               |
| scdf.server.image.tag                                           | string(image tag)       | null                                                   |                                               |
| scdf.server.config                                              | yaml(additional config) | null                                                   |                                               |
| scdf.server.metrics.dashboard.url                               | string                  | null                                                   |                                               |
| scdf.ctr.image.repository                                       | string(image repo base) | springcloud/spring-cloud-dataflow-composed-task-runner | Metrics dashboard url                         |
| scdf.ctr.image.tag                                              | string(image tag)       | null                                                   |                                               |
| scdf.skipper.image.repository                                   | string(image repo base) | springcloud/spring-cloud-skipper-server                |                                               |
| scdf.skipper.image.tag                                          | string(image tag)       | null                                                   |                                               |
| scdf.skipper.config                                             | yaml(additional config) | null                                                   |                                               |
| scdf.binder.kafka.host                                          | string(host)            | null                                                   |                                               |
| scdf.binder.kafka.port                                          | string(port)            | null                                                   |                                               |
| scdf.rabbit.kafka.host                                          | string(host)            | null                                                   |                                               |
| scdf.rabbit.kafka.port                                          | string(port)            | null                                                   |                                               |
| scdf.feature.monitoring.prometheus.enabled                      | boolean                 | false                                                  |                                               |
| scdf.feature.monitoring.prometheus.image.repository             | string(image repo base) | prom/prometheus                                        |                                               |
| scdf.feature.monitoring.prometheus.image.tag                    | string(image tag)       | v2.12.0                                                |                                               |
| scdf.feature.monitoring.grafana.enabled                         | boolean                 | false                                                  |                                               |
| scdf.feature.monitoring.grafana.image.repository                | string(image repo base) | springcloud/spring-cloud-dataflow-grafana-prometheus   |                                               |
| scdf.feature.monitoring.grafana.image.tag                       | string(image tag)       | null                                                   |                                               |
| scdf.feature.monitoring.prometheusRsocketProxy.enabled          | boolean                 | false                                                  |                                               |
| scdf.feature.monitoring.prometheusRsocketProxy.image.repository | string(image repo base) | micrometermetrics/prometheus-rsocket-proxy             |                                               |
| scdf.feature.monitoring.prometheusRsocketProxy.image.tag        | string(image tag)       | 1.0.0                                                  |                                               |

### Development
Deploying this POC into your minikube or cloud environment depends of view things
depending what you're actually doing. Packages and package repos needs a bit more
dance around pushing _bundles_ into _OCI_ repose so you're probably going to
have easier life just deploying things via `kapp` as `ytt` templates as once
that works it's easier to translate needed things into exiting bundles.

### Testing
As templating gets more complex with with a lot of different user level options
to customize how actual k8s yaml files are laid out from templating, testing
is even more critical thing. Currently a choice was made to do testing via
npm/typescript as it gives relatively nice hooks to execute command line
programs like `ytt` and pass output to other npm libs like official model
classes to assert correct resulting k8s models.

As with normal dance with npm, you need to have `node` and `npm` installed and
tests can be run with:
```bash
$ npm install

$ npm run test
```
