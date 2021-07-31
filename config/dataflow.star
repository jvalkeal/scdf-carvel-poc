load("@ytt:data", "data")
load("binder/binder.star", "rabbitmq_enabled")
load("binder/binder.star", "kafka_enabled")
load("monitoring/monitoring.star", "grafana_enabled")

def dataflow_image():
  return data.values.scdf.server.image.repository + ":" + data.values.scdf.server.image.tag
end

def ctr_image():
  return data.values.scdf.ctr.image.repository + ":" + data.values.scdf.ctr.image.tag
end

def dataflow_container_env():
  envs = []
  envs.extend([{"name": "KUBERNETES_NAMESPACE", "valueFrom": {"fieldRef": {"fieldPath": "metadata.namespace"}}}])
  envs.extend([{"name": "SPRING_CLOUD_CONFIG_ENABLED", "value": "false"}])
  envs.extend([{"name": "SPRING_CLOUD_DATAFLOW_FEATURES_ANALYTICS_ENABLED", "value": "true"}])
  envs.extend([{"name": "SPRING_CLOUD_DATAFLOW_FEATURES_SCHEDULES_ENABLED", "value": "true"}])
  envs.extend([{"name": "SPRING_CLOUD_DATAFLOW_TASK_COMPOSEDTASKRUNNER_URI", "value": "docker://" + ctr_image()}])
  envs.extend([{"name": "SPRING_CLOUD_KUBERNETES_CONFIG_ENABLE_API", "value": "false"}])
  envs.extend([{"name": "SPRING_CLOUD_KUBERNETES_SECRETS_ENABLE_API", "value": "false"}])
  envs.extend([{"name": "SPRING_CLOUD_KUBERNETES_SECRETS_PATHS", "value": "/etc/secrets"}])
  envs.extend([{"name": "SPRING_CLOUD_DATAFLOW_SERVER_URI", "value": "http://${SCDF_SERVER_SERVICE_HOST}:${SCDF_SERVER_SERVICE_PORT}"}])
  envs.extend([{"name": "SPRING_CLOUD_SKIPPER_CLIENT_SERVER_URI", "value": "http://${SKIPPER_SERVICE_HOST}:${SKIPPER_SERVICE_PORT}/api"}])
  envs.extend([{"name": "SPRING_APPLICATION_JSON", "value": "{ \"maven\": { \"local-repository\": null, \"remote-repositories\": { \"repo1\": { \"url\": \"https://repo.spring.io/libs-snapshot\"} } } }"}])
  if grafana_enabled():
    envs.extend([{"name": "MANAGEMENT_METRICS_EXPORT_PROMETHEUS_ENABLED", "value": "true"}])
    envs.extend([{"name": "MANAGEMENT_METRICS_EXPORT_PROMETHEUS_RSOCKET_ENABLED", "value": "true"}])
    envs.extend([{"name": "MANAGEMENT_METRICS_EXPORT_PROMETHEUS_RSOCKET_HOST", "value": "prometheus-rsocket-proxy"}])
    envs.extend([{"name": "MANAGEMENT_METRICS_EXPORT_PROMETHEUS_RSOCKET_PORT", "value": "7001"}])
    envs.extend([{"name": "SPRING_CLOUD_DATAFLOW_METRICS_DASHBOARD_URL", "value": "http://localhost:3000"}])
  end
  return envs
end
