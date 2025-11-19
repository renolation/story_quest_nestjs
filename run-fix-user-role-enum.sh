#!/bin/bash

# Fix User Role Enum Script
# This script connects to the PostgreSQL database and runs the fix-user-role-enum.sql file

# Load environment variables from .env file
source .env

# Connection string from .env
DB_CONNECTION="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}"

echo "=== Fixing User Role Enum ==="
echo "Connecting to database: ${DB_DATABASE}"
echo ""

# Check if we have psql or docker postgres container
if command -v psql &> /dev/null; then
    echo "Using psql command..."
    psql "$DB_CONNECTION" -f fix-user-role-enum.sql
elif command -v docker &> /dev/null && docker ps | grep -q postgres; then
    echo "Using docker exec..."
    CONTAINER_ID=$(docker ps --filter "name=postgres" --format "{{.ID}}" | head -1)
    docker exec -i $CONTAINER_ID psql -U ${DB_USERNAME} -d ${DB_DATABASE} < fix-user-role-enum.sql
else
    echo "ERROR: Neither psql nor docker postgres container found."
    echo ""
    echo "Please run the SQL manually by copying the contents of fix-user-role-enum.sql"
    echo "and executing it in your PostgreSQL database."
    echo ""
    echo "Database connection details:"
    echo "  Host: ${DB_HOST}"
    echo "  Port: ${DB_PORT}"
    echo "  Database: ${DB_DATABASE}"
    echo "  Username: ${DB_USERNAME}"
    exit 1
fi

echo ""
echo "=== Done! ==="
echo "The user role enum has been updated successfully."
echo "You can now restart your NestJS application."
