<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
//use \Ramsey\Uuid\Uuid;

class JobsController extends BaseController
{
	private $tableName = 'lotus_congviec';
	const ERROR_STATUS = 'error';
	const SUCCESS_STATUS = 'success';
 
	public function fetchJob($request){ 
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu từ hệ thống!'
		);
		// Columns to select.
		$columns = [
				'id',
				'ma_cv',
				'diengiai',
				'heso',
				'adress',
				'description'
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
	public function updateJob($request, $response)
	{
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		
		// Get params and validate them here.
		//$params = $request->getParams();
		$id = $request->getParam('id');
		//die($id);
		$maNs = $request->getParam('ma_cv');
		$name = $request->getParam('diengiai');
		$phone = $request->getParam('heso');
		$adress = $request->getParam('adress');
		$address = $request->getParam('description');
		if(!$id) {
			//Insert new data to db
			if(!$maNs) {
				$rsData['message'] = 'Mã công việc không được để trống!';
				echo json_encode($rsData);
				die;
			}
			if(!$name) {
				$rsData['message'] = 'Tên công việc không được để trống!';
				echo json_encode($rsData);
				die;
			}
			$date = new \DateTime();
			$itemData = [
				'ma_cv' => $maNs,
				'diengiai' => $name,
				'heso' => $phone,
				'adress' => $adress,
				'description' => $address,
				'create_on' => $date->format('Y-m-d H:i:s'),
			];
			$selectColumns = ['id', 'ma_cv'];
			$where = ['ma_cv' => $itemData['ma_cv']];
			$data = $this->db->select($this->tableName, $selectColumns, $where);
			if(!empty($data)) {
				$rsData['message'] = "Mã công việc [". $itemData['ma_cv'] ."] đã tồn tại: ";
				echo json_encode($rsData);exit;
			}
			$result = $this->db->insert($this->tableName, $itemData);
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$rsData['message'] = 'Đã thêm công việc mới thành công!';
				$data = $this->db->select($this->tableName, $selectColumns, $where);
				$rsData['data'] = $data[0];
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu! Có thể do bạn cập nhật trùng mã KH: ' . $maNs;
			}
		} else {
			//update data base on $id
			$date = new \DateTime();
			$itemData = [
				'ma_cv' => $maNs,
				'diengiai' => $name,
				'heso' => $phone,
				'adress' => $adress,
				'description' => $address,
				'update_on' => $date->format('Y-m-d H:i:s'),
			];
			$result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Update KH', $itemData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu! Có thể do bạn cập nhật trùng mã KH: ' . $maNs;
			}
			
		}
		echo json_encode($rsData);
	}

	public function deleteJob($request, $response, $args){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Dữ liệu chưa được xoá thành công!'
		);
		// Get params and validate them here.
		$id = isset(	$args['id']) ? $args['id'] : '';
		if($id != "") {
			$result = $this->db->update($this->tableName,['status' => 0], ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Delete KH', $id);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Đã xoá công việc khỏi hệ thống!';
				$rsData['data'] = $id;
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
	}
}
