#!/bin/bash

set -m

# DO NOT USE THIS YET (6/26/2015)

apt-get autoclean 
apt-get update
apt-get install -y ufw

wget -qO- https://get.docker.com/ | sh
service docker start

docker-compose up -d

ufw enable
ufw default deny incoming
ufw default allow outgoing

ufw allow 22/tcp
ufw allow 80/tcp
# only allow from specific servers
ufw allow 4444/udp

# test
ufw reload