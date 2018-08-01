<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
use \Ramsey\Uuid\Uuid;

class TinhtrangkhoController extends BaseController {

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

	public function updateProduct($request, $response)
	{
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		// Get params and validate them here.
		$id = $request->getParam('id');
		$params = $request->getParams();
		$maLo = isset($params['ma_lo']) ? $params['ma_lo'] : '';
		$maSp = isset($params['product_id']) ? $params['product_id'] : '';
		$maPhieu = isset($params['ma_phieu']) ? $params['ma_phieu'] : '';		
		//Some validation 
		if(!$maPhieu) {
			$rsData['message'] = 'Mã phiếu không được để trống!';
				echo json_encode($rsData);
				die;
		}
		if(!$maLo) {
			$rsData['message'] = 'Mã lô không được để trống!';
				echo json_encode($rsData);
				die;
		}
		if(!$maSp) {
			$rsData['message'] = 'Mã VT không được để trống!';
				echo json_encode($rsData);
				die;
		}
		$userId = isset($this->jwt->id) ? $this->jwt->id : '';
		$date = new \DateTime();
		$createOn = $date->format('Y-m-d H:i:s');
		if(!$id) {
			$itemData = array(
				'ma_phieu' => $maPhieu,
				'ma_lo' => $maLo,
				'product_id' => $maSp,
				'label' => isset($params['label']) ? $params['label'] : '',
				'unit' => isset($params['unit']) ? $params['unit'] : '',
				'sl_chungtu' => isset($params['sl_chungtu']) ? $params['sl_chungtu'] : '',
				'sl_thucnhap' => isset($params['sl_thucnhap']) ? $params['sl_thucnhap'] : '',
				'price' => isset($params['price']) ? $params['price'] : '',
				'create_on' => $createOn
			);
			$result = $this->db->insert('san_pham_theo_phieu', $itemData);
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$id = $this->db->id();
				$rsData['data'] = array('id' => $id);
				$rsData['message'] = 'Đã thêm sản phẩm vào phiếu nhập thành công!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu!';
			}
		} else {
			//update data base on $id
			$itemData = [
				'ma_phieu' => $maPhieu,
				'ma_lo' => $maLo,
				'product_id' => $maSp,
				'label' => isset($params['label']) ? $params['label'] : '',
				'unit' => isset($params['unit']) ? $params['unit'] : '',
				'sl_chungtu' => isset($params['sl_chungtu']) ? $params['sl_chungtu'] : '',
				'sl_thucnhap' => isset($params['sl_thucnhap']) ? $params['sl_thucnhap'] : '',
				'price' => isset($params['price']) ? $params['price'] : '',
				'update_on' =>$createOn,
			];
			$result = $this->db->update('san_pham_theo_phieu', $itemData, ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Update SP theo phiếu', $itemData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống!';
			}
		}
		echo json_encode($rsData);
	}
	public function changeStatus($request, $response) {
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		// Get params and validate them here.
		$params = $request->getParams();
		if(isset($params['ids'])
			&& isset($params['type'])
			&& isset($params['status'])) {

			$userId = isset($this->jwt->id) ? $this->jwt->id : '';
			$date = new \DateTime();
			$createOn = $date->format('Y-m-d H:i:s');
			$updateData = [
				'update_on' => $createOn,
			];
			if($params['type'] == 'qc_check') {
				$updateData['qc_check'] = $params['status'];
				$updateData['qc_id'] = $userId;
			} else {
				$updateData['qa_check'] = $params['status'];
				$updateData['qa_id'] = $userId;
			}
			
			$result = $this->db->update('san_pham_theo_phieu', $updateData, ['id' => $params['ids']]);
			if($result->rowCount()) {
				$this->superLog('Update SP theo phiếu', $updateData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống!';
			}
		}
		echo json_encode($rsData);
	}
	public function deleteProduct($request, $response, $args){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Dữ liệu chưa được xoá thành công!'
		);
		// Get params and validate them here.
		$id = isset(	$args['id']) ? $args['id'] : '';
		if($id != "") {
			$result = $this->db->update('san_pham_theo_phieu',[
				'status' => 2,
			], ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Delete Sản Phẩm Theo Phiếu', $id);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Đã xoá sản phẩm khỏi phiếu nhập!';
				$rsData['data'] = $id;
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
	}
	private function findProduct($filters) {
		//echo "<pre>";
		//print_r($filters);
		$where = "";
		//Tim theo ma kho
		if(isset($filters['ma_kho']) && !empty($filters['ma_kho'])) {
			$where .= " AND `lotus_kho`.`ma_kho` IN ('" . implode("', '", $filters['ma_kho']) . "')";
		}
		//Tim theo ma vat tu
		if(isset($filters['product_id']) && !empty($filters['product_id'])) {
			$where .= " AND `san_pham_theo_phieu`.`product_id` IN ('" . implode("', '", $filters['product_id']) . "')";
		}
		//Tim theo ma lo
		if(isset($filters['ma_lo']) && !empty($filters['ma_lo'])) {
			$where .= " AND `san_pham_theo_phieu`.`ma_lo` = '" . $filters['ma_lo'] . "'";
		}
		//Tim theo ngay san xuat
		if(isset($filters['ngay_san_xuat']) && !empty($filters['ngay_san_xuat'])) {
			$where .= " AND `san_pham_theo_phieu`.`ngay_san_xuat` BETWEEN '{$filters['ngay_san_xuat'][0]}' AND '{$filters['ngay_san_xuat'][1]}'";
		}
		//Tim theo ngay het han
		if(isset($filters['ngay_het_han']) && !empty($filters['ngay_het_han'])) {
			$where .= " AND `san_pham_theo_phieu`.`ngay_het_han` BETWEEN '{$filters['ngay_het_han'][0]}' AND '{$filters['ngay_het_han'][1]}'";
		}
		//Tim theo ngay sap het han
		if(isset($filters['sap_het_han']) && !empty($filters['sap_het_han'])) {
		$where .= " AND (SELECT DATEDIFF(san_pham_theo_phieu.ngay_het_han, CURRENT_DATE()) AS days) <= {$filters['sap_het_han']}";
		}
		//Tim theo Danh mục sản phẩm
		if(isset($filters['ma_cate']) && !empty($filters['ma_cate'])) {
			$where .= " AND `products`.`category_id` IN ('" . implode("', '", $filters['ma_cate']) . "')";
			}
		$sql = "SELECT `san_pham_theo_phieu`.`id`, `san_pham_theo_phieu`.`id` AS `key`,`san_pham_theo_phieu`.`ma_phieu`,`san_pham_theo_phieu`.`product_id`,`san_pham_theo_phieu`.`ma_lo`,`san_pham_theo_phieu`.`label`,`san_pham_theo_phieu`.`unit`,`san_pham_theo_phieu`.`price`,`san_pham_theo_phieu`.`sl_chungtu`,`san_pham_theo_phieu`.`sl_thucnhap`,`san_pham_theo_phieu`.`qc_check`,`san_pham_theo_phieu`.`qa_check`,`san_pham_theo_phieu`.`vi_tri_kho`,`san_pham_theo_phieu`.`ngay_san_xuat`,`san_pham_theo_phieu`.`ngay_het_han`,`lotus_kho`.`ma_kho`, `products`.`category_id` FROM `san_pham_theo_phieu` LEFT JOIN `phieu_nhap_xuat_kho` ON `san_pham_theo_phieu`.`ma_phieu` = `phieu_nhap_xuat_kho`.`ma_phieu` LEFT JOIN `products` ON `products`.`product_id` = `san_pham_theo_phieu`.`product_id` LEFT JOIN `lotus_kho` ON `phieu_nhap_xuat_kho`.`ma_kho` = `lotus_kho`.`ma_kho` WHERE `san_pham_theo_phieu`.`status` = 1 AND `phieu_nhap_xuat_kho`.`status` = 1 AND `phieu_nhap_xuat_kho`.`tinh_trang` = 1 ". $where ." ORDER BY `san_pham_theo_phieu`.`id` DESC"; 
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
