<?php
// PSR 7 standard.
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use App\Helper\Roles;

//User router
//$app->get('/login', 'UserController:index');
$app->post('/token', 'UserController:token')->setName('token');
$app->get('/fetchRoles', 'UserController:fetchRoles');//Per User
$app->get('/fetchAllRoles/{user_id}', 'UserController:fetchAllRoles');// To assign to user

$app->get('/users/fetchUsers', 'UserController:fetchUsers')->setName('users__users__view');
$app->post('/users/updateUser', 'UserController:updateUser')->setName('users__users__update');
$app->get('/users/deleteUser/{id}', 'UserController:deleteUser')->setName('users__users__delete');
$app->post('/users/updatePermission', 'UserController:updatePermission');
$app->get('/dashboard', 'HomeController:index');
//Npp router
$app->get('/npp/fetchNpp', 'NppController:fetchNpp');
$app->post('/npp/updateNpp', 'NppController:updateNpp');
$app->get('/npp/deleteNpp/{id}', 'NppController:deleteNpp');
$app->get('/', 'HomeController:index');
//Danh mục vật tư router
$app->get('/qlcate/fetchCate', 'CateController:fetchCate')->setName(Roles::roleAndRouter()['qlcate']['view']);
$app->post('/qlcate/updateCate', 'CateController:updateCate')->setName(Roles::roleAndRouter()['qlcate']['add']);
$app->get('/qlcate/deleteCate/{id}', 'CateController:deleteCate')->setName(Roles::roleAndRouter()['qlcate']['delete']);
//Kho router
$app->get('/qlkho/fetchKho', 'KhoController:fetchKho')->setName(Roles::roleAndRouter()['qlkho']['view']);
$app->get('/qlkho/fetchQl', 'KhoController:fetchQl')->setName(Roles::roleAndRouter()['qlkho']['view']);
$app->post('/qlkho/updateKho', 'KhoController:updateKho')->setName(Roles::roleAndRouter()['qlkho']['add']);
$app->get('/qlkho/deleteKho/{id}', 'KhoController:deleteKho')->setName(Roles::roleAndRouter()['qlkho']['delete']);
//VTKho router
$app->get('/qlvtkho/fetchVtkho', 'VtkhoController:fetchVtkho')->setName(Roles::roleAndRouter()['qlkho']['view']);
$app->post('/qlvtkho/updateVtkho', 'VtkhoController:updateVtkho')->setName(Roles::roleAndRouter()['qlkho']['add']);
$app->get('/qlvtkho/deleteVtkho/{id}', 'VtkhoController:deleteVtkho')->setName(Roles::roleAndRouter()['qlkho']['delete']);
//Khach hàng router
$app->get('/qlkh/fetchKh', 'KhController:fetchKh')->setName(Roles::roleAndRouter()['qlkh']['view']);
$app->post('/qlkh/updateKh', 'KhController:updateKh')->setName(Roles::roleAndRouter()['qlkh']['add']);
$app->get('/qlkh/deleteKh/{id}', 'KhController:deleteKh')->setName(Roles::roleAndRouter()['qlkh']['delete']);
//Đơn hàng router
$app->get('/order/fetchDh', 'OrderController:fetchDh')->setName(Roles::roleAndRouter()['qldh']['view']);
$app->post('/order/updateDh', 'OrderController:updateDh')->setName(Roles::roleAndRouter()['qldh']['add']);
$app->get('/order/deleteDh/{id}', 'OrderController:deleteDh')->setName(Roles::roleAndRouter()['qldh']['delete']);
//Product router
$app->get('/product/fetch', 'ProductController:fetch')->setName(Roles::roleAndRouter()['product']['view']);
$app->post('/product/update', 'ProductController:update')->setName(Roles::roleAndRouter()['product']['add']);
$app->get('/product/delete/{id}', 'ProductController:delete')->setName(Roles::roleAndRouter()['product']['delete']);
//Phieu nhap router
$app->get('/phieunhap/fetch', 'PhieunhapController:fetch')->setName(Roles::roleAndRouter()['qlphieunhap']['view']);
$app->get('/phieunhap/fetchProductDetailsList', 'PhieunhapController:fetchProductDetailsList')->setName(Roles::roleAndRouter()['qlphieunhap']['view']);
$app->get('/phieunhap/fetchSelectedProduct/{ma_phieu}', 'PhieunhapController:fetchSelectedProduct')->setName(Roles::roleAndRouter()['qlphieunhap']['view']);
$app->post('/phieunhap/update', 'PhieunhapController:update')->setName(Roles::roleAndRouter()['qlphieunhap']['add']);
$app->post('/phieunhap/updateProduct', 'PhieunhapController:updateProduct')->setName(Roles::roleAndRouter()['qlphieunhap']['add']);
$app->post('/phieunhap/changeStatus', 'PhieunhapController:changeStatus')->setName(Roles::roleAndRouter()['qlphieunhap']['add']);
$app->post('/phieunhap/pheduyet', 'PhieunhapController:pheDuyet')->setName(Roles::roleAndRouter()['qlphieunhap']['add']);
$app->post('/phieunhap/changePosition', 'PhieunhapController:changePosition')->setName(Roles::roleAndRouter()['qlphieunhap']['add']);
$app->get('/phieunhap/delete/{id}', 'PhieunhapController:delete')->setName(Roles::roleAndRouter()['qlphieunhap']['delete']);
$app->get('/phieunhap/deleteProduct/{id}', 'PhieunhapController:deleteProduct')->setName(Roles::roleAndRouter()['qlphieunhap']['delete']);
//Phieu xuat router
$app->get('/phieuxuat/fetch', 'PhieuxuatController:fetch')->setName(Roles::roleAndRouter()['qlphieuxuat']['view']);
$app->get('/phieuxuat/fetchProductDetailsList', 'PhieuxuatController:fetchProductDetailsList')->setName(Roles::roleAndRouter()['qlphieuxuat']['view']);
$app->get('/phieuxuat/fetchSelectedProduct/{ma_phieu}', 'PhieuxuatController:fetchSelectedProduct')->setName(Roles::roleAndRouter()['qlphieuxuat']['view']);
$app->post('/phieuxuat/update', 'PhieuxuatController:update')->setName(Roles::roleAndRouter()['qlphieuxuat']['view']);
$app->post('/phieuxuat/updateProduct', 'PhieuxuatController:updateProduct')->setName(Roles::roleAndRouter()['qlphieuxuat']['view']);
$app->post('/phieuxuat/changeStatus', 'PhieuxuatController:changeStatus')->setName(Roles::roleAndRouter()['qlphieuxuat']['view']);
$app->post('/phieuxuat/changePosition', 'PhieuxuatController:changePosition')->setName(Roles::roleAndRouter()['qlphieuxuat']['view']);
$app->get('/phieuxuat/delete/{id}', 'PhieuxuatController:delete')->setName(Roles::roleAndRouter()['qlphieuxuat']['view']);
$app->get('/phieuxuat/deleteProduct/{id}', 'PhieuxuatController:deleteProduct')->setName(Roles::roleAndRouter()['qlphieuxuat']['view']);
//Tinh trang kho router
$app->get('/tinhtrangkho/fetchAllProduct', 'TinhtrangkhoController:fetchAllProduct')->setName(Roles::roleAndRouter()['tinhtrangkho']['view']);
$app->post('/tinhtrangkho/search', 'TinhtrangkhoController:search')->setName(Roles::roleAndRouter()['tinhtrangkho']['view']);
$app->get('/tinhtrangkho/fetchProductInInventory', 'TinhtrangkhoController:fetchProductInInventory')->setName(Roles::roleAndRouter()['tinhtrangkho']['view']);
//Nhân sự router
$app->get('/qlns/fetchNs', 'NhansuController:fetchNs')->setName(Roles::roleAndRouter()['qlns']['view']);
$app->post('/qlns/updateNs', 'NhansuController:updateNs')->setName(Roles::roleAndRouter()['qlns']['add']);
$app->get('/qlns/deleteNs/{id}', 'NhansuController:deleteNs')->setName(Roles::roleAndRouter()['qlns']['delete']);
//Công việc router
$app->get('/qljobs/fetchJob', 'JobsController:fetchJob')->setName(Roles::roleAndRouter()['qljobs']['view']);
$app->post('/qljobs/updateJob', 'JobsController:updateJob')->setName(Roles::roleAndRouter()['qljobs']['add']);
$app->get('/qljobs/deleteJob/{id}', 'JobsController:deleteJob')->setName(Roles::roleAndRouter()['qljobs']['delete']);
//Sản lượng router
$app->get('/qlsl/fetchSl', 'SanluongController:fetchSl')->setName(Roles::roleAndRouter()['qlsl']['view']);
$app->post('/qlsl/updateSl', 'SanluongController:updateSl')->setName(Roles::roleAndRouter()['qlsl']['add']);
$app->get('/qlsl/deleteSl/{id}', 'SanluongController:deleteSl')->setName(Roles::roleAndRouter()['qlsl']['delete']);
$app->post('/qlsl/search', 'SanluongController:search')->setName(Roles::roleAndRouter()['qlsl']['view']);
//Chuyển đổi công router
$app->get('/cdc/fetchCdc', 'CdcController:fetchCdc')->setName(Roles::roleAndRouter()['cdc']['view']);
$app->get('/cdc/fetchTotal', 'CdcController:fetchTotal')->setName(Roles::roleAndRouter()['cdc']['view']);
$app->post('/cdc/search', 'CdcController:search')->setName(Roles::roleAndRouter()['cdc']['view']);
//SX router
$app->get('/sx/fetch', 'SXController:fetch')->setName(Roles::roleAndRouter()['qlsx']['view']);
$app->get('/sx/fetchProductDetailsList', 'SXController:fetchProductDetailsList')->setName(Roles::roleAndRouter()['qlsx']['view']);
$app->get('/sx/fetchSelectedProduct/{ma_sx}', 'SXController:fetchSelectedProduct')->setName(Roles::roleAndRouter()['qlsx']['view']);
$app->get('/sx/fetchProductByCate/{cate_id}', 'SXController:fetchProductByCate')->setName(Roles::roleAndRouter()['qlsx']['view']);
$app->post('/sx/update', 'SXController:update')->setName(Roles::roleAndRouter()['qlsx']['add']);
$app->post('/sx/updateProduct', 'SXController:updateProduct')->setName(Roles::roleAndRouter()['qlsx']['add']);
$app->post('/sx/pheduyet', 'SXController:pheDuyet');
$app->get('/sx/delete/{id}', 'SXController:delete')->setName(Roles::roleAndRouter()['qlsx']['delete']);
$app->get('/sx/deleteProduct/{id}', 'SXController:deleteProduct')->setName(Roles::roleAndRouter()['qlsx']['delete']);
//Quy trinh san xuat router
$app->get('/quytrinhsx/fetch', 'QuytrinhSxController:fetch')->setName(Roles::roleAndRouter()['quy_trinh_sx']['view']);
$app->post('/quytrinhsx/update', 'QuytrinhSxController:update')->setName(Roles::roleAndRouter()['quy_trinh_sx']['add']);
$app->get('/quytrinhsx/delete/{id}', 'QuytrinhSxController:delete')->setName(Roles::roleAndRouter()['quy_trinh_sx']['delete']);
//Gantt router
$app->post('/gantt/update', 'GanttController:update');
$app->post('/gantt/updateLink', 'GanttController:updateLink');
$app->get('/gantt/deleteLink/{id}', 'GanttController:deleteLink');
$app->get('/gantt/fetchTasks/{quy_trinh_id}', 'GanttController:fetchTasks');
$app->get('/gantt/fetchTasksByMaSx/{ma_sx}', 'GanttController:fetchTasksByMaSx');
$app->get('/gantt/fetchTasksFromSample/{ma_sx}/{quy_trinh_id}/{nsx}', 'GanttController:fetchTasksFromSample');
$app->get('/gantt/delete/{id}', 'GanttController:delete');
$app->get('/gantt/allPlan', 'GanttController:getAllPlanData');
$app->get('/gantt/users', 'GanttController:getUsers');

