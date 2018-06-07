<?php 
namespace App\Helper;

class Roles {
  static function getRoles() {
    return [
      'npp' => [
        'label' => 'Quản lý NPP', 
        'icon' => 'solution',
        'path' => 'npp'
      ],
      'qluser' => [
        'label' => 'Quản lý Users', 
        'icon' => 'user',
        'path' => 'qluser'
      ],
      'qlsx' => [
        'label' => 'Quản lý SX', 
        'icon' => 'inbox',
        'path' => 'qlsx'
      ],
    ];
  }
}