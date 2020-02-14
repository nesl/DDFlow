# DDFlow Device Manager

Run this on every device in the system. Requires Node.js (tested on v8.16.1)

1. Place all capabilities in the services folder. 

*note:* you might want to create your own services as well. Test a new service with:

> node test_service.js

2. Start the device manager

> ./start.sh

3. Add the ip:port for this device within the coordinator "DDFlow Config" node, separated by semicolons (;)