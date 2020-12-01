//gui
var FizzyText = function() {
	this.aimingAt = "";
	this.aimingAtNamesapce = "";
	this.name = "";
	this.namespace = "";
	this.project = "";
	this.uid = "";
	this.phase = "";
	this.nodeType = "";
	this.serviceProvider = "";
	this.fulljson = "";
	this.fog = false;
};  			

var guitext = new FizzyText();
var gui = new dat.GUI({width: 600,});
gui.add(guitext, 'aimingAt');
gui.add(guitext, 'aimingAtNamesapce');
gui.add(guitext, 'name');
gui.add(guitext, 'namespace');
gui.add(guitext, 'project');
gui.add(guitext, 'uid');
gui.add(guitext, 'phase');
gui.add(guitext, 'nodeType');
gui.add(guitext, 'serviceProvider');
gui.add(guitext, 'fog');

var f1 = gui.addFolder('more');
f1.add(guitext, 'fulljson');
//gui end

//initialy hide loader
HideShowLoader(false);

var camera, scene, renderer;
var geometry, material, mesh;
var controls;
var raycaster;
var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

// pointer lock section 
// http://www.html5rocks.com/en/tutorials/pointerlock/intro/
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

if ( havePointerLock ) {
	var element = document.body;
	var pointerlockchange = function ( event ) {

		if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
			controlsEnabled = true;
			controls.enabled = true;

			blocker.style.display = 'none';
		} else {
			controls.enabled = false;

			blocker.style.display = '-webkit-box';
			blocker.style.display = '-moz-box';
			blocker.style.display = 'box';

			instructions.style.display = '';
		}
	};

	var pointerlockerror = function ( event ) {
		instructions.style.display = '';
	};

	// Hook pointer lock state change events
	document.addEventListener( 'pointerlockchange', pointerlockchange, false );
	document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
	document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

	document.addEventListener( 'pointerlockerror', pointerlockerror, false );
	document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
	document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

	instructions.addEventListener( 'click', function ( event ) {

		instructions.style.display = 'none';

		// Ask the browser to lock the pointer
		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

		if ( /Firefox/i.test( navigator.userAgent ) ) {
			var fullscreenchange = function ( event ) {
				if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
					document.removeEventListener( 'fullscreenchange', fullscreenchange );
					document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

					element.requestPointerLock();
				}
			};
			document.addEventListener( 'fullscreenchange', fullscreenchange, false );
			document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

			element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

			element.requestFullscreen();
		} else {
			element.requestPointerLock();
		}
	}, false );
} else {
	instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}
// end - pointer locks section 

//scale & grid density
var scale = 10;
var grid_density = 1.5;

var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;

var Key1 = false;
var Key2 = false;
var Key3 = false;
var Key4 = false;
var Key5 = false;

var object_count = 0;

var prevTime = performance.now();
var velocity = new THREE.Vector3();

var mouseWheelDelata = 0;

var console_visible=false;
document.getElementById("console").style.display = "none";

var environment = [];
environment['fog'] = false;
environment['hud'] = false;

