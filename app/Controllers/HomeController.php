<?php 
namespace App\Controllers;
use \Slim\Views\PhpRenderer;
use \App\Helper\Data;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class HomeController extends BaseController {
  public function index($request, $response) {
    $uri = $request->getUri();
    $data = [
      'base_url' => $uri->getBaseUrl()
    ];
    return $this->view->render($response, 'home.phtml', $data);
  }
  public function test($request, $response) {
    // Create new Spreadsheet object
    $products = $this->db->select("products", "*");
    $this->exportExcel($products, "My TItle", "My_filename.xlsx");
  }
}