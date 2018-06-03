<?php 
namespace App\Controllers;
use \Slim\Views\PhpRenderer;
use \App\Helper\Data;

class HomeController extends BaseController {
  public function index($request, $response) {
    $uri = $request->getUri();
    $data = [
      'base_url' => $uri->getBaseUrl()
    ];
    return $this->view->render($response, 'home.phtml', $data);
  }
  public function uplo($request, $response) {
    $param = $request->getParams();
    var_dump($param);
    $data = $this->db->insert("lohang", $param);
    echo $data->rowCount();
  }
}