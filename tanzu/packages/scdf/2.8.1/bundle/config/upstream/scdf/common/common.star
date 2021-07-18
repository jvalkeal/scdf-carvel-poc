load("@ytt:data", "data")

deploy_types = {"minikube": "minikube", "cloud": "cloud"}

def minikube_enabled():
  return deploy_types.get(data.values.scdf.deploy.mode) == "minikube"
end

def cloud_enabled():
  return deploy_types.get(data.values.scdf.deploy.mode) == "cloud"
end

def service_spec_type():
  if data.values.scdf.deploy.mode == "minikube":
    return "NodePort"
  elif data.values.scdf.deploy.mode == "cloud":
    return "LoadBalancer"
  end
end