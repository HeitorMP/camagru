FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    msmtp \
    msmtp-mta \
    mailutils

RUN docker-php-ext-install pdo pdo_mysql mysqli

RUN apt install -yq ca-certificates

# Configurar o msmtp para simular sendmail
COPY tools/msmtprc /etc/msmtprc
RUN chmod 644 /etc/msmtprc


COPY tools/php.ini /usr/local/etc/php/php.ini

# Configura o PHP para usar o msmtp
RUN echo "sendmail_path = /usr/bin/msmtp -t" >> /usr/local/etc/php/conf.d/mail.ini

WORKDIR /var/www/html
