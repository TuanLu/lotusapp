<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
use \Ramsey\Uuid\Uuid;

class QuytrinhSxController extends BaseController
{
	private $tableName = 'quy_trinh_san_xuat';
	private $userTable = 'users';

	private function getColumns() {
		$columns = [
			'quy_trinh_san_xuat.id',
			'quy_trinh_san_xuat.name',
			'quy_trinh_san_xuat.note',
			'quy_trinh_san_xuat.tinh_trang',
			'quy_trinh_san_xuat.create_by',
			'users.username',
			'users.name',
			'create_on' => Medoo::raw("DATE_FORMAT( `quy_trinh_san_xuat`.`create_on`, '%d/%m/%Y' )")
		];
		return $columns;
	}
 
	public function fetch($request){
		//$this->logger->addInfo('Request Npp path');
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu từ hệ thống!'
		);
		// Columns to select.
		$columns = $this->getColumns();
		//echo "<pre>";
		//print_r($columns);die;
		$collection = $this->db->select($this->tableName,[
			"[>]{$this->userTable}" => ["create_by" => "id"],
		] ,$columns, [
			"{$this->tableName}.status" => 1,
			"ORDER" => ["id" => "DESC"],
		]);
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['message'] = 'Dữ liệu đã được load!';
			$rsData['data'] = $collection;
		}
		header("Content-Type: application/json");
    echo json_encode($rsData, JSON_UNESCAPED_UNICODE);
    exit;
	}

	public function update($request, $response)
	{
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		// Get params and validate them here.
		$params = $request->getParams();
		$id = isset($params['id']) ? $params['id']  : '';
		//Some validation 
		if(isset($params['name']) && $params['name'] == '') {
			$rsData['message'] = 'Không có tên quy trình!';
				echo json_encode($rsData);
				die;
		}
		$userId = isset($this->jwt->id) ? $this->jwt->id : '';
		$date = new \DateTime();
		$createOn = $date->format('Y-m-d H:i:s');
		$itemData = array(
			'name' => isset($params['name']) ? $params['name'] : '',
			'create_on' => $createOn,
			'create_by' => $userId,
			'note' => isset($params['note']) ? $params['note'] : '',
		);
		if(!$id) {
			$result = $this->db->insert($this->tableName, $itemData);
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$rsData['message'] = 'Đã thêm quy trình thành công!';
			} else {
				// $error = $result->errorInfo();
				// $errorMessage = 'Không thể tạo phiếu nhập vào CSDL';
				// if(is_array($error) && !empty($error)) {
				// 	$errorMessage = implode(', ',$error);
				// }
				$rsData['message'] = 'Không thể tạo phiếu nhập vào CSDL';
			}
		} else {
			$result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Update quy trình', $itemData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống!';
			}
		}
		echo json_encode($rsData);
	}
	public function delete($request, $response, $args){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Dữ liệu chưa được xoá thành công!'
		);
		// Get params and validate them here.
		$id = isset(	$args['id']) ? $args['id'] : '';
		if($id != "") {
			$result = $this->db->update($this->tableName,[
				'status' => 2,
			], ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Delete Ma Phieu', $id);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Đã xoá phiếu khỏi hệ thống!';
				$rsData['data'] = $id;
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
	}
}
