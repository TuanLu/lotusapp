<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
use \Ramsey\Uuid\Uuid;
use \App\Helper\Data;
use \App\Helper\Roles;

class PhieuxuatController extends BaseController
{
	private $tableName = 'phieu_nhap_xuat_kho';
	private $editNoteTable = 'edit_note_phieu_nhap_xuat_kho';

	private function getColumns() {
		$columns = [
			'phieu_nhap_xuat_kho.id',
			'phieu_nhap_xuat_kho.ma_phieu',
			'phieu_nhap_xuat_kho.ma_kho',
			'phieu_nhap_xuat_kho.note',
			'phieu_nhap_xuat_kho.type',
			'phieu_nhap_xuat_kho.nguoi_giao_dich',
			'phieu_nhap_xuat_kho.address',
			'phieu_nhap_xuat_kho.tinh_trang',
			'phieu_nhap_xuat_kho.create_by',
			'users.username',
			'users.name',
			'phieu_nhap_xuat_kho.so_chung_tu',
			'create_on' => Medoo::raw("DATE_FORMAT( `phieu_nhap_xuat_kho`.`create_on`, '%d/%m/%Y' )")
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
		//echo "<pre>";
		//print_r($columns);die;
		$collection = $this->db->select($this->tableName,[
			"[>]users" => ["create_by" => "id"],
		] ,$columns, [
			"phieu_nhap_xuat_kho.status" => 1,
			"phieu_nhap_xuat_kho.type" => 2,
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
		$maPhieu = isset(	$args['ma_phieu']) ? $args['ma_phieu'] : '';
		// Columns to select.
		$columns = [
			'id',
			'id(key)',//For unique react item
			'ma_phieu',
			'product_id',
			'ma_lo',
			'label',
			'unit',
			'price',
			'sl_chungtu',
			'sl_thucnhap',
			'qc_check',
			'qa_check',
			'ngay_san_xuat',
			'ngay_het_han'
		];
		$collection = $this->db->select('san_pham_theo_phieu_xuat', $columns, [
			"status" => 1,
			"ma_phieu" => $maPhieu
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
	public function fetchVerifyProducts($request, $response) {
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa load được sản phẩm của phiếu!'
		);
		$helper = new Data();
		$sql = $helper->getAllProductFromImportBill(true);
		if($sql) {
			$collection = $this->db->query($sql)->fetchAll(\PDO::FETCH_ASSOC);
			if(!empty($collection)) {
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được load!';
				$rsData['data'] = $collection;
			}
		}
		echo json_encode($rsData);
	}
	private function saveProductOfBill($products, $maPhieu, $createOn, $isEdit = false) {
		
		$validProducts = [];
		if($isEdit) {
			//Delete old product belong to bill 
			$oldProducts = $this->db->select('san_pham_theo_phieu_xuat', ['id','ma_phieu'], ['ma_phieu' => $maPhieu]);
			if(!empty($oldProducts)) {
				$oldIds = [];
				foreach ($oldProducts as $key => $item) {
					$oldIds[] = $item['id'];
				}
				$this->db->update('san_pham_theo_phieu_xuat', ['status' => 2], ['id' => $oldIds]);
			}
		}
		foreach($products as $product) {
			$validProducts[] = array(
				'ma_phieu' => $maPhieu,
				'ma_phieu_nhap' => isset($product['ma_phieu']) ?  $product['ma_phieu'] : '',
				'ma_lo' => isset($product['ma_lo']) ?  $product['ma_lo'] : '',
				'product_id' => isset($product['product_id']) ?  $product['product_id'] : '',
				'label' => isset($product['label']) ?  $product['label'] : '',
				'unit' => isset($product['unit']) ?  $product['unit'] : '',
				'sl_chungtu' => isset($product['sl_chungtu']) ?  $product['sl_chungtu'] : '',
				'sl_thucnhap' => isset($product['sl_thucnhap']) ?  $product['sl_thucnhap'] : '',
				'price' => isset($product['price']) ?  $product['price'] : '',
				'create_on' => $createOn,
				'ngay_san_xuat' => isset($product['ngay_san_xuat']) ?  $product['ngay_san_xuat'] : '',
				'ngay_het_han' => isset($product['ngay_het_han']) ?  $product['ngay_het_han'] : '',
			);
		}
		$result = $this->db->insert('san_pham_theo_phieu_xuat', $validProducts);
		return $result;
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
		$maKho = isset($params['ma_kho']) ? $params['ma_kho'] : '';
		$maPhieu = isset($params['ma_phieu']) ? $params['ma_phieu'] : '';
		$nguoiGiaoDich = isset($params['nguoi_giao_dich']) ? $params['nguoi_giao_dich'] : '';
		$editNote = isset($params['editNote']) ? $params['editNote'] : '';
		$products = (isset($params['products']) && !empty($params['products'])) ? $params['products'] : [];
		//Some validation 
		if(empty($products)) {
			$rsData['message'] = 'Không có sản phẩm nào trong phiếu xuất!';
				echo json_encode($rsData);
				die;
		}
		if(!$maKho) {
			$rsData['message'] = 'Mã kho không được để trống!';
				echo json_encode($rsData);
				die;
		}
		if($maPhieu && $editNote == '') {
			$rsData['message'] = 'Hãy nhập lý do sửa phiếu!';
				echo json_encode($rsData);
				die;
		}

		$userId = isset($this->jwt->id) ? $this->jwt->id : '';
		$date = new \DateTime();
		$createOn = $date->format('Y-m-d H:i:s');
		$itemData = array(
			'ma_phieu' => $maPhieu,
			'ma_kho' => $maKho,
			'type' => 2, // 1 => Nhập // 2 => Xuất
			'nguoi_giao_dich' => $nguoiGiaoDich,
			'note' => isset($params['note']) ? $params['note'] : '',
			'address' => isset($params['address']) ? $params['address'] : '',
			'so_chung_tu' => isset($params['so_chung_tu']) ? $params['so_chung_tu'] : '',
			'tinh_trang' => isset($params['tinh_trang']) ? $params['tinh_trang'] : '', // 2 => Chờ phê duyệt
		);
		if(!$id) {
			$uuid1 = Uuid::uuid1();
			$maPhieu = $uuid1->toString();
			//Tao phieu 
			$itemData['ma_phieu'] = $maPhieu;
			$itemData['create_on'] = $createOn;
			$itemData['create_by'] = $userId;
			$result = $this->db->insert($this->tableName, $itemData);
			if($result->rowCount()) {
				//San pham trong phieu
				$productsNum = $this->saveProductOfBill($products, $maPhieu, $createOn, false);
				if($productsNum->rowCount()) {
					$rsData['status'] = 'success';
					$columns = $this->getColumns();
					$data = $this->db->select('phieu_nhap_xuat_kho', ["id", "ma_phieu"], ['ma_phieu' => $maPhieu]);
					$rsData['data'] = $data[0];
					$rsData['message'] = 'Đã thêm phiếu xuất thành công!';
				} else {
					$rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu!';
				}
			}
		} else {
			//Create edit note before update data
			$editNoteData = array(
				'user_id' => $userId,
				'ma_phieu' => $maPhieu,
				'note' => $editNote,
				'create_on' => $createOn,
			);
			$createEditNote = $this->db->insert($this->editNoteTable, $editNoteData);
			if($createEditNote->rowCount()) {
				//update data base on $id
				$itemData['update_on'] = $createOn;
				$itemData['update_by'] = $userId;
				$result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
				if($result->rowCount()) {
					$this->superLog('Update phiếu xuất', $itemData);
					$productsNum = $this->saveProductOfBill($products, $maPhieu, $createOn, true);
					if($productsNum->rowCount()) {
						$this->superLog('Update SP phiếu xuất', $products);
						$rsData['status'] = self::SUCCESS_STATUS;
						$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
					} else {
						$rsData['message'] = 'Chưa cập nhật được sản phẩm theo phiếu xuất!';
					} 
				} else {
					$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống!!';
				}
			} else {
				$rsData['message'] = 'Chưa lưu được lý do sửa phiếu!';
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
				$this->superLog('Delete Ma Phieu xuat', $id);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Đã xoá phiếu khỏi hệ thống!';
				$rsData['data'] = $id;
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
	}
	public function fetchProductDetailsList($request){
		//$this->logger->addInfo('Request Npp path');
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
	public function pheDuyet($request, $response) {
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		$value = $request->getParam('value');
		$maPhieu = $request->getParam('ma_phieu');
		if($maPhieu) {
			$userId = isset($this->jwt->id) ? $this->jwt->id : '';
			//Validate if user has permission to do this
			$isSuper = $this->UserController->isSuperAdmin($userId);
			if(!$isSuper) {
				//Check if user has edit permission
				$userPermission = $this->UserController->getUserPermission($userId);
				$allowedEditRoute = Roles::roleAndRouter()['qlphieuxuat']['edit'];
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
				'verify_by' => $userId,
			];
			if($value == 1) {
				$updateData['tinh_trang'] = $value;
				$result = $this->db->update($this->tableName, $updateData, ['ma_phieu' => $maPhieu]);
				if($result->rowCount()) {
					$this->superLog('Phê duyệt phiếu xuất', $updateData);
					$rsData['status'] = self::SUCCESS_STATUS;
					$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
					$data = $this->db->select($this->tableName, ['ma_phieu', 'tinh_trang'], ['ma_phieu' => $maPhieu]);
					$rsData['data'] = isset($data[0]) ? $data[0] : [];
				} else {
					$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống!';
				}
			}
		}
		echo json_encode($rsData);
	}
}
