<?php 
namespace App\Helper;
use \PhpOffice\PhpSpreadsheet\Spreadsheet;
use \PhpOffice\PhpSpreadsheet\Reader\Xlsx;

class Data {
  /**
   * Format date for mysql database
   */
  public function convertStringToDate($format, $dateString) {
    $dt = \DateTime::createFromFormat($format, $dateString);
    if($dt instanceof \DateTime) {
      return $dt->format('Y-m-d');
    } else {
      //Normal date format will be: 13/09/17. The data must be the same date format 
      //Try another date format: 13/09/2017. 
      $dt = \DateTime::createFromFormat('d/m/Y', $dateString);
      if($dt instanceof \DateTime) {
        return $dt->format('Y-m-d');
      }
    }
  }
  public function readExcel($path) {
    if(file_exists($path)) {
      $reader = new Xlsx();
      $spreadsheet = $reader->load($path);
      $sheetData = $spreadsheet->getActiveSheet()->toArray(null, true, true, true);
      //Remove title row of excel
      unset($sheetData[1]);
      return $sheetData;
    } else {
      echo "File: $path not exitst!";
    }
    return [];
  }
  public function findDistrict($sourceText, $districtList) {
    if($sourceText != "") {
      $sourceText = mb_strtolower($sourceText);
      //Remove space 
      $sourceText = str_replace(' ', '', $sourceText);
      $districtTemp = '';
      $foundArr = [];
      foreach($districtList as $district) {
        $districtTemp = mb_strtolower($district['huyen']);
        //replace 'huyen', 'quan', 'thanhpho' => ''
        $districtTemp = str_replace('thành phố', '', $districtTemp);
        $districtTemp = str_replace('quận', '', $districtTemp);
        $districtTemp = str_replace('huyện', '', $districtTemp);
        $districtTemp = str_replace(' ', '', $districtTemp);
        //Special string Quận 1 -> 12 
        if(is_numeric($districtTemp)) {
          $districtTemp = 'quận' . $districtTemp;
        }
        if(strpos($sourceText, $districtTemp)) {
          $foundArr[] = $district;
        }
      }
      if(count($foundArr) == 1) {        
        return $foundArr[0];
      }
    }
  }
  /**
   * Load tat ca san phẩm và gộp theo mã sản phẩm, dùng cho kế hoạch vật tư dài hạn
   */
  public function getAllProductFromImportBill($verify = false) {
    $verifySQL = "";
    if($verify) {
      $verifySQL = "AND (qc_check = 1 OR qa_check = 1)";
    }
    $sql = "SELECT `san_pham_theo_phieu`.`id`,`san_pham_theo_phieu`.`id` AS `key`,`san_pham_theo_phieu`.`ma_phieu`,`san_pham_theo_phieu`.`product_id`,SUM(`san_pham_theo_phieu`.`sl_thucnhap`) as 'sl_thucnhap',`san_pham_theo_phieu`.`qc_check`,`san_pham_theo_phieu`.`qa_check`,GROUP_CONCAT(`san_pham_theo_phieu`.`vi_tri_kho`) AS vi_tri_kho,GROUP_CONCAT(`san_pham_theo_phieu`.`create_on`) AS create_on,`san_pham_theo_phieu`.`ngay_san_xuat`,`san_pham_theo_phieu`.`ngay_het_han`,GROUP_CONCAT(`lotus_kho`.`ma_kho`) AS 'ma_kho' 
    FROM `san_pham_theo_phieu` 
    LEFT JOIN `phieu_nhap_xuat_kho` 
    ON `san_pham_theo_phieu`.`ma_phieu` = `phieu_nhap_xuat_kho`.`ma_phieu` 
    LEFT JOIN `lotus_kho` 
    ON `phieu_nhap_xuat_kho`.`ma_kho` = `lotus_kho`.`ma_kho` 
    WHERE `san_pham_theo_phieu`.`status` = 1 AND `phieu_nhap_xuat_kho`.`status` = 1 AND `phieu_nhap_xuat_kho`.`tinh_trang` = 1 $verifySQL GROUP BY product_id";
    return $sql;
  }
  public function getAllProductForExport($verify = true, $where = "") {
    $verifySQL = "";
    if($verify) {
      $verifySQL = "AND (qc_check = 1 OR qa_check = 1)";
    }
    /**
     *  sl_thucnhap chinh la so luong ton 
     * sl_thucnhap bang so luong nhap - so luong trong phieu xuat
     * **/
    $sql = "SELECT `san_pham_theo_phieu`.`id`,`san_pham_theo_phieu`.`id` AS `key`,`san_pham_theo_phieu`.`ma_phieu`,`san_pham_theo_phieu`.`product_id`,(`san_pham_theo_phieu`.`sl_thucnhap` - IFNULL(`san_pham_theo_phieu_xuat`.`sl_thucnhap`,0)) AS 'sl_thucnhap',(`san_pham_theo_phieu`.`sl_thucnhap` - IFNULL(`san_pham_theo_phieu_xuat`.`sl_thucnhap`,0)) AS 'sl_ton',`san_pham_theo_phieu`.`qc_check`,`san_pham_theo_phieu`.`qa_check`,`san_pham_theo_phieu`.`vi_tri_kho`,`san_pham_theo_phieu`.`create_on`,`san_pham_theo_phieu`.`ngay_san_xuat`,`san_pham_theo_phieu`.`ngay_het_han`, products.name,`san_pham_theo_phieu`.`qc_note`,`san_pham_theo_phieu`.`qa_note`,`san_pham_theo_phieu`.`qc_file`,`san_pham_theo_phieu`.`qa_file`,`lotus_kho`.`ma_kho`, `lotus_kho`.`name` AS ten_kho, `products`.`category_id`
    FROM `san_pham_theo_phieu` 
    LEFT JOIN `phieu_nhap_xuat_kho` 
      ON `san_pham_theo_phieu`.`ma_phieu` = `phieu_nhap_xuat_kho`.`ma_phieu` 
    LEFT JOIN `lotus_kho` 
      ON `phieu_nhap_xuat_kho`.`ma_kho` = `lotus_kho`.`ma_kho`
    LEFT JOIN products
		  ON san_pham_theo_phieu.product_id = products.product_id 
    LEFT JOIN san_pham_theo_phieu_xuat 
    	ON san_pham_theo_phieu.id = san_pham_theo_phieu_xuat.item_id AND san_pham_theo_phieu_xuat.status = 1
    WHERE `san_pham_theo_phieu`.`status` = 1 AND `phieu_nhap_xuat_kho`.`status` = 1 AND `phieu_nhap_xuat_kho`.`tinh_trang` = 1 $verifySQL $where
    HAVING sl_thucnhap > 0
    ORDER BY ngay_het_han, create_on DESC";
    return $sql;
  }
}