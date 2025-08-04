<?php
// Simple test to check PHP PDO MySQL driver availability
echo "PHP Version: " . phpversion() . "\n";
echo "Available PDO drivers: " . implode(', ', PDO::getAvailableDrivers()) . "\n";

if (in_array('mysql', PDO::getAvailableDrivers())) {
    echo "✅ MySQL PDO driver is available\n";
} else {
    echo "❌ MySQL PDO driver is NOT available\n";
    echo "This is why the database connection is failing.\n";
}

// Check if other required extensions are available
$required_extensions = ['pdo', 'json', 'curl'];
foreach ($required_extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "✅ $ext extension is loaded\n";
    } else {
        echo "❌ $ext extension is NOT loaded\n";
    }
}
?>
