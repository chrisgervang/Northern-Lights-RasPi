#!/bin/sh
#
#USAGE: sh ./ap.sh ap_NIC
echo "Setting up access point on $1"
INTER=$1
# IP=$2
# DRIVER=$3

# go through each command. Figure out if you need to "sleep" at any point. watch syslog. 
service isc-dhcp-server stop

# sleep 1

service hostapd stop

ifdown $1

iwconfig $1 power off

# sleep 4

echo "writting to /etc/interfaces/"

echo "auto lo\n" > /etc/network/interfaces

echo "iface lo inet loopback" >> /etc/network/interfaces
echo "iface eth0 inet dhcp\n" >> /etc/network/interfaces

echo "iface $1 inet static" >> /etc/network/interfaces
echo "address 10.4.20.1" >> /etc/network/interfaces
echo "netmask 255.255.255.0\n" >> /etc/network/interfaces

echo "wireless-power off" >> /etc/network/interfaces


echo "\nfile write complete\n"

cat /etc/network/interfaces

ifconfig $1 10.4.20.1

# sleep 6

service hostapd start

# sleep 1

service isc-dhcp-server start

# sleep 10

echo "announce: init server"