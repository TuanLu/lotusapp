<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
use \Ramsey\Uuid\Uuid;

class PhieunhapController extends BaseController
{
	private $tableName = 'phieu_nhap_xuat_kho';

	const TABLE_FIELDS = [
		'id',
		'ma_phieu',
		'ma_kho',
		'note',
		'nguoi_giao_dich',
		'address',
		'tinh_trang'
	];
 
	public function fetch($request){
		//$this->logger->addInfo('Request Npp path');
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu từ hệ thống!'
		);
		// Columns to select.
		$columns = self::TABLE_FIELDS;
		//echo "<pre>";
		//print_r($columns);die;
		$collection = $this->db->select($this->tableName, $columns, [
			"status" => 1
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
			'sl_thucnhap'
		];
		$collection = $this->db->select('san_pham_theo_phieu', $columns, [
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
		$nguoiGiaoDich = isset($params['nguoi_giao_dich']) ? $params['nguoi_giao_dich'] : '';
		$products = (isset($params['products']) && !empty($params['products'])) ? $params['products'] : [];
		//Some validation 
		if(empty($products)) {
			$rsData['message'] = 'Không có sản phẩm nào trong phiếu nhập!';
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
		if(!$id) {
			$uuid1 = Uuid::uuid1();
			$maPhieu = $uuid1->toString();
			$date = new \DateTime();
			//Tao phieu 
			$userId = isset($this->jwt->id) ? $this->jwt->id : '';
			$duLieuPhieu = array(
				'ma_phieu' => $maPhieu,
				'ma_kho' => $maKho,
				'type' => 1, // 1 => Nhập
				'create_on' => $date->format('Y-m-d H:i:s'),
				'create_by' => $userId,
				'tinh_trang' => 2, // Chờ phê duyệt
				'nguoi_giao_dich' => $nguoiGiaoDich,
				'note' => isset($params['note']) ? $params['note'] : '',
				'address' => isset($params['address']) ? $params['address'] : ''
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
					);
				}
				$productsNum = $this->db->insert('san_pham_theo_phieu', $validProducts);
				if($productsNum->rowCount()) {
					$rsData['status'] = 'success';
					$data = $this->db->select('phieu_nhap_xuat_kho', self::TABLE_FIELDS, ['ma_phieu' => $maPhieu]);
					$rsData['data'] = $data[0];
					$rsData['message'] = 'Đã thêm phiếu nhập thành công!';
				} else {
					$rsData['message'] = 'Dữ liệu chưa được cập nhật vào cơ sở dữ liệu!';
				}
			}
		} else {
			//update data base on $id
			// $date = new \DateTime();
			// $itemData = [
			// 	'product_id' => $maSP,
			// 	'category_id' => $cateId,
			// 	'name' => $name,
			// 	//'price' => $price,
			// 	'unit' => $unit,
			// 	'min' => $min,
			// 	'max' => $max,
			// 	'update_on' => $date->format('Y-m-d H:i:s'),
			// ];
			// $result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
			// if($result->rowCount()) {
			// 	//$this->superLog('Update NPP', $itemData);
			// 	$rsData['status'] = self::SUCCESS_STATUS;
			// 	$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			// } else {
			// 	$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống! Có thể do bị trùng Mã sản phẩm!';
			// }
			
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
			$data = $this->db->select($this->tableName, ['id', 'product_id'], ['id' => $id]);
			if(!empty($data)) {
				$result = $this->db->update($this->tableName,[
					'status' => 2,
					'product_id' => $data[0]['product_id'] . '_' . microtime()
				], ['id' => $id]);
				if($result->rowCount()) {
					$this->superLog('Delete NPP', $id);
					$rsData['status'] = self::SUCCESS_STATUS;
					$rsData['message'] = 'Đã xoá phiếu khỏi hệ thống!';
					$rsData['data'] = $id;
				}
			}
		} else {
			$rsData['message'] = 'ID trống, nên không xoá được dữ liệu!';
		}
		echo json_encode($rsData);
	}
}
