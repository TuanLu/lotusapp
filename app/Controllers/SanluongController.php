<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
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
		$ma_sl = $request->getParam('ma_sl');
		$ma_ns = $request->getParam('ma_ns');
		$ma_cv = $request->getParam('ma_cv');
		$ca = $request->getParam('ca');
		$timestart = $request->getParam('timestart');
		$timestop = $request->getParam('timestop');
		$address = $request->getParam('address');
		$workday = $request->getParam('workday');
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
