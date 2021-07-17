load("@ytt:data", "data")
binder_types = {"rabbit": "rabbit", "kafka": "kafka"}

def rabbitmq_enabled():
  return binder_types.get(data.values.scdf.deploy.binder) == "rabbit"
end

def kafka_enabled():
  return binder_types.get(data.values.scdf.deploy.binder) == "kafka"
end

def external_rabbitmq_enabled():
  return data.values.scdf.binder.rabbit.host != None and data.values.scdf.binder.rabbit.port != None
end

def external_kafka_enabled():
  return data.values.scdf.binder.kafka.host != None and data.values.scdf.binder.kafka.port != None
end

def binder_install_enabled():
  return data.values.scdf.binder.kafka.host == None and data.values.scdf.binder.kafka.port == None and data.values.scdf.binder.rabbit.host == None and data.values.scdf.binder.rabbit.port == None
end
