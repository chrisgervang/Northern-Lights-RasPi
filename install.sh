#!/bin/sh

echo "running to /home/pi"
cd /home/pi

echo "download node"
wget http://nodejs.org/dist/v0.10.26/node-v0.10.26-linux-arm-pi.tar.gz
echo "unzip node"
tar -xvzf /home/pi/node-v0.10.26-linux-arm-pi.tar.gz
echo "test node"
/home/pi/node-v0.10.26-linux-arm-pi/bin/node --version

# sudo nano /etc/profile
# added {
#      NODE_JS_HOME=/usr/sbin/nodejs
#      PATH=$PATH:$NODE_JS_HOME/bin
# } 6/6 

# rebooted pi 6/6
# node worked! 6/6

echo "Changed name of node folder in home dir to \"node\""
mv /home/pi/node-v0.10.26-linux-arm-pi /home/pi/node
echo "moving /home/pi/node to /usr/sbin where scripts that require super-user access go"
# moved node to /bin/sbin/nodejs 6/12
mv /home/pi/node /usr/sbin/nodejs

echo "install dhcp and hostapd"
apt-get install hostapd isc-dhcp-server

apt-get install iw 


echo "remove load at boot:" 
update-rc.d -f isc-dhcp-server remove
update-rc.d -f hostapd remove

echo "made proper node link:" 
ln -s /usr/sbin/nodejs/bin/node /usr/sbin/node
echo "made proper npm link:" 
ln -s /usr/sbin/nodejs/bin/npm /usr/sbin/npm

# still need to configure /etc/network/interfaces
# still need to configure /etc/default/hostapd
# 
# interface=wlan0
# driver=rtl871xdrv
# ssid=Quarry 53s65e
# hw_mode=g
# channel=6
# macaddr_acl=0
# auth_algs=1
# ignore_broadcast_ssid=0
# 
# still need to configure /etc/dhcp/dhcpd.conf
# 
# subnet 10.4.20.0 netmask 255.255.255.0 {
# range 10.4.20.10 10.4.20.50;
# option broadcast-address 10.4.20.255;
# option routers 10.4.20.1;
# default-lease-time 600;
# max-lease-time 7200;
# option domain-name "miner.quarry";
# option domain-name-servers 8.8.8.8, 8.8.4.4;
# }
# 
# still need to configure and install pm2
# sudo npm install -g pm2
#  in directory of index.js pm2 startup debian
# 
# git clone https://github.com/chrisgervang/NL-Pi.git

echo "install bfgminer dependencies"
apt-get install autoconf libtool libncurses-dev yasm curl libcurl4-openssl-dev libjansson-dev pkg-config libudev-dev uthash-dev libevent-dev

echo "install bfgminer"
git clone https://github.com/luke-jr/bfgminer.git
echo "moving into bfgminer"
cd ./bfgminer
./autogen.sh
./configure
make

git clone git://github.com/quick2wire/quick2wire-gpio-admin.git
cd quick2wire-gpio-admin/
make
make install
adduser $USER gpio
cd ..

echo "moving to home"
cd /home/pi

# uncomment when feeling ready
# git clone git://github.com/quick2wire/quick2wire-gpio-admin.git
# cd quick2wire-gpio-admin
# make
# sudo make install
# sudo adduser $USER gpio

# sudo nano /lib/udev/rules.d/75-persistent-net-generator.rules 7/12
# added alan*[0-9]| {
#      # device name whitelist
#      KERNEL!="wlan*[0-9]|ath*|msh*|ra*|sta*|ctc*|lcs*|hsi*", \
#      GOTO=“persistent_net_generator_end”
# } 7/12 worked!

apt-get update

apt-get upgrade

echo "subnet 10.4.20.0 netmask 255.255.255.0 {" >> /etc/dhcp/dhcpd.conf
echo "range 10.4.20.10 10.4.20.50;" >> /etc/dhcp/dhcpd.conf
echo "option broadcast-address 10.4.20.255;" >> /etc/dhcp/dhcpd.conf
echo "option routers 10.4.20.1;" >> /etc/dhcp/dhcpd.conf
echo "default-lease-time 600;" >> /etc/dhcp/dhcpd.conf
echo "max-lease-time 7200;" >> /etc/dhcp/dhcpd.conf
echo "option domain-name \"miner.quarry.dev\";" >> /etc/dhcp/dhcpd.conf
echo "option domain-name-servers 8.8.8.8, 8.8.4.4;" >> /etc/dhcp/dhcpd.conf
echo "}" >> /etc/dhcp/dhcpd.conf


echo "interface=wlan0" > /etc/hostapd/hostapd.conf
echo "driver=nl80211" >> /etc/hostapd/hostapd.conf
echo "ssid=Quarry 53s65e" >> /etc/hostapd/hostapd.conf
echo "hw_mode=g" >> /etc/hostapd/hostapd.conf
echo "channel=6" >> /etc/hostapd/hostapd.conf
echo "macaddr_acl=0" >> /etc/hostapd/hostapd.conf
echo "auth_algs=1" >> /etc/hostapd/hostapd.conf
echo "ignore_broadcast_ssid=0" >> /etc/hostapd/hostapd.conf

npm install -g pm2

npm install

git config remote.origin.url https://chrisgervang:kwy469655491@github.com/chrisgervang/NL-Pi.git
