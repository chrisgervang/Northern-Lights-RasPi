var networkInterfaces = {
  path: "/etc/network/interfaces",
  content: {
    connect: "auto lo\n\n" + 
      "iface lo inet loopback\n" +
      "iface eth0 inet dhcp\n\n" +
      "auto wlan0\n" + 
      "allow-hotplug wlan1\n" + 
      "iface wlan1 inet dhcp\n" +
      "wpa-ssid \"{ssid}\"\n" +
      "wpa-psk \"{password}\"\n" +
      "iface wlan0 inet static\n" +
      "address 10.4.20.1\n" + 
      "netmask 255.255.255.0\n\n"+
      "wireless-power off",
    
    access: "auto lo\n\n" +
      "iface lo inet loopback\n" + 
      "iface eth0 inet dhcp\n\n" + 
      "iface wlan0 inet static\n" +
      "address 10.4.20.1\n" + 
      "netmask 255.255.255.0\n\n"+
      "wireless-power off",
  }
}

module.exports = networkInterfaces;