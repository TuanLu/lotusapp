<?php 
namespace App\Helper;

class Roles {
  static function roleAndRouter() {
    return [
      'quy_trinh_sx' => [
        'view' => 'quy_trinh_sx__quy_trinh_san_xuat__view',
        'add' => 'quy_trinh_sx__quy_trinh_san_xuat__add',
        'edit' => 'quy_trinh_sx__quy_trinh_san_xuat__edit',
        'delete' => 'quy_trinh_sx__quy_trinh_san_xuat__delete',
      ],
      'qlsx' => [
        'view' => 'qlsx__lotus_sanxuat__view',
        'add' => 'qlsx__lotus_sanxuat__add',
        'edit' => 'qlsx__lotus_sanxuat__edit',
        'delete' => 'qlsx__lotus_sanxuat__delete',
      ],
      'khsx_daihan' => [
        'view' => 'khsx_daihan__view'
      ],
      'tinhtrangkho' => [
        'view' => 'tinhtrangkho__view'
      ],
      'qlphieunhap' => [
        'view' => 'qlphieunhap__phieu_nhap_xuat_kho__view',
        'add' => 'qlphieunhap__phieu_nhap_xuat_kho__add',
        'edit' => 'qlphieunhap__phieu_nhap_xuat_kho__edit',
        'delete' => 'qlphieunhap__phieu_nhap_xuat_kho__delete',
      ],
      'qlphieuxuat' => [
        'view' => 'qlphieuxuat__phieu_nhap_xuat_kho__view',
        'add' => 'qlphieuxuat__phieu_nhap_xuat_kho__add',
        'edit' => 'qlphieuxuat__phieu_nhap_xuat_kho__edit',
        'delete' => 'qlphieuxuat__phieu_nhap_xuat_kho__delete',
      ],
      'qlkho' => [
        'view' => 'qlkho__lotus_kho__view',
        'add' => 'qlkho__lotus_kho__add',
        'edit' => 'qlkho__lotus_kho__edit',
        'delete' => 'qlkho__lotus_kho__delete',
      ],
      'pheduyet_khsx' => [
        'duyet' => 'duyet_khsx'
      ]
    ];
  }
  static function getRoles() {
    //Parents: main_group, vattu_group, qlsx_group, chamcong_group, qluser_group, other_group
    return [
      [
        'label' => 'Sản Xuất', 
        'icon' => 'inbox',
        'path' => 'qlsx',
        'parent' => 'qlsx_group',
        'permission' => Roles::roleAndRouter()['qlsx']
      ],
      [
        'label' => 'Quy trình SX', 
        'icon' => 'solution',
        'path' => 'quy_trinh_sx',
        'parent' => 'qlsx_group',
        'permission' => Roles::roleAndRouter()['quy_trinh_sx']
      ],
      [
        'label' => 'KHSX dài hạn', 
        'icon' => 'solution',
        'path' => 'khsx_daihan',
        'parent' => 'qlsx_group',
        'permission' => Roles::roleAndRouter()['khsx_daihan']
      ],
      [
        'label' => 'Kho VT', 
        'icon' => 'home',
        'path' => 'qlkho',
        'parent' => 'vattu_group',
        'permission' => Roles::roleAndRouter()['qlkho']
      ],
      [
        'label' => 'Tình trạng kho', 
        'icon' => 'home',
        'path' => 'tinhtrangkho',
        'parent' => 'main_group',
        'permission' => Roles::roleAndRouter()['tinhtrangkho']
      ],
      [
        'label' => 'Phiếu Nhập', 
        'icon' => 'schedule',
        'path' => 'qlphieunhap',
        'parent' => 'vattu_group',
        'permission' => Roles::roleAndRouter()['qlphieunhap']
      ],
      [
        'label' => 'Phiếu Xuất', 
        'icon' => 'schedule',
        'path' => 'qlphieuxuat',
        'parent' => 'vattu_group',
        'permission' => Roles::roleAndRouter()['qlphieuxuat']
      ],
      'qlcate' => [
        'label' => 'Danh mục vật tư', 
        'icon' => 'table',
        'path' => 'qlcate',
        'parent' => 'vattu_group'
      ],
      'product' => [
        'label' => 'Vật tư', 
        'icon' => 'shop',
        'path' => 'product',
        'parent' => 'vattu_group'
      ],
      'qlvtkho' => [
        'label' => 'Vị trí Kho', 
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
      'qldh' => [
        'label' => 'Đơn hàng', 
        'icon' => 'shopping-cart',
        'path' => 'qldh',
        'parent' => 'other_group'
      ],
      'npp' => [
        'label' => 'Nhà cung cấp', 
        'icon' => 'solution',
        'path' => 'npp',
        'parent' => 'other_group'
      ],
      'qluser' => [
        'label' => 'Thành viên', 
        'icon' => 'user',
        'path' => 'qluser',
        'parent' => 'qluser_group'
      ],
      'qlkh' => [
        'label' => 'Khách Hàng', 
        'icon' => 'team',
        'path' => 'qlkh',
        'parent' => 'other_group'
      ],
      // 'full_quyen' => [
      //   'label' => 'Chức vụ, phê duyệt', 
      //   'icon' => 'team',
      //   'path' => 'full_quyen',
      //   'include_in_menu' => false,
      //   'children' => [
      //     array(
      //       'name' => 'Kí duyệt KHSX', 
      //       'key' => 'duyet_khsx',
      //       'permission' => Roles::roleAndRouter()['pheduyet_khsx']
      //     ),
      //     array('name' => 'Kí duyệt ĐBCL', 'value' => 'duyet_dbcl', 'key' => 'duyet_dbcl'),
      //     array('name' => 'Giám đốc QLSX', 'value' => 'duyet_gd', 'key' => 'duyet_gd'),
      //     array('name' => 'Nhóm quản lý kho', 'value' => 'nhom_thu_kho', 'key' => 'nhom_thu_kho'),
      //     array('name' => 'Nhóm QA', 'value' => 'nhomqa', 'key' => 'nhomqa'),
      //     array('name' => 'Nhóm QC', 'value' => 'nhomqc', 'key' => 'nhomqc'),
      //   ]
      // ],
      'qlns' => [
        'label' => 'Nhân sự', 
        'icon' => 'team',
        'path' => 'qlns',
        'parent' => 'chamcong_group'
      ],
      'qljobs' => [
        'label' => 'Công việc', 
        'icon' => 'solution',
        'path' => 'qljobs',
        'parent' => 'chamcong_group'
      ],
      'qlsl' => [
        'label' => 'Sản Lượng', 
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
      'qlpb' => [
        'label' => 'Phòng ban', 
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
    ];
  }
}