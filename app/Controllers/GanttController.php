<?php 
namespace App\Controllers;
use \Slim\Views\PhpRenderer;
use \App\Helper\Data;
use App\Helper\Roles;
use Ramsey\Uuid\Uuid;
use Firebase\JWT\JWT;
use \Medoo\Medoo;
//use Tuupola\Base62;

class GanttController extends BaseController {
  private $tableName = 'gantt_tasks';
	private $linkTable = 'gantt_links';
	
	protected function getTasksByQuytrinhId($quyTrinhId) {
		$tasks = [
			'data' => [],
			'links' => []
		];
		if($quyTrinhId) {
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
				'user',
				'check_user',
				'group_user',
				'note',
				'sortorder'
			];
			//Will not filter by group user or user for sample tasks
			$where = [
				"ORDER" => [
					"sortorder" => "ASC",
					"create_on" => "ASC",
				],
				"status" => 1,
				"quy_trinh_id" => $quyTrinhId
			];
			// $userId = isset($this->jwt->id) ? $this->jwt->id : '';
			// $userInfo = $this->UserController->getUserById($userId);
			// //var_dump($userInfo);
			// //Skip if admin
			// $isSuper = $this->UserController->isSuperAdmin($userId);
			// if(!$isSuper) {
			// 	$where["OR"] = [
			// 		"user" => [$userId],
			// 		"group_user" => [$userInfo[0]['group_user']],
			// 		"create_by" => [$userId],
			// 	];
			// }
			
			$collection = $this->db->select($this->tableName, $columns, $where);
			//Get links
      $links = $this->db->select($this->linkTable, ['id', 'source', 'target', 'type'], [
				"status" => 1,
				"quy_trinh_id" => $quyTrinhId
			]);
			if(!empty($collection)) {
				$tasks['data'] = $collection;
			}
			if(!empty($links)) {
				$tasks['links'] = $links;
			}
		}
		return $tasks;
	}
	protected function getTasksByMaSx($maSx) {
		$tasks = [
			'data' => [],
			'links' => []
		];
		if($maSx) {
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
				'user',
				'check_user',
				'group_user',
				'note',
				'sortorder'
			];
			$where = [
				"ORDER" => [
					"sortorder" => "ASC",
					"create_on" => "ASC",
				],
				"status" => 1,
				"ma_sx" => $maSx
			];
			$userId = isset($this->jwt->id) ? $this->jwt->id : '';
			$userInfo = $this->UserController->getUserById($userId);
			//var_dump($userInfo);
			//Skip if admin
			$isSuper = $this->UserController->isSuperAdmin($userId);
			if(!$isSuper) {
				$where["OR"] = [
					"user" => [$userId],
					"group_user" => [$userInfo[0]['group_user'], 'ALL_PB'],
					"create_by" => [$userId],
				];
			}
			
			$collection = $this->db->select($this->tableName, $columns, $where);
			//Get links
      $links = $this->db->select($this->linkTable, ['id', 'source', 'target', 'type'], [
				"status" => 1,
				"ma_sx" => $maSx
			]);
			if(!empty($collection)) {
				$tasks['data'] = $collection;
			}
			if(!empty($links)) {
				$tasks['links'] = $links;
			}
		}
		return $tasks;
	}
	protected function getTasksByMaRnd($maRnd) {
		$tasks = [
			'data' => [],
			'links' => []
		];
		if($maRnd) {
			// Columns to select.
			$columns = [
				'id',
				'text',
				'start_date',
				'duration',
				'status',
				'progress',
				'parent',
				'ma_rnd',
				'user',
				'check_user',
				'group_user',
				'note',
				'sortorder'
			];
			$where = [
				"ORDER" => [
					"sortorder" => "ASC",
					"create_on" => "ASC",
				],
				"status" => 1,
				"ma_rnd" => $maRnd
			];
			$userId = isset($this->jwt->id) ? $this->jwt->id : '';
			$userInfo = $this->UserController->getUserById($userId);
			//var_dump($userInfo);
			//Skip if admin
			$isSuper = $this->UserController->isSuperAdmin($userId);
			if(!$isSuper) {
				$where["OR"] = [
					"user" => [$userId],
					"group_user" => [$userInfo[0]['group_user'], 'ALL_PB'],
					"create_by" => [$userId],
				];
			}
			
			$collection = $this->db->select($this->tableName, $columns, $where);
			//Get links
      $links = $this->db->select($this->linkTable, ['id', 'source', 'target', 'type'], [
				"status" => 1,
				"ma_rnd" => $maRnd
			]);
			if(!empty($collection)) {
				$tasks['data'] = $collection;
			}
			if(!empty($links)) {
				$tasks['links'] = $links;
			}
		}
		return $tasks;
	}
	private function checkUser() {
		//Filter task by user or user group 
		$userId = isset($this->jwt->id) ? $this->jwt->id : '';
		if(!$userId) {
			$rsData = array(
				'status' => self::ERROR_STATUS,
				'message' => 'Không tìm thấy user hoặc user không có quyền!'
			);
			echo json_encode($rsData);
			die;
		}
	}
  public function fetchTasks($request, $response, $args){
		$this->checkUser();
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
		
		$collection = $this->getTasksByQuytrinhId($quyTrinhId);
		if(!empty($collection['data'])) {
			$rsData['status'] = self::SUCCESS_STATUS;
      $rsData['message'] = 'Dữ liệu đã được load!';
			$rsData['data'] = $collection;
		} else {
			$rsData = $this->getEmptyGanttChart();
		}
		echo json_encode($rsData);
	}
  public function fetchTasksByMaSx($request, $response, $args){
		$this->checkUser();
    //$this->logger->addInfo('Request Npp path');
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu từ hệ thống!'
    );
    $maSx = isset(	$args['ma_sx']) ? $args['ma_sx'] : '';
    if($maSx == "") {
      $rsData['message'] = 'Không tìm thấy mã sx!';
      echo json_encode($rsData);
      die;
		};
		
		$collection = $this->getTasksByMaSx($maSx);
		if(!empty($collection['data'])) {
			$rsData['status'] = self::SUCCESS_STATUS;
      $rsData['message'] = 'Dữ liệu đã được load!';
			$rsData['data'] = $collection;
		} else {
			$rsData = $this->getEmptyGanttChart();
		}
		echo json_encode($rsData);
	}
	public function fetchTasksByMaRnd($request, $response, $args){
		$this->checkUser();
    //$this->logger->addInfo('Request Npp path');
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu từ hệ thống!'
    );
    $maRnd = isset(	$args['ma_rnd']) ? $args['ma_rnd'] : '';
    if($maRnd == "") {
      $rsData['message'] = 'Không tìm thấy mã RND!';
      echo json_encode($rsData);
      die;
		};
		
		$collection = $this->getTasksByMaRnd($maRnd);
		if(!empty($collection['data'])) {
			$rsData['status'] = self::SUCCESS_STATUS;
      $rsData['message'] = 'Dữ liệu đã được load!';
			$rsData['data'] = $collection;
		} else {
			$rsData = $this->getEmptyGanttChart();
		}
		echo json_encode($rsData);
	}
	/**
	 * Tịnh tiến start date của từng task
	 */
	private function getFowardDateDiff($nsx, $collection) {
		$dates = [];
		foreach ($collection as $key => $task) {
			$dates[] = $task['start_date'];
		}
		$minStartDate = min($dates);
		$date1 = date_create($minStartDate);
		$date2 = date_create($nsx);
		$diff = date_diff($date1,$date2);
		return $diff->format("%a");
	}
	/**
	 * Clone task from quy trinh
	 */
	public function fetchTasksFromSample($request, $response, $args) {
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa load được dữ liệu từ quy trình mẫu!'
    );
		$maSx = isset(	$args['ma_sx']) ? $args['ma_sx'] : '';
		$quyTrinhId = isset(	$args['quy_trinh_id']) ? $args['quy_trinh_id'] : '';
		$date = new \DateTime();
		$createOn = $date->format('Y-m-d H:i:s');
		$nsx = isset(	$args['nsx']) ? $args['nsx'] : $date->format('Y-m-d');
    $userId = isset($this->jwt->id) ? $this->jwt->id : '';
		$collection = $this->getTasksByQuytrinhId($quyTrinhId);
		$oldAndNewTaskIds = [];
		//Tao task ID moi
		if(isset($collection['data']) && !empty($collection['data'])) {
			$dayDiff = $this->getFowardDateDiff($nsx, $collection['data']);
			foreach ($collection['data'] as $key => $task) {
				$uuid1 = Uuid::uuid1();
      	$uuid = $uuid1->toString();
				$oldAndNewTaskIds[$task['id']] = [
					'old' => $task['id'],
					'new' => $uuid
				]; 
				//Cap nhat task ID
				$collection['data'][$key]['id'] = $uuid;	
				//Thay the quy trinh id = ma_sx
				unset($collection['data'][$key]['quy_trinh_id']);
				$collection['data'][$key]['ma_sx'] = $maSx;
				//Reset progress
				$collection['data'][$key]['progress'] = 0;
				//Update create date
				$collection['data'][$key]['create_on'] = $createOn;
				$collection['data'][$key]['create_by'] = $userId;
				//Update start_date 
				if($dayDiff > 0) {
					$date = date_create($collection['data'][$key]['start_date']);
					date_add($date,date_interval_create_from_date_string("$dayDiff days"));
					$collection['data'][$key]['start_date'] = date_format($date,"Y-m-d");
				}
			}
			//Update task parent 
			foreach ($collection['data'] as $key => $task) {
				if(isset($oldAndNewTaskIds[$collection['data'][$key]['parent']])) {
					$collection['data'][$key]['parent'] = $oldAndNewTaskIds[$collection['data'][$key]['parent']]['new'];
				}
			}
			//Update links if exists 
			if(isset($collection['links']) && !empty($collection['links'])) {
				foreach ($collection['links'] as $key => $link) {
					//$collection['links'][$key]['source'] = $oldAndNewTaskIds
					if(isset($oldAndNewTaskIds[$collection['links'][$key]['source']]) 
						&& isset($oldAndNewTaskIds[$collection['links'][$key]['target']])) {
							$collection['links'][$key]['source'] = $oldAndNewTaskIds[$collection['links'][$key]['source']]['new'];
							$collection['links'][$key]['target'] = $oldAndNewTaskIds[$collection['links'][$key]['target']]['new'];
							//Unset ID 
							unset($collection['links'][$key]['id']);
							//Update ma_sx
							$collection['links'][$key]['ma_sx'] = $maSx;
							$collection['links'][$key]['create_on'] = $createOn;
							$collection['links'][$key]['create_by'] = $userId;
					}
				}
			}
			//Insert Task
			$resultTask = $this->db->insert($this->tableName, $collection['data']);
			//Insert Link
			$resultLink = $this->db->insert($this->linkTable, $collection['links']);
			if($resultTask->rowCount()) {
				$collection = $this->getTasksByMaSx($maSx);
				if(!empty($collection['data'])) {
					$rsData['status'] = self::SUCCESS_STATUS;
					$rsData['message'] = 'Dữ liệu đã được load!';
					$rsData['data'] = $collection;
				} else {
					$rsData = $this->getEmptyGanttChart();
				}
			}
		}
		echo json_encode($rsData);
	}
	private function checkPermission($userId) {
		$isSuper = $this->UserController->isSuperAdmin($userId);
		$isAllow = false;
		if(!$isSuper) {
			//Check if user has edit permission
			$userPermission = $this->UserController->getUserPermission($userId);
			$allowedEditRoute = Roles::roleAndRouter()['qlsx']['edit'];
			foreach ($userPermission as $key => $router) {
				if($router['router_name'] == $allowedEditRoute) {
					$isAllow = true;
					break;
				}
			}
		} else {
			$isAllow = true;
		}
		return $isAllow;
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
		$maRnd = $request->getParam('ma_rnd');
		$worker = $request->getParam('user');
		//$check_user = $request->getParam('check_user');
		$group_user = $request->getParam('group_user');
		$note = $request->getParam('note');
    $date = new \DateTime();
    $createOn = $date->format('Y-m-d H:i:s');
    $userId = isset($this->jwt->id) ? $this->jwt->id : '';
    $itemData = [
      'text' => $text,
      'duration' => $duration,
      'start_date' => $start_date,
			'quy_trinh_id' => $quyTrinhId,
			'ma_sx' => $maSx,
			'ma_rnd' => $maRnd,
			'progress' => $progress,
			'parent' => $parent,
			'user' => $worker,
			//'check_user' => $check_user,
			'group_user' => $group_user,
			'note' => $note,
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
			//Update max order for new item 
			$maxOrderData = $this->db->select($this->tableName, ['sortorder' => Medoo::raw('MAX(sortorder)')]);
			if(!empty($maxOrderData)) {
				$itemData['sortorder'] = $maxOrderData[0]['sortorder'] + 1;
			} else {
				$itemData['sortorder'] = 0;
			}
			$result = $this->db->insert($this->tableName, $itemData);
			$selectColumns = ['id','text'];
			$where = ['id' => $itemData['id']];
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$rsData['message'] = 'Đã thêm công việc thành công!';
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


			//Nguoi co quyen sua se duoc cap nhat toan bo hoac admin
			//Nguoi phe duyet se co quyen cap nhat progress
			$userId = isset($this->jwt->id) ? $this->jwt->id : '';
			$isAllow = $this->checkPermission($userId);
			if(!$isAllow) {
				$rsData['message'] = 'Bạn không có quyền thực hiện tác vụ này';
			} else {
				$result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
				if($result->rowCount()) {
					$this->superLog('Update Quy trinh', $itemData);
					$rsData['status'] = self::SUCCESS_STATUS;
					$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
				} else {
					$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống!';
				}
			}
		}
		//Load data after added or updated
		$rsData['data'] = $this->getTaskByType($quyTrinhId, $maSx, $maRnd);
		echo json_encode($rsData);
	}
	/**
	 * Type: Quy trinh ID, Ma Sx or Ma Rnd
	 */
	protected function getTaskByType($quyTrinhId = '', $maSx = '', $maRnd = '') {
		if($quyTrinhId) {
			$collection = $this->getTasksByQuytrinhId($quyTrinhId);
		} elseif($maSx) {
			$collection = $this->getTasksByMaSx($maSx);
		} elseif($maRnd) {
			$collection = $this->getTasksByMaRnd($maRnd);
		}
		return $collection;
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
		$maRnd = $request->getParam('ma_rnd');
    
    $date = new \DateTime();
    $createOn = $date->format('Y-m-d H:i:s');
    $userId = isset($this->jwt->id) ? $this->jwt->id : '';
    $itemData = [
      'source' => $source,
      'target' => $target,
			'type' => $type,
			'quy_trinh_id' => $quyTrinhId,
			'ma_sx' => $maSx,
			'ma_rnd' => $maRnd,
			
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
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống!';
			}
			
		}
		//Load data after added or updated
		$rsData['data'] = $this->getTaskByType($quyTrinhId, $maSx, $maRnd);
		echo json_encode($rsData);
	}
	public function updateTaskOrder($request, $response){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		// Get params and validate them here.
		//$params = $request->getParams();
		$id = $request->getParam('id');
		$targetId = $request->getParam('target');
		$quyTrinhId = $request->getParam('quy_trinh_id');
		$maSx = $request->getParam('ma_sx');
		$maRnd = $request->getParam('ma_rnd');
		$nextTask = false;
		if(strpos($targetId, "next:") === 0){
			$targetId = substr($targetId, strlen("next:"));
			$nextTask = true;
		}
		if($targetId) {
			$orderData = $this->db->select($this->tableName, ['sortorder'], ['id' => $targetId]);
			$targetOrder = $orderData[0]['sortorder'];
			if($nextTask) $targetOrder++;

			$extraWhere = "WHERE sortorder >= $targetOrder ";
			if($quyTrinhId) {
				$extraWhere .= "AND quy_trinh_id = $quyTrinhId";
			}
			if($maSx) {
				$extraWhere .= "AND ma_sx = '$maSx'";
			}
			if($maRnd) {
				$extraWhere .= "AND ma_rnd = '$maRnd'";
			}
			$this->db->update($this->tableName, [
				'sortorder' => Medoo::raw('sortorder + 1')
			], Medoo::raw("$extraWhere"));

			$this->db->update($this->tableName, ['sortorder' => $targetOrder], ['id' => $id]);

			$rsData['status'] = 'success';
		}
		//Load data after added or updated
		$rsData['data'] = $this->getTaskByType($quyTrinhId, $maSx, $maRnd);
		echo json_encode($rsData);
  }
  public function delete($request, $response, $args){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Dữ liệu chưa được xoá thành công!'
		);
		$userId = isset($this->jwt->id) ? $this->jwt->id : '';
		$isAllow = $this->checkPermission($userId);
		if(!$isAllow) {
			$rsData['message'] = 'Bạn không có quyền thực hiện tác vụ này';
			echo json_encode($rsData);
			exit;
		}
		
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
		$userId = isset($this->jwt->id) ? $this->jwt->id : '';
		$isAllow = $this->checkPermission($userId);
		if(!$isAllow) {
			$rsData['message'] = 'Bạn không có quyền thực hiện tác vụ này';
			echo json_encode($rsData);
			exit;
		}
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
		$sql = "SELECT lotus_sanxuat.ma_sx, MIN(start_date) as start_date, MAX(DATE_ADD(gantt_tasks.start_date, INTERVAL gantt_tasks.duration DAY)) as end_date,DATEDIFF( MAX(DATE_ADD(gantt_tasks.start_date, INTERVAL gantt_tasks.duration DAY)), MIN(start_date)) as duration, CONCAT('Mã SX: ',  lotus_sanxuat.ma, ', Mã SP: ', lotus_sanxuat.ma_sp) as text, progress FROM gantt_tasks, lotus_sanxuat WHERE lotus_sanxuat.ma_sx = gantt_tasks.ma_sx AND lotus_sanxuat.pkhsx <> '' AND lotus_sanxuat.pdbcl <> '' AND lotus_sanxuat.gd <> '' AND lotus_sanxuat.status = 1 GROUP BY ma_sx ORDER BY start_date";
		$collection = $this->db->query($sql)->fetchAll(\PDO::FETCH_ASSOC);
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['message'] = 'Đã load được các quy trình!';
			$rsData['data'] = array(
				'data' => $collection,
				'links' => []
			);
		} else {
			$rsData = $this->getEmptyGanttChart();
		}
		echo json_encode($rsData);
	}
	private function getEmptyGanttChart() {
		return array(
			'status' => self::SUCCESS_STATUS,
			'message' => 'Chưa có dữ liệu để vẽ biểu đồ Gantt',
			'data' => array(
				'data' => [],
				'links' => []
			)
		);
	}
	public function getUsers($request, $response, $args){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu từ hệ thống!'
		);
		//$allUser = $this->getAllActiveUsers();
		$workers = $this->UserController->getAllActiveUsers();
		$nhancong = $workers;
		$users = $workers;
		//Get group users
		$groupUsers = $this->PhongbanController->getGroupUser();
		$allGroups = array_merge([['ma_pb' => 'ALL_PB', 'name' => 'Tất cả phòng ban']], $groupUsers);
		if(!empty($nhancong) && !empty($users)) {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['message'] = 'Đã load được nhân sự và người phê duyệt';
			$rsData['data'] = [
				'workers' => $nhancong,
				'check_users' => $users,
				'group_users' => $allGroups
			];
		} else {
			$rsData['message'] = 'Chưa có user nào thuộc nhóm nhân sự! Hãy cập nhật phòng ban cho thành viên!';
		}
		
		echo json_encode($rsData);
	}
}