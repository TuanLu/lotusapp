<?php 
namespace App\Helper;

class Roles {
  static function getRoles() {
    return [
      'tinhtrangkho' => [
        'label' => 'Tình trạng kho', 
        'icon' => 'home',
        'path' => 'tinhtrangkho',
      ],
      'qldh' => [
        'label' => 'QL Đơn hàng', 
        'icon' => 'shopping-cart',
        'path' => 'qldh'
      ],
      'npp' => [
        'label' => 'QL NCC', 
        'icon' => 'solution',
        'path' => 'npp'
      ],
      'qluser' => [
        'label' => 'QL Users', 
        'icon' => 'user',
        'path' => 'qluser'
      ],
      'qlsx' => [
        'label' => 'QL Sản Xuất', 
        'icon' => 'inbox',
        'path' => 'qlsx'
      ],
      'qlkho' => [
        'label' => 'QL Kho', 
        'icon' => 'home',
        'path' => 'qlkho'
      ],
      'qlvtkho' => [
        'label' => 'QL Vị trí Kho', 
        'icon' => 'home',
        'path' => 'qlvtkho'
      ],
      'qlphieunhap' => [
        'label' => 'QL Phiếu Nhập', 
        'icon' => 'home',
        'path' => 'qlphieunhap'
      ],
      'qlphieuxuat' => [
        'label' => 'QL Phiếu Xuất', 
        'icon' => 'home',
        'path' => 'qlphieuxuat'
      ],
      'qlcate' => [
        'label' => 'QL Danh mục SP', 
        'icon' => 'table',
        'path' => 'qlcate'
      ],
      'product' => [
        'label' => 'QL Sản phẩm', 
        'icon' => 'pushpin-o',
        'path' => 'product'
      ],
      'qlkh' => [
        'label' => 'QL Khách Hàng', 
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
      'nhom_thu_kho' => [
        'label' => 'Nhóm Thủ Kho', 
        'icon' => 'team',
        'path' => 'nhom_thu_kho',
        'include_in_menu' => false
      ],
      'qlns' => [
        'label' => 'QL Nhân sự', 
        'icon' => 'team',
        'path' => 'qlns'
      ],
      'qljobs' => [
        'label' => 'QL Công việc', 
        'icon' => 'solution',
        'path' => 'qljobs'
      ],
      'qlsl' => [
        'label' => 'QL Sản Lượng', 
        'icon' => 'solution',
        'path' => 'qlsl'
      ],
      'cdc' => [
        'label' => 'Chuyển đổi công', 
        'icon' => 'solution',
        'path' => 'cdc'
      ],
    ];
  }
}