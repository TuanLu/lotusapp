<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
//use \Ramsey\Uuid\Uuid;

class LanguageController extends BaseController
{
	private $tableName = 'lotus_language';
	const ERROR_STATUS = 'error';
	const SUCCESS_STATUS = 'success';

	private function getAllLang(){
		// Columns to select.
		$columns = [
				'id',
				'ma_text',
				'vi',
				'en',
				'status'
		];
		$collection = $this->db->select($this->tableName, $columns, [
			"ORDER" => ["id" => "DESC"],
			"status" => 1
		]);
		return $collection;
	}
	public function fetchLang($request){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu ngôn ngữ từ hệ thống!'
		);
		$collection = $this->getAllLang();
		$languages = [];
		$defaultLang = "vi";
		foreach($collection as $key => $word) {
			$languages[$word['ma_text']] = $word[$defaultLang];
		}
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['message'] = 'Dữ liệu đã được load!';
			$rsData['data'] = $languages;
		}
		echo json_encode($rsData);
	}
	public function fetchListLang($request){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu ngôn ngữ từ hệ thống!'
		);
		$collection = $this->getAllLang();
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['message'] = 'Dữ liệu đã được load!';
			$rsData['data'] = $collection;
		}
		echo json_encode($rsData);
	}
	public function updateLang($request, $response)
	{
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		// Get params and validate them here.
		$id = $request->getParam('id');
		$ma_text = $request->getParam('ma_text');
		$vi = $request->getParam('vi');
		$en = $request->getParam('en');
		if(!$ma_text) {
			$rsData['message'] = 'Mã ngôn ngữ không được để trống!';
			echo json_encode($rsData);
			die;
		}
		if(!$id) {
			//Insert new data to db
			if(!$ma_text) {
				$rsData['message'] = 'Tên ngôn ngữ không được để trống!';
				echo json_encode($rsData);
				die;
			}
			$date = new \DateTime();
			$itemData = [
				'ma_text' => $ma_text
			];
			$selectColumns = ['id', 'ma_text'];
			$where = ['ma_text' => $itemData['ma_text']];
			$data = $this->db->select($this->tableName, $selectColumns, $where);
			if(!empty($data)) {
				$rsData['message'] = "Mã language [". $itemData['ma_text'] ."] đã tồn tại: ";
				echo json_encode($rsData); exit;
			}
			$itemData = [
				'ma_text' => $ma_text,
				'vi' => $vi,
				'en' => $en,
				'status' => 1,
				'create_on' => $date->format('Y-m-d H:i:s'),
			];
			$result = $this->db->insert($this->tableName, $itemData);
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$rsData['message'] = 'Đã thêm ngôn ngữ mới thành công!';
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
				'ma_text' => $ma_text,
				'vi' => $vi,
				'en' => $en,
				'status' => 1,
				'update_on' => $date->format('Y-m-d H:i:s'),
			];
			$result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Update Cate', $itemData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống! Có thể mã ngôn ngữ ['.$ma_text.'] đã bị trùng';
			}
			
		}
		echo json_encode($rsData);
	}

	public function deleteLang($request, $response, $args){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Dữ liệu ngôn ngữ chưa được xoá thành công!'
		);
		// Get params and validate them here.
		$id = isset(	$args['id']) ? $args['id'] : '';
		if($id != "") {
			$result = $this->db->update($this->tableName,['status' => 0], ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Delete Cate', $id);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Đã xoá ngôn ngữ khỏi hệ thống!';
				$rsData['data'] = $id;
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
	}
}
