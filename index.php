<?php
// /index.php (корень проекта)

// Если по какой-то причине build ещё не залит — покажем понятную ошибку.
$buildIndex = __DIR__ . '/public/build/index.php';

if (!file_exists($buildIndex)) {
    http_response_code(503);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Build не найден: /public/build/index.php\n";
    echo "Сначала сделай локально: npm install && npm run build\n";
    echo "И залей содержимое папки /public/build на сервер.\n";
    exit;
}

// Отдаём build-версию
require $buildIndex;
