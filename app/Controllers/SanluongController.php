<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
use \App\Helper\Data;
//use \Ramsey\Uuid\Uuid;
class SanluongController extends BaseController
{
	private $tableName = 'lotus_sanluong';
	const ERROR_STATUS = 'error';
	const SUCCESS_STATUS = 'success';
 
	public function fetchSl($request){ 
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu sản lượng nào từ hệ thống!'
		);
		// Columns to select.
		$columns = [
				'id',
				'id(key)',
				'ma_sl',
				'ma_ns',
				'ca',
				'timestart',
				'timestop',
				'address',
				'ma_cv',
				'workday',
				'status',
				'create_on'
		];
		$collection = $this->db->select($this->tableName, $columns, [
			"ORDER" => ["id" => "DESC"],
			"status" => 1
		]);
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['message'] = 'Dữ liệu đã được load!';
			$rsData['data'] = $collection;
		}
		echo json_encode($rsData);
	}
	public function updateSl($request, $response)
	{
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		
		// Get params and validate them here.
		//$params = $request->getParams();
		$id = $request->getParam('id');
		//die($id);
		$helper = new Data();
		$ma_sl = $request->getParam('ma_sl');
		$ma_ns = $request->getParam('ma_ns');
		$ma_cv = $request->getParam('ma_cv');
		$ca = $request->getParam('ca');
		$timestart = $request->getParam('timestart');
		$timestop = $request->getParam('timestop');
		$address = $request->getParam('address');
		$workday = $request->getParam('workday');
		$workday = $helper->convertStringToDate('d-m-Y', $workday);
		if(!$id) {
			//Insert new data to db
			if(!$ma_cv) {
				$rsData['message'] = 'Mã công việc không được để trống!';
				echo json_encode($rsData);
				die;
			}
			if(!$ma_ns) {
				$rsData['message'] = 'Mã nhân viên không được để trống!';
				echo json_encode($rsData);
				die;
			}
			$date = new \DateTime();
			$itemData = [
				'ma_cv' => $ma_cv,
				'ma_sl' => $ma_sl,
				'ma_ns' => $ma_ns,
				'ca' => $ca,
				'timestart' => $timestart,
				'timestop' => $timestop,
				'address' => $address,
				'workday' => $workday,
				'status' => 1,
				'create_on' => $date->format('Y-m-d H:m:s'),
			];
			$selectColumns = ['id', 'ma_sl'];
			//$where = ['ma_sl' => $itemData['ma_sl']];
			//$data = $this->db->select($this->tableName, $selectColumns, $where);
			if(!empty($data)) {
				//$rsData['message'] = "Mã sản lượng [". $itemData['ma_sl'] ."] đã tồn tại: ";
				//echo json_encode($rsData);exit;
			}
			$result = $this->db->insert($this->tableName, $itemData);
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$rsData['message'] = 'Đã thêm sản lượng mới thành công!';
				$data = $this->db->select($this->tableName, $selectColumns);
				$rsData['data'] = $data[0];
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu! Có thể do bạn cập nhật trùng mã DH: ' . $ma_sl;
			}
		} else {
			//update data base on $id
			$date = new \DateTime();
			$itemData = [
				'ma_cv' => $ma_cv,
				'ma_sl' => $ma_sl,
				'ma_ns' => $ma_ns,
				'ca' => $ca,
				'timestart' => $timestart,
				'timestop' => $timestop,
				'address' => $address,
				'workday' => $workday,
				'status' => 1,
				'create_on' => $date->format('Y-m-d H:m:s'),
			];
			$result = $this->db->update($this->tableName, $itemData, ['id' => $id]); 
			if($result->rowCount()) {
				$this->superLog('Update SL', $itemData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu! Có thể do bạn cập nhật trùng mã DH: ' . $ma_sl;
			}
			
		}
		echo json_encode($rsData);
	}
	private function findSanluong($filters) {
		//echo "<pre>";
		//print_r($filters);
		$where = "";
		//Tim theo mã nhân sự
		if(isset($filters['ma_ns']) && !empty($filters['ma_ns'])) {
			$where .= " AND `lotus_nhansu`.`ma_ns` IN ('" . implode("', '", $filters['ma_ns']) . "')";
		}
		//Tim theo mã công việc
		if(isset($filters['ma_cv']) && !empty($filters['ma_cv'])) {
			$where .= " AND `lotus_congviec`.`ma_cv` IN ('" . implode("', '", $filters['ma_cv']) . "')";
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
		$where .= " AND `status` = 1";
		//$sql = "SELECT `lotus_sanluong`.`id`,`san_pham_theo_phieu`.`id` AS `key`,`san_pham_theo_phieu`.`ma_phieu`,`san_pham_theo_phieu`.`product_id`,`san_pham_theo_phieu`.`ma_lo`,`san_pham_theo_phieu`.`label`,`san_pham_theo_phieu`.`unit`,`san_pham_theo_phieu`.`price`,`san_pham_theo_phieu`.`sl_chungtu`,`san_pham_theo_phieu`.`sl_thucnhap`,`san_pham_theo_phieu`.`qc_check`,`san_pham_theo_phieu`.`qa_check`,`san_pham_theo_phieu`.`vi_tri_kho`,`san_pham_theo_phieu`.`ngay_san_xuat`,`san_pham_theo_phieu`.`ngay_het_han`,`phieu_nhap_xuat_kho`.`ma_kho` AS `kho_id`,`lotus_kho`.`ma_kho` FROM `san_pham_theo_phieu` LEFT JOIN `phieu_nhap_xuat_kho` ON `san_pham_theo_phieu`.`ma_phieu` = `phieu_nhap_xuat_kho`.`ma_phieu` LEFT JOIN `lotus_kho` ON `phieu_nhap_xuat_kho`.`ma_kho` = `lotus_kho`.`id` WHERE `san_pham_theo_phieu`.`status` = 1 AND `phieu_nhap_xuat_kho`.`status` = 1 ". $where ." ORDER BY `san_pham_theo_phieu`.`id` DESC";
		$sql = "SECECT * ,`lotus_sanluong`.`id` AS `key` FROM `lotus_sanluong` WHERE = $where ORDER BY id";
		$collection = $this->db->query($sql)->fetchAll(\PDO::FETCH_ASSOC);
		return $collection;
	}
	public function search($request, $response) {
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Không tìm thấy vật tư nào theo điều kiện tìm kiếm!'
		);
		$params = $request->getParams();
		$collection = $this->findSanluong($params);
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['data'] = $collection;
			$rsData['message'] = "Tìm thấy " . count($collection) . " dữ liệu sản lượng!";
		} else {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['data'] = [];
		}
		echo json_encode($rsData);
	}
	public function deleteSl($request, $response, $args){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Dữ liệu chưa được xoá thành công!'
		);
		// Get params and validate them here.
		$id = isset(	$args['id']) ? $args['id'] : '';
		if($id != "") {
			$result = $this->db->update($this->tableName,['status' => 0], ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Delete SL', $id);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Đã xoá sản lượng khỏi hệ thống!';
				$rsData['data'] = $id;
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
	}
}
