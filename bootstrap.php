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
//Sometime dont know the issue, just add this hanlde for app working anyway
$container['errorHandler'] = function ($c) {
  return function ($request, $response, $exception) use ($c) {
      return $container['response']->withStatus(500)
                           ->withHeader('Content-Type', 'text/html')
                           ->write('Something went wrong!');
  };
};
//Access to token
$container["jwt"] = function ($container) {
  return new StdClass;
};
// view renderer
$container['view'] = function ($c) {
  $settings = $c->get('settings')['renderer'];
  return new PhpRenderer($settings['template_path']);
};
$container['UserController'] = function ($c) {
  return new \App\Controllers\UserController($c);
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
$container['VtkhoController'] = function ($c) {
  return new \App\Controllers\VtkhoController($c);
};
$container['CateController'] = function ($c) {
  return new \App\Controllers\CateController($c);
};
$container['KhController'] = function ($c) {
  return new \App\Controllers\KhController($c);
};
$container['ProductController'] = function ($c) {
  return new \App\Controllers\ProductController($c);
};
$container['PhieunhapController'] = function ($c) {
  return new \App\Controllers\PhieunhapController($c);
};
$container['PhieuxuatController'] = function ($c) {
  return new \App\Controllers\PhieuxuatController($c);
};
$container['TinhtrangkhoController'] = function ($c) {
  return new \App\Controllers\TinhtrangkhoController($c);
};
$container['OrderController'] = function ($c) {
  return new \App\Controllers\OrderController($c);
};
$container['NhansuController'] = function ($c) {
  return new \App\Controllers\NhansuController($c);
};
$container['JobsController'] = function ($c) {
  return new \App\Controllers\JobsController($c);
};
$container['SanluongController'] = function ($c) {
  return new \App\Controllers\SanluongController($c);
};
$container['CdcController'] = function ($c) {
  return new \App\Controllers\CdcController($c);
};
$container['SXController'] = function ($c) {
  return new \App\Controllers\SXController($c);
};
$container['QuytrinhSxController'] = function ($c) {
  return new \App\Controllers\QuytrinhSxController($c);
};
$container['GanttController'] = function ($c) {
  return new \App\Controllers\GanttController($c);
$container['PhongbanController'] = function ($c) {
  return new \App\Controllers\PhongbanController($c);
};
//Add more controllers

// Get an instance of Slim.
$app = new \Slim\App($container);
//Might turn off all exception
unset($app->getContainer()['errorHandler']);
unset($app->getContainer()['phpErrorHandler']);