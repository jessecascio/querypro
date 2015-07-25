#!/bin/bash

set -m

# DO NOT USE THIS YET (7/24/2015)

# set timezone ???

apt-get autoclean 
apt-get update
apt-get install -y ufw git

wget -qO- https://get.docker.com/ | sh
service docker start

curl -L https://github.com/docker/compose/releases/download/1.3.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# clone repo
cd /opt && git clone https://github.com/jessecascio/querypro.git
cd /opt/querypro && docker-compose up -d

ufw enable
ufw default deny incoming
ufw default allow outgoing

ufw allow 22/tcp
ufw allow 80/tcp
# only allow from specific servers
ufw allow 4444/udp

# test
ufw reload