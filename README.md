# Inviso

[![Screen capture video](https://raw.githubusercontent.com/rgombash/inviso/master/inviso_screenshot.png)](https://youtu.be/b5nJMbBpMWQ "Screen capture video")

### Idea, Vision

Expanding perception and visibility of the complex distributed computing systems through spatial visualisation

### What does it do currently ?

Gets list of pods from OpenShift cluster and displays it in 3d space with some meta info embedded in visual representation.

### Architecture

[3d/2d client(s)] <--websocket--> [proxy service] <--http(s), kafka, ...---> [data source(s)]

client/server communication is done via simple JSON asynchronously.

Currently there is only one data source plugin but adding more plugins for different data sources (eg.: public cloud providers) should be relatively easy.

### Proxy Service

Proxy Service is intended to provide simple and universal websocket interface for various data sources.
It is written in Java and Spark framework. Currently has only OpenShift data source (plugin).
Apart from websocket endpoint service also has http endpoint for static content. 
By default service runs on port 4567 (both http and ws)

#### Proxy Service plugins

##### OpenShift plugin

Gets and filters pods from OpenShift API. Plugin was tested with OKD v3.11 with API v1

Currently only works with token auth. 
To get your api key use oc tool : 

`oc login -u your_username https://url_to_your_openshift.com:8443`

`oc whoami -t` 

update config.properties accordingly

### Visualisation Clients

All static content (clients) reside in `/src/main/resources/public/`
Service serves this content on http://localhost:4567 (if you are running the service locally)

#### 3DView 

Technology : html, .js, three.js (WebGL)

3D representation of nodes. Each box represents one node/container/vm where position represent state (higher = online / lower = offline)
Colors represent different roles. Aiming and clicking on specific box shows basic info in right window

If run locally you can access it on : http://localhot:4567/3dview.html

Accepts filter parameter : http://localhost:4567/3dview.html?search=some_namespace_search_string

JS visualization code is a modified three.js example : https://threejs.org/examples/#misc_controls_pointerlock

#### Debug endpoint for server messages

location `/debug.html`

Displays server (Proxy Service) messages and active clients

### Build and Run

Tested with JDK 9 and OpenJDK 9 

##### Update service config file

Copy dist.config.properties to config.properties and update authentication and config data.

`cp dist.config.properties config.properties`

##### Maven build

`mvn clean compile assembly:single`

##### Run

`java -cp target/inviso-1.0-SNAPSHOT-jar-with-dependencies.jar ProxyService`

If running locally you should go to http://localhost:4567 for index page

### TODOs
* add ldap auth to http (some basic auth is already there already but it is disabled, had problems with .js loading on FireFox)
* enable https and wss
* add more data sources (e.g.: prometheus, kubernetes, GCP, ...)
* test subscription model (client subscribes to periodic / streaming updates)
* standardize Proxy Service response schema

### Final notes
This a hobby project that I am playing with sporadically for few years now. Initial concept was written in python and panda3d engine later rewritten to Java and Three.js engine.
Code was prototyped fast and most of the time dirty (also this is my first Java service), so do not expect high quality code.