//Phòng ban router
$app->get('/qlpb/fetchPb', 'PhongbanController:fetchPb')->setName(Roles::roleAndRouter()['qlpb']['view']);
$app->post('/qlpb/updatePb', 'PhongbanController:updatePb')->setName(Roles::roleAndRouter()['qlpb']['add']);
$app->get('/qlpb/deletePb/{id}', 'PhongbanController:deletePb')->setName(Roles::roleAndRouter()['qlpb']['delete']);
//Kế hoạch vật tư router
$app->get('/khvt/fetchAllProduct', 'KHVTController:fetchAllProduct')->setName(Roles::roleAndRouter()['khvt']['view']);
$app->post('/khvt/search', 'KHVTController:search')->setName(Roles::roleAndRouter()['khvt']['view']);
$app->get('/khvt/fetchProductInInventory', 'KHVTController:fetchProductInInventory')->setName(Roles::roleAndRouter()['khvt']['view']);
//Kiểm kê vật tư router
$app->get('/kkvt/fetch', 'KiemkeController:fetch')->setName(Roles::roleAndRouter()['kkvt']['view']);
$app->get('/kkvt/delete/{id}', 'KiemkeController:delete')->setName(Roles::roleAndRouter()['kkvt']['delete']);
$app->get('/kkvt/fetchAllProduct', 'KiemkeController:fetchAllProduct')->setName(Roles::roleAndRouter()['kkvt']['view']);
$app->post('/kkvt/search', 'KiemkeController:search')->setName(Roles::roleAndRouter()['kkvt']['view']);
$app->get('/kkvt/fetchProductInInventory', 'KiemkeController:fetchProductInInventory')->setName(Roles::roleAndRouter()['kkvt']['view']);
$app->get('/kkvt/fetchProductDetailsList', 'KiemkeController:fetchProductDetailsList')->setName(Roles::roleAndRouter()['kkvt']['view']);
$app->get('/kkvt/fetchSelectedProduct/{ma_phieu}', 'KiemkeController:fetchSelectedProduct')->setName(Roles::roleAndRouter()['kkvt']['view']);
$app->post('/kkvt/update', 'KiemkeController:update')->setName(Roles::roleAndRouter()['kkvt']['add']);
$app->post('/kkvt/updateProduct', 'KiemkeController:updateProduct')->setName(Roles::roleAndRouter()['kkvt']['add']);
$app->post('/kkvt/changeStatus', 'KiemkeController:changeStatus')->setName(Roles::roleAndRouter()['kkvt']['add']);
$app->post('/kkvt/pheduyet', 'KiemkeController:pheDuyet')->setName(Roles::roleAndRouter()['kkvt']['add']);
$app->post('/kkvt/changePosition', 'KiemkeController:changePosition')->setName(Roles::roleAndRouter()['kkvt']['add']);
$app->get('/kkvt/deleteProduct/{id}', 'KiemkeController:deleteProduct')->setName(Roles::roleAndRouter()['kkvt']['delete']);
//Phân Quyền router
$app->get('/qlpq/fetch', 'PhanquyenController:fetch')->setName(Roles::roleAndRouter()['qluser']['view']);
$app->post('/qlpq/update', 'PhanquyenController:update')->setName(Roles::roleAndRouter()['qluser']['add']);
$app->get('/qlpq/delete/{id}', 'PhanquyenController:delete')->setName(Roles::roleAndRouter()['qluser']['delete']);
