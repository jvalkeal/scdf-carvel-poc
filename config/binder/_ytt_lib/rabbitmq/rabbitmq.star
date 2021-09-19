load("@ytt:data", "data")

def non_empty_string(value):
  return type(value) == "string" and len(value) > 0
end

def image():
  if non_empty_string(data.values.image.digest):
    return data.values.image.repository + "@" + data.values.image.digest
  else:
    return data.values.image.repository + ":" + data.values.image.tag
  end
end
