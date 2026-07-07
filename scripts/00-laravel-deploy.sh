#!/usr/bin/env sh
set -e

cd /var/www/html

composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan storage:link || true
php artisan migrate --force
