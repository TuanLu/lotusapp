<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
//use \Ramsey\Uuid\Uuid;

class PhanquyenController extends BaseController
{
	private $tableName = 'lotus_roles';
 
	public function fetch($request){
		//$this->logger->addInfo('Request Npp path');
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu từ hệ thống!'
		);
		// Columns to select.
		$columns = [
				'id',
				'user_id',
				'ma_role',
				'role_add',
				'role_edit',
				'role_view',
				'role_delete',
				'create_by',
				'status'
		];
		$collection = $this->db->select($this->tableName, $columns, [
			"status" => 1
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
		//$params = $request->getParams();
		$id = $request->getParam('id');
		$maSP = $request->getParam('product_id');
		$cateId = $request->getParam('category_id');
		$name = $request->getParam('name');
		//$price = $request->getParam('price');
		$unit = $request->getParam('unit');
		$min = $request->getParam('min');
		$max = $request->getParam('max');
		if(!$id) {
			//Insert new data to db
			if(!$maSP) {
				$rsData['message'] = 'Mã sản phẩm không được để trống!';
				echo json_encode($rsData);
				die;
			}
			if(!$name) {
				$rsData['message'] = 'Tên sản phẩm không được để trống!';
				echo json_encode($rsData);
				die;
			}
			$date = new \DateTime();
			$itemData = [
				'product_id' => $maSP,
				'category_id' => $cateId,
				'name' => $name,
				//'price' => $price,
				'unit' => $unit,
				'min' => $min,
				'max' => $max,
				'create_on' => $date->format('Y-m-d H:i:s'),
			];
			//Kiểm tra sản phẩm đã tồn tại chưa 
			$selectColumns = ['id', 'product_id'];
			$where = ['product_id' => $itemData['product_id']];
			$data = $this->db->select($this->tableName, $selectColumns, $where);
			if(!empty($data)) {
				$rsData['message'] = "Mã VT [". $itemData['product_id'] ."] đã tồn tại: ";
				echo json_encode($rsData);exit;
			}
			$result = $this->db->insert($this->tableName, $itemData);
			
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$rsData['message'] = 'Đã thêm sản phẩm mới thành công!';
				$data = $this->db->select($this->tableName, $selectColumns, $where);
				$rsData['data'] = $data[0];
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu!';
			}
		} else {
			//update data base on $id
			$date = new \DateTime();
			$itemData = [
				'product_id' => $maSP,
				'category_id' => $cateId,
				'name' => $name,
				//'price' => $price,
				'unit' => $unit,
				'min' => $min,
				'max' => $max,
				'update_on' => $date->format('Y-m-d H:i:s'),
			];
			$result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Update Sản phẩm', $itemData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống! Có thể do bị trùng Mã sản phẩm!';
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
			$data = $this->db->select($this->tableName, ['id', 'product_id'], ['id' => $id]);
			if(!empty($data)) {
				$result = $this->db->update($this->tableName,[
					'status' => 2,
					'product_id' => $data[0]['product_id'] . '_' . microtime()
				], ['id' => $id]);
				if($result->rowCount()) {
					$this->superLog('Delete NPP', $id);
					$rsData['status'] = self::SUCCESS_STATUS;
					$rsData['message'] = 'Đã xoá sản phẩm khỏi hệ thống!';
					$rsData['data'] = $id;
				}
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
	}
}
