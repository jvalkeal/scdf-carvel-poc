load("@ytt:data", "data")
load("/binder/binder.star", "rabbitmq_enabled")
load("/binder/binder.star", "kafka_enabled")

def dataflow_image():
  return data.values.scdf.server.image.repository + ":" + data.values.scdf.server.image.tag
end

def ctr_image():
  return data.values.scdf.ctr.image.repository + ":" + data.values.scdf.ctr.image.tag
end
