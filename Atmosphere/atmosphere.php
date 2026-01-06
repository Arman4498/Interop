<?php
// Configuration du proxy pour webetu
$context = stream_context_create([
    'http' => ['proxy' => 'tcp://www-cache:3128', 'request_fulluri' => true],
    'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
]);

function fetchUrl($url, $context) {
    $content = @file_get_contents($url, false, $context);
    if ($content === false) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_PROXY, 'www-cache:3128');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $content = curl_exec($ch);
        curl_close($ch);
    }
    return $content;
}

// Récupération de l'IP du client
$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['HTTP_X_REAL_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
if (strpos($ip, ',') !== false) {
    $ip = trim(explode(',', $ip)[0]);
}

// Géolocalisation IP
$geoUrl = !empty($ip) && filter_var($ip, FILTER_VALIDATE_IP)
    ? "http://ip-api.com/xml/{$ip}?fields=status,country,region,regionName,city,lat,lon"
    : "http://ip-api.com/xml/?fields=status,country,region,regionName,city,lat,lon";

$geoXml = fetchUrl($geoUrl, $context);
$geoData = simplexml_load_string($geoXml);

if (!$geoData || $geoData->status != 'success') {
    die("Erreur de géolocalisation");
}

$lat = (float)$geoData->lat;
$lon = (float)$geoData->lon;
$departement = (string)($geoData->regionName ?: $geoData->region);
$ville = (string)$geoData->city;
$pays = (string)$geoData->country;

$meteoUrl = "https://www.infoclimat.fr/public-api/gfs/xml?_ll={$lat},{$lon}&_auth=ARsDFFIsBCZRfFtsD3lSe1Q8ADUPeVRzBHgFZgtuAH1UMQNgUTNcPlU5VClSfVZkUn8AYVxmVW0Eb1I2WylSLgFgA25SNwRuUT1bPw83UnlUeAB9DzFUcwR4BWMLYwBhVCkDb1EzXCBVOFQoUmNWZlJnAH9cfFVsBGRSPVs1UjEBZwNkUjIEYVE6WyYPIFJjVGUAZg9mVD4EbwVhCzMAMFQzA2JRMlw5VThUKFJiVmtSZQBpXGtVbwRlUjVbKVIuARsDFFIsBCZRfFtsD3lSe1QyAD4PZA%3D%3D&_c=19f3aa7d766b6ba91191c8be71dd1ab2";
$meteoXml = fetchUrl($meteoUrl, $context);

$meteoDom = new DOMDocument();
$meteoDom->loadXML($meteoXml);
$root = $meteoDom->documentElement;
$root->setAttribute('departement', $departement);
$root->setAttribute('ville', $ville);
$root->setAttribute('pays', $pays);
$root->setAttribute('lat', $lat);
$root->setAttribute('lon', $lon);

$xsl = new DOMDocument();
$xsl->load('meteo.xsl');
$proc = new XSLTProcessor();
$proc->importStylesheet($xsl);

header('Content-Type: text/html; charset=UTF-8');
echo $proc->transformToXML($meteoDom);
?>
