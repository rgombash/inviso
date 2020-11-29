import com.google.gson.*;
import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.Configuration;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.openapi.models.V1Pod;
import io.kubernetes.client.openapi.models.V1PodList;
import io.kubernetes.client.util.ClientBuilder;
import io.kubernetes.client.util.KubeConfig;

import org.joda.time.DateTime;
import org.joda.time.format.ISODateTimeFormat;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.FileReader;
import java.io.IOException;
import java.lang.reflect.Type;
import java.time.Instant;

public class Kubernetesp {
    public static JSONArray GetPods(String Context) throws IOException, ApiException {
        JSONArray Nodes = new JSONArray();

        // file path to your KubeConfig
        String kubeConfigPath = ProxyService.prop.getProperty("kubernetes_config");
        // loading the out-of-cluster config, a kubeconfig from file-system
        // ApiClient client = ClientBuilder.kubeconfig(KubeConfig.loadKubeConfig(new FileReader(kubeConfigPath))).build();

        KubeConfig kubeconfig = KubeConfig.loadKubeConfig(new FileReader(kubeConfigPath));
        kubeconfig.setContext(Context);
        System.out.println(kubeconfig.getContexts());
        System.out.println(kubeconfig.getCurrentContext());

        ApiClient client = ClientBuilder.kubeconfig(kubeconfig).build();

        // set the global default api-client to the in-cluster one from above
        Configuration.setDefaultApiClient(client);

        // the CoreV1Api loads default api-client from global configuration.
        CoreV1Api api = new CoreV1Api();

        // invokes the CoreV1Api client
        V1PodList list = api.listPodForAllNamespaces(null, null, null, null, null, null, null, null, null);

        for (V1Pod item : list.getItems()) {

            //System.out.println(item.toString());

            JSONObject Node_prepared = new JSONObject();

            //use datetime joda deserializer
            Gson gson = new GsonBuilder().registerTypeAdapter(DateTime.class, new DateTimeTypeAdapter()).create();

            String jsonSpecs = gson.toJson(item.getSpec());
            String jsonMetadata = gson.toJson(item.getMetadata());
            String jsonStatus = gson.toJson(item.getStatus());
            //String jsonApiVersion = gson.toJson(item.getApiVersion());

            Node_prepared.put("specs", new JSONObject(jsonSpecs));
            Node_prepared.put("metadata", new JSONObject(jsonMetadata));
            Node_prepared.put("status", new JSONObject(jsonStatus));
            //Node_prepared.put("apiversion", new JSONObject(jsonApiVersion));

            //System.out.println(Node_prepared.toString(2));

            Transformer tr = new Transformer();
            tr.uid=Node_prepared.getJSONObject("metadata").get("uid").toString().toLowerCase();
            //pod name
            if (Node_prepared.getJSONObject("metadata").has("name"))
                tr.name=Node_prepared.getJSONObject("metadata").get("name").toString();
            if (Node_prepared.getJSONObject("metadata").has("namespace"))
                tr.namespace = Node_prepared.getJSONObject("metadata").get("namespace").toString();
            tr.state=Node_prepared.getJSONObject("status").get("phase").toString().toLowerCase();
            tr.type="pod";
            tr.serviceProvider="kubernetes";

            Nodes.put(tr.Transform(Node_prepared));
            //Nodes.put(Node_prepared);

        }
        return Nodes;
        //return Transform(Nodes, "none");
    }

    //joda datetime serializer/deserializer
    static class DateTimeTypeAdapter implements JsonSerializer<DateTime>, JsonDeserializer<DateTime> {
        @Override
        public DateTime deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
            return DateTime.parse(json.getAsString());
        }

        @Override
        public JsonElement serialize(DateTime src, Type typeOfSrc, JsonSerializationContext context) {
            return new JsonPrimitive(ISODateTimeFormat
                    .dateTimeNoMillis()
                    .print(src));
        }
    }
}