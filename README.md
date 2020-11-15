# Inviso

[![Screen capture video](https://raw.githubusercontent.com/rgombash/inviso/master/inviso_screenshot.png)](https://youtu.be/b5nJMbBpMWQ "Screen capture video")

### Idea, Vision

Expanding perception and visibility of the complex distributed computing systems through spatial visualization.

### What does it do currently ?

Gets the list of pods from Kubernetes, OpenShift cluster, or Google Cloud compute nodes and displays it in 3d space with some meta info embedded in visual representation.

### Architecture

[3d/2d client(s)] <--websocket--> [proxy service] <--http(s), kafka, ...---> [data source(s)]

Client/server communication is done via simple JSON asynchronously.

Currently, there are plugins for getting node or pod list from
* OpenShift OKD v3.11 with API v1 (plugin: OpenShift.java) 
* Google Cloud compute nodes (plugin: GoogleCloudPlatform.java)  
* Kubernetes (plugin: Kubernetes.java, note: tested only with GKE)

Adding more plugins for different data sources (e.g.: public cloud providers) should be relatively easy following the existing plugins pattern.

### Proxy Service

Proxy Service is intended to provide a universal and straightforward WebSocket interface for various data sources.
It is written in Java and Spark framework. Currently has Kubernetes, OpenShift, and GCP Compute data sources (plugins).
Apart from the WebSocket endpoint service also has an HTTP endpoint for static content. 
By default, the service runs on port 4567 (both HTTP and WS)

#### Proxy Service plugins

##### OpenShift Plugin

Gets and filters pods from OpenShift API. The plugin was tested with OKD v3.11 with API v1.

Currently only works with token auth. 
To get your API key, use oc tool: 

`oc login -u your_username https://url_to_your_openshift.com:8443`

`oc whoami -t` 

Update config.properties accordingly.

##### Google Cloud Compute Plugin

Uses Google's API Client for Java and gcloud CLI authentication.  

Howto for installing gcloud command line tool : https://cloud.google.com/sdk/docs/quickstarts
After setting it up and successfully authenticating, you need you set environment variable GOOGLE_APPLICATION_CREDENTIALS to point to gcloud credentials token.

In Linux/bash: 

`export GOOGLE_APPLICATION_CREDENTIALS = /home/YOUR_HOME_DIR/.config/gcloud/legacy_credentials/YOUR_USER@SOMEWHERE.COM/adc.json`

Or use your preferred IDE to set up runtime environment variable.   

##### Kubernetes

For the plugin to work, you need to have configured kubectl on the machine where Inviso ProxyService will run, or config file with at least one context. On Linux, usually in ~/.kube/config

### Visualisation Clients

All static content (clients) reside in `/src/main/resources/public/`
Service serves this content on http://localhost:4567 (if you are running the service locally)

#### 3DView 

Technology : html, .js, three.js (WebGL)

3D representation of nodes. Each box represents one node/container/vm where position represents state (higher = online / lower = offline)
Colors represent different roles. Aiming and clicking on a specific box shows basic info in the properties box.

If run locally you can access it on : http://localhot:4567/3dview.html

* For OpenShift : http://localhost:4567/3dview.html?provider=openshift&search=SOME_SEARCH_STRING. If no search string provided it will list all available pods.
* For Google Cloud compute : http://localhost:4567/3dview.html?provider=gcp&zone=YOUR-ZONE&project=YOUR-PROJECT

For JS visualization three.js example was used as a starting point: https://threejs.org/examples/#misc_controls_pointerlock

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
* Add LDAP auth to HTTP (some basic auth is already there, but it is disabled, had problems with .js loading on Firefox)
* Enable HTTPS and WSS
* Add more elements of the clusters, e.g., ingest controllers, storages, etc. 
* Test subscription model (client subscribes to periodic / streaming updates)

### Final notes
This is a hobby project that I am playing with sporadically for a few years now. The initial concept was written in Python and the Panda3d engine and was later rewritten to Java and Three.js engine.
The code was prototyped fast and dirty (also, my first Java service), so do not expect high-quality code.