init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );			
	
	crosshair = new THREE.Mesh(
		new THREE.RingGeometry( 0.02, 0.04, 32 ),
		new THREE.MeshBasicMaterial( {
			color: 0xf4d142,
			opacity: 0.5,
			transparent: true
		} )
	);
	crosshair.position.z = - 2;
	camera.add( crosshair );

	scene = new THREE.Scene();
	if (environment['fog'] == true ) scene.fog = new THREE.Fog( 0xffffff, 0, 950 );
	
	var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
	light.position.set( 0.5, 1, 0.75 );
	scene.add( light );

	controls = new THREE.PointerLockControls( camera );
	scene.add( controls.getObject() );

	//set initial camera position and orientation
	//controls.getObject().translateY(50);
	//controls.getObject().rotateY(120 * Math.PI / 180);
	//controls.update();
	//var initpoint = new THREE.Vector3( 15, 15, 30 );
	//camera.lookAt( initpoint );

	var onKeyDown = function ( event ) {

		//console.log(event.keyCode);
		
		if(console_visible){
			switch ( event.keyCode ) {				
				case 192: // key "`"					
					document.getElementById("console_input").blur();						
					break;
				case 13: //enter
					console_command_parse(document.getElementById("console_input").value);
					break;
				case 9: //tab
					break;
			}
		}else{
			switch ( event.keyCode ) {

				case 38: // up
				case 87: // w
					moveForward = true;
					break;

				case 37: // left
				case 65: // a
					moveLeft = true; break;

				case 40: // down
				case 83: // s
					moveBackward = true;
					break;

				case 39: // right
				case 68: // d
					moveRight = true;
					break;

				case 32: // space
					selectbox(selectcubemesh);
					break;

				case 49: //  key "1"
					Key1 = true;
					break;

				case 50: //  key "2"
					Key2 = true;
					break;

				case 51: //  key "3"
					Key3 = true;
					break;

				case 52: //  key "4"
					Key4 = true;
					break;

				case 53: //  key "5"
					Key5 = true;
					break;
						
				case 192: // key "`"
					//if (console_visible == false) ConsoleCtl();
					break;
			}

		}

	};

	var onKeyUp = function ( event ) {

		switch( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
			case 83: // s
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;
			
			case 192: // key "`"
				ConsoleCtl();
			break;
		}

	};

	var onDocumentMouseWheel = function ( event ) {
		mouseWheelDelata = event.wheelDeltaY

	};
	var onDocumentMouseDown = function( event ) {
		selectbox(selectcubemesh);
	};

	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );

	raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

	// floor 
	geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
	geometry.rotateX( - Math.PI / 2 );

	for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {

		var vertex = geometry.vertices[ i ];
		vertex.x += Math.random() * 20 - 10;
		vertex.y += Math.random() * 2;
		vertex.z += Math.random() * 20 - 10;
	
	}

	for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

		var face = geometry.faces[ i ];
		face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

	}
					
	material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
	mesh = new THREE.Mesh( geometry, material );
	mesh.name = "FloorMesh";
	scene.add( mesh );
	// floor end

	// cube objects
	// scale: defines cube size. by decresing size it increses number of viewvable objects, thus rendering distance (more objects fit into same scene).Also infulences placement of cubes (grid density)	

	scale = 10;

	console.log(geometry.faces.length);

	geometry = new THREE.BoxGeometry( scale ,scale ,scale );

	for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

		var face = geometry.faces[ i ];
		face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

	}

	//crete object group for selector cube
	var SelectorGroup = new THREE.Group();
	SelectorGroup.name = "SelectorGroup";

	var select_geometry = new THREE.CubeGeometry(12,12,12);

	var select_cubeMaterials = [ 
	new THREE.MeshBasicMaterial({color:0xf9f754, transparent:true, opacity:0.6, side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({color:0xf9f754, transparent:true, opacity:0.6, side: THREE.DoubleSide}), 
	new THREE.MeshBasicMaterial({color:0xf9f754, transparent:true, opacity:0.6, side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({color:0xf9f754, transparent:true, opacity:0.6, side: THREE.DoubleSide}), 
	new THREE.MeshBasicMaterial({color:0xf9f754, transparent:true, opacity:0.6, side: THREE.DoubleSide}), 
	new THREE.MeshBasicMaterial({color:0xf9f754, transparent:true, opacity:0.6, side: THREE.DoubleSide})];

	var select_cubeMaterial = new THREE.MeshFaceMaterial(select_cubeMaterials);
	var selectcubemesh = new THREE.Mesh(select_geometry, select_cubeMaterial);
	selectcubemesh.name = "selectcube";
	scene.add( selectcubemesh );
	
	selectcubemesh.position.x =10 ;
	selectcubemesh.position.y =10 ;
	selectcubemesh.position.z =10 ;

	selectcubemesh.visible = false;
	//end selectcube 

	//***********************				
	// get data from proxy  				
	//***********************
	
	var wsUri = "ws://" + location.hostname + ":" + location.port + "/wsapi";
	
	querystring = parse_query_string();

	command = querystring['command'];
	provider = querystring['provider'];

	console_append("request: " + command);

	websocket = new WebSocket(wsUri);

	//show loader
	HideShowLoader(true);

	//crete object group to group all node objects
	var ServerGroup = new THREE.Group();
	ServerGroup.name = "ServersGroup";

	websocket.onopen = function() {
		//init keepalive
		keepAlive();

		//initial request to get server list
		websocket.send(command);
		
		//on message handler
		websocket.onmessage = function(message) 
		{

			var full_arr1 = JSON.parse(message.data);
			full_arr = JSON.parse(full_arr1.userMessage);
			
			//console.log("parsed json > " + full_arr);
									
			if(typeof full_arr.response === 'undefined') {
			    response_command = "undefined";
			}
			else {
			    response_command = full_arr.response;
			}

			console.log("server command > " + response_command);

			//check response is received for getservers command
			if (response_command=="response_openshift_get_pods" || response_command=="response_gcp_get_compute" || response_command=="response_kubernetes_get_pods")
			{

				arr = full_arr.data;
				object_count = arr.length					 

				//sort by project or name depending on provider
				if (provider == "openshift" )
					arr.sort(compareRoleSort);
				else if (provider == "gcp" | provider == "k8s") 
					arr.sort(compareNameSort);
	  			
				prev_role = '';
				prev_name = '';

			 	console.log(arr.length)

			 	//draw cubes
			  	for (var i = 0, len = arr.length; i < len; i++) {
		
					//cubes 	
					//material = new THREE.MeshPhongMaterial( { specular: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
					material = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, vertexColors: THREE.VertexColors } );
					var mesh = new THREE.Mesh( geometry, material );

					//material.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
					//change collor when role or name changes deppending on provider
					if (provider == "openshift" ){
						if (arr[i]['namespace'] != prev_role)
						{
							ar = Math.random();	
							br = Math.random();
							prev_role = arr[i]['namespace']
						}
					}else if (provider == "gcp" | provider == "k8s"){
						if (arr[i]['name'].substring(0, 3) != prev_name.substring(0, 3))
						{
							ar = Math.random();	
							br = Math.random();
							prev_name = arr[i]['name']
						}
					}

					material.color.setHSL(ar * 0.8 + 0.5, 0.75, br * 0.25 + 0.75 );

					//add node data to current mesh
					mesh.userData.node = arr[i]
											
					//change mesh name to node name
					console.log(arr[i]['name']);
					mesh.name = arr[i]['name'];
					
					//add mesh(server object) to group
					ServerGroup.add( mesh );

				//end cube draw
			  	}

			  	//cubes placement
			  	arrange_flat(scene.getObjectByName("ServersGroup"));

			//end getservers section
			}
			
			if(response_command=="getgraphite"){
				//legacy artefact for fetching graphite data
				index = -1
				console.log(full_arr[0]['nodes']);
				console.log(full_arr[0]['values']);
				scene.getObjectByName("ServersGroup").traverse( function ( objx ) {							
					index = full_arr[0]['nodes'].indexOf(objx.name)
					if(index>=0){
						graphite_value = full_arr[0]['values'][index]
						console.log(graphite_value)
						scalar = graphite_value * 20;
						if(scalar == 0) scalar = 0.1;
						objx.scale.y = scalar;
						//objx.scale.y = 10
						HideShowLoader(false);
					}																	
				} );
			}
		
			//hide loader
			HideShowLoader(false);
		
			//close websocket
			//websocket.close();
		}		
	}

	//add servers object group to scene 
	scene.add( ServerGroup );
	scene.getObjectByName("ServersGroup").userData.intresection = null;
	
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0xffffff );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );

}

