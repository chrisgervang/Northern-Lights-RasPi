#!/bin/sh

# This script will bring the system back to a clean configuration.
# It's goal is to bring the system to a remote debugging state through eth0 or wlan0.
# All other networking is turned off, and all servers are shutdown.

# You must renable pm2 at startup with 'pm2 startup debian'
# You must reconfigure /etc/network/intefaces
# You must turn power management off for WiFi's
# Doesn't alter dhcp or hostapd settings yet
dhclient -r wlan0
dhclient -r wlan1

ifdown wlan0
ifdown wlan1

ifconfig wlan0 down
ifconfig wlan1 down

service isc-dhcp-server stop
service hostapd stop

pm2 stop all

rm /home/pi/NL-Pi/settings.json

update-rc.d -f pm2-init.sh remove

echo "writting to /etc/interfaces/"

echo "auto lo" > /etc/network/interfaces
echo "iface lo inet loopback\n" >> /etc/network/interfaces

echo "auto eth0" >> /etc/network/interfaces
echo "iface eth0 inet dhcp\n" >> /etc/network/interfaces

echo "iface wlan0 inet manual\n" >> /etc/network/interfaces

echo "iface wlan1 inet manual\n" >> /etc/network/interfaces

echo "wireless-power off" >> /etc/network/interfaces

echo "\nfile write complete\n"

dhclient -r eth0

ifdown eth0

ifup eth0