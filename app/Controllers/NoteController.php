<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
//use \Ramsey\Uuid\Uuid;

class NoteController extends BaseController
{
	private $tableName = 'lotus_notes';
	const ERROR_STATUS = 'error';
	const SUCCESS_STATUS = 'success';
 
	public function fetchNote($request){ 
		//$this->logger->addtitles('Request Npp path');
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu thông báo từ hệ thống!'
		);
		// Columns to select.
		$columns = [
				'lotus_notes.id',
				'lotus_notes.note',
				'lotus_notes.titles',
				'lotus_notes.assign_users',
				'lotus_notes.assign_group',
				'lotus_notes.create_by',
				'lotus_notes.create_on',
				'lotus_notes.status',
				'users.name'
		];
		$collection = $this->db->select($this->tableName, [
			"[>]users" => ["create_by" => "id"],
		], $columns, [
			"ORDER" => ["lotus_notes.id" => "DESC"],
			"lotus_notes.status" => 1
		]);
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['message'] = 'Dữ liệu đã được load!';
			$rsData['data'] = $collection;
		}
		echo json_encode($rsData);
	}
	public function updateNote($request, $response)
	{
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		
		// Get params and validate them here.
		$id = $request->getParam('id');
		$note = $request->getParam('note');
		$titles = $request->getParam('titles') | "";
		$assign_group = $request->getParam('assign_group');
		$assign_users = $request->getParam('assign_users');
		if(is_array($assign_group)) {
      $assign_group = implode(',', $assign_group);
		}else{
			$assign_group = '';
		}
		if(is_array($assign_users)) {
      $assign_users = implode(',', $assign_users);
		}else{
			$assign_users = '';
		}
		$userId = isset($this->jwt->id) ? $this->jwt->id : '';
		$date = new \DateTime();
		$today = $date->format('Y-m-d H:i:s');
		$itemData = [
			'note' => $note,
			'titles' => $titles,
			'assign_users' => $assign_users,
			'assign_group' => $assign_group,
			'status' => 1
		];
		if(!$id) {
			//Insert new data to db
			if(!$note) {
				$rsData['message'] = 'Thông báo không được để trống!';
				echo json_encode($rsData);
				die;
			}
			$itemData['create_on'] = $today;
			$itemData['create_by'] = $userId;
			$result = $this->db->insert($this->tableName, $itemData);
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$rsData['message'] = 'Đã thêm thông báo mới thành công!';
				$rsData['data'] = [
					'id' => $this->db->id()
				];
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu!';
			}
		} else {
			//update data base on $id
			$itemData['update_on'] = $today;
			$itemData['update_by'] = $userId;
			$result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Update Notes ', $itemData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống! Có thể do bạn chưa có thay đổi gì!';
			}
			
		}
		echo json_encode($rsData);
	}

	public function deleteNote($request, $response, $args){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Dữ liệu thông báo chưa được xoá thành công!'
		);
		// Get params and validate them here.
		$id = isset(	$args['id']) ? $args['id'] : '';
		if($id != "") {
			$result = $this->db->update($this->tableName,['status' => 0], ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Delete Cate', $id);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Đã xoá thông báo khỏi hệ thống!';
				$rsData['data'] = $id;
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
	}
}