//function for sorting by role
function compareRoleSort(a, b) {
    if (a['namespace'] === b['namespace']) {
        return 0;
    }
    else {
        return (a['namespace'] < b['namespace']) ? -1 : 1;
    }
}	

//function for sorting by name 
function compareNameSort(a, b) {
    if (a['name'] === b['name']) {
        return 0;
    }
    else {
        return (a['name'] < b['name']) ? -1 : 1;
    }
}	

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );

	if ( controlsEnabled ) {
		raycaster.ray.origin.copy( controls.getObject().position );
		raycaster.ray.origin.y -= 10;

		
		var intersections = raycaster.intersectObjects( scene.getObjectByName("ServersGroup").children );
		//var intersections = raycaster.intersectObjects( objects );

		var isOnObject = intersections.length > 0;

		var time = performance.now();
		var delta = ( time - prevTime ) / 1000;

		var vector = new THREE.Vector3(); 
		camera.getWorldDirection( vector );
		//console.log(vector.y)
		//console.log(vector)

		//raycaster pointer
		//find which object are we pointing at  
		//example :stemkoski.github.io/Three.js/Mouse-Tooltip.html
		//var cam_raycaster = new THREE.Raycaster( camera.position, vector);			
		//var cam_intersections = cam_raycaster.intersectObjects( objects );					
		var cam_raycaster = new THREE.Raycaster();
		var mouse = new THREE.Vector2(0,0);
		//mouse.x = 0;
		//mouse.y = 0;
		
		cam_raycaster.setFromCamera( mouse, camera );	
		
		var cam_intersections = cam_raycaster.intersectObjects( scene.getObjectByName("ServersGroup").children );				
		//var cam_intersections = cam_raycaster.intersectObjects( objects );				
		
		if ( cam_intersections.length > 0 )
		{
			
			//add intersected object to scene graph and serversgroup so it can be accessed globaly
			scene.getObjectByName("ServersGroup").userData.intresection=cam_intersections[ 0 ].object
			
			//console.log(intersections[ 0 ].object.userData['node']);
			role = cam_intersections[ 0 ].object.userData['node']['project'];
			host = cam_intersections[ 0 ].object.userData['node']['name'];
			hostname = cam_intersections[ 0 ].object.userData['node']['name'];
			//console.log(cam_intersections[ 0 ].object.position)
			//console.log(host);
			
			//get namespace if provider k8s
			namespace = "none";
			if(cam_intersections[ 0 ].object.userData['node']['serviceProvider'] == "kubernetes")
			{
				namespace = cam_intersections[ 0 ].object.userData['node']['payload']['metadata']['namespace'];				
			}
			
			guitext.aimingAt = hostname;
			guitext.aimingAtNamesapce = namespace;
			gui.__controllers[0].updateDisplay();
			gui.__controllers[1].updateDisplay();
			
			//document.getElementById("hostname").innerHTML = hostname + " [" + role + "]";
		}
		
		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;
		velocity.y -= velocity.y * 10.0 * delta;

		//console.log(camera.getWorldDirection);
		//velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

		speed = 1800.0

		if ( moveForward ) velocity.y += vector.y * speed * delta;
		if ( moveBackward ) velocity.y -= vector.y * speed * delta;

		if ( moveForward ) velocity.z -= speed * delta;
		if ( moveBackward ) velocity.z += speed * delta;

		if ( moveLeft ) velocity.x -= speed * delta;
		if ( moveRight ) velocity.x += speed * delta;

		if ( isOnObject === true ) {
			velocity.y = Math.max( 0, velocity.y );

		}					

		//mouse wheel movement		
		if(mouseWheelDelata!=0)
		{
			//speed divider, lower value higher mousewhell speed
			divDelta=15;
			
			AbsMouseWheelDelata = Math.abs(mouseWheelDelata);

			if (mouseWheelDelata>0){
				velocity.y += vector.y * speed * delta * (AbsMouseWheelDelata/divDelta);
				velocity.z -= speed * delta * (AbsMouseWheelDelata/divDelta);
			}
			if (mouseWheelDelata<0){
				velocity.y -= vector.y * speed * delta * (AbsMouseWheelDelata/divDelta);
				velocity.z += speed * delta * (AbsMouseWheelDelata/divDelta);
			}

			mouseWheelDelata=0;
		}

		controls.getObject().translateX( velocity.x * delta );
		controls.getObject().translateY( velocity.y * delta );
		controls.getObject().translateZ( velocity.z * delta );

		if ( controls.getObject().position.y < 10 ) {

			velocity.y = 0;
			controls.getObject().position.y = 10;

		}

		prevTime = time;

		//**********  other functions 
		// display scene graph 
		if (Key1){
			scene.traverse( function ( obj ) {
				var s = '|___';
				var obj2 = obj;
				while ( obj2 !== scene ) {
					s = '\t' + s;
					obj2 = obj2.parent;
				}
				console.log( s + obj.name + ' <' + obj.type + '>' );
			} );
			Key1 = false;
		}

		// on keypress do stuff
		if (Key2){
			//reset sizes and position 
			scene.getObjectByName("ServersGroup").traverse( function ( obj ) {
			 	if(obj.name!="ServersGroup"){
			 	 	//reset scale
				 	obj.scale.y = 1;
					//reset position 
					state = 1
					if (obj.userData.node.state == 'live') state = 2;
					//obj.position.y = state * 10 * 1.5;					
					obj.position.y = state * scale * grid_density;
				}

			} );
 		
			Key2 = false;
		}

		// on keypress do stuff
		if (Key3){
			x=0;
			scene.getObjectByName("ServersGroup").traverse( function ( obj ) {
			 	x +=1;
			 	if(x>10) x=1;														
				//delta = 10 * Math.random()
				scaleY(obj,x);
			} );

			Key3 = false;
		}

		// on keypress do stuff
		if (Key4){
			x=0;
			scene.getObjectByName("ServersGroup").traverse( function ( obj ) {
			 	x = 5 * Math.random();							
				scaleY(obj,x);							
			} );

			Key4 = false;
		}

		// on keypress do stuff
		if (Key5){
			//test artefacts from graphite fetch 
			var hostnames = []
			scene.getObjectByName("ServersGroup").traverse( function ( obj ) {
				if(obj.name!="ServersGroup")
					hostnames.push(obj.name);							
			} );

			command = '{"command":"GetGraphite","metric_name":"load","GraphiteTarget":"movingMedian(sys.<fqdn>.loadavg.01,\'20min\')","nodes":'+ JSON.stringify(hostnames) + '}'
			
			//show loader
			HideShowLoader(true);

			console.log(command)
			websocket.send(command);

			hostnames = null
			command = null
			Key5 = false;

		}

	}

	renderer.render( scene, camera );

}

