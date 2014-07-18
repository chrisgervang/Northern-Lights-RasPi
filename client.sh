#!/bin/sh
#
#USAGE: sh ./client.sh client_NIC ssid wpa-psk ap_NIC
echo "Setting up client on $1"
CLIENT=$1
SSID=$2
PSK=$3
AP=$4

ifconfig $CLIENT down

# sleep 2

ifdown $CLIENT

# sleep 4

echo "writting to /etc/interfaces/"

"auto lo\n" > /etc/network/interfaces

"iface lo inet loopback" >> /etc/network/interfaces
"iface eth0 inet dhcp\n" >> /etc/network/interfaces

"auto $CLIENT" >> /etc/network/interfaces
"allow-hotplug $CLIENT" >> /etc/network/interfaces
"iface $CLIENT inet dhcp" >> /etc/network/interfaces
  "wpa-ssid \"$SSID\"" >> /etc/network/interfaces
  "wpa-psk \"$PSK\"\n" >> /etc/network/interfaces

"iface $AP inet static" >> /etc/network/interfaces
  "address 10.4.20.1" >> /etc/network/interfaces
"netmask 255.255.255.0\n" >> /etc/network/interfaces

"wireless-power off" >> /etc/network/interfaces

echo "\nfile write complete\n"

cat /etc/network/interfaces

# sleep 1

ifup $CLIENT

# sleep 3

echo "announce: init mining"

# optional: turn off ap

# service hostapd stop
# service isc-dhcp-server stop
# ifconfig $AP down
# ifdown $AP