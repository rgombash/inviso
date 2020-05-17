import java.io.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Properties;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qmetric.spark.authentication.AuthenticationDetails;
import com.qmetric.spark.authentication.BasicAuthenticationFilter;
import org.eclipse.jetty.websocket.api.Session;
import org.json.JSONArray;
import org.json.JSONObject;

import static spark.Spark.*;

public class ProxyService {

    // this map is shared between sessions and threads, so it needs to be thread-safe (http://stackoverflow.com/a/2688817)
    static Map<Session, String> userUsernameMap = new ConcurrentHashMap<>();
    static int nextUserNumber = 1; //Assign to username for next connecting user
    // load properties
    static Properties prop = LoadConfig();


    public static void main(String[] args) {
        //staticFiles.location("/public"); //debug.html is served at localhost:4567 (default port)
        staticFiles.externalLocation("src/main/resources/public"); //using external to avoid caching

        //static file caching
        //staticFiles.expireTime(600);
        webSocket("/wsapi", ProxyServiceWebSocketHandler.class);

        //basic authentication
        //before(new BasicAuthenticationFilter("src/main/resources/public/", new AuthenticationDetails(ProxyService.prop.getProperty("login_user"), ProxyService.prop.getProperty("login_password"))));

        init();
    }

    public static Properties LoadConfig(){
        Properties prop = new Properties();
        InputStream input = null;

        try {
            input = new FileInputStream("config.properties");
            prop.load(input);
        }
        catch (IOException ex)
        {
            ex.printStackTrace();
        }
        return prop;
    }

    //Sends a message from one user to all users, along with a list of current usernames
    public static void broadcastMessage(String sender, String message) {
        userUsernameMap.keySet().stream().filter(Session::isOpen).forEach(session -> {
            try {
                session.getRemote().sendString(String.valueOf(new JSONObject()
                    .put("userMessage", message)
                    .put("userlist", userUsernameMap.values())
                    .put("SendDate", new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ").format(new Date()))
                    .put("Sender", sender)
                ));
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }
    //implement server to client msg and/or client to client
    public static void sendMessage(String sender, String receiver, String message) {
        userUsernameMap.keySet().stream().filter(Session::isOpen).forEach(session -> {
            try {
                if(userUsernameMap.get(session) == receiver) {
                    session.getRemote().sendString(String.valueOf(new JSONObject()
                            .put("userMessage", message)
                            .put("userlist", userUsernameMap.values())
                            .put("SendDate", new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ").format(new Date()))
                            .put("Sender", sender)
                    ));
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    public static boolean parseMessage(String sender, String message) {
        ObjectMapper mapper = new ObjectMapper();
        try {
                JsonNode jsoncommand = mapper.readTree(message);
                parseCommand(message, sender);
                return true;
        } catch (IOException e) {
                System.out.println("do not understand the command, string is not JSON");
                return false;
        }
    }

    //prepare json string data to be sent to client
    public static String prepareMessage(JSONArray Nodes){
        JSONObject response  = new JSONObject()
                .put("response", "getservers")
                .put("data",  Nodes);

        return response.toString();
    }

    public static boolean parseCommand(String message, String sender){
        ObjectMapper mapper = new ObjectMapper();
        try {
                JsonNode jsoncommand = mapper.readValue(message, JsonNode.class);
                String command = jsoncommand.get("command").asText();

                System.out.println("command received:" + command);
                switch(command) {
                    case "ping":
                        System.out.println("ping command");
                        ProxyService.sendMessage("server", sender,"{\"command\":\"pong!\"}");
                        break;
                    case "keepalive":
                        System.out.println("keepalive from " + sender);
                        break;
                    case "broadcast":
                        //{"command":"broadcast","message":"test msg"}
                        message = jsoncommand.get("message").asText();
                        System.out.println("broadcast from" + sender);
                        ProxyService.broadcastMessage(sender, message);
                        break;
                    case "OpenshiftGetPods":
                        //{"command":"OpenshiftGetPods","filter":""}
                        String filter_openshift = jsoncommand.get("filter").asText();
                        String outstring_openshift = prepareMessage(OpenShift.GetContainersOpenShift(filter_openshift));
                        ProxyService.sendMessage("server", sender, outstring_openshift);
                        break;
                    case "GCPGetCompute":
                        //{"command":"GCPGetCompute","project":"","zone":""}
                        String gcp_project = jsoncommand.get("project").asText();
                        String gcp_zone = jsoncommand.get("zone").asText();
                        String outstring_gcp = prepareMessage(GoogleCloudPlatform.getInstances(gcp_project, gcp_zone ));
                        ProxyService.sendMessage("server", sender, outstring_gcp);
                        break;
                    case "transform":
                        //command fot testing purposes
                        //{"command":"transform"}
                        JSONArray outnodes_openshift1 = OpenShift.GetContainersOpenShift("car");
                        //String outstring = transformer_test.Transform(outstring_openshift1);
                        String outstring2 = outnodes_openshift1.toString();
                        ProxyService.sendMessage("server", sender, outstring2);
                        break;
                    default:
                        System.out.println("unknown command");
                        break;
                }
                return true;
        } catch (NullPointerException | IOException e) {
            System.out.println("do not understand the command");
            e.printStackTrace();
            return false;
        }
    }

}
