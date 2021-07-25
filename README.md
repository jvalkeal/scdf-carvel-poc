# SCDF Carvel POC

This is a POC repo to create full [carvel dance](https://carvel.dev) with scdf.
- Template k8s deploy files with `ytt`
- Create packages and package repos for `kapp-controller`.

## Examples

NOTE: You need to have tools `kapp`, `kbld`, `ytt` and `imgpkg` installed from https://carvel.dev

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
about _Packages_ and _Package Repos_.

Install `kapp-controller`:
Deploy controller:
```
$ kapp deploy -a default-ns-rbac -f https://raw.githubusercontent.com/vmware-tanzu/carvel-kapp-controller/develop/examples/rbac/default-ns.yml
$ kapp deploy -a kc -f https://github.com/vmware-tanzu/carvel-kapp-controller/releases/latest/download/release.yml
```

After `kapp-controller` has been deployed you can deploy repositories for different stages
of a dataflow development and release channels like `snapshot`, `milestone` or `release`.

Deploy repository:
```
$ kapp deploy -a scdf-repo-snapshot -f examples/scdf-repo-snapshot-dockerhub.yml -y
$ kapp deploy -a scdf-repo-release -f examples/scdf-repo-release-dockerhub.yml -y

$ kapp deploy -a scdf-repo-snapshot -f examples/scdf-repo-snapshot-vmware.yml -y
$ kapp deploy -a scdf-repo-release -f examples/scdf-repo-release-vmware.yml -y

$ kubectl get packagerepositories
NAME                         AGE   DESCRIPTION
scdf-release.tanzu.vmware    23s   Reconcile succeeded
scdf-snapshot.tanzu.vmware   60s   Reconcile succeeded

$ kubectl get packages
NAME                                   PACKAGEMETADATA NAME    VERSION          AGE
scdf.tanzu.vmware.com.2.8.1            scdf.tanzu.vmware.com   2.8.1            12s
scdf.tanzu.vmware.com.2.8.2-SNAPSHOT   scdf.tanzu.vmware.com   2.8.2-SNAPSHOT   47s
scdf.tanzu.vmware.com.2.9.0-SNAPSHOT   scdf.tanzu.vmware.com   2.9.0-SNAPSHOT   46s
```

xxx:
```
$ kapp deploy -a scdf-demo -f examples/kapp-install-scdf-281-postgres.yml -y
```

xxx:
```
$ kubectl get packageinstalls
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
