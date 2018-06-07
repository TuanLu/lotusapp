<?php
// Turn on debug.
error_reporting(E_ALL);
ini_set('display_errors', 'On');
use Slim\Views\PhpRenderer;

// Include Composer autoloader.
require_once __DIR__ . '/vendor/autoload.php';

// Start the session.
session_cache_limiter(false);
session_start();

chdir(dirname(__DIR__));
// Configure the Slim app.
// https://www.slimframework.com/docs/objects/application.html
$settings = require 'config/app.php';


$container = new \Slim\Container($settings);
// view renderer
$container['view'] = function ($c) {
  $settings = $c->get('settings')['renderer'];
  return new PhpRenderer($settings['template_path']);
};

$container['HomeController'] = function ($c) {
  return new \App\Controllers\HomeController($c);
};
$container['NppController'] = function ($c) {
  return new \App\Controllers\NppController($c);
};
$container['KhoController'] = function ($c) {
  return new \App\Controllers\KhoController($c);
};
$container['CateController'] = function ($c) {
  return new \App\Controllers\CateController($c);
};

// Get an instance of Slim.
$app = new \Slim\App($container);
