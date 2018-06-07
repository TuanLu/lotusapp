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
$app->get('/login', 'UserController:index');
$app->post('/token', 'UserController:token');
$app->get('/fetchRoles', 'UserController:fetchRoles');

$app->get('/fetchUsers', 'UserController:fetchUsers');
$app->post('/updateUser', 'UserController:updateUser');
$app->get('/deleteUser/{id}', 'UserController:deleteUser');
$app->get('/dashboard', 'HomeController:index');
//Npp router
$app->get('/fetchNpp', 'NppController:fetchNpp');
$app->post('/updateNpp', 'NppController:updateNpp');
$app->get('/deleteNpp/{id}', 'NppController:deleteNpp');

