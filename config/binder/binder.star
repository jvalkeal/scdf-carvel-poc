load("@ytt:data", "data")
binder_types = {"rabbit": "rabbit", "kafka": "kafka"}

def rabbitmq_enabled():
  return binder_types.get(data.values.binder_type) == "rabbit"
end

def kafka_enabled():
  return binder_types.get(data.values.binder_type) == "kafka"
end