function scaleY ( meshx, scalex ) {
    meshx.scale.y = scalex ;
    //if( ! mesh.geometry.boundingBox ) mesh.geometry.computeBoundingBox();
    //var height = mesh.geometry.boundingBox.max.y - mesh.geometry.boundingBox.min.y;
    //height is here the native height of the geometry
    //that does not change with scaling. 
    //So we need to multiply with scale again
    meshx.position.y = Math.floor((10 * scalex / 2))
}

//fetch the query string 			
function QueryString() {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
  return query_string;
};

//show hide loader div
function HideShowLoader(showhide) {
    var x = document.getElementById('loader');
    if (showhide) {
        x.style.display = 'block';
    } else {
        x.style.display = 'none';
    }
}

function selectbox(selectcubemesh){
	if(scene.getObjectByName("ServersGroup").userData.intresection)
	{
		fqdn = scene.getObjectByName("ServersGroup").userData.intresection.userData['node']['name'];
		
		guitext.name = fqdn		
		guitext.project = scene.getObjectByName("ServersGroup").userData.intresection.userData.node.project;	
		guitext.uid = scene.getObjectByName("ServersGroup").userData.intresection.userData.node.uid;
		guitext.phase = scene.getObjectByName("ServersGroup").userData.intresection.userData.node.state;
		guitext.nodeType = scene.getObjectByName("ServersGroup").userData.intresection.userData.node.nodeType;
		guitext.serviceProvider = scene.getObjectByName("ServersGroup").userData.intresection.userData.node.serviceProvider;

		//if provider k8s get namespace
		if(scene.getObjectByName("ServersGroup").userData.intresection.userData.node.serviceProvider == "kubernetes")
		{
			guitext.namespace = scene.getObjectByName("ServersGroup").userData.intresection.userData.node.payload.metadata.namespace;			
		}
			
		console.log(scene.getObjectByName("ServersGroup").userData.intresection.userData.node);

		//update gui after changes
		for (var i in gui.__controllers) 
		{			
			gui.__controllers[i].updateDisplay();
		};			
			  	
		//move selector box
		selectcubemesh.position.x = scene.getObjectByName("ServersGroup").userData.intresection.position.x;
		selectcubemesh.position.y = scene.getObjectByName("ServersGroup").userData.intresection.position.y;
		selectcubemesh.position.z = scene.getObjectByName("ServersGroup").userData.intresection.position.z;

		selectcubemesh.scale.y = scene.getObjectByName("ServersGroup").userData.intresection.scale.y;

		selectcubemesh.visible = true;
	};
}

