# SCDF Carvel POC

Testing concepts of deploying `scdf` via `ytt` templating with `kapp`.

## Examples

```bash
$ kapp -y deploy -a dataflow -f <(ytt -f config -f example-minikube-oss-28x-kafka-postgres-values.yml)
$ kapp -y deploy -a dataflow -f <(ytt -f config -f example-minikube-oss-28x-rabbit-mysql-values.yml)
$ kapp -y deploy -a dataflow -f <(ytt -f config -f example-cloud-oss-28x-kafka-postgres-values.yml)
$ kapp -y deploy -a dataflow -f <(ytt -f config -f example-cloud-oss-28x-rabbit-mysql-values.yml)
$ kapp -y delete -a dataflow
```

## Testing

As templating gets more complex with with a lot of different user level options
to customize how actual k8s yaml files are laid out from templating, testing
is even more critical thing. Currently a choice was made to do testing via
npm/typescript as it gives relatively nice hooks to execute command line
programs like `ytt` and pass output to other npm libs like official model
classes to assert correct resulting k8s models.
