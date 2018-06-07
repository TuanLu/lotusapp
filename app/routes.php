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

$app->get('/', 'HomeController:index');
//Cate router
$app->get('/fetchCate', 'CateController:fetchCate');
$app->post('/updateCate', 'CateController:updateCate');
$app->get('/deleteCate/{id}', 'CateController:deleteCate');
//Kho router
$app->get('/fetchKho', 'KhoController:fetchKho');
$app->post('/updateKho', 'KhoController:updateKho');
$app->get('/deleteKho/{id}', 'KhoController:deleteKho');
//NPP router
$app->get('/fetchNpp', 'NppController:fetchNpp');
$app->post('/updateNpp', 'NppController:updateNpp');
$app->get('/deleteNpp/{id}', 'NppController:deleteNpp');

