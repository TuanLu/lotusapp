<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
use \Ramsey\Uuid\Uuid;

class KiemkeController extends BaseController
{
	private $tableName = 'lotus_kiemke';
	private $editNoteTable = 'edit_note_phieu_nhap_xuat_kho';

	private function getColumns() {
		$columns = [
			'lotus_kiemke.id',
			'lotus_kiemke.ma_phieu',
			'lotus_kiemke.ma_kho',
			'lotus_kiemke.note',
			'lotus_kiemke.type',
			'lotus_kiemke.user_check',
			'lotus_kiemke.address',
			'lotus_kiemke.tinh_trang',
			'lotus_kiemke.create_by',
			'users.username',
			'users.name',
			'lotus_kiemke.so_chung_tu',
			'create_on' => Medoo::raw("DATE_FORMAT( `lotus_kiemke`.`create_on`, '%d/%m/%Y' )")
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
			"lotus_kiemke.status" => 1,
			"lotus_kiemke.type" => 1, //1 => phieu nhap, 2 => phieu xuat
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
		$collection = $this->db->select('lotus_spkiemke', $columns, [
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
		$userCheck = isset($params['user_check']) ? $params['user_check'] : '';
		$editNote = isset($params['editNote']) ? $params['editNote'] : '';
		$products = (isset($params['products']) && !empty($params['products'])) ? $params['products'] : [];
		$tinh_trang = isset($params['tinh_trang']) ? $params['tinh_trang'] : 2;
		$userId = isset($params['create_by']) ? $params['create_by'] : '';
		if($tinh_trang) {$tinh_trang = 1;}else{$tinh_trang = 2;}
		//Some validation 
		if(empty($products)) {
			$rsData['message'] = 'Không có sản phẩm nào trong phiếu kiểm kê!';
				echo json_encode($rsData);
				die;
		}
		if(!$maKho) {
			$rsData['message'] = 'Mã kho không được để trống!';
				echo json_encode($rsData);
				die;
		}
		// if(!$userCheck) {
		// 	$rsData['message'] = 'Tên người thực hiện giao dịch không được để trống!';
		// 		echo json_encode($rsData);
		// 		die;
		// }
		if($maPhieu && $editNote == '') {
			$rsData['message'] = 'Hãy nhập lý do sửa phiếu!';
				echo json_encode($rsData);
				die;
		}
		if(!$id) {
			$uuid1 = Uuid::uuid1();
			$maPhieu = $uuid1->toString();
			$date = new \DateTime();
			$createOn = $date->format('Y-m-d H:i:s');
			$userId = isset($this->jwt->id) ? $this->jwt->id : '';
			//Tao phieu 
			$duLieuPhieu = array(
				'ma_phieu' => $maPhieu,
				'ma_kho' => $maKho,
				'type' => 1, // 1 => Nhập
				'create_on' => $createOn,
				'create_by' => $userId,
				'user_check' => $userCheck,
				'note' => isset($params['note']) ? $params['note'] : '',
				'address' => isset($params['address']) ? $params['address'] : '',
				'so_chung_tu' => isset($params['so_chung_tu']) ? $params['so_chung_tu'] : '',
				'tinh_trang' => $tinh_trang, // 2 => Chờ phê duyệt
			);
			$result = $this->db->insert($this->tableName, $duLieuPhieu); 
			if($result->rowCount()) {
				//San pham trong phieu
				$validProducts = [];
				foreach($products as $product) {
					$validProducts[] = array(
						'ma_phieu' => $maPhieu,
						'ma_lo' => $product['ma_lo'],
						'product_id' => $product['product_id'],
						'label' => $product['label'],
						'unit' => $product['unit'],
						'sl_chungtu' => $product['sl_chungtu'],
						'sl_thucnhap' => $product['sl_thucnhap'],
						'price' => $product['price'],
						'create_on' => $createOn,
						'ngay_san_xuat' => $product['ngay_san_xuat'],
						'ngay_het_han' => $product['ngay_het_han'],
					);
				}
				$productsNum = $this->db->insert('lotus_spkiemke', $validProducts);
				if($productsNum->rowCount()) {
					$rsData['status'] = 'success';
					$columns = $this->getColumns();
					$data = $this->db->select('lotus_kiemke', ["id", "ma_phieu"], ['ma_phieu' => $maPhieu]);
					$rsData['data'] = $data[0];
					$rsData['message'] = 'Đã thêm phiếu kiểm kê thành công!';
				} else {
					$rsData['message'] = 'Dữ liệu chưa được sản phẩm theo phiếu!';
				}
			} else {
				$rsData['message'] = 'Không thể tạo phiếu kiểm kê vào CSDL';
			}
		} else {
			//update data base on $id
			$date = new \DateTime();
			$itemData = [
				'ma_phieu' => $maPhieu,
				'ma_kho' => $maKho,
				'type' => 1, // 1 => Nhập
				'create_on' => $date->format('Y-m-d H:i:s'),
				'create_by' => $userId,
				'user_check' => $userCheck,
				'note' => isset($params['note']) ? $params['note'] : '',
				'address' => isset($params['address']) ? $params['address'] : '',
				'tinh_trang' => $tinh_trang,
				'so_chung_tu' => isset($params['so_chung_tu']) ? $params['so_chung_tu'] : '',
				'update_on' => $date->format('Y-m-d H:i:s'),
			];
			//Create edit note before update data
			$editNoteData = array(
				'user_id' => $userId,
				'ma_phieu' => $maPhieu,
				'note' => $editNote,
				'create_on' => $date->format('Y-m-d H:i:s'),
			);
			$createEditNote = $this->db->insert($this->editNoteTable, $editNoteData);
			if($createEditNote->rowCount()) {
				$result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
				if($result->rowCount()) {
					$this->superLog('Update phiếu kiểm kê', $itemData);
					$rsData['status'] = self::SUCCESS_STATUS;
					$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
				} else {
					$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống! Có thể do bị trùng Mã phiếu!';
				}
			} else {
				$rsData['message'] = 'Xin lỗi, chưa lưu được lý do chỉnh sửa phiếu!';
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
		$maLo = isset($params['ma_lo']) ? $params['ma_lo'] : '';
		$maSp = isset($params['product_id']) ? $params['product_id'] : '';
		$maPhieu = isset($params['ma_phieu']) ? $params['ma_phieu'] : '';		
		//Some validation 
		if(!$maPhieu) {
			$rsData['message'] = 'Mã phiếu không được để trống!';
				echo json_encode($rsData);
				die;
		}
		// if(!$maLo) {
		// 	$rsData['message'] = 'Mã lô không được để trống!';
		// 		echo json_encode($rsData);
		// 		die;
		// }
		if(!$maSp) {
			$rsData['message'] = 'Mã VT không được để trống!';
				echo json_encode($rsData);
				die;
		}
		$userId = isset($this->jwt->id) ? $this->jwt->id : '';
		$date = new \DateTime();
		$createOn = $date->format('Y-m-d H:i:s');
		if(!$id) {
			$itemData = array(
				'ma_phieu' => $maPhieu,
				'ma_lo' => $maLo,
				'product_id' => $maSp,
				'label' => isset($params['label']) ? $params['label'] : '',
				'unit' => isset($params['unit']) ? $params['unit'] : '',
				'sl_chungtu' => isset($params['sl_chungtu']) ? $params['sl_chungtu'] : '',
				'sl_thucnhap' => isset($params['sl_thucnhap']) ? $params['sl_thucnhap'] : '',
				'price' => isset($params['price']) ? $params['price'] : '',
				'create_on' => $createOn,
				'ngay_san_xuat' => isset($params['ngay_san_xuat']) ? $params['ngay_san_xuat'] : '',
				'ngay_het_han' => isset($params['ngay_het_han']) ? $params['ngay_het_han'] : '',
			);
			$result = $this->db->insert('lotus_spkiemke', $itemData);
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$id = $this->db->id();
				$rsData['data'] = array('id' => $id);
				$rsData['message'] = 'Đã thêm sản phẩm vào phiếu kiểm kê thành công!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu!';
			}
		} else {
			//update data base on $id
			$itemData = [
				'ma_phieu' => $maPhieu,
				'ma_lo' => $maLo,
				'product_id' => $maSp,
				'label' => isset($params['label']) ? $params['label'] : '',
				'unit' => isset($params['unit']) ? $params['unit'] : '',
				'sl_chungtu' => isset($params['sl_chungtu']) ? $params['sl_chungtu'] : '',
				'sl_thucnhap' => isset($params['sl_thucnhap']) ? $params['sl_thucnhap'] : '',
				'price' => isset($params['price']) ? $params['price'] : '',
				'update_on' =>$createOn,
				'ngay_san_xuat' => isset($params['ngay_san_xuat']) ? $params['ngay_san_xuat'] : '',
				'ngay_het_han' => isset($params['ngay_het_han']) ? $params['ngay_het_han'] : '',
			];
			$result = $this->db->update('lotus_spkiemke', $itemData, ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Update SP theo phiếu', $itemData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống!';
			}
		}
		echo json_encode($rsData);
	}
	public function changeStatus($request, $response) {
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		// Get params and validate them here.
		$params = $request->getParams();
		if(isset($params['ids'])
			&& isset($params['type'])
			&& isset($params['status'])) {

			$userId = isset($this->jwt->id) ? $this->jwt->id : '';
			$date = new \DateTime();
			$createOn = $date->format('Y-m-d H:i:s');
			$updateData = [
				'update_on' => $createOn,
			];
			if($params['type'] == 'qc_check') {
				$updateData['qc_check'] = $params['status'];
				$updateData['qc_id'] = $userId;
			} else {
				$updateData['qa_check'] = $params['status'];
				$updateData['qa_id'] = $userId;
			}
			
			$result = $this->db->update('lotus_spkiemke', $updateData, ['id' => $params['ids']]);
			if($result->rowCount()) {
				$this->superLog('Update SP theo phiếu', $updateData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống!';
			}
		}
		echo json_encode($rsData);
	}
	public function changePosition($request, $response) {
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Xin lỗi! Dữ liệu chưa được cập nhật thành công!'
		);
		// Get params and validate them here.
		$params = $request->getParams();
		$maPhieu = isset($params['ma_phieu']) ? $params['ma_phieu'] : '';
		$maKho = isset($params['ma_kho']) ? $params['ma_kho'] : '';
		if(!$maKho || !$maPhieu) {
			$rsData['message'] = 'Thiếu mã kho hoặc mã phiếu';
			echo json_encode($rsData);
			die;
		}
		if(isset($params['id'])
			&& isset($params['vi_tri_kho'])) {

			$userId = isset($this->jwt->id) ? $this->jwt->id : '';
			$date = new \DateTime();
			$createOn = $date->format('Y-m-d H:i:s');
			//Update kho 
			$updateKhoData = [
				'update_by' => $userId,
				'ma_kho' => $maKho,
				'update_on' => $createOn,
			];
			$result = $this->db->update('lotus_kiemke', $updateKhoData, ['ma_phieu' => $maPhieu]);
			if($result->rowCount()) {
				$updateData = [
					'vi_tri_kho' => $params['vi_tri_kho'],
					'update_on' => $createOn,
				];
				$result = $this->db->update('lotus_spkiemke', $updateData, ['id' => $params['id']]);
				if($result->rowCount()) {
					$this->superLog('Update SP theo phiếu', $updateData);
					$rsData['status'] = self::SUCCESS_STATUS;
					$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
				} else {
					$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống!';
				}
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
				$this->superLog('Delete Ma Phieu', $id);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Đã xoá phiếu khỏi hệ thống!';
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
			$result = $this->db->update('lotus_spkiemke',[
				'status' => 2,
			], ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Delete Sản Phẩm Theo Phiếu', $id);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Đã xoá sản phẩm khỏi phiếu kiểm kê!';
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
			$date = new \DateTime();
			$createOn = $date->format('Y-m-d H:i:s');
			$updateData = [
				'update_on' => $createOn,
				'update_by' => $userId
			];
			if($value != "") {
				$value = 1;
			} else {
				$value = 2;
			}
			$updateData['tinh_trang'] = $value;
			$result = $this->db->update($this->tableName, $updateData, ['ma_phieu' => $maPhieu]);
			if($result->rowCount()) {
				$this->superLog('Phe duyet phiếu kiểm kê', $updateData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
				$data = $this->db->select($this->tableName, ['ma_phieu', 'tinh_trang'], ['ma_phieu' => $maPhieu]);
				$rsData['data'] = isset($data[0]) ? $data[0] : [];
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống!';
			}
		}
		echo json_encode($rsData);
	}
}
