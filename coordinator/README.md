# DDFlow Coordinator as an extension of Node-RED

Run this on a device with high availability. Requires Node.js (tested on v8.16.1)

1. Start the coordinator

> ./start.sh

2. Access the coordinator via browser (e.g. http://localhost:1880)

3. Drag out the ddflow-config node, and add all participating devices in the device list, separated by semicolons. For example:

> http://localhost:3000;http://172.17.40.23:3000

4. You *may* need to restart the coordinator to reload all the available services across all the devices

5. Drag and drop to build your application. Wire up nodes to build your dataflow. 

*note:* a "pulse" is a periodic trigger, and a "sink" will print to coordinator console.

6. Click deploy in the top right, and the coordinator will assign tasks based on availability of devices within the system. It will also monitor the application with periodic heartbeats.