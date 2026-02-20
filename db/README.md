# Project PostgreSQL data

Database files for this project are stored in this folder.

- **Port:** `5433` (so it doesn’t conflict with a main PostgreSQL on 5432)
- **Database name:** `Graduation Project`
- **User:** `postgres` (no password by default for this local cluster)

**Start server (from project root):**
```powershell
.\scripts\start-db.ps1
```

**Stop server:**
```powershell
.\scripts\stop-db.ps1
```

**Connect (e.g. psql):**
```powershell
psql -U postgres -d "Graduation Project" -p 5433
```

Connection string for apps: `postgresql://postgres@localhost:5433/Graduation%20Project`
