// console and hud related functions

// command line parser 
function console_command_parse(input)
{
	cmd = input.split(" ")
	arg_no = cmd.length;

	console_append("#" + input)

	switch(cmd[0]){
		case "clear":
			document.getElementById("consolewindow").innerHTML = "";
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
				default:
					console_append(`Unknown layout`);
				break;
			}	
		break;
		case "help":
			console_append(`				
				Options:
				<br>
				list nodes - list all loaded nodes in console<br>
				arrange [flat|columns] - nodes layout<br>
				clear - erase content of console<br>
				set - show environment variables<br>
				set [variable] - show value of the environment variable<br>
				set [varibale] [value] - set environment variable to the value<br>
				hud [on|off] - show hud
			`);
		break;
		case "set":
			if(arg_no == 1){
				for (var key in environment)
				{
					console_append(key + "=" + environment[key] + " | " +typeof(environment[key]));
				}
			}
			if(arg_no == 2){
				if(typeof environment[cmd[1]] === 'undefined'){
					console_append("Error: environment variable is not set");
				} else {
					console_append(cmd[1] + "=" + environment[cmd[1]]);
				}
			}
			if(arg_no == 3){
				environment[cmd[1]] = ConvertString(cmd[2]);
				console_append(cmd[1] + "=" + cmd[2]);
			}
		break;
		case "hud":
			switch(cmd[1]){
				case "on":
					VisibilitySwitch("hud", true);
				break;
				case "off":
					VisibilitySwitch("hud", false);
				break;
				default:
					console_append(`Hud options: on|off`);
				break;
			}
		break;
		default:
			console_append(`Unknown command. Type "help" for options`);
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

function VisibilitySwitch(element_id, state) {
  var x = document.getElementById(element_id);
  if (state === true) {
    x.style.display = "block";
  } else {
    x.style.display = "none";
    window.focus();
  }
}

function console_append(text)
{
	var consoleDiv = document.getElementById("consolewindow");
	consoleDiv.innerHTML += text;
	consoleDiv.innerHTML += "<br>";
	consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

function ConvertString(string) {

	var out;

	if(string == "true")
		out = true;
	else if(string == "false")
		out = false;
	else if (/^-?[\d.]+(?:e-?\d+)?$/.test(string))
		out = Number(string);
	else out = string;

	return out;
}

//details window functions
function setdetails(details)
{
	document.getElementById("detailswindow").innerHTML = details;
	window.focus();
}

function resetscrolldetails()
{
	DetailsWindowScroll = 0;
	document.getElementById("detailswindow").scroll(0, 0);
}