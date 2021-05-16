load("@ytt:data", "data")

database_types = {"mysql": "mysql", "postgres": "postgres"}

def mysql_enabled():
  return database_types.get(data.values.database_type) == "mysql"
end

def postgres_enabled():
  return database_types.get(data.values.database_type) == "postgres"
end
