<?php 
namespace App\Helper;

class Roles {
  static function getRoles() {
    return [
      'qldh' => [
        'label' => 'Quản lý Đơn hàng', 
        'icon' => 'shopping-cart',
        'path' => 'qldh'
      ],
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
      'qlvtkho' => [
        'label' => 'Quản lý Vị trí Kho', 
        'icon' => 'home',
        'path' => 'qlvtkho'
      ],
      'qlphieunhap' => [
        'label' => 'Quản lý Phiếu Nhập', 
        'icon' => 'home',
        'path' => 'qlphieunhap'
      ],
      'qlphieuxuat' => [
        'label' => 'Quản lý Phiếu Xuất', 
        'icon' => 'home',
        'path' => 'qlphieuxuat'
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
      'tinhtrangkho' => [
        'label' => 'Tình trạng kho', 
        'icon' => 'home',
        'path' => 'tinhtrangkho',
      ],
    ];
  }
}