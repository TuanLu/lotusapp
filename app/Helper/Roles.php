<?php 
namespace App\Helper;

class Roles {
  static function getRoles() {
    return [
      'npp' => [
        'label' => 'Quản lý NCC', 
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
      'qlphieunhap' => [
        'label' => 'Quản lý Phiếu Nhập', 
        'icon' => 'pushpin-o',
        'path' => 'qlphieunhap'
      ],
      'qlcate' => [
        'label' => 'Quản lý Danh mục SP', 
        'icon' => 'table',
        'path' => 'qlcate'
      ],
      'product' => [
        'label' => 'Quản lý Sản phẩm', 
        'icon' => 'pushpin-o',
        'path' => 'product'
      ],
      'qlkh' => [
        'label' => 'Quản lý Khách Hàng', 
        'icon' => 'team',
        'path' => 'qlkh'
      ],
      'nhomqa' => [
        'label' => 'Nhóm QA', 
        'icon' => 'team',
        'path' => 'nhomqa',
        'include_in_menu' => false
      ],
      'nhomqc' => [
        'label' => 'Nhóm QC', 
        'icon' => 'team',
        'path' => 'nhomqc',
        'include_in_menu' => false
      ],
    ];
  }
}