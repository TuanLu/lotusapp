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
$app->get('/fetchCate', 'CateController:fetchCate');
$app->post('/updateCate', 'CateController:updateCate');
$app->get('/deleteCate/{id}', 'CateController:deleteCate');
//Kho router
$app->get('/fetchKho', 'KhoController:fetchKho');
$app->post('/updateKho', 'KhoController:updateKho');
$app->get('/deleteKho/{id}', 'KhoController:deleteKho');
//Khach hàng router
$app->get('/fetchKh', 'KhController:fetchKh');
$app->post('/updateKh', 'KhController:updateKh');
$app->get('/deleteKh/{id}', 'KhController:deleteKh');

