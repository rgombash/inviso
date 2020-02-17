import org.eclipse.jetty.websocket.api.*;
import org.eclipse.jetty.websocket.api.annotations.*;
import org.json.JSONObject;

@WebSocket
public class ProxyServiceWebSocketHandler {

    private String sender, msg;

    @OnWebSocketConnect
    public void onConnect(Session user) throws Exception {
        String username = "User" + ProxyService.nextUserNumber++;
        ProxyService.userUsernameMap.put(user, username);

        JSONObject response  = new JSONObject()
                .put("servermsg_user_connect", username);

        ProxyService.broadcastMessage(sender = "Server", msg = response.toString());
    }

    @OnWebSocketClose
    public void onClose(Session user, int statusCode, String reason) {
        String username = ProxyService.userUsernameMap.get(user);
        ProxyService.userUsernameMap.remove(user);
        ProxyService.broadcastMessage(sender = "Server", msg = (username + " disconnected"));
    }

    @OnWebSocketMessage
    public void onMessage(Session user, String message) {
        System.out.println(ProxyService.userUsernameMap.get(user) + " : " + message);
        ProxyService.parseMessage(ProxyService.userUsernameMap.get(user), message);
    }
}
