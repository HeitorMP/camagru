FROM php:8.4-fpm

RUN docker-php-ext-install pdo pdo_mysql mysqli

# Copia arquivos de configuração
# ADD ./php.ini /usr/local/etc/php/conf.d/

WORKDIR /var/www/html
