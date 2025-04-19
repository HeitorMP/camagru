FROM php:8.4-apache

# Instala msmtp e outros utilitários
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
    git
    
    

# Habilita módulos PHP necessários
RUN docker-php-ext-install pdo pdo_mysql mysqli gd


# Configura sendmail com msmtp
COPY conf/msmtprc /etc/msmtprc
RUN chmod 644 /etc/msmtprc
RUN echo "sendmail_path = /usr/bin/msmtp -t" >> /usr/local/etc/php/conf.d/mail.ini


# Substitui o php.ini
COPY conf/php.ini /usr/local/etc/php/php.ini

COPY conf/apache.conf /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite

# Define diretório de trabalho
WORKDIR /var/www/html

# Expõe a porta do Apache
EXPOSE 80
