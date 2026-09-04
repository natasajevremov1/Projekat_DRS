from sqlalchemy import create_engine, inspect

DATABASE_URL = "postgresql://projekat_drs_user:2kqGYmpRZZsFjta2HLN4pF4bRpMCkFeG@dpg-dada6q67bikc73aakuu0-a.oregon-postgres.render.com/projekat_drs"

engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

print(inspector.get_table_names())