<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
//use \Ramsey\Uuid\Uuid;

class CateController extends BaseController
{
	private $tableName = 'lotus_cats';
	const ERROR_STATUS = 'error';
	const SUCCESS_STATUS = 'success';
 
	public function fetchCate($request){ 
		//$this->logger->addInfo('Request Npp path');
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu từ hệ thống!'
		);
		// Columns to select.
		$columns = [
				'id',
				'name',
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
	public function updateCate($request, $response)
	{
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		
		// Get params and validate them here.
		//$params = $request->getParams();
		$id = $request->getParam('id');
		$name = $request->getParam('name');
		$address = $request->getParam('description');
		if(!$id) {
			//Insert new data to db
			if(!$name) {
				$rsData['message'] = 'Tên danh mục không được để trống!';
				echo json_encode($rsData);
				die;
			}
			$date = new \DateTime();
			$itemData = [
				'name' => $name,
				'description' => $address,
				'create_on' => $date->format('Y-m-d H:i:s'),
			];
			$result = $this->db->insert($this->tableName, $itemData);
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$rsData['message'] = 'Đã thêm danh mục mới thành công!';
				$rsData['data'] = [
					'id' => $this->db->id()
				];
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu!';
			}
		} else {
			//update data base on $id
			$date = new \DateTime();
			$itemData = [
				'name' => $name,
				'description' => $address,
				'update_on' => $date->format('Y-m-d H:i:s'),
			];
			$result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Update Cate', $itemData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống! Có thể do bạn chưa có thay đổi gì!';
			}
			
		}
		echo json_encode($rsData);
	}

	public function deleteCate($request, $response, $args){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Dữ liệu chưa được xoá thành công!'
		);
		// Get params and validate them here.
		$id = isset(	$args['id']) ? $args['id'] : '';
		if($id != "") {
			$result = $this->db->update($this->tableName,['status' => 0], ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Delete Cate', $id);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Đã xoá danh mục khỏi hệ thống!';
				$rsData['data'] = $id;
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
	}
}
