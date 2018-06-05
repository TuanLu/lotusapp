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
  protected function superLog($action_name = '', $user_id = '', $description, $logText = true) {
    $date = new \DateTime();
    $insertItem = [
      'user_id' => $user_id,
      'action_name' => $action_name,
      'create_on' => $date->format('Y-m-d H:i:s')
    ];
    if(is_array($description)) {
      $insertItem['description[JSON]'] = $description;
    } else {
      $insertItem['description'] = $description;
    }
    $this->db->insert('app_logger', $insertItem);
    if($logText) {
      $description = (is_array($description) ? $description : [$description]);
      $this->logger->addInfo($action_name, $description);
    }
  }
}