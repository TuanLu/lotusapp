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
    if(password_verify($params['password'], '$2y$10$Hhc.zxNnCoffplakjPT3k.l0NPenh86r/uIKiYei5ltXr.prHJOVG')) {
      return true;
    } else {
      return false;
    }
  }
  public function token($request, $response) {
    $params = $request->getParsedBody() ?: [];
    $rsData = [
      "status" => "error",
      "message" => "Invalid",
    ];
    $isChecked = $this->validateRequest($params);
    if(!$isChecked) {
      echo json_encode($rsData);exit;
    }
    $now = time();//new \DateTime();
    //$future = new \DateTime("now +2 hours");
    $server = $request->getServerParams();
    //$jti = random_bytes(16);
    $payload = [
        "iat" => $now,
        //"exp" => $now + (60),
        //"jti" => $jti,
        //"sub" => $server["PHP_AUTH_USER"],
        "scope" => ['npp','qlsx']
    ];
    $secret = ISD_APP_KEY;
    $token = JWT::encode($payload, $secret, "HS256");
    if($token != "") {
      $data["token"] = $token;
      //$data["expires"] = $payload['exp'];
      return $response->withStatus(201)
          ->withHeader("Content-Type", "application/json")
          ->write(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
    }
    echo json_encode($rsData);
  }
  public function fetchRoles($request, $response) {
    $rsData = [
      "status" => "error",
      "message" => "This user have no role",
    ];
    $scopes = $this->jwt->scope ? : ['qluser', 'npp','qlsx'];
    
    if(!empty($scopes)) {
      $allScopes = Roles::getRoles();
      $userRoles = [];
      foreach($scopes as $role) {
        if(in_array($role, array_keys($allScopes))) {
         $userRoles[] = $allScopes[$role];
        }
      }
      if(!empty($userRoles)) {
        $rsData['status'] = 'success';
        $rsData['message'] = 'Load roles successfully!'; 
        $rsData['data'] = $userRoles;
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
        'hash',
				'email',
				'status'
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
				$rsData['message'] = 'Đã thêm nhà phân phối mới thành công!';
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
				'hash' => password_hash($hash, PASSWORD_DEFAULT),
				'status' => $status,
				'email' => $email,
				'update_on' => $date->format('Y-m-d H:i:s'),
			];
			$result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Update User', 0, $itemData);
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
				$this->superLog('Delete User', 0, $id);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Đã xoá user khỏi hệ thống!';
				$rsData['data'] = $id;
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
	}
}