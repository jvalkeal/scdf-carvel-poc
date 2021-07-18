load("@ytt:data", "data")

database_types = {"mysql": "mysql", "postgres": "postgres"}

def mysql_enabled():
  return database_types.get(data.values.scdf.database.type) == "mysql"
end

def postgres_enabled():
  return database_types.get(data.values.scdf.database.type) == "postgres"
end