NL-Pi
=====
To watch logs: tail -f -n 100 /var/log/syslog

1. SD format 4GB card. Download Raspian http://www.raspberrypi.org/downloads/ . Use ApplePi-Baker to flash SD. Boot SD.
2. settings: locale en_US GMT-08 08; timezone American/Los_Angeles; keyboard other/English(US);
3a. ssh in eth0
3. in /home/pi : git clone https://github.com/chrisgervang/NL-Pi.git
4. run sh install.sh
5. sudo nano /lib/udev/rules.d/75-persistent-net-generator.rules 7/12
added wlan*[0-9]| {
     # device name whitelist
     KERNEL!="wlan*[0-9]|ath*|msh*|ra*|sta*|ctc*|lcs*|hsi*", \
     GOTO=“persistent_net_generator_end”
} 7/12 worked!
6. config software: sudo nano /etc/default/isc-dhcp-server 6/4
changed to {
     INTERFACES=“wlan0"
}
7. link config file: sudo nano /etc/default/hostapd
changed {
     DAEMON_CONF="/etc/hostapd/hostapd.conf"
} 6/4
8. reboot
9. check to make sure hostapd and isc-dhcp-server are NOT running and that wlan0 and wlan1 are not changing.
9a. you can check with sudo service hostapd status and sudo service ics-dhcp-server and sudo nano /etc/udev/rules.d/70-persistent-net.rules
10. In ~/NL-Pi: sudo env PATH=$PATH:/usr/sbin/nodejs/bin pm2 startup debian -u pi


You’re done! 
restart with: sudo reboot
shutdown with: sudo shutdown -h now

Avoid unplugging the device without first shutting it down via command.