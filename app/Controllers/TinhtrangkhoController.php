<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
use \Ramsey\Uuid\Uuid;

class TinhtrangkhoController extends BaseController {

	public function fetchAllProduct($request, $response, $args) {
		//$this->logger->addInfo('Request Npp path');
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa load được sản phẩm của phiếu!'
		);
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
			'qa_check'
		];
		$collection = $this->db->select('san_pham_theo_phieu', $columns, [
			"status" => 1,
			"ORDER" => [
				"id" => "DESC"
			]
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
		if(!$maLo) {
			$rsData['message'] = 'Mã lô không được để trống!';
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
				'ma_phieu' => $maPhieu,
				'ma_lo' => $maLo,
				'product_id' => $maSp,
				'label' => isset($params['label']) ? $params['label'] : '',
				'unit' => isset($params['unit']) ? $params['unit'] : '',
				'sl_chungtu' => isset($params['sl_chungtu']) ? $params['sl_chungtu'] : '',
				'sl_thucnhap' => isset($params['sl_thucnhap']) ? $params['sl_thucnhap'] : '',
				'price' => isset($params['price']) ? $params['price'] : '',
				'create_on' => $createOn
			);
			$result = $this->db->insert('san_pham_theo_phieu', $itemData);
			if($result->rowCount()) {
				$rsData['status'] = 'success';
				$id = $this->db->id();
				$rsData['data'] = array('id' => $id);
				$rsData['message'] = 'Đã thêm sản phẩm vào phiếu nhập thành công!';
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
			];
			$result = $this->db->update('san_pham_theo_phieu', $itemData, ['id' => $id]);
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
			
			$result = $this->db->update('san_pham_theo_phieu', $updateData, ['id' => $params['ids']]);
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
	public function deleteProduct($request, $response, $args){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Dữ liệu chưa được xoá thành công!'
		);
		// Get params and validate them here.
		$id = isset(	$args['id']) ? $args['id'] : '';
		if($id != "") {
			$result = $this->db->update('san_pham_theo_phieu',[
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
}
