#!/bin/sh
# build status: this works!!
#print out common commands
echo "\n***********************\nusb wifi name rules"
cat /etc/udev/rules.d/70-persistent-net.rules

echo "\n***********************\nlsusb"
lsusb

echo "***********************\nhostapd config file"
cat /etc/hostapd/hostapd.conf

echo "\n***********************\nnetwork interfaces file"
cat /etc/network/interfaces

echo "\n***********************\niwconfig"
iwconfig

echo "\n***********************\nifconfig"
ifconfig

echo "\n***********************\nwpa_cli status"
wpa_cli status

echo "\n***********************\nDCHP server status"
service isc-dhcp-server status

echo "\n***********************\nhostapd status"
service hostapd status

echo "\n***********************\nNOT shows:\n /etc/default/isc-dhcp-server \n /etc/dhcp/dhcpd.conf"
