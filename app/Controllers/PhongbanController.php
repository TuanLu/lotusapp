<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
//use \Ramsey\Uuid\Uuid;

class PhongBanController extends BaseController
{
	private $tableName = 'lotus_phongban';
	const ERROR_STATUS = 'error';
	const SUCCESS_STATUS = 'success';
 
	public function fetchPb($request){ 
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu từ hệ thống!'
		);
		// Columns to select.
		$columns = [
				'id',
				'ma_pb',
				'name',
				'phone',
				'address',
				'description',
				'roles'
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
	public function updatePb($request, $response)
	{
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		
		// Get params and validate them here.
		//$params = $request->getParams();
		$id = $request->getParam('id');
		//die($id);
		$maPb = $request->getParam('ma_pb');
		$name = $request->getParam('name');
		$phone = $request->getParam('phone');
		$address = $request->getParam('address');
		$description = $request->getParam('description');
		$roles = $request->getParam('roles');
    if(is_array($roles)) {
      $roles = implode(',', $roles);
		} else {
			$roles = '';
		}
		$date = new \DateTime();
		$createOn = $date->format('Y-m-d H:i:s');
		$itemData = [
			'ma_pb' => $maPb,
			'name' => $name,
			'phone' => $phone,
			'address' => $address,
			'description' => $description,
			'roles' => $roles
		];
		if(!$id) {
			//Insert new data to db
			if(!$maPb) {
				$rsData['message'] = 'Mã phòng ban không được để trống!';
				echo json_encode($rsData);
				die;
			}
			if(!$name) {
				$rsData['message'] = 'Tên phòng ban không được để trống!';
				echo json_encode($rsData);
				die;
			}
			$itemData['create_on'] = $createOn;
			
			$selectColumns = ['id', 'ma_pb'];
			$where = ['ma_pb' => $itemData['ma_pb']];
			$data = $this->db->select($this->tableName, $selectColumns, $where);
			if(!empty($data)) {
				$rsData['message'] = "Mã phòng ban [". $itemData['ma_pb'] ."] đã tồn tại: ";
				echo json_encode($rsData);exit;
			}
			$result = $this->db->insert($this->tableName, $itemData);
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$rsData['message'] = 'Đã thêm phòng ban mới thành công!';
				$data = $this->db->select($this->tableName, $selectColumns, $where);
				$rsData['data'] = $data[0];
			} else {
				// echo "<pre>";
				// print_r($result->errorInfo());
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu!';
			}
		} else {
			//update data base on $id
			$itemData['update_on'] = $createOn;
			$result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Update KH', $itemData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu! Có thể do bạn cập nhật trùng mã KH: ' . $maPb;
			}
			
		}
		echo json_encode($rsData);
	}

	public function deletePb($request, $response, $args){
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
				$rsData['message'] = 'Đã xoá phòng ban khỏi hệ thống!';
				$rsData['data'] = $id;
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
	}
	public function roles() {
		return [
			//array('title' => 'Kí duyệt KHSX', 'value' => 'duyet_khsx'),
			//array('title' => 'Kí duyệt ĐBCL', 'value' => 'duyet_dbcl'),
			//array('title' => 'Giám đốc QLSX', 'value' => 'duyet_gd'),
			array('title' => 'Nhóm Nhân viên', 'value' => 'nhomnv'),
			array('title' => 'Nhóm quản lý kho', 'value' => 'nhom_thu_kho'),
			array('title' => 'Nhóm QA', 'value' => 'nhomqa'),
			array('title' => 'Nhóm QC', 'value' => 'nhomqc'),
		];
	}
	public function fetchGroupRoles() {
    $rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa load được quyền nào!'
    );
    $allRoles = $this->roles();
    $roleList = [];
    foreach ($allRoles as $key => $value) {
      $roleItem = [
        'label' => $value['title'],
        'value' => $value['value'],
        'key' => $value['value'],
      ];
      $roleList[] = $roleItem;
    }
    if(!empty($roleList)) {
      $rsData['status'] = self::SUCCESS_STATUS;
      $rsData['message'] = 'Các chức năng đã load thành công!';
      $rsData['data'] = $roleList;
    }
    echo json_encode($rsData);
  }
}
