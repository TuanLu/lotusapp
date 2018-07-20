/*global gantt*/
import React, { Component } from 'react';
import 'dhtmlx-gantt';
//import 'dhtmlx-gantt/codebase/ext/dhtmlxgantt_tooltip.js';
import 'dhtmlx-gantt/codebase/ext/dhtmlxgantt_undo.js';
//import 'dhtmlx-gantt/codebase/locale/locale_ar.js';
//import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import './QuanlyQuytrinhSanxuat/Theme.css';
//import {connect} from 'react-redux'
import {getTokenHeader} from 'ISD_API'
import {updateStateData} from 'actions'
import moment from 'moment'
import { 
  message,
  Spin
} from 'antd';

class KehoachSanxuatDaihan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      resetEvents: false,
      data: {
        'data': [
          {"id":11, "text":"Project #1", "start_date":"2018-03-28", "duration":"11", "progress": 0.6, "open": true},
		      {"id":1, "text":"Project #2", "start_date":"2018-04-01", "duration":"18", "progress": 0.4, "open": true},
        ],
        'links': []
      }
    }
  }
  fetchTasks() {
    this.setState({loading: true});
    fetch(ISD_BASE_URL + 'gantt/allPlan', {
      headers: getTokenHeader()
    })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      if(json.status == 'error') {
        message.warning(json.message, 3);
      } else {
        if(json.data) {
          this.setState({
            data: json.data,
            loading: false
          });
          this.renderGantt();
          return false;
        }
      }
      this.setState({
        loading: false, 
      });
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu quy trình sản xuất!', 3);
      console.log(error);
      this.setState({loading: false});
    }); 
  }
  renderGantt() {
    gantt.config.xml_date = "%Y-%m-%d %H:%i:%s";
    gantt.config.date_grid = "%d-%m-%Y";
    gantt.config.start_date = gantt.date.day_start(new Date());
    gantt.config.columns = [];
    gantt.init(this.ganttContainer);
    gantt.parse(this.state.data);
  }
  componentDidMount() {
    this.fetchTasks();
  }
  render() {
    //this.setZoom(this.props.zoom);
    return (
     <div className="wrap-gantt-chart">
        <div className="loading" style={{
          display: this.state.loading ? 'block' : 'none'
        }}>
          <Spin size="large" />
        </div>
        <div
          ref={(input) => { this.ganttContainer = input }}
          style={{width: '100%', height: '100%'}}
      ></div>
     </div>
    );
  }
}

export default KehoachSanxuatDaihan