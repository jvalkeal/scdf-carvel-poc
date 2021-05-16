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
