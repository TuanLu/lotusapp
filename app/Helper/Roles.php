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
      'qlkho' => [
        'label' => 'Quản lý Kho', 
        'icon' => 'home',
        'path' => 'qlkho'
      ],
      'qlcate' => [
        'label' => 'Quản lý Danh mục SP', 
        'icon' => 'table',
        'path' => 'qlcate'
      ],
      'qlkh' => [
        'label' => 'Quản lý Khách Hàng', 
        'icon' => 'team',
        'path' => 'qlkh'
      ],
    ];
  }
}