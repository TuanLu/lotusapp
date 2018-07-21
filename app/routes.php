<?php
// PSR 7 standard.
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

// $app->get('/', function (Request $request, Response $response, $args) {
//   $data['template_data'] = 'Lotus.App.Slim';
//   //$this->logger->addInfo('You open home router');
//   // Columns to select.
//   $columns = [
//     'uuid',
//     'name',
//     'created_on',
//     'updated_on',
//   ];

//   // Get user.
//   // https://medoo.in/api/get
//   $data = $this->db->get('users', $columns, [
//       "name" => "Lu Tuan"
//   ]);
//   $this->renderer->render($response, "home.phtml", $data);
// });
//User router
//$app->get('/login', 'UserController:index');
$app->post('/token', 'UserController:token');
$app->get('/fetchRoles', 'UserController:fetchRoles');//Per User
$app->get('/fetchAllRoles', 'UserController:fetchAllRoles');// To assign to user

$app->get('/users/fetchUsers', 'UserController:fetchUsers');
$app->post('/users/updateUser', 'UserController:updateUser');
$app->get('/users/deleteUser/{id}', 'UserController:deleteUser');
$app->get('/dashboard', 'HomeController:index');
//Npp router
$app->get('/npp/fetchNpp', 'NppController:fetchNpp');
$app->post('/npp/updateNpp', 'NppController:updateNpp');
$app->get('/npp/deleteNpp/{id}', 'NppController:deleteNpp');
$app->get('/', 'HomeController:index');
//Cate router
$app->get('/qlcate/fetchCate', 'CateController:fetchCate');
$app->post('/qlcate/updateCate', 'CateController:updateCate');
$app->get('/qlcate/deleteCate/{id}', 'CateController:deleteCate');
//Kho router
$app->get('/qlkho/fetchKho', 'KhoController:fetchKho');
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
$app->get('/tinhtrangkho/fetchAllProduct', 'TinhtrangkhoController:fetchAllProduct');
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
$app->get('/sx/fetch', 'SXController:fetch');
$app->get('/sx/fetchProductDetailsList', 'SXController:fetchProductDetailsList');
$app->get('/sx/fetchSelectedProduct/{ma_sx}', 'SXController:fetchSelectedProduct');
$app->get('/sx/fetchProductByCate/{cate_id}', 'SXController:fetchProductByCate');
$app->post('/sx/update', 'SXController:update');
$app->post('/sx/updateProduct', 'SXController:updateProduct');
$app->post('/sx/pheduyet', 'SXController:pheDuyet');
$app->get('/sx/delete/{id}', 'SXController:delete');
$app->get('/sx/deleteProduct/{id}', 'SXController:deleteProduct');
//Quy trinh san xuat router
$app->get('/quytrinhsx/fetch', 'QuytrinhSxController:fetch');
$app->post('/quytrinhsx/update', 'QuytrinhSxController:update');
$app->get('/quytrinhsx/delete/{id}', 'QuytrinhSxController:delete');
//Gantt router
$app->post('/gantt/update', 'GanttController:update');
$app->post('/gantt/updateLink', 'GanttController:updateLink');
$app->get('/gantt/deleteLink/{id}', 'GanttController:deleteLink');
$app->get('/gantt/fetchTasks/{quy_trinh_id}', 'GanttController:fetchTasks');
$app->get('/gantt/fetchTasksByMaSx/{ma_sx}', 'GanttController:fetchTasksByMaSx');
$app->get('/gantt/delete/{id}', 'GanttController:delete');
$app->get('/gantt/allPlan', 'GanttController:getAllPlanData');

//Phòng ban router
$app->get('/qlpb/fetchPb', 'PhongbanController:fetchPb');
$app->post('/qlpb/updatePb', 'PhongbanController:updatePb');
$app->get('/qlpb/deletePb/{id}', 'PhongbanController:deletePb');
