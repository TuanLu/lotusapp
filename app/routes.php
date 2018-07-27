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
//Cate router
$app->get('/qlcate/fetchCate', 'CateController:fetchCate')->setName(Roles::roleAndRouter()['qlcate']['view']);
$app->post('/qlcate/updateCate', 'CateController:updateCate')->setName(Roles::roleAndRouter()['qlcate']['add']);
$app->get('/qlcate/deleteCate/{id}', 'CateController:deleteCate')->setName(Roles::roleAndRouter()['qlcate']['delete']);
//Kho router
$app->get('/qlkho/fetchKho', 'KhoController:fetchKho');
$app->get('/qlkho/fetchQl', 'KhoController:fetchQl');
$app->post('/qlkho/updateKho', 'KhoController:updateKho');
$app->get('/qlkho/deleteKho/{id}', 'KhoController:deleteKho');
//VTKho router
$app->get('/qlvtkho/fetchVtkho', 'VtkhoController:fetchVtkho');
$app->post('/qlvtkho/updateVtkho', 'VtkhoController:updateVtkho');
$app->get('/qlvtkho/deleteVtkho/{id}', 'VtkhoController:deleteVtkho');
//Khach hàng router
$app->get('/qlkh/fetchKh', 'KhController:fetchKh');
$app->post('/qlkh/updateKh', 'KhController:updateKh');
$app->get('/qlkh/deleteKh/{id}', 'KhController:deleteKh');
//Đơn hàng router
$app->get('/order/fetchDh', 'OrderController:fetchDh');
$app->post('/order/updateDh', 'OrderController:updateDh');
$app->get('/order/deleteDh/{id}', 'OrderController:deleteDh');
//Product router
$app->get('/product/fetch', 'ProductController:fetch');
$app->post('/product/update', 'ProductController:update');
$app->get('/product/delete/{id}', 'ProductController:delete');
//Phieu nhap router
$app->get('/phieunhap/fetch', 'PhieunhapController:fetch');
$app->get('/phieunhap/fetchProductDetailsList', 'PhieunhapController:fetchProductDetailsList');
$app->get('/phieunhap/fetchSelectedProduct/{ma_phieu}', 'PhieunhapController:fetchSelectedProduct');
$app->post('/phieunhap/update', 'PhieunhapController:update');
$app->post('/phieunhap/updateProduct', 'PhieunhapController:updateProduct');
$app->post('/phieunhap/changeStatus', 'PhieunhapController:changeStatus');
$app->post('/phieunhap/pheduyet', 'PhieunhapController:pheDuyet');
$app->post('/phieunhap/changePosition', 'PhieunhapController:changePosition');
$app->get('/phieunhap/delete/{id}', 'PhieunhapController:delete');
$app->get('/phieunhap/deleteProduct/{id}', 'PhieunhapController:deleteProduct');
//Phieu xuat router
$app->get('/phieuxuat/fetch', 'PhieuxuatController:fetch');
$app->get('/phieuxuat/fetchProductDetailsList', 'PhieuxuatController:fetchProductDetailsList');
$app->get('/phieuxuat/fetchSelectedProduct/{ma_phieu}', 'PhieuxuatController:fetchSelectedProduct');
$app->post('/phieuxuat/update', 'PhieuxuatController:update');
$app->post('/phieuxuat/updateProduct', 'PhieuxuatController:updateProduct');
$app->post('/phieuxuat/changeStatus', 'PhieuxuatController:changeStatus');
$app->post('/phieuxuat/changePosition', 'PhieuxuatController:changePosition');
$app->get('/phieuxuat/delete/{id}', 'PhieuxuatController:delete');
$app->get('/phieuxuat/deleteProduct/{id}', 'PhieuxuatController:deleteProduct');
//Tinh trang kho router
$app->get('/tinhtrangkho/fetchAllProduct', 'TinhtrangkhoController:fetchAllProduct')->setName(Roles::roleAndRouter()['tinhtrangkho']['view']);
$app->post('/tinhtrangkho/search', 'TinhtrangkhoController:search');
$app->get('/tinhtrangkho/fetchProductInInventory', 'TinhtrangkhoController:fetchProductInInventory');
//Nhân sự router
$app->get('/qlns/fetchNs', 'NhansuController:fetchNs');
$app->post('/qlns/updateNs', 'NhansuController:updateNs');
$app->get('/qlns/deleteNs/{id}', 'NhansuController:deleteNs');
//Công việc router
$app->get('/qljobs/fetchJob', 'JobsController:fetchJob');
$app->post('/qljobs/updateJob', 'JobsController:updateJob');
$app->get('/qljobs/deleteJob/{id}', 'JobsController:deleteJob');
//Sản lượng router
$app->get('/qlsl/fetchSl', 'SanluongController:fetchSl');
$app->post('/qlsl/updateSl', 'SanluongController:updateSl');
$app->get('/qlsl/deleteSl/{id}', 'SanluongController:deleteSl');
$app->post('/qlsl/search', 'SanluongController:search');
//Chuyển đổi công router
$app->get('/cdc/fetchCdc', 'CdcController:fetchCdc');
$app->get('/cdc/fetchTotal', 'CdcController:fetchTotal');
$app->post('/cdc/search', 'CdcController:search');
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
$app->get('/qlpb/fetchPb', 'PhongbanController:fetchPb');
$app->post('/qlpb/updatePb', 'PhongbanController:updatePb');
$app->get('/qlpb/deletePb/{id}', 'PhongbanController:deletePb');
//Kế hoạch vật tư router
$app->get('/khvt/fetchAllProduct', 'KHVTController:fetchAllProduct');
$app->post('/khvt/search', 'KHVTController:search');
$app->get('/khvt/fetchProductInInventory', 'KHVTController:fetchProductInInventory');
//Kiểm kê vật tư router
$app->get('/kkvt/fetch', 'KiemkeController:fetch');
$app->get('/kkvt/delete/{id}', 'KiemkeController:delete');
$app->get('/kkvt/fetchAllProduct', 'KiemkeController:fetchAllProduct');
$app->post('/kkvt/search', 'KiemkeController:search');
$app->get('/kkvt/fetchProductInInventory', 'KiemkeController:fetchProductInInventory');
$app->get('/kkvt/fetchProductDetailsList', 'KiemkeController:fetchProductDetailsList');
$app->get('/kkvt/fetchSelectedProduct/{ma_phieu}', 'KiemkeController:fetchSelectedProduct');
$app->post('/kkvt/update', 'KiemkeController:update');
$app->post('/kkvt/updateProduct', 'KiemkeController:updateProduct');
$app->post('/kkvt/changeStatus', 'KiemkeController:changeStatus');
$app->post('/kkvt/pheduyet', 'KiemkeController:pheDuyet');
$app->post('/kkvt/changePosition', 'KiemkeController:changePosition');
$app->get('/kkvt/deleteProduct/{id}', 'KiemkeController:deleteProduct');
//Phân Quyền router
$app->get('/qlpq/fetch', 'PhanquyenController:fetch');
$app->post('/qlpq/update', 'PhanquyenController:update');
$app->get('/qlpq/delete/{id}', 'PhanquyenController:delete');
