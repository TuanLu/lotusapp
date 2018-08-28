<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
use \Ramsey\Uuid\Uuid;
use App\Helper\Roles;

class SXController extends BaseController
{
	private $tableName = 'lotus_sanxuat';

	private function getColumns() {
		$columns = [
			'id',
			'ma_sx',
			'ma_rnd',
			'so',
			'cong_doan',
			'ma_sp',
			'co_lo',
			'so_lo',
			'nsx',
			'hd',
			'so_dk',
			'dang_bao_che',
			'qcdg',
			'dh',
			'tttb_kltb',
			'note',
			'pkhsx',
			'pdbcl',
			'gd',
			'status',
			'create_on' => Medoo::raw("DATE_FORMAT( create_on, '%d/%m/%Y' )")
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
		$collection = $this->db->select($this->tableName, $columns, [
			"status" => 1,
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
	public function fetchSelectedProduct($request, $response, $args) {
		//$this->logger->addInfo('Request Npp path');
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa load được sản phẩm của phiếu!'
		);
		$ma_sx = isset(	$args['ma_sx']) ? $args['ma_sx'] : '';
		// Columns to select.
		$columns = [
			'id',
			'id(key)',//For unique react item
			'ma_sx',
			'ma_maquet',
			'product_id',
			'cong_doan',
			'sl_1000',
			'sl_nvl',
			'status',
			'hu_hao',
			'create_on'
		];
		$collection = $this->db->select('lotus_spsx', $columns, [
			"status" => 1,
			"ma_sx" => $ma_sx
		]);
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['message'] = 'Dữ liệu sản phẩm đã được load!';
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
		$id = $request->getParam('id');
		$params = $request->getParams();
		$ma_sx = isset($params['ma_sx']) ? $params['ma_sx'] : '';
		$ma_rnd = isset($params['ma_rnd']) ? $params['ma_rnd'] : '';
		$ma = isset($params['ma']) ? $params['ma'] : '';
		$so = isset($params['so']) ? $params['so'] : '';
		$cong_doan = isset($params['cong_doan']) ? $params['cong_doan'] : '';
		$ma_sp = isset($params['ma_sp']) ? $params['ma_sp'] : '';
		$co_lo = isset($params['co_lo']) ? $params['co_lo'] : '';
		$so_lo = isset($params['so_lo']) ? $params['so_lo'] : '';
		$nsx = isset($params['nsx']) ? $params['nsx'] : '';
		$hd = isset($params['hd']) ? $params['hd'] : '';
		$so_dk = isset($params['so_dk']) ? $params['so_dk'] : '';
		$dang_bao_che = isset($params['dang_bao_che']) ? $params['dang_bao_che'] : '';
		$qcdg = isset($params['qcdg']) ? $params['qcdg'] : '';
		$dh = isset($params['dh']) ? $params['dh'] : '';
		//$pkhsx = isset($params['pkhsx']) ? $params['pkhsx'] : '';
		//$pdbcl = isset($params['pdbcl']) ? $params['pdbcl'] : '';
		//$gd = isset($params['gd']) ? $params['gd'] : '';
		// if($pkhsx) {$pkhsx = 1;}else{$pkhsx = 0;}
		// if($pdbcl) {$pdbcl = 1;}else{$pdbcl = 0;}
		// if($gd) {$gd = 1;}else{$gd = 0;}
		$tttb_kltb = isset($params['tttb_kltb']) ? $params['tttb_kltb'] : '';
		$note = isset($params['note']) ? $params['note'] : '';
		$products = (isset($params['products']) && !empty($params['products'])) ? $params['products'] : [];
		//Some validation 
		if(empty($products)) {
			$rsData['message'] = 'Không có VT nào trong lệnh sản xuất!';
				echo json_encode($rsData);
				die;
		}
		if(!$so) {
			$rsData['message'] = 'Mã sản xuất không được để trống!';
				echo json_encode($rsData);
				die;
		}
		$userId = isset($this->jwt->id) ? $this->jwt->id : '';
		if(!$id) {
			$uuid1 = Uuid::uuid1();
			$ma_sx = $uuid1->toString();
			$date = new \DateTime();
			$createOn = $date->format('Y-m-d H:i:s');
			//Tao phieu 
			$duLieuPhieu = array(
				'ma_sx' => $ma_sx,
				'ma_rnd' => $ma_rnd,
				'so' => $so,
				'ma' => $ma,
				'ma_sp' => $ma_sp,
				'co_lo' => $co_lo,
				'so_lo' => $so_lo,
				'cong_doan' => $cong_doan,
				'nsx' => $nsx,
				'hd' => $hd,
				'so_dk' => $so_dk,
				'dang_bao_che' => $dang_bao_che,
				'qcdg' => $qcdg,
				'dh' => $dh,
				'tttb_kltb' => $tttb_kltb,
				'note' => $note,
				'status' => 1,
				//'pkhsx' => $pkhsx,
				//'pdbcl' => $pdbcl,
				//'gd' => $gd,
				'create_on' => $createOn,
				'create_by' => $userId,
				'update_by' => $userId,
			);
			$selectColumns = ['id', 'so'];
			$where = ['so' => $itemData['so']];
			$data = $this->db->select($this->tableName, $selectColumns, $where);
			if(!empty($data)) {
				$rsData['message'] = "Mã sản xuất [". $itemData['so'] ."] đã tồn tại: ";
				echo json_encode($rsData);exit;
			}
			$result = $this->db->insert($this->tableName, $duLieuPhieu);
			if($result->rowCount()) {
				//San pham trong phieu
				$validProducts = [];
				foreach($products as $product) {
					$validProducts[] = array(
						'ma_sx' => $ma_sx,
						'ma_maquet' => $product['ma_maquet'],
						'product_id' => $product['product_id'],
						'cong_doan' => $product['cong_doan'],
						'sl_1000' => $product['sl_1000'],
						'sl_nvl' => $product['sl_nvl'],
						'hu_hao' => $product['hu_hao'],
						'create_on' => $createOn
					);
				}
				$productsNum = $this->db->insert('lotus_spsx', $validProducts);
				if($productsNum->rowCount()) {
					$rsData['status'] = 'success';
					$columns = $this->getColumns();
					$data = $this->db->select('lotus_sanxuat', $columns, ['ma_sx' => $ma_sx]);
					$rsData['data'] = $data[0];
					$rsData['message'] = 'Đã thêm lệnh sản xuất thành công!';
				} else {
					$rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu!';
				}
			} else {
				// echo "<pre>";
				// print_r($result->errorInfo());
				$rsData['message'] = 'Không chèn được lệnh vào CSDL!';
			}
		} else {
			//update data base on $id
			$date = new \DateTime();
			$itemData = [
				'ma_sx' => $ma_sx,
				'ma_rnd' => $ma_rnd,
				'ma' => $ma,
				'so' => $so,
				'cong_doan' => $cong_doan,
				'ma_sp' => $ma_sp,
				'co_lo' => $co_lo,
				'so_lo' => $so_lo,
				'nsx' => $nsx,
				'hd' => $hd,
				'so_dk' => $so_dk,
				'dang_bao_che' => $dang_bao_che,
				'qcdg' => $qcdg,
				'dh' => $dh,
				'tttb_kltb' => $tttb_kltb,
				'note' => $note,
				'status' => 1,
				//'pkhsx' => $pkhsx,
				//'pdbcl' => $pdbcl,
				//'gd' => $gd,
				'update_on' => $date->format('Y-m-d H:i:s'),
				'update_by' => $userId
			];
			$result = $this->db->update($this->tableName, $itemData, ['id' => $id]); 
			if($result->rowCount()) {
				$this->superLog('Update phiếu nhập', $itemData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				//$errors = $result->errorInfo();
				$message = 'Dữ liệu chưa được cập nhật vào hệ thống! Có thể do bị trùng Mã phiếu!';
				// if(is_array($errors)) {
				// 	$message = implode(', ', $errors);
				// }
				$rsData['message'] = $message;
			}
			
		}
		echo json_encode($rsData);
	}
	public function updateProduct($request, $response)
	{
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		// Get params and validate them here.
		$id = $request->getParam('id');
		$params = $request->getParams();
		$maSp = isset($params['product_id']) ? $params['product_id'] : '';
		$ma_sx = isset($params['ma_sx']) ? $params['ma_sx'] : '';	
		$date = new \DateTime();
		$createOn = isset($params['create_on']) ? $params['create_on'] : $date->format('Y-m-d H:i:s');
		$updateOn = $date->format('Y-m-d H:i:s');
		//Some validation 
		if(!$ma_sx) {
			$rsData['message'] = 'Mã sản xuất không được để trống!';
				echo json_encode($rsData);
				die;
		}
		if(!$maSp) {
			$rsData['message'] = 'Mã VT không được để trống!';
				echo json_encode($rsData);
				die;
		}
		$userId = isset($this->jwt->id) ? $this->jwt->id : '';
		if(!$id) {
			$itemData = array(
				'ma_sx' => $ma_sx,
				'ma_maquet' => isset($params['ma_maquet']) ? $params['ma_maquet'] : '',
				'product_id' => $maSp,
				'cong_doan' => isset($params['cong_doan']) ? $params['cong_doan'] : '',
				'sl_1000' => isset($params['sl_1000']) ? $params['sl_1000'] : '',
				'sl_nvl' => isset($params['sl_nvl']) ? $params['sl_nvl'] : '',
				'hu_hao' => isset($params['hu_hao']) ? $params['hu_hao'] : '',
				'create_on' => $createOn
			);
			$result = $this->db->insert('lotus_spsx', $itemData);
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$id = $this->db->id();
				$rsData['data'] = array('id' => $id);
				$rsData['message'] = 'Đã thêm sản phẩm vào sản xuất thành công!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu!';
			}
		} else {
			//update data base on $id
			$itemData = [
				'ma_sx' => $ma_sx,
				'ma_maquet' => isset($params['ma_maquet']) ? $params['ma_maquet'] : '',
				'product_id' => isset($params['product_id']) ? $params['product_id'] : '',
				'sl_1000' => isset($params['sl_1000']) ? $params['sl_1000'] : '',
				'cong_doan' => isset($params['cong_doan']) ? $params['cong_doan'] : '',
				'sl_nvl' => isset($params['sl_nvl']) ? $params['sl_nvl'] : '',
				'hu_hao' => isset($params['hu_hao']) ? $params['hu_hao'] : '',
				'create_on' => $createOn,
				'update_on' => $updateOn
			];
			$result = $this->db->update('lotus_spsx', $itemData, ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Update SP theo mã sản xuất ', $itemData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống!';
			}
		}
		echo json_encode($rsData);
	}
	public function pheDuyet($request, $response) {
		/**
		 * Cho admin va nguoi co quyen edit router qlsx thuc hien phe duyet
		 */
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		$type = $request->getParam('type');
		$maSx = $request->getParam('ma_sx');
		$value = $request->getParam('value');
		if($type && $maSx) {
			$userId = isset($this->jwt->id) ? $this->jwt->id : '';
			$isSuper = $this->UserController->isSuperAdmin($userId);
			if(!$isSuper) {
				//Check if user has edit permission
				$userPermission = $this->UserController->getUserPermission($userId);
				$allowedEditRoute = Roles::roleAndRouter()['qlsx']['edit'];
				$isAllow = false;
				foreach ($userPermission as $key => $router) {
					if($router['router_name'] == $allowedEditRoute) {
						$isAllow = true;
						break;
					}
				}
				if(!$isAllow) {
					$rsData['message'] = 'Bạn không có quyền thực hiện tác vụ này';
					echo json_encode($rsData);exit();
				}
			}
			$date = new \DateTime();
			$createOn = $date->format('Y-m-d H:i:s');
			$updateData = [
				'update_on' => $createOn,
			];
			if($value != "") {
				$value = $userId;
			} else {
				$value = "";
			}
			$updateData[$type] = $value;
			$result = $this->db->update($this->tableName, $updateData, ['ma_sx' => $maSx]);
			if($result->rowCount()) {
				$this->superLog('Phe duyet lenh sx', $updateData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
				$data = $this->db->select($this->tableName, [$type, 'ma_sx'], ['ma_sx' => $maSx]);
				$rsData['data'] = isset($data[0]) ? $data[0] : [];
			} else {
				// echo "<pre>";
				// print_r($result->errorInfo());
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
				$this->superLog('Delete Ma SX', $id);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Đã xoá mã sản xuất khỏi hệ thống!';
				$rsData['data'] = $id;
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
	}
	public function deleteProduct($request, $response, $args){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Dữ liệu chưa được xoá thành công!'
		);
		// Get params and validate them here.
		$id = isset(	$args['id']) ? $args['id'] : '';
		if($id != "") {
			$result = $this->db->update('lotus_spsx',[
				'status' => 2,
			], ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Delete Sản Phẩm Theo Phiếu', $id);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Đã xoá sản phẩm khỏi phiếu nhập!';
				$rsData['data'] = $id;
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
	}
	public function fetchProductDetailsList($request){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu từ hệ thống!'
		);
		// Columns to select.
		$columns = [
				'products.id',
				'products.product_id',
				'products.category_id',
				'products.name',
				//'price',
				'products.unit',
				'products.min',
				'products.max',
				'lotus_cats.name(category_name)'
		];
		$collection = $this->db->select('products', [
			"[>]lotus_cats" => ["category_id" => "id"],
		], $columns, [
			"products.status" => 1
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
	public function fetchProductByCate($request, $response, $args){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu từ hệ thống!'
		);
		$cate_id = isset(	$args['cate_id']) ? $args['cate_id'] : '';
		// Columns to select.
		$columns = [
				'products.id',
				'products.product_id',
				'products.category_id',
				'products.name',
				//'price',
				'products.unit',
				'products.min',
				'products.max',
				'lotus_cats.name(category_name)'
		];
		$collection = $this->db->select('products', [
			"[>]lotus_cats" => ["category_id" => "id"],
		], $columns, [
			"products.status" => 1,
			"products.category_id" => $cate_id
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

}
