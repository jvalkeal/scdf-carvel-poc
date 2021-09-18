load("@ytt:data", "data")

def name(): return data.values.name
def broker_name(): return name() + "-broker"
def zk_name(): return name() + "-zk"
def zk_client_name(): return zk_name() + "-client"
def zk_server_name(): return zk_name() + "-server"

def kafka_zk_container_env():
  envs = []
  envs.extend([{"name": "ZOOKEEPER_CLIENT_PORT", "value": "2181"}])
  return envs
end

def kafka_broker_container_env():
  envs = []
  envs.extend([{"name": "KAFKA_ADVERTISED_LISTENERS", "value": "PLAINTEXT://" + broker_name() + ":9092"}])
  envs.extend([{"name": "KAFKA_ZOOKEEPER_CONNECT", "value": zk_client_name() + ":2181"}])
  envs.extend([{"name": "KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR", "value": "1"}])
  return envs
end