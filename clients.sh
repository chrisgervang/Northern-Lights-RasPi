#!/bin/sh
# ifconfig wlan0 down
ifconfig wlan1 down
ifconfig wlan2 down

ifdown wlan1
ifdown wlan2

service hostapd stop
service isc-dhcp-server stop

echo "auto lo" > /etc/network/interfaces
echo "" >> /etc/network/interfaces
echo "iface lo inet loopback" >> /etc/network/interfaces
echo "iface eth0 inet dhcp" >> /etc/network/interfaces
echo "\n" >> /etc/network/interfaces
echo "auto wlan1" >> /etc/network/interfaces
echo "allow-hotplug wlan1" >> /etc/network/interfaces
echo "iface wlan1 inet dhcp" >> /etc/network/interfaces
echo "wpa-ssid \"Gervang Wireless\"" >> /etc/network/interfaces
echo "wpa-psk \"cocoapunch\"" >> /etc/network/interfaces
echo "\n" >> /etc/network/interfaces
echo "auto wlan2" >> /etc/network/interfaces
echo "allow-hotplug wlan2" >> /etc/network/interfaces
echo "iface wlan2 inet dhcp" >> /etc/network/interfaces
echo "wpa-ssid \"Gervang Wireless\"" >> /etc/network/interfaces
echo "wpa-psk \"cocoapunch\"" >> /etc/network/interfaces
echo "" >> /etc/network/interfaces

echo "\nfile write complete\n"

cat /etc/network/interfaces

ifconfig wlan1 up
ifconfig wlan2 up