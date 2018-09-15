<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
//use \Ramsey\Uuid\Uuid;

class OptionsController extends BaseController
{
	private $tableName = 'lotus_options';
	const ERROR_STATUS = 'error';
	const SUCCESS_STATUS = 'success';

	private function getAllOpts(){
		// Columns to select.\
		$userId = isset($this->jwt->id) ? $this->jwt->id : '';
		$columns = [
				'id',
				'ma_opt',
				'defaultconfig',
				'config',
				'userid',
				'create_by',
				'create_on',
				'status'
		];
		$collection = $this->db->select($this->tableName, $columns, [
			"ORDER" => ["id" => "DESC"],
			"status" => 1,
			'userid' => ["48a3de74-69f4-11e8-8eb5-acbc32834b7d"]
		]);
		$collection_user = $this->db->select($this->tableName, $columns, [
			"ORDER" => ["id" => "DESC"],
			"status" => 1,
			'userid' => $userId
		]);
		$new_collect = [];
		if(!empty($collection_user)){
			foreach($collection as $collect) {
				foreach($collection_user as $userkey) {
					if($collect['ma_opt'] == $userkey['ma_opt']) {
						$collect = $userkey; 
					}
				}
				$new_collect[] = $collect;
			}
		}	
		return $new_collect;
	}
	public function fetchOpts($request){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu cấu hình từ hệ thống!'
		);
		$collection = $this->getAllOpts();
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['message'] = 'Dữ liệu đã được load!';
			$rsData['data'] = $collection;
		}
		echo json_encode($rsData);
	}
	public function updateOpts($request, $response)
	{
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		// Get params and validate them here.
		$id = $request->getParam('id');
		$ma_opt = $request->getParam('ma_opt');
		$defaultconfig = $request->getParam('defaultconfig');
		$config = $request->getParam('config');
		$userId = isset($this->jwt->id) ? $this->jwt->id : '';
		if(!$ma_opt) {
			$rsData['message'] = 'Mã cấu hình không được để trống!';
			echo json_encode($rsData);
			die;
		}
		if(!$id) {
			//Insert new data to db
			if(!$ma_opt) {
				$rsData['message'] = 'Tên cấu hình không được để trống!';
				echo json_encode($rsData);
				die;
			}
			$date = new \DateTime();
			$itemData = [
				'ma_opt' => $ma_opt
			];
			$selectColumns = ['id', 'ma_opt'];
			$where = ['ma_opt' => $itemData['ma_opt'],'userid'=>$userId];
			$data = $this->db->select($this->tableName, $selectColumns, $where);
			if(!empty($data)) {
				$rsData['message'] = "Mã cấu hình [". $itemData['ma_opt'] ."] đã tồn tại: ";
				echo json_encode($rsData); exit;
			}
			$itemData = [
				'ma_opt' => $ma_opt,
				'defaultconfig' => $defaultconfig,
				'config' => $config,
				'status' => 1,
				'userid' => $userId,
				'create_on' => $date->format('Y-m-d H:i:s'),
			];
			$result = $this->db->insert($this->tableName, $itemData);
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$rsData['message'] = 'Đã thêm cấu hình mới thành công!';
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
				'ma_opt' => $ma_opt,
				'defaultconfig' => $defaultconfig,
				'config' => $config,
				'status' => 1,
				'userid' => $userId,
				'update_on' => $date->format('Y-m-d H:i:s'),
			];
			$selectColumns = ['id', 'ma_opt', 'userid'];
			$where = ['ma_opt' => $itemData['ma_opt'],'userid'=>$userId];
			$data = $this->db->select($this->tableName, $selectColumns, $where); 
			if(!empty($data)) {
				$result = $this->db->insert($this->tableName, $itemData);
			}else{
				$result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
			}
			if($result->rowCount()) {
				$this->superLog('Update Cate', $itemData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống! Có thể mã cấu hình ['.$ma_opt.'] đã bị trùng';
			}
			
		}
		echo json_encode($rsData);
	}

	public function deleteOpts($request, $response, $args){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Dữ liệu cấu hình chưa được xoá thành công!'
		);
		// Get params and validate them here.
		$id = isset(	$args['id']) ? $args['id'] : '';
		if($id != "") {
			$result = $this->db->update($this->tableName,['status' => 0], ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Delete Cate', $id);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Đã xoá cấu hình khỏi hệ thống!';
				$rsData['data'] = $id;
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
	}
}
