<?php 
namespace App\Controllers;
use \Slim\Views\PhpRenderer;
use \App\Helper\Data;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ExportController extends BaseController {
  public function export($request, $response) {
    $rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Không export được file!'
		);
    $params = $request->getParams();
    $dataset = isset($params['dataset']) ? $params['dataset'] : [];
    if(!empty($dataset)) {
      $title = isset($params['title']) ? $params['title'] : '';
      $filename = isset($params['filename']) ? $params['filename'] : '';
      $result = $this->exportExcel($dataset, $title, $filename);
      if($result) {
        $rsData['status'] = self::SUCCESS_STATUS;
        $rsData['message'] = 'Đã export được file';
        $rsData['filename'] = $result;
      }
    }
    echo json_encode($rsData);
  }
  private function getExportDir() {
    $baseDir = $this->baseDir();
    $exportDir = $this->baseDir() . '/public/export/';
    if(!file_exists($exportDir)) {
      mkdir($exportDir, 0775);
    }
    return $exportDir;
  }
  protected function exportExcel($collection, $title = "", $filename = "") {
    if(empty($collection)) return false;
    $exportDir = $this->getExportDir();
    $date = new \DateTime();
    $createOn = $date->format('d-m-Y');
    $filename = $filename ? $filename . "-$createOn.xlsx" : "Data - $createOn.xlsx";
    $title = $title ? : "Dữ liệu - $createOn";
    
    $spreadsheet = new Spreadsheet();
    
    // Set workbook properties
    $spreadsheet->getProperties()->setCreator('tuan.mrbean@gmail.com')
            ->setLastModifiedBy('User')
            ->setTitle('PHP Excel')
            ->setSubject('PhpSpreadsheet')
            ->setDescription('A Simple Excel Spreadsheet generated using PhpSpreadsheet.')
            ->setKeywords('Tuan Lu')
            ->setCategory('PHP Excel');
    
    //Set active sheet index to the first sheet, 
    //and add some data
    $spreadsheet->setActiveSheetIndex(0);

    $headerColumns = array_keys($collection[0]);
    foreach ($headerColumns as $key => $column) {
      $spreadsheet->getActiveSheet()->setCellValueByColumnAndRow(++$key, 1, $column);
    }
    $startRow = 2;
    foreach ($collection as $rowKey => $product) {
      foreach ($headerColumns as $columKey => $column) {
        $spreadsheet->getActiveSheet()->setCellValueByColumnAndRow(++$columKey, $startRow, $product[$column]);
      }
      $startRow++;
    }
    
    // Set worksheet title
    $spreadsheet->getActiveSheet()->setTitle($title);
    
    // Set active sheet index to the first sheet, so Excel opens this as the first sheet
    $spreadsheet->setActiveSheetIndex(0);
    
    // Redirect output to a client's web browser (Xlsx)
    // header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    // header('Content-Disposition: attachment; filename="'. $filename .'"');
    // header('Cache-Control: max-age=0');
    // If you're serving to IE 9, then the following may be needed
    // header('Cache-Control: max-age=1');
    
    // If you're serving to IE over SSL, then the following may be needed
    // header('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); // Date in the past
    // header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT'); // always modified
    // header('Cache-Control: cache, must-revalidate'); // HTTP/1.1
    // header('Pragma: public'); // HTTP/1.0
    
    // $writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($spreadsheet, "Xlsx");
    // $writer->setPreCalculateFormulas(false);
    // $writer->save("php://output");
    //exit;

    //Save file and return path 
    $filePath = $exportDir . $filename;

    $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
    $writer->setPreCalculateFormulas(false);
    $writer->save($filePath);
    if(file_exists($filePath)) {
      return $filename;
    }
  }
}