<?php
// Tell the container how to construct the db.
// https://medoo.in/api/collaboration
// $container->add('Medoo\Medoo', function() {
//     $dbconfig = require './config/db.php';
//     return new \Medoo\Medoo([
//         'database_type' => 'mysql',
//         'database_name' => $dbconfig['name'],
//         'server' => $dbconfig['host'],
//         'username' => $dbconfig['username'],
//         'password' => $dbconfig['password']
//     ]);
// });

// Medoo setup
$container['db'] = function ($c) {
    $dbconfig = require __DIR__ . '/../config/db.php';
    $db = new \Medoo\Medoo([
        'database_type' => 'mysql',
        'database_name' => $dbconfig['name'],
        'server' => $dbconfig['host'],
        'username' => $dbconfig['username'],
        'password' => $dbconfig['password'],
        'logging' => true,
        'charset' => 'utf8',
    ]);
    return $db;
};
