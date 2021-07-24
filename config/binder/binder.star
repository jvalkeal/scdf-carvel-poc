load("@ytt:data", "data")
binder_types = {"rabbit": "rabbit", "kafka": "kafka"}

def non_empty_string(value):
  return type(value) == "string" and len(value) > 0
end

def rabbitmq_enabled():
  return binder_types.get(data.values.scdf.deploy.binder) == "rabbit"
end

def kafka_enabled():
  return binder_types.get(data.values.scdf.deploy.binder) == "kafka"
end

def external_rabbitmq_enabled():
  return non_empty_string(data.values.scdf.binder.rabbit.host);
end

def external_kafka_enabled():
  return non_empty_string(data.values.scdf.binder.kafka.host);
end

def binder_install_enabled():
  return not non_empty_string(data.values.scdf.binder.rabbit.host) or not non_empty_string(data.values.scdf.binder.kafka.host);
end
