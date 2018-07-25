<?php 
namespace App\Helper;

class Roles {
  static function roleAndRouter() {
    return [
      'tinhtrangkho' => [
        'view' => 'tinhtrangkho__view'
      ]
    ];
  }
  static function getRoles() {
    //Parents: main_group, vattu_group, qlsx_group, chamcong_group, qluser_group, other_group
    return [
      'tinhtrangkho' => [
        'label' => 'Tình trạng kho', 
        'icon' => 'home',
        'path' => 'tinhtrangkho',
        'parent' => 'main_group',
        'permission' => [
          'view' => Roles::roleAndRouter()['tinhtrangkho']['view']
        ]
      ],
      'qldh' => [
        'label' => 'QL Đơn hàng', 
        'icon' => 'shopping-cart',
        'path' => 'qldh',
        'parent' => 'other_group'
      ],
      'npp' => [
        'label' => 'QL NCC', 
        'icon' => 'solution',
        'path' => 'npp',
        'parent' => 'other_group'
      ],
      'qluser' => [
        'label' => 'QL Users', 
        'icon' => 'user',
        'path' => 'qluser',
        'parent' => 'qluser_group'
      ],
      'qlsx' => [
        'label' => 'QL Sản Xuất', 
        'icon' => 'inbox',
        'path' => 'qlsx',
        'parent' => 'qlsx_group'
      ],
      'qlphieunhap' => [
        'label' => 'QL Phiếu Nhập', 
        'icon' => 'schedule',
        'path' => 'qlphieunhap',
        'parent' => 'vattu_group'
      ],
      'qlphieuxuat' => [
        'label' => 'QL Phiếu Xuất', 
        'icon' => 'schedule',
        'path' => 'qlphieuxuat',
        'parent' => 'vattu_group'
      ],
      'qlcate' => [
        'label' => 'QL Danh mục vật tư', 
        'icon' => 'table',
        'path' => 'qlcate',
        'parent' => 'vattu_group'
      ],
      'product' => [
        'label' => 'QL Vật tư', 
        'icon' => 'shop',
        'path' => 'product',
        'parent' => 'vattu_group'
      ],
      'qlkho' => [
        'label' => 'QL Kho', 
        'icon' => 'home',
        'path' => 'qlkho',
        'parent' => 'vattu_group'
      ],
      'qlvtkho' => [
        'label' => 'QL Vị trí Kho', 
        'icon' => 'home',
        'path' => 'qlvtkho',
        'parent' => 'vattu_group'
      ],
      'khvt' => [
        'label' => 'Kế hoạch Vật tư', 
        'icon' => 'schedule',
        'path' => 'khvt',
        'parent' => 'vattu_group'
      ],
      'qlkh' => [
        'label' => 'QL Khách Hàng', 
        'icon' => 'team',
        'path' => 'qlkh',
        'parent' => 'other_group'
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
        'path' => 'qlns',
        'parent' => 'chamcong_group'
      ],
      'qljobs' => [
        'label' => 'QL Công việc', 
        'icon' => 'solution',
        'path' => 'qljobs',
        'parent' => 'chamcong_group'
      ],
      'qlsl' => [
        'label' => 'QL Sản Lượng', 
        'icon' => 'form',
        'path' => 'qlsl',
        'parent' => 'chamcong_group'
      ],
      'cdc' => [
        'label' => 'Chuyển đổi công', 
        'icon' => 'calculator',
        'path' => 'cdc',
        'parent' => 'chamcong_group'
      ],
      'quy_trinh_sx' => [
        'label' => 'Quy trình SX', 
        'icon' => 'solution',
        'path' => 'quy_trinh_sx',
        'parent' => 'qlsx_group',
        'permission' => [
          'view' => 'quytrinhsx__quy_trinh_san_xuat__view',
          'add' => 'quytrinhsx__quy_trinh_san_xuat__add',
          'edit' => 'quytrinhsx__quy_trinh_san_xuat__edit',
          'delete' => 'quytrinhsx__quy_trinh_san_xuat__delete',
        ]
      ],
      'khsx_daihan' => [
        'label' => 'KHSX dài hạn', 
        'icon' => 'solution',
        'path' => 'khsx_daihan',
        'parent' => 'qlsx_group'
      ],
      'qlpb' => [
        'label' => 'QL Phòng ban', 
        'icon' => 'team',
        'path' => 'qlpb',
        'parent' => 'other_group'
      ],
      'kkvt' => [
        'label' => 'Kiểm kê vật tư', 
        'icon' => 'schedule',
        'path' => 'kkvt',
        'parent' => 'vattu_group'
      ],
      'qlpq' => [
        'label' => 'Phân quyền', 
        'icon' => 'schedule',
        'path' => 'qlpq',
        'parent' => 'other_group'
      ],
    ];
  }
}