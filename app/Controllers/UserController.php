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
  private function isSuperAdmin($userId = "") {
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
        'label' => 'QL Cảnh báo', 
        'icon' => 'safety',
        'path' => 'main_group',
        'children' => []
      ],
      [
        'label' => 'QL Kho vật tư', 
        'icon' => 'home',
        'path' => 'vattu_group',
        'children' => []
      ],
      [
        'label' => 'QL Sản xuất', 
        'icon' => 'rocket',
        'path' => 'qlsx_group',
        'children' => []
      ],
      [
        'label' => 'QL Chấm công',
        'icon' => 'schedule',
        'path' => 'chamcong_group',
        'children' => []
      ],
      // [
      //   'label' => 'QL User', 
      //   'icon' => 'team',
      //   'path' => 'qluser_group',
      //   'children' => []
      // ],
      [
        'label' => 'QL Khác', 
        'icon' => 'pushpin',
        'path' => 'other_group',
        'children' => []
      ],
    ];
    //Check is_supper admin
    if($this->isSuperAdmin($userId)) {
      $menus[] = [
        'label' => 'QL User', 
        'icon' => 'team',
        'path' => 'qluser_group',
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
      $userData = $this->db->select($this->tableName, ['roles', 'name','username','email'], [
        'id' => $userId,
        'status' => 1
      ]);
      if(!$this->isSuperAdmin($userId)) {
        //Limit permission here 
        $routerNames = $this->db->select('user_permission', ['router_name', 'allow','include'], [
          'user_id' => $userId,
        ]);
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
            $menus[$menuKey]['children'][] = $role;
          }
        }
      }
      //Filter level 1 menu
      foreach ($menus as $key => $menu) {
        if(empty($menu['children'])) {
          unset($menus[$key]);
        }
      }

      if(!empty($userRoles)) {
        return [
          'roles' => array_values($menus),
          'userInfo' => $userData[0]
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
		$collection = $this->db->select($this->tableName, $columns, [
			"ORDER" => ["id" => "DESC"],
			"status" => [0, 1]//2 is deleted status
		]);
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
		$username = $request->getParam('username');
		$name = $request->getParam('name');
		$hash = $request->getParam('hash');
    $status = $request->getParam('status');
    $email = $request->getParam('email');
    $roles = $request->getParam('roles');
    if(is_array($roles)) {
      $roles = implode(',', $roles);
    }
		if(!$id) {
			//Insert new data to db
			if(!$username) {
				$rsData['message'] = 'Tên đăng nhập không được để trống!';
				echo json_encode($rsData);
				die;
			}
			if(!$hash) {
				$rsData['message'] = 'Mật khẩu không được để trống!';
				echo json_encode($rsData);
				die;
			}
      $date = new \DateTime();
      //Create new uuid
      $uuid1 = Uuid::uuid1();
      $uuid = $uuid1->toString();
			$itemData = [
        'id' => $uuid,
				'username' => $username,
				'name' => $name,
				'hash' => password_hash($hash, PASSWORD_DEFAULT),
				'status' => $status,
        'email' => $email,
        'roles' => $roles,
				'create_on' => $date->format('Y-m-d H:i:s'),
      ];
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
      $usernameExists = $this->db->select($this->tableName, ['username'], ['username' => $itemData['username']]);
      if(!empty($usernameExists)) {
        $rsData['message'] = 'Username đã tồn tại trong hệ thống!';
        echo json_encode($rsData);exit;
      }
			$result = $this->db->insert($this->tableName, $itemData);
			$selectColumns = ['id','email'];
			$where = ['email' => $itemData['email']];
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$rsData['message'] = 'Đã thêm người dùng mới thành công!';
				$data = $this->db->select($this->tableName, $selectColumns, $where);
				$rsData['data'] = $data[0];
			} else {
        $rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu!';
			}
		} else {
			//update data base on $id
			$date = new \DateTime();
			$itemData = [
				'username' => $username,
				'name' => $name,
				//'hash' => password_hash($hash, PASSWORD_DEFAULT),
				'status' => $status,
        'email' => $email,
        'roles' => $roles,
				'update_on' => $date->format('Y-m-d H:i:s'),
      ];
      if($hash != "") {
        $itemData["hash"] = password_hash($hash, PASSWORD_DEFAULT);
      }
			$result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
			if($result->rowCount()) {
        $this->superLog('Update User', $itemData);
        $data = $this->db->select($this->tableName, 
        [
          'username',
          'email',
          'status',
          'roles',
          //'hash',
          'name'
        ], 
        ['id' => $id]);
				$rsData['data'] = $data[0];
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống! Có thể do bạn chưa có thay đổi gì!';
			}
			
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
  public function fetchAllRoles() {
    $rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa load được chức năng nào!'
    );
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
      $roleList[] = $roleItem;
    }
    if(!empty($roleList)) {
      $rsData['status'] = self::SUCCESS_STATUS;
      $rsData['message'] = 'Các chức năng đã load thành công!';
      $rsData['data'] = $roleList;
    }
    echo json_encode($rsData);
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
			} else {
        $rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu!';
			}
		}
		echo json_encode($rsData);
  }
}