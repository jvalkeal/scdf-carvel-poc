load("@ytt:data", "data")

def grafana_enabled():
  return data.values.scdf.feature.monitoring.grafana.enabled == True
end

def prometheus_enabled():
  return data.values.scdf.feature.monitoring.prometheus.enabled == True
end

def prometheus_rsocket_proxy_enabled():
  return data.values.scdf.feature.monitoring.prometheusRsocketProxy.enabled == True
end
