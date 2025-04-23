FROM php:8.4-apache

# Instala dependências do sistema e bibliotecas necessárias
RUN apt-get update && apt-get install -y \
    msmtp \
    msmtp-mta \
    mailutils \
    ca-certificates \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    curl \
    git \
    libmagickwand-dev \
    imagemagick \
    && rm -rf /var/lib/apt/lists/*

# Instala extensões PHP
RUN docker-php-ext-install pdo pdo_mysql mysqli gd

# Instala imagick via PECL
RUN pecl install imagick && docker-php-ext-enable imagick

# Configura msmtp como sendmail
COPY conf/msmtprc /etc/msmtprc
RUN chmod 644 /etc/msmtprc
RUN echo "sendmail_path = /usr/bin/msmtp -t" >> /usr/local/etc/php/conf.d/mail.ini

# Substitui o php.ini
COPY conf/php.ini /usr/local/etc/php/php.ini

# Configura Apache
COPY conf/apache.conf /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite

# Define diretório de trabalho
WORKDIR /var/www/html

# Expõe a porta do Apache
EXPOSE 80
