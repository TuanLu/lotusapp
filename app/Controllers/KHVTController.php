<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
use \Ramsey\Uuid\Uuid;

class KHVTController extends BaseController {

	public function fetchAllProduct($request, $response, $args) {
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Sản phẩm chưa được load thành công!'
		);
		$collection = $this->findProduct([]);
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['message'] = 'Dữ liệu đã được load!';
			$rsData['data'] = $collection;
		}
		header("Content-Type: application/json");
    echo json_encode($rsData, JSON_UNESCAPED_UNICODE);
    exit;
	}
	private function findProduct($filters) {
		//echo "<pre>";
		//print_r($filters);
		$where = "";
		//Tim theo ma vat tu
		if(isset($filters['product_id']) && !empty($filters['product_id'])) {
			$where .= " AND `lotus_spsx`.`product_id` = '" . $filters['product_id'] . "'";
		}
		//Tim theo ma khsx
		if(isset($filters['ma']) && !empty($filters['ma'])) {
			$where .= " AND `lotus_sanxuat`.`ma` = '" . $filters['ma'] . "'";
		}
		//Tim theo ma quet
		if(isset($filters['ma_maquet']) && !empty($filters['ma_maquet'])) {
			$where .= " AND `lotus_spsx`.`ma_maquet` = '" . $filters['ma_maquet'] . "'";
		}
		$sql = "SELECT lotus_spsx.ma_sx, lotus_sanxuat.ma,lotus_spsx.ma_maquet,lotus_spsx.product_id, lotus_spsx.product_id as 'key', lotus_spsx.cong_doan, lotus_spsx.sl_1000, lotus_spsx.unit, SUM(lotus_spsx.sl_nvl) as 'sl_nvl', lotus_spsx.status,lotus_spsx.hu_hao FROM lotus_spsx, lotus_sanxuat WHERE lotus_sanxuat.ma_sx = lotus_spsx.ma_sx AND lotus_spsx.status = 1 AND lotus_sanxuat.status = 1 AND lotus_sanxuat.pkhsx <> '' AND lotus_sanxuat.pdbcl <> '' AND lotus_sanxuat.gd <> '' GROUP BY lotus_spsx.product_id $where";
		$collection = $this->db->query($sql)->fetchAll(\PDO::FETCH_ASSOC);
		return $collection;
	}
	public function search($request, $response) {
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Không tìm thấy vật tư nào theo điều kiện tìm kiếm!'
		);
		$params = $request->getParams();
		$collection = $this->findProduct($params);
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['data'] = $collection;
			$rsData['message'] = "Tìm thấy " . count($collection) . " vật tư trong kho!";
		} else {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['data'] = [];
		}
		echo json_encode($rsData);
	}
	public function fetchProductInInventory($request, $response) {
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu từ hệ thống!'
		);
		$sql = "SELECT DISTINCT products.product_id, products.name, products.unit FROM products INNER JOIN san_pham_theo_phieu ON products.product_id = san_pham_theo_phieu.product_id ORDER BY products.name";
    	$collection = $this->db->query($sql)->fetchAll(\PDO::FETCH_ASSOC);
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['message'] = 'Dữ liệu đã được load!';
			$rsData['data'] = $collection;
		}
		header("Content-Type: application/json");
		echo json_encode($rsData, JSON_UNESCAPED_UNICODE);
		exit;
	}
}
