<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
use \Ramsey\Uuid\Uuid;

class SXController extends BaseController
{
	private $tableName = 'lotus_sanxuat';

	private function getColumns() {
		$columns = [
			'id',
			'ma_sx',
			'ma',
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
			'status',
			'created' => Medoo::raw("DATE_FORMAT( created, '%d/%m/%Y' )")
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
			'ma',
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
			'status'
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
		$tttb_kltb = isset($params['tttb_kltb']) ? $params['tttb_kltb'] : '';


		$products = (isset($params['products']) && !empty($params['products'])) ? $params['products'] : [];
		//Some validation 
		if(empty($products)) {
			$rsData['message'] = 'Không có VT nào trong lệnh sản xuất!';
				echo json_encode($rsData);
				die;
		}
		if(!$ma) {
			$rsData['message'] = 'Mã SX không được để trống!';
				echo json_encode($rsData);
				die;
		}
		if(!$so) {
			$rsData['message'] = 'Số sản xuất không được để trống!';
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
				'so' => $so,
				'ma' => $ma,
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
				'status' => 1
			);
			$result = $this->db->insert($this->tableName, $duLieuPhieu);
			if($result->rowCount()) {
				//San pham trong phieu
				$validProducts = [];
				foreach($products as $product) {
					$validProducts[] = array(
						'ma_sx' => $ma_sx,
						'ma_maquet' => $product['ma_maquet'],
						'product_id' => $product['product_id'],
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
			}
		} else {
			//update data base on $id
			$date = new \DateTime();
			$itemData = [
				'ma_sx' => $ma_sx,
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
				'status' => 1
			];
			$result = $this->db->update($this->tableName, $itemData, ['id' => $id]);
			if($result->rowCount()) {
				$this->superLog('Update phiếu nhập', $itemData);
				$rsData['status'] = self::SUCCESS_STATUS;
				$rsData['message'] = 'Dữ liệu đã được cập nhật vào hệ thống!';
			} else {
				$rsData['message'] = 'Dữ liệu chưa được cập nhật vào hệ thống! Có thể do bị trùng Mã phiếu!';
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
		$date = new \DateTime();
		$createOn = $date->format('Y-m-d H:i:s');
		if(!$id) {
			$itemData = array(
				'ma_sx' => $ma_sx,
				'ma_maquet' => isset($params['ma_maquet']) ? $params['ma_maquet'] : '',
				'product_id' => $maSp,
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
				'product_id' => $ma_sp,
				'sl_1000' => isset($params['sl_1000']) ? $params['sl_1000'] : '',
				'sl_nvl' => isset($params['sl_nvl']) ? $params['sl_nvl'] : '',
				'hu_hao' => isset($params['hu_hao']) ? $params['hu_hao'] : '',
				'create_on' => $createOn
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
			
			$result = $this->db->update('lotus_spsx', $updateData, ['id' => $params['ids']]);
			if($result->rowCount()) {
				$this->superLog('Update SP theo mã SX ', $updateData);
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
		$ma_sx = isset($params['ma_sx']) ? $params['ma_sx'] : '';
		if(!$ma_sx) {
			$rsData['message'] = 'Thiếu mã sản xuất';
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
			$result = $this->db->update('phieu_nhap_xuat_kho', $updateKhoData, ['ma_sx' => $ma_sx]);
			if($result->rowCount()) {
				$updateData = [
					'vi_tri_kho' => $params['vi_tri_kho'],
					'update_on' => $createOn,
				];
				$result = $this->db->update('lotus_spsx', $updateData, ['id' => $params['id']]);
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
