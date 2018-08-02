<?php 
namespace App\Controllers;
use \Slim\Views\PhpRenderer;
use \App\Helper\Data;
use App\Helper\Roles;
use Ramsey\Uuid\Uuid;
use Firebase\JWT\JWT;
//use Tuupola\Base62;

class UserController extends BaseController {
  private $tableName = 'users';
  public function index($request, $response) {
    $uri = $request->getUri();
    $data = [
      'base_url' => $uri->getBaseUrl()
    ];
    return $this->view->render($response, 'login.phtml', $data);
  }
  private function validateRequest($params) {
    $user = $this->db->select($this->tableName, ['id','name','username', 'email', 'status', 'hash'], [
      "OR" => [
        "username" => $params['userName'],
        "email" => $params['userName'],
      ]
    ]);
    if(!empty($user)) {
      $isCorrectPass = password_verify($params['password'], $user[0]['hash']);
      if($isCorrectPass) {
        return $user[0];
      }
    }    
    return false;
  }
  public function token($request, $response) { 
    $params = $request->getParsedBody() ?: [];
    $rsData = [
      "status" => "error",
      "message" => "Tên đăng nhập hoặc mật khẩu không đúng!",
    ];
    $user = $this->validateRequest($params);
    if(empty($user)) {
      echo json_encode($rsData);exit;
    }
    $userId = $user['id'];
    $userRoles = $this->getUserRoles($userId);
    if(empty($userRoles)) {
      $rsData['message'] = 'User hiện tại chưa được phân quyền hoặc chưa kích hoạt. Liên hệ admin để cập nhật!';
      echo json_encode($rsData);exit;
    }
    $now = time();//new \DateTime();
    //$future = new \DateTime("now +2 hours");
    //$server = $request->getServerParams();
    //$jti = random_bytes(16);
    $payload = [
        "iat" => $now,
        //"exp" => $now + (60),
        //"jti" => $jti,
        //"sub" => $server["PHP_AUTH_USER"],
        //"scopes" => $userRoles,
        "id" => $userId
    ];
    $secret = '';
    if(defined('ISD_APP_KEY')) {
      $secret = ISD_APP_KEY;
    }
    $token = JWT::encode($payload, $secret, "HS256");
    if($token != "") {
      $data["token"] = $token;
      $data["scopes"] = $userRoles['roles'];
      $data["userInfo"] = $userRoles['userInfo'];;
      
      return $response->withStatus(201)
          ->withHeader("Content-Type", "application/json")
          ->write(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
    }
    echo json_encode($rsData);
  }
  public function isSuperAdmin($userId = "") {
    if(!$userId) {
      $userId = isset($this->jwt->id) ? $this->jwt->id : '';
    }
    if($userId != "") {
      $user = $this->db->select('users', ['is_super'], ['id' => $userId]);
      if(!empty($user) && $user[0]['is_super'] === "1") {
        return true;
      }
    }
    return false;
  }
  protected function appMenus($userId = "") {
    $menus = [
      [
        'label' => 'Thông báo', 
        'icon' => 'safety',
        'path' => 'main_group',
        'children' => []
      ],
      [
        'label' => 'Khách hàng', 
        'icon' => 'team',
        'path' => 'khachhang_group',
        'children' => []
      ],
      [
        'label' => 'Quản lý kho', 
        'icon' => 'home',
        'path' => 'vattu_group',
        'children' => []
      ],
      [
        'label' => 'Sản xuất', 
        'icon' => 'rocket',
        'path' => 'qlsx_group',
        'children' => []
      ],
      [
        'label' => 'Chấm công',
        'icon' => 'schedule',
        'path' => 'chamcong_group',
        'children' => []
      ],
      // [
      //   'label' => 'Thành viên', 
      //   'icon' => 'team',
      //   'path' => 'qluser_group',
      //   'children' => []
      // ],
    ];
    //Check is_supper admin
    if($this->isSuperAdmin($userId)) {
      $menus[] = [
        'label' => 'Người dùng', 
        'icon' => 'team',
        'path' => 'qluser_group',
        'children' => []
      ];
    }
    $menus[] = [
      'label' => 'Cá Nhân', 
      'icon' => 'idcard',
      'path' => 'my_account',
      'children' => [
        [
          'label' => 'Thông tin', 
          'icon' => 'profile',
          'path' => 'my_info',
        ],
        [
          'label' => 'Nhiệm vụ', 
          'icon' => 'form',
          'path' => 'my_mission',
        ],
      ]
    ];
    if($this->isSuperAdmin($userId)) {
      $menus[] = [
        'label' => 'Cài đặt', 
        'icon' => 'tool',
        'path' => 'other_group',
        'children' => []
      ];
    }
    return $menus;

  }
  private function getUserRoles($userId) { 
    if($userId) {
      $allScopes = Roles::getRoles();
      $userRoles = [];
      $menus = $this->appMenus($userId);
      foreach($allScopes as $router => $role) {
        $userRoles[] = $role;
      }
      $userData = $this->getAllActiveUsers($userId);
      $allAllowedRouter = [];
      $isSuperAdmin = $this->isSuperAdmin($userId);
      if(!$isSuperAdmin) {
        //Limit permission here 
        $allowedPermission = $this->getUserPermission($userId);
        foreach ($allowedPermission as $key => $permission) {
          $allAllowedRouter[] = $permission['router_name'];
        }
        $routerAndRole = Roles::roleAndRouter();
        foreach ($userRoles as $key => $role) {
          if(isset($role['path']) && isset($routerAndRole[$role['path']])) {
            //Will do something later
          } else {
            unset($userRoles[$key]);
          }
        }
      }
      //Append menu item to parent 
      foreach ($menus as $menuKey => $menuItem) {
        foreach ($userRoles as $roleKey => $role) {
          if(isset($role['parent']) && $role['parent'] == $menuItem['path']) {
            if($isSuperAdmin) {
              $menus[$menuKey]['children'][] = $role;
            } else {
              //Check if user has view permission or not
              if(isset($role['permission']['view']) && in_array($role['permission']['view'], $allAllowedRouter)) {
                $menus[$menuKey]['children'][] = $role;
              }
            }
          }
        }
      }
      //Filter level 1 menu
      foreach ($menus as $key => $menu) {
        if(empty($menu['children'])) {
          unset($menus[$key]);
        }
      }

      if(!empty($userRoles) && !empty($userData)) {
        return [
          'roles' => array_values($menus),
          'userInfo' => isset($userData[0]) ? $userData[0] : [] 
        ];
      }
    }
  }
  public function fetchRoles($request, $response) {
    $rsData = [
      "status" => self::ERROR_STATUS,
      "message" => "Bạn hãy đăng nhập lại!",
    ];
    $userId = $this->jwt->id ? : '';
    if($userId) {
      $userRoles = $this->getUserRoles($userId);
      if(!empty($userRoles)) {
        $rsData['status'] = self::SUCCESS_STATUS;
        $rsData['message'] = 'Đã load quyền thành công!';
        $rsData['userInfo'] = $userRoles['userInfo'];
        $rsData['scopes'] = $userRoles['roles'];
      } else {
        $rsData['message'] = 'User chưa được phân quyền hoặc chưa được kích hoạt. Liên hệ admin để cập nhật!';
      }
    }
    
    echo json_encode($rsData);
  }
  public function getAllActiveUsers($userId = "") {
    // Columns to select.
		$columns = [
      'users.id',
      'users.id(key)',//Unique key for React loop
      'users.name',
      'users.username',
      //'hash',
      'users.email',
      'users.status',
      'users.roles',
      'users.group_user',
      'users.ma_ns',
      'users.to_hanh_chinh',
      'users.phone',
      'users.description',
      'users.create_on',
      'lotus_phongban.name(ten_phong_ban)',
      'lotus_phongban.roles',
    ];
    $where = [
      "ORDER" => ["create_on" => "DESC"],
      "users.status" => [0, 1]//2 is deleted status
    ];
    //Load user cu the theo ID 
    if($userId) {
      $where["users.id"] = $userId;
    }
    $collection = $this->db->select($this->tableName,[
      "[>]lotus_phongban" => ["group_user" => "ma_pb"],
    ], $columns, $where);
    if(!empty($collection)) {
      return $collection;
    }
    return [];
  }
  public function fetchUsers($request, $response){
		//$this->logger->addInfo('Request Npp path');
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu từ hệ thống!'
		);
		// Columns to select.
		$columns = [
				'id',
				'name',
        'username',
        //'hash',
				'email',
        'status',
        'roles'
		];
		$collection = $this->getAllActiveUsers();
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['message'] = 'Dữ liệu đã được load!';
			$rsData['data'] = $collection;
		}
		echo json_encode($rsData);
  }
  public function updateUser($request, $response)
	{
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		// Get params and validate them here.
		//$params = $request->getParams();
    $id = $request->getParam('id');
    $roles = $request->getParam('roles');
    if(is_array($roles)) {
      $roles = implode(',', $roles);
    }
    $date = new \DateTime();
    $today = $date->format('Y-m-d H:i:s');
    $itemData = [
      'username' => $request->getParam('username'),
      'name' => $request->getParam('name'),
      'status' => 1,
      'email' => $request->getParam('email'),
      'phone' => $request->getParam('phone') || '',
      'ma_ns' => $request->getParam('ma_ns'),
      'description' => $request->getParam('description'),
      'to_hanh_chinh' => $request->getParam('to_hanh_chinh'),
      'group_user' => $request->getParam('group_user'),
      'roles' => $roles ? : '',
    ];
		if(!$id) {
			//Insert new data to db
			if(!$itemData['username']) {
				$rsData['message'] = 'Tên đăng nhập không được để trống!';
				echo json_encode($rsData);
				die;
      }
      if(!$itemData['ma_ns']) {
				$rsData['message'] = 'Mã nhân viên không được để trống';
				echo json_encode($rsData);
				die;
			}
			if(!$request->getParam('hash')) {
				$rsData['message'] = 'Mật khẩu không được để trống!';
				echo json_encode($rsData);
				die;
			}
      //Create new uuid
      $uuid1 = Uuid::uuid1();
      $uuid = $uuid1->toString();
      $itemData['id'] = $uuid;
      $itemData['hash'] = password_hash($request->getParam('hash'), PASSWORD_DEFAULT);
      $itemData['create_on'] = $today;
      //Valid email format
      $isValidEmail = filter_var($itemData['email'], FILTER_VALIDATE_EMAIL);
      if(!$isValidEmail) {
        $rsData['message'] = "Địa chỉ email [" . $itemData['email'] ."] không hợp lệ";
        echo json_encode($rsData);exit;
      }
      //Check user exists before insert 
      $emailExists = $this->db->select($this->tableName, ['email'], ['email' => $itemData['email']]);
      if(!empty($emailExists)) {
        $rsData['message'] = 'Email đã tồn tại trong hệ thống!';
        echo json_encode($rsData);exit;
      }
      //Check username exists
      $usernameExists = $this->db->select($this->tableName, ['username'], ['username' => $itemData['username']]);
      if(!empty($usernameExists)) {
        $rsData['message'] = 'Username đã tồn tại trong hệ thống!';
        echo json_encode($rsData);exit;
      }
      //Check ma_ns exists
      $maNsExists = $this->db->select($this->tableName, ['ma_ns'], ['ma_ns' => $itemData['ma_ns']]);
      if(!empty($maNsExists)) {
        $rsData['message'] = 'Mã nhân sự đã tồn tại trong hệ thống!';
        echo json_encode($rsData);exit;
      }
			$result = $this->db->insert($this->tableName, $itemData);
			
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$rsData['message'] = 'Đã thêm người dùng mới thành công!';
				$data = $this->getAllActiveUsers();
				$rsData['data'] = $data;
			} else {
        // echo "<pre>";
        // print_r($result->errorInfo());
        $rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu!';
			}
		} else {
      $userId = isset($this->jwt->id) ? $this->jwt->id : '';
      $itemData['update_on'] = $today;
      $itemData['update_by'] = $userId;
			//update data base on $id
      if($request->getParam('hash') != "") {
        $itemData["hash"] = password_hash($request->getParam('hash'), PASSWORD_DEFAULT);
      }
      //Check if ma_ns da ton tai voi user_id khac
      if($itemData['ma_ns'] != "") {
        $maNsExists = $this->db->select($this->tableName, ['ma_ns', 'id'], ['ma_ns' => $itemData['ma_ns']]);
        if(!empty($maNsExists) && $maNsExists[0]['id'] != $id) {
          $rsData['message'] = 'Mã nhân sự đã tồn tại trong hệ thống!';
          echo json_encode($rsData);exit;
        }
      } 
			$result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
			if($result->rowCount()) {
        $this->superLog('Update User', $itemData);
        
				$rsData['status'] = self::SUCCESS_STATUS;
        $rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
        $data = $this->getAllActiveUsers();
				$rsData['data'] = $data;
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống! Có thể do bạn chưa có thay đổi gì!';
			}
			
		}
		echo json_encode($rsData);
  }
  /**
   * Chi cho phep user cap nhat mot so thong tin
   */
  public function updateUserByUser($request, $response)
	{
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		// Get params and validate them here.
		//$params = $request->getParams();
    $id = $request->getParam('id');   
    $date = new \DateTime();
    $today = $date->format('Y-m-d H:i:s');
    $userId = isset($this->jwt->id) ? $this->jwt->id : '';
    $itemData = [
      'name' => $request->getParam('name'),
      'email' => $request->getParam('email'),
      'phone' => $request->getParam('phone'),
      'description' => $request->getParam('description'),
    ];
    $itemData['update_on'] = $today;
    $itemData['update_by'] = $userId;
    //Check user exists before insert 
    $emailExists = $this->db->select($this->tableName, ['email', 'id'], ['email' => $itemData['email']]);
    if(!empty($emailExists)) {
      if($emailExists[0]['id'] != $id) {
        $rsData['message'] = 'Email đã tồn tại trong hệ thống!';
        echo json_encode($rsData);exit;
      }
    }
    //update data base on $id
    $changePassword = false;
    if($request->getParam('hash') != "") {
      $itemData["hash"] = password_hash($request->getParam('hash'), PASSWORD_DEFAULT);
      $changePassword = true;
    }
    $result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
    if($result->rowCount()) {
      $this->superLog('Update User By User', $itemData);
      $rsData['status'] = self::SUCCESS_STATUS;
      $rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
      $userData = $this->getAllActiveUsers($id);
      $rsData['data'] = isset($userData[0]) ? $userData[0] : [];
      if($changePassword) {
        $rsData['update_pass'] = $changePassword;
        $rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống! Mời bạn đăng nhập lại!';
      }
    } else {
      $rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống! Có thể do bạn chưa có thay đổi gì!';
    }
		echo json_encode($rsData);
  }
  public function deleteUser($request, $response, $args){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Dữ liệu chưa được xoá thành công!'
		);
		// Get params and validate them here.
		$id = isset(	$args['id']) ? $args['id'] : '';
		if($id != "") {
			$result = $this->db->update($this->tableName,['status' => 2], ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Delete User', $id);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Đã xoá user khỏi hệ thống!';
				$rsData['data'] = $id;
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
  }
  public function fetchAllRoles($request, $response, $args) {
    $rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa load được chức năng nào!'
    );
    $userId = isset($args['user_id']) ? $args['user_id'] : ''; 
    $routerAndPermission = $this->getUserRouteAndPermission($userId);
    if($routerAndPermission) {
      $rsData['status'] = self::SUCCESS_STATUS;
      $rsData['message'] = 'Các chức năng đã load thành công!';
      $rsData['data'] = array(
        'roles' => $routerAndPermission['roles'],
        'permission' => $routerAndPermission['permission'],
        'include' => isset($routerAndPermission['include']) ? $routerAndPermission['include'] : []
      );
    }
    echo json_encode($rsData);
  }
  private function getUserRouteAndPermission($userId) {
    if(!$userId) {
      return false;
    }
    $allRoles = Roles::getRoles();
    $roleList = [];
    foreach ($allRoles as $key => $value) {
      $roleItem = [
        'name' => $value['label'],
        'value' => $value['path'],
        'key' => $value['path'],
      ];
      if(isset($value['children'])) {
        $roleItem['children'] = $value['children'];
      }
      if(isset($value['permission'])) {
        $roleItem['permission'] = $value['permission'];
      }
      if(isset($value['limit_view'])) {
        $entryData = $this->db->select($value['limit_view'], "*", ['status' => 1]);
        $roleItem['include'] = $entryData;
      }
      $roleList[] = $roleItem;
    }
    if(!empty($roleList)) {
      $permission = $this->getUserPermission($userId);
      return array(
        'roles' => $roleList,
        'permission' => $permission
      );
    }
    return false;
  }
  public function updatePermission($request, $response){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
    );
    if(!$this->isSuperAdmin()) {
      $rsData['message'] = 'Bạn không có quyền để thực hiện tác vụ này';
      echo json_encode($rsData);die;
    }
		//$params = $request->getParams();
		$userId = $request->getParam('user_id');
		$routerName = $request->getParam('router_name');
		$allow = $request->getParam('allow') ? 1 : 2;
    $include = $request->getParam('include');
    
		if($userId && $routerName) {
      $permissionExists = $this->db->select('user_permission', ['user_id', 'router_name'], 
      ['user_id' => $userId, 'router_name' => $routerName]);
      if(!empty($permissionExists)) {
        //Update permission
        $result = $this->db->update('user_permission', ['allow' => $allow, 'include' => $include], ['user_id' => $userId, 'router_name' => $routerName]);
      } else {
        //Add permission 
        $result = $this->db->insert('user_permission', 
        [
          'user_id' => $userId, 
          'router_name' => $routerName, 
          'allow' => $allow, 
          'include' => $include,
        ]);
      }
			if($result->rowCount()) {
				$rsData['status'] = 'success';
        $rsData['message'] = 'Đã cập nhật quyền thành công!';
        $routerAndPermission = $this->getUserRouteAndPermission($userId);
        $rsData['data'] = array(
          'roles' => $routerAndPermission['roles'],
          'permission' => $routerAndPermission['permission']
        );
			} else {
        $rsData['message'] = 'Phân quyền nhân sự chưa được cập nhật vào CSDL!';
			}
		}
		echo json_encode($rsData);
  }
  public function getUserPermission($userId) {
    if($userId) {
      $collection = $this->db->select('user_permission', ['router_name','include'], ['user_id' => $userId, 'allow' => '1']);
      return $collection;
    }
    return [];
  }
  public function getWorkers() {
    $allUser = $this->getAllActiveUsers();
    //Loc lay cac user thuoc phong ban co roles LIKE "nhomnv"
    $workers = [];
    foreach ($allUser as $key => $user) {
      $userRoles = explode(',', $user['roles']);
      if(in_array('nhomnv', $userRoles)) {
        $workers[] = $user;
      }
    }
    return $workers;
  }
  public function getUserGroupByUserId($userId) {
    $userGroup = "";
    $collection = $this->db->select($this->tableName, [
      "[>]lotus_phongban" => ["group_user" => "ma_pb"],
    ], ["users.id", "lotus_phongban.roles"], ["users.id" => $userId]);
    if(isset($collection[0]['roles']) && $collection[0]['roles']) {
      $userGroup = $collection[0]['roles'];
    }
    return $userGroup;
  }
}