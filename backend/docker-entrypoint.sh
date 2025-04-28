#!/bin/sh

# Wait for the database to be ready
if [ -n "$DATABASE_URL" ]; then
    echo "Waiting for database..."
    until nc -z -v -w30 $(echo $DATABASE_URL | awk -F[/:@] '{print $5}') $(echo $DATABASE_URL | awk -F[/:@] '{print $6}')
    do
      echo "Waiting for database connection..."
      sleep 1
    done
fi

exec "$@"
