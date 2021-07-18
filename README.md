# SCDF Carvel POC

This is a POC repo to create full [carvel dance](https://carvel.dev) with scdf.
- Template k8s deploy files with `ytt`
- Create packages and package repos for `kapp-controller`.

## Examples

### Direct Deploy with Generated Config

Having a minicube:
```bash
$ kapp -y deploy -a dataflow -f <(ytt -f config -f examples/cloud-oss-281-kafka-postgres-values.yml)
$ kapp -y deploy -a dataflow -f <(ytt -f config -f examples/cloud-oss-281-rabbit-mysql-values.yml)
$ kapp -y delete -a dataflow
```

NOTE: With minikube a nodeports ip's are used

Having a cloud environment:
```bash
$ kapp -y deploy -a dataflow -f <(ytt -f config -f examples/minikube-oss-281-kafka-postgres-values.yml)
$ kapp -y deploy -a dataflow -f <(ytt -f config -f examples/minikube-oss-281-rabbit-mysql-values.yml)
$ kapp -y delete -a dataflow
```

NOTE: With cloud a loadbalancer ip's are used

### Deploy via kapp-controller
Better system integration exists via `kapp-controller` which knows things
about _Packages_ and _Package Repos_. In this example there is two version
`2.8.0` and `2.8.1` which are available from a registry. This example
is with a minikube.

Deploy controller:
```
$ kapp deploy -a kc -f https://github.com/vmware-tanzu/carvel-kapp-controller/releases/latest/download/release.yml
```

Deploy repository:
```
$ kapp deploy -a scdf-repo-main -f examples/scdf-repo-main.yml -y

$ kubectl get packagerepositories
NAME                     AGE   DESCRIPTION
scdf-main.tanzu.vmware   13m   Reconcile succeeded

$ kubectl get packages
NAME                          PACKAGEMETADATA NAME    VERSION   AGE
scdf.tanzu.vmware.com.2.8.0   scdf.tanzu.vmware.com   2.8.0     13m24s
scdf.tanzu.vmware.com.2.8.1   scdf.tanzu.vmware.com   2.8.1     13m23s
```

Deploy dataflow:
```
$ kapp deploy -a scdf-demo -f examples/kapp-install-scdf-280-postgres.yml -y

$ kubectl get packageinstalls
NAME        PACKAGE NAME            PACKAGE VERSION   DESCRIPTION           AGE
scdf-demo   scdf.tanzu.vmware.com   2.8.0             Reconcile succeeded   13m
```

Upgrade dataflow:
```
$ kapp deploy -a scdf-demo -f examples/kapp-install-scdf-281-postgres.yml -y

$ kubectl get packageinstalls
NAME        PACKAGE NAME            PACKAGE VERSION   DESCRIPTION           AGE
scdf-demo   scdf.tanzu.vmware.com   2.8.1             Reconcile succeeded   13m
```

Cleanup:
```
kapp delete -a scdf-demo -y
kapp delete -a scdf-repo-main -y
```

## Testing

As templating gets more complex with with a lot of different user level options
to customize how actual k8s yaml files are laid out from templating, testing
is even more critical thing. Currently a choice was made to do testing via
npm/typescript as it gives relatively nice hooks to execute command line
programs like `ytt` and pass output to other npm libs like official model
classes to assert correct resulting k8s models.

As with normal dance with npm, you need to have `node` and `npm` installed and
tests can be run with:
```bash
$ npm run test
```
