import org.json.JSONObject;
import java.time.Instant;

public class Transformer {

    String serviceProvider;
    String type;
    String name;
    String uid;
    String state = "";
    String project_id = "";
    String namespace = "";
    String context = "";

    public JSONObject Transform(JSONObject Payload){

        long unixTime = Instant.now().getEpochSecond();
        JSONObject Node_prepared = new JSONObject();

        Node_prepared.put("serviceProvider", this.serviceProvider);
        Node_prepared.put("nodeType", this.type);
        Node_prepared.put("dataFetchTimestamp", Long.toString(unixTime));
        //nodeName
        Node_prepared.put("name", this.name.toString());
        Node_prepared.put("uid", this.uid.toString().toLowerCase());
        Node_prepared.put("state", this.state.toString().toLowerCase());
        Node_prepared.put("context", this.context.toString().toLowerCase());
        Node_prepared.put("project_id", this.project_id.toString().toLowerCase());
        Node_prepared.put("namespace", this.namespace.toString().toLowerCase());
        // raw node metadata json to payload
        Node_prepared.put("payload", Payload);

        return Node_prepared;
    }

}
