<?php 
namespace App\Controllers;
use \App\Helper\Data;

class UploadController extends BaseController {
  private $tableName = 'files';
  const MAX_UPLOAD_FILESIZE = 20000000;//20M
  public function uploadFile($request, $response) {
    $rsData = array(
      'status' => self::ERROR_STATUS,
      'message' => 'Xin lỗi! Chưa upload được file lên server!'
    );
    //Directory of image. Magento will different with Wordpress
    $target_dir = $this->baseDir() . '/public/upload/';
    if(!file_exists($target_dir)) {
      mkdir($target_dir, 0775);
    }
    $filename = basename($_FILES["filename"]["name"]);
    //Try to upload image without wordpress function
    
    $target_file = $target_dir . $filename;
    $uploadOk = 1;
    $fileExt = pathinfo($target_file,PATHINFO_EXTENSION);
    $allowExts = ["xls", "xlsx", "pdf", "png", "jpg", "jpeg"];
    
    // Allow certain file formats
    if(!in_array($fileExt, $allowExts)) {
        $rsData['message'] = "Xin lỗi, chỉ cho phép upload file có đuôi " . implode(',', $allowExts);
        $uploadOk = 0;
        $response->getBody()->write(json_encode($rsData));
        return $response->withHeader('Content-type', 'application/json');
    }
    // Check if file is a actual file or fake file
    if(isset($_POST["submit"])) {
        $check = filesize($_FILES["filename"]["tmp_name"]);
        if($check !== false) {
            //echo "File is an image - " . $check["mime"] . ".";
            $uploadOk = 1;
        } else {
            $rsData['message'] = "File is invalid.";
            $uploadOk = 0;
        }
    }
    // Check if file already exists
    if (file_exists($target_file)) {
        //$rsData['message'] = "Sorry, file already exists.";
        $filename = time() . '_' . $filename;
        $target_file = $target_dir . $filename;
        //If file already exists then rename the file and allow upload normally
        $uploadOk = 1;
    }
    // Check file size
    if ($_FILES["filename"]["size"] > self::MAX_UPLOAD_FILESIZE) {
        $rsData['message'] = "Sorry, your file is too large.";
        $uploadOk = 0;
    }
    // Check if $uploadOk is set to 0 by an error
    if ($uploadOk == 1) {
      if (move_uploaded_file($_FILES["filename"]["tmp_name"], $target_file)) {
          try {
            $date = new \DateTime();
            $createOn = $date->format('Y-m-d H:i:s');
            $userId = isset($this->jwt->id) ? $this->jwt->id : '';
            $itemData = [
              'filename' => $filename,
              'create_on' => $createOn,
              'create_by' => $userId
            ];
            $result = $this->db->insert($this->tableName, $itemData);
            if($result->rowCount()) {
              $rsData['status'] = self::SUCCESS_STATUS;
              $rsData['message'] = "Đã up file thành công!";
              $rsData['data'] = $itemData;
            }
          }catch(Exception $e) {
            $rsData['message'] = "Xin lỗi! Server không thể đọc được file excel này: $filename!";
          }
      } else {
          $rsData['message'] = "Sorry, there was an error uploading your file.";
      }
    }
    $response->getBody()->write(json_encode($rsData));
    return $response->withHeader('Content-type', 'application/json');
  }
}