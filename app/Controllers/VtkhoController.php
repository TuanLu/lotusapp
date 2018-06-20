<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
//use \Ramsey\Uuid\Uuid;

class VtkhoController extends BaseController
{
	private $tableName = 'lotus_vitrikho';
	const ERROR_STATUS = 'error';
	const SUCCESS_STATUS = 'success';
 
	public function fetchVtkho($request){ 
		//$this->logger->addInfo('Request Npp path');
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu từ hệ thống!'
		);
		// Columns to select.
		$columns = [
				'id',
				'ma_kho',
				'name',
				'description',
				'status'
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
	public function updateVtkho($request, $response)
	{
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		
		// Get params and validate them here.
		//$params = $request->getParams();
		$id = $request->getParam('id');
		//die($id);
		$maKho = $request->getParam('ma_kho');
		$name = $request->getParam('name');
		$address = $request->getParam('description');
		if(!$id) {
			//Insert new data to db
			if(!$maKho) {
				$rsData['message'] = 'Mã kho không được để trống!';
				echo json_encode($rsData);
				die;
			}
			if(!$name) {
				$rsData['message'] = 'Tên kho không được để trống!';
				echo json_encode($rsData);
				die;
			}
			$date = new \DateTime();
			$itemData = [
				'ma_kho' => $maKho,
				'name' => $name,
				'description' => $address,
				'create_on' => $date->format('Y-m-d H:i:s'),
				'status' => 1
			];
			$selectColumns = ['id', 'ma_kho' , 'name'];
			$where = ['ma_kho' => $itemData['ma_kho'], 'name' => $itemData['name'] ];
			$data = $this->db->select($this->tableName, $selectColumns, $where);
			if(!empty($data)) { //echo count($data); 
				$rsData['message'] = "Vị trí [". $itemData['name'] ."] đã tồn tại trong kho ";
				echo json_encode(	$rsData);die;
			}

			$result = $this->db->insert($this->tableName, $itemData);
			
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$rsData['message'] = 'Đã thêm vị trí kho mới thành công!';
				$data = $this->db->select($this->tableName, $selectColumns, $where);
				$rsData['data'] = $data[0];
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu! Có thể do bạn cập nhật mã kho đã tồn tại: ' . $maKho;
			}
		} else {
			//update data base on $id
			$date = new \DateTime();
			$itemData = [
				'id' => $id,
				'ma_kho' => $maKho,
				'name' => $name,
				'description' => $address,
				'update_on' => $date->format('Y-m-d H:i:s'),
			];
			$selectColumns = ['id', 'ma_kho' , 'name'];
			$where = ['ma_kho' => $itemData['ma_kho'], 'name' => $itemData['name'] ];
			$data = $this->db->select($this->tableName, $selectColumns, $where);
			if(!empty($data)) { //echo count($data); 
				$rsData['message'] = "Vị trí [". $itemData['name'] ."] đã tồn tại trong kho ";
				echo json_encode(	$rsData);die;
			}
			$result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Update vị trí Kho', $itemData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống! Có thể do bạn cập nhật mã kho đã tồn tại: ' . $maKho;
			}
			
		}
		echo json_encode($rsData);
	}

	public function deleteVtkho($request, $response, $args){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Dữ liệu chưa được xoá thành công!'
		);
		// Get params and validate them here.
		$id = isset(	$args['id']) ? $args['id'] : '';
		if($id != "") {
			$result = $this->db->update($this->tableName,['status' => 0], ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Delete Kho', $id);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Đã xoá vị trí kho khỏi hệ thống!';
				$rsData['data'] = $id;
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
	}
}
