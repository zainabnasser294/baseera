#!/bin/bash
# Baseera Postgres Automated Backup Script

# Set backup directory and date
BACKUP_DIR="/var/backups/baseera_db"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/baseera_db_$DATE.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Run pg_dump inside the running postgres container
docker exec baseera-postgres pg_dump -U baseera_user baseera_db | gzip > "$BACKUP_FILE"

# Optional: Delete backups older than 7 days
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
