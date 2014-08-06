### BEGIN INIT INFO
# Provides:             quarry
# Required-Start:
# Required-Stop:
# Default-Start:        2 3 4 5
# Default-Stop:         0 1 6
# Short-Description:    Quarry Node App
### END INIT INFO

#export PATH=$PATH:/opt/node/bin
#export NODE_PATH=$NODE_PATH:/opt/node/lib/node_modules
#export HOME=/root 


case "$1" in
  start)
    sudo env PATH=$PATH:/home/pi/npm/bin forever -a -l /home/pi/quarry.log --minUptime 5000 --spinSleepTime 2000 start /home/pi/NL-Pi/index.js
    echo "starting shizz"
    ;;
  stop)
    sudo env PATH=$PATH:/home/pi/npm/bin forever stopall
    ;;
  status)
    sudo env PATH=$PATH:/home/pi/npm/bin forever list
    ;;
  *)

  echo "Usage: /etc/init.d/nodeup {start|stop}"
  exit 1
  ;;
esac
exit 0