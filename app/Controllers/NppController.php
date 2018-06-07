<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
//use \Ramsey\Uuid\Uuid;

class NppController extends BaseController
{
	private $tableName = 'nha_phan_phoi';
 
	public function fetchNpp($request){
		//$this->logger->addInfo('Request Npp path');
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu từ hệ thống!'
		);
		// Columns to select.
		$columns = [
				'id',
				'ma_npp',
				'name',
				'address',
				'phone',
				'ranking'
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
	public function updateNpp($request, $response)
	{
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		// Get params and validate them here.
		//$params = $request->getParams();
		$id = $request->getParam('id');
		$maNpp = $request->getParam('ma_npp');
		$name = $request->getParam('name');
		$address = $request->getParam('address');
		$phone = $request->getParam('phone');
		$ranking = $request->getParam('ranking');
		if(!$id) {
			//Insert new data to db
			if(!$maNpp) {
				$rsData['message'] = 'Mã nhà phân phối không được để trống!';
				echo json_encode($rsData);
				die;
			}
			if(!$name) {
				$rsData['message'] = 'Tên nhà phân phối không được để trống!';
				echo json_encode($rsData);
				die;
			}
			$date = new \DateTime();
			$itemData = [
				'ma_npp' => $maNpp,
				'name' => $name,
				'address' => $address,
				'phone' => $phone,
				'ranking' => $ranking,
				'create_on' => $date->format('Y-m-d H:i:s'),
			];
			//Kiểm tra nhà phân phối đã tồn tại chưa 
			$selectColumns = ['id', 'ma_npp'];
			$where = ['ma_npp' => $itemData['ma_npp']];
			$data = $this->db->select($this->tableName, $selectColumns, $where);
			if(!empty($data)) {
				$rsData['message'] = "Mã nhà phân phối [". $itemData['ma_npp'] ."] đã tồn tại: ";
				echo json_encode($rsData);exit;
			}
			$result = $this->db->insert($this->tableName, $itemData);
			
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$rsData['message'] = 'Đã thêm nhà phân phối mới thành công!';
				$data = $this->db->select($this->tableName, $selectColumns, $where);
				$rsData['data'] = $data[0];
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu!';
			}
		} else {
			//update data base on $id
			$date = new \DateTime();
			$itemData = [
				'ma_npp' => $maNpp,
				'name' => $name,
				'address' => $address,
				'phone' => $phone,
				'ranking' => $ranking,
				'update_on' => $date->format('Y-m-d H:i:s'),
			];
			$result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Update NPP', $itemData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống! Có thể do bị trùng mã nhà phân phối!';
			}
			
		}
		echo json_encode($rsData);
	}

	public function deleteNpp($request, $response, $args){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Dữ liệu chưa được xoá thành công!'
		);
		// Get params and validate them here.
		$id = isset(	$args['id']) ? $args['id'] : '';
		if($id != "") {
			$result = $this->db->update($this->tableName,['status' => 2], ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Delete NPP', $id);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Đã xoá nhà phân phối khỏi hệ thống!';
				$rsData['data'] = $id;
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
	}
}
