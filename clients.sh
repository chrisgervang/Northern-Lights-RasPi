#!/bin/sh
# ifconfig wlan0 down
ifconfig wlan1 down
ifconfig wlan2 down

ifdown wlan1
ifdown wlan2

service hostapd stop
service isc-dhcp-server stop

echo "auto lo" > /etc/network/interfaces
echo -e "\n" >> /etc/network/interfaces
echo -e "iface lo inet loopback" >> /etc/network/interfaces
echo -e "iface eth0 inet dhcp" >> /etc/network/interfaces
echo -e "\n" >> /etc/network/interfaces
echo -e "auto wlan1" >> /etc/network/interfaces
echo -e "allow-hotplug wlan1" >> /etc/network/interfaces
echo -e "iface wlan1 inet dhcp" >> /etc/network/interfaces
echo -e "wpa-ssid \"Gervang Wireless\"" >> /etc/network/interfaces
echo -e "wpa-psk \"cocoapunch\"" >> /etc/network/interfaces
echo -e "\n" >> /etc/network/interfaces
echo -e "auto wlan2" >> /etc/network/interfaces
echo -e "allow-hotplug wlan2" >> /etc/network/interfaces
echo -e "iface wlan2 inet dhcp" >> /etc/network/interfaces
echo -e "wpa-ssid \"Gervang Wireless\"" >> /etc/network/interfaces
echo -e "wpa-psk \"cocoapunch\"" >> /etc/network/interfaces
echo -e "\n" >> /etc/network/interfaces

echo -e "\nfile write complete\n"

cat /etc/network/interfaces

ifconfig wlan1 up
ifconfig wlan2 up