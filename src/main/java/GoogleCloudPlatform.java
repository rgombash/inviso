import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.compute.Compute;
import com.google.api.services.compute.ComputeScopes;
import com.google.api.services.compute.model.Instance;
import com.google.api.services.compute.model.InstanceList;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class GoogleCloudPlatform {
    /**
     * Be sure to specify the name of your application. If the application name is {@code null} or
     * blank, the application will log a warning. Suggested format is "MyCompany-ProductName/1.0".
     */
    private static final String APPLICATION_NAME = "Antropotech-Inviso/1.0";

    /** Global instance of the HTTP transport. */
    private static HttpTransport httpTransport;

    /** Global instance of the JSON factory. */
    private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();

    /**
     * Setup GCP API connection
     * If run locally environment variable needs to be set to point gcloud credential:
     * GOOGLE_APPLICATION_CREDENTIALS = /home/YOUR_HOME_DIR/.config/gcloud/legacy_credentials/YOUR_GOOGLE_LOGIN@gmail.com/adc.json
     * If you install gclod command tools locally these credentials will be set up for you
     *
     * @return Compute object
     */

    public static Compute connect() {
        Compute compute = null;
        try {
            httpTransport = GoogleNetHttpTransport.newTrustedTransport();

            // Authenticate using Google Application Default Credentials.
            GoogleCredential credential = GoogleCredential.getApplicationDefault();
            if (credential.createScopedRequired()) {
                List<String> scopes = new ArrayList<>();
                // Set Google Cloud Storage scope to Full Control.
                scopes.add(ComputeScopes.DEVSTORAGE_FULL_CONTROL);
                // Set Google Compute Engine scope to Read-write.
                scopes.add(ComputeScopes.COMPUTE);
                credential = credential.createScoped(scopes);
            }

            // Create Compute Engine object for listing instances.
            compute = new Compute.Builder(httpTransport, JSON_FACTORY, credential)
                    .setApplicationName(APPLICATION_NAME)
                    .build();

        } catch (IOException e) {
            System.err.println(e.getMessage());
        } catch (Throwable t) {
            t.printStackTrace();
        }
        return compute;
    }

    // [START list_instances]
    /**
     * Print available machine instances.
     *
     * @return json string with all instances
     */

    public static JSONArray getInstances(String project_id, String zone_name) throws IOException {
        Compute compute = connect();
        JSONArray Nodes = new JSONArray();
        int count;
        count = 0;
        // System.out.println("================== Listing Compute Engine Instances ==================");
        Compute.Instances.List instances = compute.instances().list(project_id, zone_name);

        InstanceList list = instances.execute();
        if (list.getItems() == null) {
            System.out.println("GCP : No instances found.");
            return null;
        } else {
            for (Instance instance : list.getItems()) {
                //System.out.println(instance.toPrettyString());

                Transformer tr = new Transformer();
                tr.uid=instance.get("id").toString();
                tr.name=instance.get("name").toString();
                tr.state=instance.get("status").toString().toLowerCase();
                tr.type="compute";
                tr.serviceProvider="GCP_api_v1";
                tr.project_id=project_id;


                Nodes.put(tr.Transform(new JSONObject(instance)));

                //Nodes.put(new JSONObject(instance));
                ++count;
            }

            System.out.println("GCP: Instances found: " + count);
            //return Transform(Nodes, project_id);
            return Nodes;
        }
    }
}
