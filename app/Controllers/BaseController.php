<?php 
namespace App\Controllers;

class BaseController {
  protected $container;
  public function __construct($container) {
    $this->container = $container;
  }
  public function __get($prop) {
    if($this->container->{$prop}) {
      return $this->container->{$prop};
    }
  }
  public function baseDir() {
    $dir = __DIR__;
    return str_replace('app/Controllers', '', $dir);
  }
}