<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
use \Ramsey\Uuid\Uuid;

class PhieuxuatController extends BaseController
{
	private $tableName = 'phieu_nhap_xuat_kho';

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
		if(!$nguoiGiaoDich) {
			$rsData['message'] = 'Tên người thực hiện giao dịch không được để trống!';
				echo json_encode($rsData);
				die;
		}
		$userId = isset($this->jwt->id) ? $this->jwt->id : '';
		if(!$id) {
			$uuid1 = Uuid::uuid1();
			$maPhieu = $uuid1->toString();
			$date = new \DateTime();
			$createOn = $date->format('Y-m-d H:i:s');
			//Tao phieu 
			$duLieuPhieu = array(
				'ma_phieu' => $maPhieu,
				'ma_kho' => $maKho,
				'type' => 2, // 1 => Nhập // 2 => Xuất
				'create_on' => $createOn,
				'create_by' => $userId,
				'nguoi_giao_dich' => $nguoiGiaoDich,
				'note' => isset($params['note']) ? $params['note'] : '',
				'address' => isset($params['address']) ? $params['address'] : '',
				'so_chung_tu' => isset($params['so_chung_tu']) ? $params['so_chung_tu'] : '',
				'tinh_trang' => isset($params['tinh_trang']) ? $params['tinh_trang'] : '', // 2 => Chờ phê duyệt
			);
			$result = $this->db->insert($this->tableName, $duLieuPhieu);
			if($result->rowCount()) {
				//San pham trong phieu
				$validProducts = [];
				foreach($products as $product) {
					$validProducts[] = array(
						'ma_phieu' => $maPhieu,
						'ma_phieu_nhap' => $product['ma_phieu'],
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
				$productsNum = $this->db->insert('san_pham_theo_phieu_xuat', $validProducts);
				if($productsNum->rowCount()) {
					$rsData['status'] = 'success';
					$columns = $this->getColumns();
					$data = $this->db->select('phieu_nhap_xuat_kho', $columns, ['ma_phieu' => $maPhieu]);
					$rsData['data'] = $data[0];
					$rsData['message'] = 'Đã thêm phiếu xuất thành công!';
				} else {
					$rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu!';
				}
			}
		} else {
			//update data base on $id
			$date = new \DateTime();
			$itemData = [
				'ma_phieu' => $maPhieu,
				'ma_kho' => $maKho,
				'type' => 2, // 1 => Nhập 2 => Xuất
				'create_on' => $date->format('Y-m-d H:i:s'),
				'create_by' => $userId,
				'nguoi_giao_dich' => $nguoiGiaoDich,
				'note' => isset($params['note']) ? $params['note'] : '',
				'address' => isset($params['address']) ? $params['address'] : '',
				'tinh_trang' => isset($params['tinh_trang']) ? $params['tinh_trang'] : '',
				'so_chung_tu' => isset($params['so_chung_tu']) ? $params['so_chung_tu'] : '',
				'update_on' => $date->format('Y-m-d H:i:s'),
			];
			$result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Update phiếu xuất', $itemData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống! Có thể do bị trùng Mã phiếu!';
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
}
