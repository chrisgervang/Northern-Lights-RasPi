#!/bin/sh

# This script will bring the system back to a clean configuration.
# It's goal is to bring the system to a remote debugging state through eth0 or wlan0.
# All other networking is turned off, and all servers are shutdown.

ifconfig wlan0 down
ifconfig wlan1 down


service isc-dhcp-server stop
service hostapd stop

pm2 stop all

echo "writting to /etc/interfaces/"

echo "auto lo\n" > /etc/network/interfaces

echo "iface lo inet loopback" >> /etc/network/interfaces

echo "auto eth0\n" >> /etc/network/interfaces
echo "iface eth0 inet dhcp\n" >> /etc/network/interfaces
echo "iface wlan0 inet dhcp\n" >> /etc/network/interfaces
echo "iface wlan1 inet dhcp\n" >> /etc/network/interfaces

echo "\nfile write complete\n"

ifdown eth0
ifup eth0