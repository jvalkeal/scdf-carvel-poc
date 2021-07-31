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

$ kapp deploy -y -a kc -f https://github.com/vmware-tanzu/carvel-kapp-controller/releases/latest/download/release.yml
```

After `kapp-controller` has been deployed you can deploy repositories for different stages
of a dataflow development and release channels like `snapshot`, `milestone` or `release`.

Deploy repository:
```
$ kapp deploy -a scdf-repo-snapshot -f examples/scdf-repo-snapshot-vmware.yml -y

$ kapp deploy -a scdf-repo-release -f examples/scdf-repo-release-vmware.yml -y

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

## Project
Development notes about this POC.

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