function keepAlive() {
    var timeout = 60000;
    if (websocket.readyState == websocket.OPEN) {
        websocket.send('{"command":"keepalive"}');
    }
    timerId = setTimeout(keepAlive, timeout);
}

function arrange_flat(ObjectGroup)
{
	var prev_name = "";
	var x=0;
	var z=0;
	var y=0;
	var state=1;
	var q=0;
	
	//object_count = ObjectGroup.name.length;				 
	ObjectGroup.traverse( function ( obj ) {
		q=q+1;
	});

	console_append("Number of nodes: " + object_count);

	//min square side to fit all objects
	q = Math.ceil(Math.sqrt(object_count));


	ObjectGroup.traverse( function ( obj ) {
		if(obj.name!="ServersGroup")
		{	
			// grid placement coordiantes 
			if (x>q){ 
				x=0;
				if (y>q) y=1;
				y++;
			}
			x++;

			state = 1
			
			console.log(obj.userData.node.state);
			if (obj.userData.node.state == 'running') state = 2;

			obj.position.x = x * scale * grid_density;	//height
			obj.position.y = state * scale * grid_density;
			obj.position.z = y * scale * grid_density;
									
		}
	} );
}

function arrange_columns(ObjectGroup)
{
	var prev_name = "";
	var x=0;
	var z=0;
	var y=0;

	ObjectGroup.traverse( function ( obj ) {
		if(obj.name!="ServersGroup")
		{
			//console_append(obj.userData.node.serviceProvider + " | " + obj.name + " | " + obj.userData.node.uid);

			if (obj.name.substring(0, 3) != prev_name.substring(0, 3))
			{
				x = x + 1
				y = 0;
				prev_name = obj.name;
			}

			y=y+1;
			obj.position.x = x * scale * grid_density;
			obj.position.y = y * scale * grid_density; //height
			obj.position.z = z * scale * grid_density;

		}
	} );
}


function parse_query_string(){
	
	var command = "";
	var provider = "";
	var out = [];

	//get the query string
	querystrig = QueryString();
	if (querystrig.search)
		search = querystrig.search;
	else
		search = '';

	if (querystrig.project)
		project = querystrig.project;
	else
		project = '';

	if (querystrig.zone)
		zone = querystrig.zone;
	else
		zone = '';

	if (querystrig.context)
		context = querystrig.context;
	else
		context = '';

	if (querystrig.provider)
		provider = querystrig.provider;
	else
		provider = '';

	//prepare initial command for server depending on querystring values
	if (provider == "openshift" )
		command = '{"command":"openshift_get_pods","filter":"' + search + '"}';
	else if (provider == "gcp" ) 
		command = '{"command":"gcp_get_compute","project":"'+ project + '","zone":"' + zone + '"}';
	else if (provider == "k8s" ) 
		command = '{"command":"kubernetes_get_pods","context":"' + context + '"}';
	else 
		command = '{"command":"ping"}';
	
	out["command"]=command;
	out["provider"]=provider;
	
	return out;
}
