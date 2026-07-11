FROM richarvey/nginx-php-fpm:3.1.6

ENV WEBROOT=/var/www/html/public
ENV RUN_SCRIPTS=1
# nginx-php-fpm listens on 8080 by default in this image — confirm and expose it
EXPOSE 8080

WORKDIR /var/www/html

# root of the API branch is already the Laravel app — copy everything as-is
COPY . /var/www/html/

RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader \
    && chmod +x /var/www/html/scripts/00-laravel-deploy.sh