load("@ytt:data", "data")
load("binder/binder.star", "binder_install_enabled")
load("binder/binder.star", "rabbitmq_enabled")
load("binder/binder.star", "kafka_enabled")
load("binder/binder.star", "external_rabbitmq_enabled")
load("binder/binder.star", "external_kafka_enabled")
load("monitoring/monitoring.star", "grafana_enabled")

def env_config():
  env = ""
  if rabbitmq_enabled():
    env = "SPRING_RABBITMQ_HOST=${RABBITMQ_SERVICE_HOST},SPRING_RABBITMQ_PORT=${RABBITMQ_SERVICE_PORT}"
  elif kafka_enabled():
    env = "SPRING_CLOUD_STREAM_KAFKA_BINDER_BROKERS=kafka-broker:9092,SPRING_CLOUD_STREAM_KAFKA_BINDER_ZK_NODES=${KAFKA_ZK_SERVICE_HOST}:${KAFKA_ZK_SERVICE_PORT}"
  else:
    if external_rabbitmq_enabled():
      env = "SPRING_RABBITMQ_HOST=" + data.values.scdf.binder.rabbit.host + ",SPRING_RABBITMQ_PORT=" + str(data.values.scdf.binder.rabbit.port)
    elif external_kafka_enabled():
      env = "SPRING_CLOUD_STREAM_KAFKA_BINDER_BROKERS=" + data.values.scdf.binder.kafka.host
    end
  end
  return env
end

def skipper_image():
  return data.values.scdf.skipper.image.repository + ":" + data.values.scdf.skipper.image.tag
end

def skipper_container_env():
  envs = []
  envs.extend([{"name": "SPRING_CLOUD_CONFIG_ENABLED", "value": "false"}])
  envs.extend([{"name": "SPRING_CLOUD_KUBERNETES_CONFIG_ENABLE_API", "value": "false"}])
  envs.extend([{"name": "SPRING_CLOUD_KUBERNETES_SECRETS_ENABLE_API", "value": "false"}])
  envs.extend([{"name": "SPRING_CLOUD_KUBERNETES_SECRETS_PATHS", "value": "/etc/secrets"}])
  if grafana_enabled():
    envs.extend([{"name": "MANAGEMENT_METRICS_EXPORT_PROMETHEUS_ENABLED", "value": "true"}])
    envs.extend([{"name": "MANAGEMENT_METRICS_EXPORT_PROMETHEUS_RSOCKET_ENABLED", "value": "true"}])
    envs.extend([{"name": "MANAGEMENT_METRICS_EXPORT_PROMETHEUS_RSOCKET_HOST", "value": "prometheus-rsocket-proxy"}])
    envs.extend([{"name": "MANAGEMENT_METRICS_EXPORT_PROMETHEUS_RSOCKET_PORT", "value": "7001"}])
  end
  return envs
end
