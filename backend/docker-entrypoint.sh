#!/bin/sh

# Wait for the database to be ready
if [ -n "$DATABASE_URL" ]; then
    echo "Waiting for database..."

    host=$(echo "$DATABASE_URL" | sed -E 's|.*://[^@]+@([^:/]+):([0-9]+)/.*|\1|')
    port=$(echo "$DATABASE_URL" | sed -E 's|.*://[^@]+@([^:/]+):([0-9]+)/.*|\2|')

    echo "Connecting to host: $host, port: $port"

    until nc -z -v -w30 "$host" "$port"; do
        echo "Waiting for database connection..."
        sleep 1
    done
fi

exec "$@"
