#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <ESP8266WebServer.h>
#include <ESP8266WebServerSecure.h>
#include <ArduinoJson.h>

// For ultrasonic sensor
#define Echo_InputPin D7 // Echo Input-Pin
#define Trigger_OutputPin D8 // Trigger Output-Pin

//Internal LED
#define LED D0
#define PUMP D3
#define SIEVE D4


const char* ssid = "here-SSID";
const char* password = "here-password";

IPAddress ip(172,22,132,55);
IPAddress gateway(172,22,132,1);
IPAddress subnet(255,255,255,0);

/*
const char* ssid = "mtech";
const char* password = "mtech%01";
*/

// Defining the needed variables for ultrasonic
int maximumRange = 21; //Depth of Water tank
int minimumRange = 2; //Highest water level, when full
long distance;
long timing;

BearSSL::ESP8266WebServerSecure server(443);

static const char serverCert[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
MIICTjCCAbegAwIBAgIUFoGpItw/poOmCkkrWomMmsKd/70wDQYJKoZIhvcNAQEL
BQAwOTELMAkGA1UEBhMCREUxEjAQBgNVBAcMCUthcmxzcnVoZTEWMBQGA1UEAwwN
Y29mZmVlbWFjaGluZTAeFw0yMTExMDQxNDQwNTVaFw0zMzAxMjExNDQwNTVaMDkx
CzAJBgNVBAYTAkRFMRIwEAYDVQQHDAlLYXJsc3J1aGUxFjAUBgNVBAMMDWNvZmZl
ZW1hY2hpbmUwgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBAL92Z50b3s8OsJkG
lZwcPFtJZZ0LoFn811HMFF9gDcnzpfnJl3YHYrmpQdL69xYIJYDC+oASmTuX3W6O
xk84jNmlwR9ZMNXwCPgQyfPphcWEQM0/NjVqNeqGi32yCJ1M7HX1gBteZErvsIWr
Cnu86z7QpEIVMfpS7kViee/ea8p7AgMBAAGjUzBRMB0GA1UdDgQWBBSeSjkTsMmJ
yeGEE+G1Z0MWj+XOgDAfBgNVHSMEGDAWgBSeSjkTsMmJyeGEE+G1Z0MWj+XOgDAP
BgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4GBAAknviSjlX6DpOF+cdLD
0STXXtT/2XzZdXt4HFr1t689pmWOfj7CwvJy3SrJS3BcGnaKN6KTJw9cW8LH2SRL
WCD9FTrJWatg0J8FYVSYmS0zyqzxs/o9bc+/dcm7Rxmvci9fwr34LwJ88FzNqctx
6yEtWDYfV3pQPLJ8HC8nrG7g
-----END CERTIFICATE-----

)EOF";

static const char serverKey[] PROGMEM =  R"EOF(
-----BEGIN PRIVATE KEY-----
MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAL92Z50b3s8OsJkG
lZwcPFtJZZ0LoFn811HMFF9gDcnzpfnJl3YHYrmpQdL69xYIJYDC+oASmTuX3W6O
xk84jNmlwR9ZMNXwCPgQyfPphcWEQM0/NjVqNeqGi32yCJ1M7HX1gBteZErvsIWr
Cnu86z7QpEIVMfpS7kViee/ea8p7AgMBAAECgYEAsyDRMeE4ZRpGSPUrFiIoqfOS
eQq+nFJ9FQ9NZCoW3IHzIC7mYMvqJu/fIMgiUd+PTteczCQabvHXfq9fhBDRXNSE
zS06mPZD3EwSMDoJOBUDRF/k+8WJrGgHtfxiYodZt+jQWpVgu8nL+DWf9Goc6L7V
dhIe+uYHgdDUVGC4VNECQQDtHAcOSRhCToBLOi61uhlgYZl5IJF4RZzgfs2nuYfc
EaoS4WwH6CekZoyrZa9QOmVAgzbAGm08kROaUwyajaS5AkEAzrdiJIlU1jQBI5R8
rLb5xJbNpx/MyuyTO6ygH8jOh/AnzJcyexMfnzXwsRVOcnjZWNLz0/ZgDdUeRip/
l1420wJAFwgn701OW/KAJ86JBwICwQf5/ngZaVNpv6zRkT9GYSweFyNqeQImB6Qm
eeewtdxWRYP5Z4OppL565vy2NrUXkQJAYrd+ndYbdoO1O4mQlGZ5FqGxqirsgMfD
dA73FNavkolkaDaYO+AhDMYUoGx9XvtJSDrNiB6zNkfdQkLPVbj/UwJAP3Vv/sp0
Wajz0qwqxEh9oIit6R2mIj6DbvR/RZkUN3+lf3SnWSw5DAIZu/Qt9ZzedUNcBpY6
qe6q7pUD7MoQ/Q==
-----END PRIVATE KEY-----

)EOF";

