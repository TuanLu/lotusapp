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
		$sql = 'SELECT lotus_sanluong.ma_ns,lotus_nhansu.name,lotus_sanluong.timestart,lotus_sanluong.timestop, SUM(CASE WHEN lotus_congviec.heso = 1.0 THEN ROUND(lotus_congviec.heso * HOUR(TIMEDIFF(lotus_sanluong.timestart, lotus_sanluong.timestop)),2) ELSE 0 END) as heso1, SUM(CASE WHEN lotus_congviec.heso = 1.2 THEN ROUND(lotus_congviec.heso * HOUR(TIMEDIFF(lotus_sanluong.timestart, lotus_sanluong.timestop)),2) ELSE 0 END) as heso12, SUM(CASE WHEN lotus_congviec.heso = 1.3 THEN ROUND(lotus_congviec.heso * HOUR(TIMEDIFF(lotus_sanluong.timestart, lotus_sanluong.timestop)),2) ELSE 0 END) as heso13,HOUR(TIMEDIFF(lotus_sanluong.timestart, lotus_sanluong.timestop)) as so_gio,  SUM(ROUND((HOUR(TIMEDIFF(lotus_sanluong.timestart, lotus_sanluong.timestop))*heso),2)) as tong_cong  FROM lotus_sanluong,lotus_congviec,lotus_nhansu WHERE lotus_sanluong.ma_cv = lotus_congviec.ma_cv AND lotus_sanluong.ma_ns = lotus_nhansu.ma_ns AND MONTH(workday) = MONTH(CURRENT_DATE()) GROUP BY lotus_nhansu.ma_ns ORDER BY tong_cong DESC';
		$collection = $this->db->query($sql)->fetchAll(\PDO::FETCH_ASSOC);
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['message'] = 'Dữ liệu đã được load!';
			$rsData['data'] = $collection;
		}
		echo json_encode($rsData);
	}
	public function fetchTotal($request){
		$rsData = array(
			'status' => self::ERROR_STATUS,
			'message' => 'Chưa có dữ liệu sản lượng nào từ hệ thống!'
		);
		// Columns to select.
		$sql = 'SELECT SUM(CASE WHEN lotus_congviec.heso = 1.0 THEN ROUND(lotus_congviec.heso * HOUR(TIMEDIFF(lotus_sanluong.timestart, lotus_sanluong.timestop)),2) ELSE 0 END) as heso1, SUM(CASE WHEN lotus_congviec.heso = 1.2 THEN ROUND(lotus_congviec.heso * HOUR(TIMEDIFF(lotus_sanluong.timestart, lotus_sanluong.timestop)),2) ELSE 0 END) as heso12, SUM(CASE WHEN lotus_congviec.heso = 1.3 THEN ROUND(lotus_congviec.heso * HOUR(TIMEDIFF(lotus_sanluong.timestart, lotus_sanluong.timestop)),2) ELSE 0 END) as heso13, SUM(ROUND((HOUR(TIMEDIFF(lotus_sanluong.timestart, lotus_sanluong.timestop))*heso),2)) as tong_cong FROM lotus_sanluong,lotus_congviec,lotus_nhansu WHERE lotus_sanluong.ma_cv = lotus_congviec.ma_cv AND lotus_sanluong.ma_ns = lotus_nhansu.ma_ns AND MONTH(workday) = MONTH(CURRENT_DATE()) ORDER BY tong_cong DESC';
		$collection = $this->db->query($sql)->fetchAll(\PDO::FETCH_ASSOC);
		if(!empty($collection)) {
			$rsData['status'] = self::SUCCESS_STATUS;
			$rsData['message'] = 'Dữ liệu đã được load!';
			$rsData['data'] = $collection;
		}
		echo json_encode($rsData);
	}
}
