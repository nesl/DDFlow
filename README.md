# DDFlow
DDFlow is a visualized programming interface for specifying declarative dataflow applications that dynamically deploy to a distributed and heterogeneous IoT cluster

This implementation accompanies the publication at IoTDI 2019. [Read the paper here](https://pdfs.semanticscholar.org/ef16/b2e15272804c84d69869fd6252489cc61aac.pdf) 

## coordinator
The coordinator is the centralized orchestration mechanism for DDFlow. It is a fork of the Node-RED programming tool, with intelligence added for dynamically assembling the capabilities of a distributed IoT cluster, presenting the capabilities through the visual interface, accepting declarative dataflow programs, and deploying/maintaining them across the available cluster. Requires Node.js.

## device-manager
The device manager is responsible for making available the capabilities of each device in the system. Capabilities are offered as *services* and reside in the services subfolder. You may either select from the current *suite* of services, or create your own, and test via the test_services.js program. By adding the device ip:port to the device list in the visual interface, the DDFlow coordinator will automatically extract and expose its functionality.