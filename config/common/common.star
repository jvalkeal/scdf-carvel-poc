load("@ytt:data", "data")

deploy_types = {"minikube": "minikube", "cloud": "cloud"}

def minikube_enabled():
  return deploy_types.get(data.values.database_type) == "minikube"
end

def cloud_enabled():
  return deploy_types.get(data.values.database_type) == "cloud"
end

def service_spec_type():
  if data.values.deploy_mode == "minikube":
    return "NodePort"
  elif data.values.deploy_mode == "cloud":
    return "LoadBalancer"
  end
end
