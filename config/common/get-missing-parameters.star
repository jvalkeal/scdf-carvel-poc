def non_empty_string(value):
  return type(value) == "string" and len(value) > 0
end

def non_empty_array(value):
  return type(value) == "list" and len(value) > 0
end

requirements = {
   "dataflow_image_repository": non_empty_string,
   "dataflow_image_tag": non_empty_string,
   "ctr_image_repository": non_empty_string,
   "ctr_image_tag": non_empty_string,
   "skipper_image_repository": non_empty_string,
   "skipper_image_tag": non_empty_string,
   "binder_type": non_empty_string,
   "database_type": non_empty_string,
}

def is_present(values, param):
    parts = param.split('.')
    obj = values
    for p in parts[0:-1]:
        obj = getattr(obj, p, None)
    end
    if not hasattr(obj, parts[-1]):
      return False
    end
    value = getattr(obj, parts[-1])
    if param in requirements:
      return requirements[param](value)
    end
    return non_empty_string(value)
end

def is_missing(values, param):
    return not is_present(values, param)
end

def get_missing_parameters(values):
    required_parameters = '''\
dataflow_image_tag
ctr_image_tag
skipper_image_tag
binder_type
database_type'''.split("\n")
    return [param for param in required_parameters if is_missing(values, param)]
end
