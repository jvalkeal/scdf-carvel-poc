load("@ytt:data", "data")
load("/common/common.lib.yml", "rabbitmq_enabled", "kafka_enabled")

def dataflow_image():
  return data.values.dataflow_image_repository + ":" + data.values.dataflow_image_tag
end
