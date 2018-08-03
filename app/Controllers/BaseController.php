<?php 
namespace App\Controllers;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class BaseController {
  const ERROR_STATUS = 'error';
	const SUCCESS_STATUS = 'success';
  protected $container;
  public function __construct($container) {
    $this->container = $container;
  }
  public function __get($prop) {
    if($this->container->{$prop}) {
      return $this->container->{$prop};
    }
  }
  public function baseDir() {
    $dir = __DIR__;
    return str_replace('app/Controllers', '', $dir);
  }
  protected function superLog($action_name = '', $description, $logText = true) {
    $date = new \DateTime();
    $userId = isset($this->jwt->id) ? $this->jwt->id : '';
    $insertItem = [
      'user_id' => $userId,
      'action_name' => $action_name,
      'create_on' => $date->format('Y-m-d H:i:s')
    ];
    if(is_array($description)) {
      $insertItem['description[JSON]'] = $description;
    } else {
      $insertItem['description'] = $description;
    }
    $this->db->insert('app_logger', $insertItem);
    if($logText) {
      $description = (is_array($description) ? $description : [$description]);
      $this->logger->addInfo($action_name, $insertItem);
    }
  }
  protected function updateDB($tableName, $data, $where) {
    $rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa cập nhật được dữ liệu'
    );
    if(!$tableName || !$data || !$where) {
      $rsData['message'] = 'Missing table or data or where clause!';
      return $rsData;
    }
    $result = $this->db->update($tableName, $data, $where);
    if($result->rowCount()) {
      $rsData['status'] = self::SUCCESS_STATUS;
      $rsData['message'] = 'Dữ liệu đã được cập nhật thành công!';
    }
    return $rsData;
  }
  protected function exportExcel($collection, $title = "", $filename = "") {
    if(empty($collection)) return false;
    $date = new \DateTime();
    $createOn = $date->format('d-m-Y');
    $filename = $filename ? : "Data - $createOn.xlsx";
    $title = $title ? : "Dữ liệu - $createOn.xlsx";
    
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
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="'. $filename .'"');
    header('Cache-Control: max-age=0');
    // If you're serving to IE 9, then the following may be needed
    header('Cache-Control: max-age=1');
    
    // If you're serving to IE over SSL, then the following may be needed
    header('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); // Date in the past
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT'); // always modified
    header('Cache-Control: cache, must-revalidate'); // HTTP/1.1
    header('Pragma: public'); // HTTP/1.0
    
    $writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($spreadsheet, "Xlsx");
    $writer->setPreCalculateFormulas(false);
    $writer->save("php://output");
    exit;
  }
}