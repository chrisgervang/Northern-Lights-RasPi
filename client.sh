#!/bin/sh
#
#USAGE: sh ./client.sh client_NIC ssid wpa-psk ap_NIC
echo "Setting up client on $1"
CLIENT=$1
SSID=$2
PSK=$3
AP=$4

# ifconfig $CLIENT down



ifdown $CLIENT

# sleep 2

iwconfig $CLIENT power off

sleep 4

echo "writting to /etc/interfaces/"

echo "auto lo" > /etc/network/interfaces
echo "iface lo inet loopback\n" >> /etc/network/interfaces

echo "auto eth0" >> /etc/network/interfaces
echo "iface eth0 inet dhcp\n" >> /etc/network/interfaces

echo "auto $CLIENT" >> /etc/network/interfaces
echo "allow-hotplug $CLIENT" >> /etc/network/interfaces
echo "iface $CLIENT inet dhcp" >> /etc/network/interfaces
echo "  wpa-ssid \"$SSID\"" >> /etc/network/interfaces
echo "  wpa-psk \"$PSK\"" >> /etc/network/interfaces
# echo "  netmask 255.255.255.0\n" >> /etc/network/interfaces

echo "iface $AP inet static" >> /etc/network/interfaces
echo "  address 10.4.20.1" >> /etc/network/interfaces
echo "  netmask 255.255.255.0\n" >> /etc/network/interfaces

echo "wireless-power off" >> /etc/network/interfaces

echo "\nfile write complete\n"

cat /etc/network/interfaces

sleep 1

ifup $CLIENT

# sleep 3

echo "announce: init mining"

# optional: turn off ap

# service hostapd stop
# service isc-dhcp-server stop
# ifconfig $AP down
# ifdown $AP