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
}