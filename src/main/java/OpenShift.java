import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
//import com.sun.org.apache.xpath.internal.objects.XNodeSetForDOM;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;
import java.time.Instant;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import java.security.cert.X509Certificate;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

public class OpenShift {

    public static String ReadOpenShift(String Url){
        try {

            //workaround for accepting self signed certs
            TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {
                public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                    return null;
                }
                public void checkClientTrusted(X509Certificate[] certs, String authType) {
                }
                public void checkServerTrusted(X509Certificate[] certs, String authType) {
                }
            } };
            // Install the all-trusting trust manager
            final SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            // Create all-trusting host name verifier
            HostnameVerifier allHostsValid = new HostnameVerifier() {
                public boolean verify(String hostname, SSLSession session) {
                    return true;
                }
            };

            //comment out this line if you have valid certs
            HttpsURLConnection.setDefaultHostnameVerifier(allHostsValid);

            URL OpenshiftUrl = new URL(ProxyService.prop.getProperty("openshift_base_url") + Url);
            URLConnection uc = OpenshiftUrl.openConnection();

            // auth mode
            if(ProxyService.prop.getProperty("openshift_auth_mode").equals("token")){
                uc.setRequestProperty("Authorization", "Bearer " + ProxyService.prop.getProperty("openshift_token"));
            } else {
                uc.setRequestProperty("Authorization", "Basic " + ProxyService.prop.getProperty("openshift_user") + ":" + ProxyService.prop.getProperty("openshift_password"));
            }

            BufferedReader in = new BufferedReader(new InputStreamReader(uc.getInputStream()));
            String inputLine;
            StringBuilder sb = new StringBuilder();
            while ((inputLine = in.readLine()) != null) {
                sb.append(inputLine);
            }
            in.close();
            return sb.toString();
        } catch(Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public static JSONArray GetContainersOpenShift(String filter){
        try {
            int count;
            count = 0;
            String message = ReadOpenShift("/api/v1/pods");
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(message);

            JSONArray Nodes = new JSONArray();

            if(node.get("items").isArray()) {
                for (int i = 0; i <= node.get("items").size() - 1; i++) {
                    String fqdn = node.get("items").get(i).get("metadata").get("name").asText();
                    Pattern p = Pattern.compile(filter);
                    Matcher m = p.matcher(fqdn);
                    boolean b = m.find();
                    if(b){
                        //Nodes.put(new JSONObject(node.get("items").get(i).get("metadata").toString()));
                        Nodes.put(new JSONObject(node.get("items").get(i).toString()));
                        count++;
                    }
                }
            }

            System.out.println("OpenShift: Pods found: " + count);
            return Transform(Nodes);

        } catch (IOException e) {
            System.out.println("Error parsing OpenShift output!");
            return null;
        }
    }

    /** Transform node list to common schema
    *
    *  serviceProvider
    *  serviceType
    *  project
    *  name - node name(pod,vm,..)
    *  fqdn - fqdn of the node
    *  ip - ip address
    *  uid - unique identifier
    *  state - node state
    *  payload - raw node json data from service provider
    *  creationTimestamp
    *
    *  @return JSONArray of all packed in common schema nodes
    */
    public static JSONArray Transform(JSONArray Nodes){
        JSONArray Nodes_prepared = new JSONArray();

        long unixTime = Instant.now().getEpochSecond();

        for (int i = 0, size = Nodes.length(); i < size; i++)
        {
            JSONObject Node_prepared = new JSONObject();
            JSONObject Node = Nodes.getJSONObject(i);

            //basic provider and data fetch info
            Node_prepared.put("serviceProvider", "openshift_v3");
            Node_prepared.put("NodeType", "container");
            Node_prepared.put("dataFetchTimestamp",  Long.toString(unixTime));
            //basic node data extracted from raw json. Consider moving this logic completely to frontend plugins
            Node_prepared.put("project", Node.getJSONObject("metadata").get("namespace").toString());
            Node_prepared.put("name", Node.getJSONObject("metadata").get("name").toString());
            Node_prepared.put("uid", Node.getJSONObject("metadata").get("uid").toString());
            Node_prepared.put("state", Node.getJSONObject("status").get("phase").toString().toLowerCase());
            // full raw node json
            Node_prepared.put("payload", Node);

            Nodes_prepared.put(Node_prepared);

        }
        return Nodes_prepared;
    }
}