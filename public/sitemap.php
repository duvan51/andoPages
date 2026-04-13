<?php
// Evitar errores por caché
header("Cache-Control: no-cache, must-revalidate");
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");
header("Content-Type: text/xml; charset=utf-8");

// Función para obtener variables de entorno
function loadEnv($path) {
    if(!file_exists($path)) return false;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $env = [];
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        // Quitar comillas si las hay
        $value = trim($value);
        if (preg_match('/^["\'](.*)["\']$/', $value, $matches)) {
            $value = $matches[1];
        }
        $env[trim($name)] = $value;
    }
    return $env;
}

$env = loadEnv(__DIR__ . '/../.env');

$supabase_url = $env['VITE_SUPABASE_URL'] ?? getenv('VITE_SUPABASE_URL');
$supabase_key = $env['VITE_SUPABASE_ANON_KEY'] ?? getenv('VITE_SUPABASE_ANON_KEY');

if (!$supabase_url || !$supabase_key) {
    echo '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
    exit;
}

// Obtener host
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
if(empty($host)) {
    $host = 'localhost'; // Fallback
}
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
$base_url = "$protocol://$host";

// 1. Obtener Tenant por dominio
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "$supabase_url/rest/v1/tenants?domain=eq." . urlencode($host) . "&select=id");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "apikey: $supabase_key",
    "Authorization: Bearer $supabase_key",
    "Accept: application/json"
]);
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($httpcode >= 400 || !$response) {
    curl_close($ch);
    echo '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>' . $base_url . '/</loc></url></urlset>';
    exit;
}

$tenants = json_decode($response, true);
$tenant_id = null;
if (is_array($tenants) && count($tenants) > 0) {
    // Exact match for domains is preferred but let's just take the first
    $tenant_id = $tenants[0]['id'];
}
curl_close($ch);

$treatments = [];

if ($tenant_id) {
    // 2. Obtener productos de este tenant
    $ch2 = curl_init();
    curl_setopt($ch2, CURLOPT_URL, "$supabase_url/rest/v1/treatments?tenant_id=eq.$tenant_id&active=eq.true&select=id,updated_at");
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch2, CURLOPT_HTTPHEADER, [
        "apikey: $supabase_key",
        "Authorization: Bearer $supabase_key",
        "Accept: application/json"
    ]);
    $res2 = curl_exec($ch2);
    $treatments = json_decode($res2, true);
    if (!is_array($treatments)) $treatments = [];
    curl_close($ch2);
}

// Empezar a generar XML
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

// URL Principal
echo "  <url>\n";
echo "    <loc>" . htmlspecialchars($base_url . '/') . "</loc>\n";
echo "    <changefreq>daily</changefreq>\n";
echo "    <priority>1.0</priority>\n";
echo "  </url>\n";

// URL Paquetes de Oferta
echo "  <url>\n";
echo "    <loc>" . htmlspecialchars($base_url . '/#offers') . "</loc>\n"; // O enrutamiento pertinente si fuera real path
echo "    <changefreq>weekly</changefreq>\n";
echo "    <priority>0.8</priority>\n";
echo "  </url>\n";

// URLs por Producto
foreach ($treatments as $treatment) {
    $date = date('Y-m-d');
    if (isset($treatment['updated_at']) && !empty($treatment['updated_at'])) {
        $date = substr($treatment['updated_at'], 0, 10);
    }
    
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars($base_url . '/producto/' . $treatment['id']) . "</loc>\n";
    echo "    <lastmod>" . htmlspecialchars($date) . "</lastmod>\n";
    echo "    <changefreq>weekly</changefreq>\n";
    echo "    <priority>0.9</priority>\n";
    echo "  </url>\n";
}

echo '</urlset>';
?>
