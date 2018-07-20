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
        'icon' => 'schedule',
        'path' => 'qlphieunhap'
      ],
      'qlphieuxuat' => [
        'label' => 'QL Phiếu Xuất', 
        'icon' => 'schedule',
        'path' => 'qlphieuxuat'
      ],
      'qlcate' => [
        'label' => 'QL Danh mục SP', 
        'icon' => 'table',
        'path' => 'qlcate'
      ],
      'product' => [
        'label' => 'QL Sản phẩm', 
        'icon' => 'shop',
        'path' => 'product'
      ],
      'qlkh' => [
        'label' => 'QL Khách Hàng', 
        'icon' => 'team',
        'path' => 'qlkh'
      ],
      'full_quyen' => [
        'label' => 'Chức vụ, phê duyệt', 
        'icon' => 'team',
        'path' => 'full_quyen',
        'include_in_menu' => false,
        'children' => [
          array('title' => 'Kí duyệt KHSX', 'value' => 'duyet_khsx', 'key' => 'duyet_khsx'),
          array('title' => 'Kí duyệt ĐBCL', 'value' => 'duyet_dbcl', 'key' => 'duyet_dbcl'),
          array('title' => 'Giám đốc QLSX', 'value' => 'duyet_gd', 'key' => 'duyet_gd'),
          array('title' => 'Nhóm quản lý kho', 'value' => 'nhom_thu_kho', 'key' => 'nhom_thu_kho'),
          array('title' => 'Nhóm QA', 'value' => 'nhomqa', 'key' => 'nhomqa'),
          array('title' => 'Nhóm QC', 'value' => 'nhomqc', 'key' => 'nhomqc'),
        ]
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
        'icon' => 'form',
        'path' => 'qlsl'
      ],
      'cdc' => [
        'label' => 'Chuyển đổi công', 
        'icon' => 'calculator',
        'path' => 'cdc'
      ],
      'quy_trinh_sx' => [
        'label' => 'Quy trình SX', 
        'icon' => 'solution',
        'path' => 'quy_trinh_sx',
      ],
      'khsx_daihan' => [
        'label' => 'KHSX dài hạn', 
        'icon' => 'solution',
        'path' => 'khsx_daihan',
      ],
      'qlpb' => [
        'label' => 'QL Phòng ban', 
        'icon' => 'team',
        'path' => 'qlpb'
      ],
    ];
  }
}