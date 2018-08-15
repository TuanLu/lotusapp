<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
//use \Ramsey\Uuid\Uuid;

class KhoController extends BaseController
{
	private $tableName = 'lotus_kho';
	const ERROR_STATUS = 'error';
	const SUCCESS_STATUS = 'success';

	protected function getInventories($maKho = "") {
		// Columns to select.
		$columns = [
			'lotus_kho.id',
			'lotus_kho.ma_kho',
			'lotus_kho.name',
			//'quanly',
			'lotus_kho.description',
			'users.name(quanly)',
		];
		$where = [
			"ORDER" => ["id" => "DESC"],
			"lotus_kho.status" => 1
		];
		if($maKho) {
			$where["lotus_kho.ma_kho"] = $maKho;
		}
		$collection = $this->db->select($this->tableName,
		[
			"[>]users" => ["quanly" => "id"],
		], $columns, $where);
		return $collection;
	}
 
	public function fetchKho($request){
		//$this->logger->addInfo('Request Npp path');
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu từ hệ thống!'
		);
		// Columns to select.
		
		$collection = $this->getInventories();
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['message'] = 'Dữ liệu đã được load!';
			$rsData['data'] = $collection;
		}
		echo json_encode($rsData);
	}
	public function fetchQl(){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu users từ hệ thống!'
		);
		$sql = "SELECT `id`,`username`,`email`,`name`, `router_name` FROM `users` LEFT JOIN `user_permission` ON `user_permission`.`user_id` = `users`.`id` AND user_permission.router_name LIKE '%lotus_kho__edit' WHERE `status` = 1 AND `user_permission`.router_name IS NOT NULL";
		$collection = $this->db->query($sql)->fetchAll(\PDO::FETCH_ASSOC);
		//echo '<pre>'; print_r($collection);
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['message'] = 'Dữ liệu đã được load!';
			$rsData['data'] = $collection;
		}
		echo json_encode($rsData);
	}
	public function updateKho($request, $response)
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
		$quanly = $request->getParam('quanly');
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
				'quanly' => $quanly,
				'description' => $address,
				'create_on' => $date->format('Y-m-d H:i:s'),
			];
			$selectColumns = ['id', 'ma_kho'];
			$where = ['ma_kho' => $itemData['ma_kho']];
			$data = $this->db->select($this->tableName, $selectColumns, $where);
			if(!empty($data)) {
				$rsData['message'] = "Mã kho [". $itemData['ma_kho'] ."] đã tồn tại: ";
				echo json_encode(	$rsData);die;
			}

			$result = $this->db->insert($this->tableName, $itemData);
			
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$rsData['message'] = 'Đã thêm kho mới thành công!';
				$data = $this->getInventories($maKho);
				$rsData['data'] = $data[0];
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu! Có thể do bạn cập nhật mã kho đã tồn tại: ' . $maKho;
			}
		} else {
			//update data base on $id
			$date = new \DateTime();
			$itemData = [
				'ma_kho' => $maKho,
				'name' => $name,
				'quanly' => $quanly,
				'description' => $address,
				'update_on' => $date->format('Y-m-d H:i:s'),
			];
			$result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Update Kho', $itemData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
				$data = $this->getInventories($maKho);
				$rsData['data'] = $data[0];
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống! Có thể do bạn cập nhật mã kho đã tồn tại: ' . $maKho;
			}
			
		}
		echo json_encode($rsData);
	}

	public function deleteKho($request, $response, $args){
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
				$rsData['message'] = 'Đã xoá kho khỏi hệ thống!';
				$rsData['data'] = $id;
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
	}
}
