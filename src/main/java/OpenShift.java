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

                        Transformer tr = new Transformer();
                        tr.uid=node.get("items").get(i).get("metadata").get("uid").toString();
                        //Node.getJSONObject("metadata").get("uid").toString());
                        tr.name=node.get("items").get(i).get("metadata").get("name").asText();
                        tr.state=node.get("items").get(i).get("status").get("phase").toString().toLowerCase();
                        // Node.getJSONObject("status").get("phase").toString().toLowerCase()
                        tr.type="container";
                        tr.serviceProvider="openshift_v3";
                        //Node.getJSONObject("metadata").get("namespace").toString()
                        tr.namespace=node.get("items").get(i).get("metadata").get("namespace").asText();;

                        Nodes.put(tr.Transform(new JSONObject(node.get("items").get(i).toString())));

                        //Nodes.put(new JSONObject(node.get("items").get(i).toString()));
                        count++;
                    }
                }
            }

            System.out.println("OpenShift: Pods found: " + count);
            //return Transform(Nodes);
            return Nodes;

        } catch (IOException e) {
            System.out.println("Error parsing OpenShift output!");
            return null;
        }
    }
}