# SCDF Carvel POC

This is a POC repo to create full [carvel dance](https://carvel.dev) with scdf.
- Template k8s deploy files with `ytt`
- Create packages and package repos for `kapp-controller`.

## Examples

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
