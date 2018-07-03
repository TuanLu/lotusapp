<?php
namespace App\Controllers;
use \Medoo\Medoo;
use \Monolog\Logger;
use \App\Helper\Data;
//use \Ramsey\Uuid\Uuid;
class CdcController extends BaseController
{
	private $tableName = 'lotus_sanluong';
	const ERROR_STATUS = 'error';
	const SUCCESS_STATUS = 'success';
 
	public function fetchCdc($request){ 
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu sản lượng nào từ hệ thống!'
		);
		// Columns to select.
		$columns = [
				'id',
				'id(key)',
				'ma_sl',
				'ma_ns',
				'ca',
				'timestart',
				'timestop',
				'address',
				'ma_cv',
				'workday',
				'status',
				'create_on'
		];
		$collection = $this->db->select($this->tableName, $columns, [
			"ORDER" => ["id" => "DESC"],
			"status" => 1
		]);
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['message'] = 'Dữ liệu đã được load!';
			$rsData['data'] = $collection;
		}
		echo json_encode($rsData);
	}
}
