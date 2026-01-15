<?php
// /public/build/index.php

$indexHtml = __DIR__ . '/index.html';

if (!file_exists($indexHtml)) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Не найден /public/build/index.html\n";
    exit;
}

// Явно отдаём HTML клиенту
header('Content-Type: text/html; charset=utf-8');
readfile($indexHtml);
exit;