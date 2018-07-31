<?php 
namespace App\Helper;
class Roles {
  static function roleAndRouter() {
    //Cần phân tích để clear phase 2
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
      ],
      'qlcate' => [
        'view' => 'qlcate__view',
        'add' => 'qlcate__add',
        'edit' => 'qlcate__edit',
        'delete' => 'qlcate__delete',
      ],
      'khvt' => [
        'view' => 'khvt__view',
        'add' => 'khvt__add',
        'edit' => 'khvt__edit',
        'delete' => 'khvt__delete',
      ],
      'qldh' => [
        'view' => 'qldh__view',
        'add' => 'qldh__add',
        'edit' => 'qldh__edit',
        'delete' => 'qldh__delete',
      ],
      'npp' => [
        'view' => 'npp__view',
        'add' => 'npp__add',
        'edit' => 'npp__edit',
        'delete' => 'npp__delete',
      ],
      'qluser' => [
        'view'    => 'qluser__view',
        'add'     => 'qluser__add',
        'edit'    => 'qluser__edit',
        'delete'  => 'qluser__delete',
      ],
      'qlkh' => [
        'view'    => 'qlkh__view',
        'add'     => 'qlkh__add',
        'edit'    => 'qlkh__edit',
        'delete'  => 'qlkh__delete',
      ],
      'product' => [
        'view'    => 'product__view',
        'add'     => 'product__add',
        'edit'    => 'product__edit',
        'delete'  => 'product__delete',
      ],
      'qlns' => [
        'view'    => 'qlns__view',
        'add'     => 'qlns__add',
        'edit'    => 'qlns__edit',
        'delete'  => 'qlns__delete',
      ],
      'qljobs' => [
        'view'    => 'qljobs__view',
        'add'     => 'qljobs__add',
        'edit'    => 'qljobs__edit',
        'delete'  => 'qljobs__delete',
      ],
      'qlsl' => [
        'view'    => 'qlsl__view',
        'add'     => 'qlsl__add',
        'edit'    => 'qlsl__edit',
        'delete'  => 'qlsl__delete',
      ],
      'cdc' => [
        'view'    => 'cdc__view',
        'add'     => 'cdc__add',
        'edit'    => 'cdc__edit',
        'delete'  => 'cdc__delete',
      ],
      'qlpb' => [
        'view'    => 'qlpb__view',
        'add'     => 'qlpb__add',
        'edit'    => 'qlpb__edit',
        'delete'  => 'qlpb__delete',
      ],
      'kkvt' => [
        'view'    => 'kkvt__view',
        'add'     => 'kkvt__add',
        'edit'    => 'kkvt__edit',
        'delete'  => 'kkvt__delete',
      ],
      'qlvtkho' => [
        'view'    => 'qlvtkho__view',
        'add'     => 'qlvtkho__add',
        'edit'    => 'qlvtkho__edit',
        'delete'  => 'qlvtkho__delete',
      ],
      'lang' => [
        'view'    => 'lang__view',
        'add'     => 'lang__add',
        'edit'    => 'lang__edit',
        'delete'  => 'lang__delete',
      ],
      'note' => [
        'view'    => 'note__view',
        'add'     => 'note__add',
        'edit'    => 'note__edit',
        'delete'  => 'note__delete',
      ]
    ];
  }
  static function getRoles() {
    // Parents: main_group, vattu_group, qlsx_group, chamcong_group, qluser_group, other_group
    // Cần phân tích để clear phase 2. Chưa có group cha con và tự động linh hoạt theo chuẩn mô hình 
    return [
      [
        'label' => 'Sản Xuất', 
        //'icon' => 'inbox',
        'path' => 'qlsx',
        'parent' => 'qlsx_group',
        'permission' => Roles::roleAndRouter()['qlsx']
      ],
      [
        'label' => 'Quy trình SX', 
        //'icon' => 'solution',
        'path' => 'quy_trinh_sx',
        'parent' => 'qlsx_group',
        'permission' => Roles::roleAndRouter()['quy_trinh_sx']
      ],
      [
        'label' => 'KHSX dài hạn', 
        //'icon' => 'solution',
        'path' => 'khsx_daihan',
        'parent' => 'qlsx_group',
        'permission' => Roles::roleAndRouter()['khsx_daihan']
      ],
      [
        'label' => 'Kho VT', 
        'icon' => 'home',
        'path' => 'qlkho',
        'parent' => 'vattu_group',
        'limit_view' => 'lotus_kho',
        'permission' => Roles::roleAndRouter()['qlkho']
      ],
      [
        'label' => 'Tình trạng kho', 
        //'icon' => 'home',
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
      [
        'label' => 'Danh mục VT', 
        'icon' => 'table',
        'path' => 'qlcate',
        'parent' => 'vattu_group',
        'permission' => Roles::roleAndRouter()['qlcate']
      ],
      'product' => [
        'label' => 'Vật tư', 
        'icon' => 'shop',
        'path' => 'product',
        'parent' => 'vattu_group',
        'permission' => Roles::roleAndRouter()['product']
      ],
      'qlvtkho' => [
        'label' => 'Vị trí Kho', 
        'icon' => 'home',
        'path' => 'qlvtkho',
        'parent' => 'vattu_group',
        'permission' => Roles::roleAndRouter()['qlvtkho']
      ],
      'khvt' => [
        'label' => 'Kế hoạch VT', 
        'icon' => 'schedule',
        'path' => 'khvt',
        'parent' => 'vattu_group',
        'permission' => Roles::roleAndRouter()['khvt']
      ],
      'qldh' => [
        'label' => 'Đơn hàng', 
        'icon' => 'shopping-cart',
        'path' => 'qldh',
        'parent' => 'other_group',
        'permission' => Roles::roleAndRouter()['qldh']
      ],
      'npp' => [
        'label' => 'Nhà cung cấp', 
        'icon' => 'solution',
        'path' => 'npp',
        'parent' => 'other_group',
        'permission' => Roles::roleAndRouter()['npp']
      ],
      'qluser' => [
        'label' => 'Thành viên', 
        'icon' => 'user',
        'path' => 'qluser',
        'parent' => 'qluser_group',
        'permission' => Roles::roleAndRouter()['qluser']
      ],
      'qlkh' => [
        'label' => 'Khách Hàng', 
        'icon' => 'team',
        'path' => 'qlkh',
        'parent' => 'other_group',
        'permission' => Roles::roleAndRouter()['qlkh']
      ],
      'qlns' => [
        'label' => 'Nhân sự', 
        'icon' => 'team',
        'path' => 'qlns',
        'parent' => 'chamcong_group',
        'permission' => Roles::roleAndRouter()['qlns']
      ],
      'qljobs' => [
        'label' => 'Công việc', 
        'icon' => 'solution',
        'path' => 'qljobs',
        'parent' => 'chamcong_group',
        'permission' => Roles::roleAndRouter()['qljobs']
      ],
      'qlsl' => [
        'label' => 'Sản Lượng', 
        'icon' => 'form',
        'path' => 'qlsl',
        'parent' => 'chamcong_group',
        'permission' => Roles::roleAndRouter()['qlsl']
      ],
      'cdc' => [
        'label' => 'Chuyển đổi công', 
        'icon' => 'calculator',
        'path' => 'cdc',
        'parent' => 'chamcong_group',
        'permission' => Roles::roleAndRouter()['cdc']
      ],
      'qlpb' => [
        'label' => 'Phòng ban', 
        'icon' => 'team',
        'path' => 'qlpb',
        'parent' => 'qluser_group',
        'permission' => Roles::roleAndRouter()['qlpb']
      ],
      'kkvt' => [
        'label' => 'Kiểm kê vật tư', 
        'icon' => 'schedule',
        'path' => 'kkvt',
        'parent' => 'vattu_group',
        'permission' => Roles::roleAndRouter()['kkvt']
      ],
      'lang' => [
        'label' => 'Ngôn ngữ', 
        'icon' => 'schedule',
        'path' => 'lang',
        'parent' => 'other_group',
        'permission' => Roles::roleAndRouter()['lang']
      ],
      'note' => [
        'label' => 'Thông báo', 
        'icon' => 'schedule',
        'path' => 'note',
        'parent' => 'main_group',
        'permission' => Roles::roleAndRouter()['note']
      ]
    ];
  }
}