void handleWater() 
{
  int waterLevel = map(getWaterAvg(), 2, 21, 0, 100);
  StaticJsonDocument<200> doc;
  String buf;
  JsonObject sensor = doc.createNestedObject("sensor"); 
  sensor["waterLevel"] = 100 - waterLevel;
  serializeJson(doc, buf);
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", buf);
}

long getWater()
{
  // starting the measurement with the 10us long trigger signal
  digitalWrite(Trigger_OutputPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(Trigger_OutputPin, LOW);
  
  // waiting on the Echo-Input until the signal is active 
  // and measuring how long the signal stays active
  timing = pulseIn(Echo_InputPin, HIGH);
  
  // calculating the distance with the measured time
  distance = timing/58.2;
  
  // checking if the value above empyt tank
  if (distance >= maximumRange)
  {
    return 21;
  }
  else if(distance <= minimumRange)
  {
    return 2;
  }
  else {
    return distance;
  }
}

long getWaterAvg()
{
  long avgs = 0;
  for(int i = 0; i <= 2; i++)
  {
    avgs += getWater();
    delay(100);
  }

  avgs = avgs/3;
  return avgs;
}

void startPump()
{
  StaticJsonDocument<200> doc;
  String buf;
  JsonObject pump = doc.createNestedObject("pump");
  pump["status"] = "OK";
  serializeJson(doc, buf);
  digitalWrite(PUMP, HIGH);
  delay(1500);
  digitalWrite(PUMP, LOW);
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", buf);
}

void isSieveEmpty()
{
  int empty = 0;
  if(digitalRead(sieveButton) == HIGH)
  {
    delay(1500);
    if(digitalRead(sieveButton) == HIGH){
      empty = 1;
    }
  }
  StaticJsonDocument<200> doc;
  String buf;
  JsonObject sieve = doc.createNestedObject("sieve");
  sieve["status"] = empty;
  serializeJson(doc, buf);
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", buf);
}

void setup(void) 
{
  pinMode(Trigger_OutputPin, OUTPUT);
  pinMode(Echo_InputPin, INPUT);
  pinMode(LED, OUTPUT);
  pinMode(PUMP, OUTPUT);
  pinMode(SIEVE, INPUT);
  
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("Connecting to: " + String(ssid) + " " + String(password));
  WiFi.mode(WIFI_STA);
  if (!WiFi.config(ip, gateway, subnet)) {
    Serial.println("STA Failed to configure");
  }
  WiFi.begin(ssid, password);
  Serial.println("");

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) 
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("MAC: ");
  Serial.println(WiFi.macAddress());
  Serial.println(" ");

  server.on("/", handleWater);
  server.on("/pump", startPump);
  server.on("/sieve", isSieveEmpty);
  server.getServer().setRSACert(new BearSSL::X509List(serverCert), new BearSSL::PrivateKey(serverKey));
  server.begin();
  Serial.println("HTTP server started");
}

void loop(void) {
  server.handleClient();
  MDNS.update();
}
