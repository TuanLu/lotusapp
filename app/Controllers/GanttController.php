<?php 
namespace App\Controllers;
use \Slim\Views\PhpRenderer;
use \App\Helper\Data;
use App\Helper\Roles;
use Ramsey\Uuid\Uuid;
use Firebase\JWT\JWT;
//use Tuupola\Base62;

class GanttController extends BaseController {
  private $tableName = 'gantt_tasks';
  private $linkTable = 'gantt_links';

  public function fetchTasks($request, $response, $args){
    //$this->logger->addInfo('Request Npp path');
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu từ hệ thống!'
    );
    $quyTrinhId = isset(	$args['quy_trinh_id']) ? $args['quy_trinh_id'] : '';
    if($quyTrinhId == "") {
      $rsData['message'] = 'Không tìm thấy mã quy trình!';
      echo json_encode($rsData);
      die;
    };
		// Columns to select.
		$columns = [
				'id',
				'text',
        'start_date',
				'duration',
        'status',
        'progress',
        'parent',
        'quy_trinh_id',
		];
		$collection = $this->db->select($this->tableName, $columns, [
			"ORDER" => ["start_date" => "ASC"],
      "status" => 1,
      "quy_trinh_id" => $quyTrinhId
		]);
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
      $rsData['message'] = 'Dữ liệu đã được load!';
      //Load links 
      $links = $this->db->select($this->linkTable, ['id', 'source', 'target', 'type'], [
				"status" => 1,
				"quy_trinh_id" => $quyTrinhId
			]);
			$rsData['data'] = array(
        'data' => $collection,
        'links' => $links
      );
		}
		echo json_encode($rsData);
	}
	public function fetchTasksByMaSx($request, $response, $args){
    //$this->logger->addInfo('Request Npp path');
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu từ hệ thống!'
    );
    $maSx = isset(	$args['ma_sx']) ? $args['ma_sx'] : '';
    if($maSx == "") {
      $rsData['message'] = 'Không tìm thấy mã sản xuất!';
      echo json_encode($rsData);
      die;
    };
		// Columns to select.
		$columns = [
				'id',
				'text',
        'start_date',
				'duration',
        'status',
        'progress',
        'parent',
        'ma_sx',
		];
		$collection = $this->db->select($this->tableName, $columns, [
			"ORDER" => ["start_date" => "ASC"],
      "status" => 1,
      "ma_sx" => $maSx
		]);
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
      $rsData['message'] = 'Dữ liệu đã được load!';
      //Load links 
      $links = $this->db->select($this->linkTable, ['id', 'source', 'target', 'type'], [
				"status" => 1,
				"ma_sx" => $maSx
			]);
			$rsData['data'] = array(
        'data' => $collection,
        'links' => $links
      );
		}
		echo json_encode($rsData);
  }
  public function update($request, $response){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		// Get params and validate them here.
		//$params = $request->getParams();
		$id = $request->getParam('id');
		$text = $request->getParam('text');
		$start_date = $request->getParam('start_date');
		$duration = $request->getParam('duration');
    $progress = $request->getParam('progress');
    $sortorder = $request->getParam('sortorder');
    $parent = $request->getParam('parent');
		$quyTrinhId = $request->getParam('quy_trinh_id');
		$maSx = $request->getParam('ma_sx');
    $date = new \DateTime();
    $createOn = $date->format('Y-m-d H:i:s');
    $userId = isset($this->jwt->id) ? $this->jwt->id : '';
    $itemData = [
      'text' => $text,
      'duration' => $duration,
      'start_date' => $start_date,
			'quy_trinh_id' => $quyTrinhId,
			'ma_sx' => $maSx,
			'progress' => $progress,
			'parent' => $parent
    ];
		if(!$id) {
			//Insert new data to db
			if(!$text) {
				$rsData['message'] = 'Tên công việc trống!';
				echo json_encode($rsData);
				die;
			}
			if(!$start_date) {
				$rsData['message'] = 'Ngày bắt đầu công việc trống';
				echo json_encode($rsData);
				die;
      }
      if(!$duration) {
				$rsData['message'] = 'Thời gian thực hiện công việc trống';
				echo json_encode($rsData);
				die;
			}
      
      //Create new uuid
      $uuid1 = Uuid::uuid1();
      $uuid = $uuid1->toString();
      $itemData['id'] = $uuid;
      $itemData['create_by'] = $userId;
      $itemData['create_on'] = $createOn;
			$result = $this->db->insert($this->tableName, $itemData);
			$selectColumns = ['id','text'];
			$where = ['id' => $itemData['id']];
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$rsData['message'] = 'Đã thêm công việc thành công!';
				$data = $this->db->select($this->tableName, $selectColumns, $where);
				$rsData['data'] = $data[0];
			} else {
        // $error = $result->errorInfo();
        // echo "<pre>";
        // print_r($error);
        $rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu!';
			}
		} else {
			//update data base on $id
			$date = new \DateTime();
			$itemData['update_on'] = $createOn;
      
			$result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
			if($result->rowCount()) {
        $this->superLog('Update Quy trinh', $itemData);
        $data = $this->db->select($this->tableName, 
        [
          'text',
          'duration',
          'start_date',
					'parent',
					'progress',
          'status',
        ], 
        ['id' => $id]);
				$rsData['data'] = $data[0];
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống!';
			}
			
		}
		echo json_encode($rsData);
	}
	public function updateLink($request, $response){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		// Get params and validate them here.
		//$params = $request->getParams();
		$id = $request->getParam('id');
		$source = $request->getParam('source');
		$target = $request->getParam('target');
		$type = $request->getParam('type');
		$quyTrinhId = $request->getParam('quy_trinh_id');
		$maSx = $request->getParam('ma_sx');
    
    $date = new \DateTime();
    $createOn = $date->format('Y-m-d H:i:s');
    $userId = isset($this->jwt->id) ? $this->jwt->id : '';
    $itemData = [
      'source' => $source,
      'target' => $target,
			'type' => $type,
			'quy_trinh_id' => $quyTrinhId,
			'ma_sx' => $maSx
			
		];
		//Kiem tra lien ket da ton tai hay chua
		$existLink = $this->db->select($this->linkTable, ['id', 'source', 'target'], [
			"source" => $itemData["source"],
			"target" => $itemData["target"],
		]);
		if(empty($existLink)) {
			//Insert new data to db
			if(!$source) {
				$rsData['message'] = 'Thiếu công việc bắt đầu!';
				echo json_encode($rsData);
				die;
			}
			if(!$target) {
				$rsData['message'] = 'Thiếu công việc kết thúc';
				echo json_encode($rsData);
				die;
      }
      $itemData['create_by'] = $userId;
      $itemData['create_on'] = $createOn;
			$result = $this->db->insert($this->linkTable, $itemData);
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$rsData['message'] = 'Đã thêm liên kết thành công!';
			} else {
        // $error = $result->errorInfo();
        // echo "<pre>";
        // print_r($error);
        $rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu!';
			}
		} else {
			//update data base on $id
			$date = new \DateTime();
			$itemData['update_on'] = $createOn;
			//Active link between source and target
			$itemData['status'] = 1;
      
			$result = $this->db->update($this->linkTable, $itemData, [
				'source' => $itemData['source'],
				'target' => $itemData["target"]
			]);
			if($result->rowCount()) {
        $this->superLog('Update Link', $itemData);
        $data = $this->db->select($this->linkTable, 
        [
          'source',
          'target',
          'type',
        ], 
        [
					'source' => $itemData['source'],
					'target' => $itemData["target"]
				]);
				$rsData['data'] = $data[0];
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
			$result = $this->db->update($this->tableName,['status' => 2], ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Delete Task', $id);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Đã xoá công việc khỏi hệ thống!';
				$rsData['data'] = $id;
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
	}
	public function deleteLink($request, $response, $args){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Dữ liệu chưa được xoá thành công!'
		);
		// Get params and validate them here.
		$id = isset(	$args['id']) ? $args['id'] : '';
		if($id != "") {
			$result = $this->db->update($this->linkTable,['status' => 2], ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Delete Link', $id);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Đã xoá liên kết thành công!';
				$rsData['data'] = $id;
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
	}
	public function getAllPlanData($request, $response) {
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có quy trình nào trong kế hoạch dài hạn!'
		);
		$sql = "SELECT quy_trinh_id, MIN(start_date) as start_date, MAX(DATE_ADD(gantt_tasks.start_date, INTERVAL gantt_tasks.duration DAY)) as end_date,DATEDIFF( MAX(DATE_ADD(gantt_tasks.start_date, INTERVAL gantt_tasks.duration DAY)), MIN(start_date)) as duration, quy_trinh_san_xuat.name as text, progress FROM gantt_tasks, quy_trinh_san_xuat WHERE quy_trinh_san_xuat.id = gantt_tasks.quy_trinh_id GROUP BY quy_trinh_id ORDER BY start_date";
		$collection = $this->db->query($sql)->fetchAll(\PDO::FETCH_ASSOC);
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['message'] = 'Đã load được các quy trình!';
			$rsData['data'] = array(
				'data' => $collection,
				'links' => []
			);
		}
		echo json_encode($rsData);
	}
}