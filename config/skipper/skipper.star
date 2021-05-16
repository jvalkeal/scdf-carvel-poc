load("@ytt:data", "data")
load("/common/common.lib.yml", "rabbitmq_enabled", "kafka_enabled")

def env_config():
  env = ""
  if rabbitmq_enabled():
    env = "SPRING_RABBITMQ_HOST=${RABBITMQ_SERVICE_HOST},SPRING_RABBITMQ_PORT=${RABBITMQ_SERVICE_PORT}"
  elif kafka_enabled():
    env = "SPRING_CLOUD_STREAM_KAFKA_BINDER_BROKERS=kafka-broker:9092,SPRING_CLOUD_STREAM_KAFKA_BINDER_ZK_NODES=${KAFKA_ZK_SERVICE_HOST}:${KAFKA_ZK_SERVICE_PORT}"
  end
  return env
end

def skipper_image():
  return data.values.skipper_image_repository + ":" + data.values.skipper_image_tag
end
