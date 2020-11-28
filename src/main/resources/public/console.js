// console related functions

// command line parser 
function console_command_parse(input)
{
	cmd = input.split(" ")
	switch(cmd[0]){
		case "test":
			console_append(input);
			break;
		case "clear":
			document.getElementById("window").innerHTML = "";
			break;
		case "list":
			switch(cmd[1]){
				case "nodes":
					/*for (var i = 0, len = arr.length; i < len; i++) {
						console_append(arr[i]['name']);
					}*/
				scene.getObjectByName("ServersGroup").traverse( function ( obj ) {
					if(obj.name!="ServersGroup")
					{
						console_append(obj.userData.node.serviceProvider + " | " +  obj.userData.node.state + " | " + obj.name + " | " + obj.userData.node.uid);						
					}
				} );
				break;
			}
		case "arrange":			
			switch(cmd[1]){
				case "flat":
					arrange_flat(scene.getObjectByName("ServersGroup"));
				break;
				case "columns":
					arrange_columns(scene.getObjectByName("ServersGroup"));
				break;
			}	
		break;
		case "help":
			console_append(`				
				Options:
				<br>
				test [anything] - console echo test<br>
				list nodes - list all loaded nodes in console<br>
				arrange [flat|columns] - nodes layout<br>
				clear - erase content of console<br>
			`);
		break;
		default:
			console_append(`<br>Unknown command. Type "help" for options<br>`);
		break;
	}

	document.getElementById("console_input").value = "";
}

//show and hide console
function ConsoleCtl() {
  var x = document.getElementById("console");
  if (x.style.display === "none") {
    x.style.display = "block";
    console_visible=true;
    document.getElementById("console_input").focus(); 
  } else {
    x.style.display = "none";
    console_visible=false;
    window.focus();
  }
} 

function console_append(text)
{
	var consoleDiv = document.getElementById("window");
	consoleDiv.innerHTML += text;
	consoleDiv.innerHTML += "<br>";
	consoleDiv.scrollTop = consoleDiv.scrollHeight;
}
