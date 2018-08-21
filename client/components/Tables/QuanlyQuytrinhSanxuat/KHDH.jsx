/*global gantt*/

/**
 * Vi gantt la global object, nen toan bo app chi dung 1 doi tuong gantt.
 * Thay doi cac bieu do bang cach reset lai event, reset lai data
 */
import React, { Component } from 'react';
import './lib/dhtmlxgantt';
import vnLang from './lib/locale_vn.js';
import './lib/dhtmlxgantt_marker.js'
import './lib/Theme.css';
//import {demo_tasks, users_data, projects_with_milestones, projects_milestones_critical} from './lib/test_data.js'
//import {connect} from 'react-redux'
import {getTokenHeader} from 'ISD_API'
import {updateStateData} from 'actions'
import moment from 'moment'
import { 
  message,
  Spin
} from 'antd';
const gantt2 = Gantt.getGanttInstance();
//Translate to vn
gantt2.locale = gantt.locale;

class GanttComponent extends Component {
  constructor(props) {
    super(props);
    this.getQuyTrinhId = this.getQuyTrinhId.bind(this);
    this.getMaSx = this.getMaSx.bind(this);
    this.expandAllTask = this.expandAllTask.bind(this);
    this.fetchUsers = this.fetchUsers.bind(this);
    this.state = {
      loading: false,
      resetEvents: false,
    }
  }
  expandAllTask(ganttData) {
    if(ganttData) {
      let ganttTasks = [];
      if(ganttData.data) {
        ganttTasks = ganttData.data.map((task) => {
          return {
            ...task,
            open: true,//Expand all task
          }
        });
      } 
      let expandAllGanttData = {
        links: ganttData.links,
        data: ganttTasks
      }
      return expandAllGanttData;
    }
  }
  updateGanttDataToState(data) {
    let ganttData = this.expandAllTask(data) || data;
    this.props.dispatch(updateStateData({
      ganttData: ganttData,
    }));
  }
  fetchTasks() {
    this.setState({loading: true});
    let fetchUrl;
    switch (this.props.type) {
      case 'allPlan':
        fetchUrl = ISD_BASE_URL + 'gantt/allPlan';
        break;
      case 'theo_lenh_sx':
        let maSX = this.getMaSx();
        fetchUrl = ISD_BASE_URL + 'gantt/fetchTasksByMaSx/' + maSX;
        //Load tu quy trinh mau
        // console.log(this.props.mainState.sx);
        // if(this.props.mainState.sx && this.props.mainState.sx.quyTrinhMauId) {
        //   fetchUrl += `/${this.props.mainState.sx.quyTrinhMauId}`;
        // }
        break;
      default:
        let quyTrinhId = this.getQuyTrinhId();
        fetchUrl = ISD_BASE_URL + 'gantt/fetchTasks/' + quyTrinhId;
        break;
    }
    fetch(fetchUrl, {
      headers: getTokenHeader()
    })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      if(json.status == 'error') {
        this.renderGantt();
        message.warning(json.message, 3);
      } else {
        if(json.data) {
          this.updateGanttDataToState(json.data);
        }
      }
      this.setState({
        loading: false, 
      });
      this.renderGantt();
    })
    .catch((error) => {
      this.renderGantt();
      message.error('Có lỗi khi tải dữ liệu quy trình sản xuất!', 3);
      console.log(error);
      this.setState({loading: false});
    }); 
  }
  fetchUsers() {
    this.setState({loading: true});
    fetch(ISD_BASE_URL + 'gantt/users', {
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
         this.props.dispatch(updateStateData({
            worker_and_users: {
              workers: json.data.workers,
              check_users: json.data.check_users,
              group_users: json.data.group_users
           }
         }));
         this.addControlToLightBox();
       }
      }
      this.setState({
        loading: false, 
      });
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu nhân sự và người phê duyệt!', 3);
      console.log(error);
      this.setState({loading: false});
    }); 
  }
  renderTodayMarker() {
    var date_to_str = gantt.date.date_to_str(gantt.config.task_date);
    var today = new Date();
    gantt.addMarker({
      start_date: today,
      css: "today",
      text: "Hôm nay",
      title: "Hôm nay: " + date_to_str(today)
    });
  }
  renderGantt(data) {
    let {mainState} = this.props;
    let {ganttData} = mainState;
    ganttData = ganttData || {};
    gantt2.clearAll();
    this.renderTodayMarker();
    gantt2.parse(ganttData);   
    gantt2.render();
  }
  //Switch tu quy trinh nay sang quy trinh khac, phai cap nhat lai bien gantt
  static getDerivedStateFromProps(nextProps, prevState) {
    //Switch theo quy trinh ID
    if(nextProps.mainState.quyTrinhSx.edit.id && nextProps.mainState.quyTrinhSx.edit.id !== prevState.quyTrinhId) {
      //console.log('thay doi quy trinh, reset lai event di nao');
      return {
        quyTrinhId: nextProps.mainState.quyTrinhSx.edit.id,
        resetEvents: true
      }
    }
    //Cap nhat khi thay doi ma sx
    if(nextProps.mainState.sx.ma_sx && nextProps.mainState.sx.ma_sx !== prevState.ma_sx) {
      //console.log('thay doi ma san xuat kia, reset lai event di nao');
      return {
        ma_sx: nextProps.mainState.sx.ma_sx,
        resetEvents: true
      }
    }
    //Cap nhat khi thay doi quy trinh mau, hoac khi co yeu cau thay doi
    if(nextProps.mainState.refreshGantt) {
      return {
        resetEvents: true
      }
    }
    return null;
  }
  componentDidUpdate() {
    //Cap nhat lai gantt
    if(this.state.resetEvents) {
      this.clearAllEvents();
      this.setState({resetEvents: false});
      this.renderGantt();
    }
  }
  getQuyTrinhId() {
    return this.props.mainState.quyTrinhSx.edit ? this.props.mainState.quyTrinhSx.edit.id : '';
  }
  getMaSx() {
    return this.props.mainState.sx.ma_sx ? this.props.mainState.sx.ma_sx : '';
  }
  taskClass() {
    gantt.templates.task_class = function (start, end, task) {
      let taskClass = "";
      let percentDone = parseFloat(task.progress) || 0;
      if(percentDone == 0) {
        taskClass += " not_started";
      } else if(percentDone < 0.5) {
        taskClass += " high";
      } else if(percentDone < 0.8) {
        taskClass += " medium";
      } else if(percentDone < 0.9) {
        taskClass += " low";
      } else if(percentDone == 1) {
        taskClass += " task_done";
      }
      taskClass += task.$level == 0 ? " gantt_project" : "";
      return taskClass;
    };
  }
  componentDidMount() {
    let {mainState} = this.props;
    let {ganttData} = mainState;
    //gantt2.config.fit_tasks = true;
    gantt2.config.xml_date = "%Y-%m-%d %H:%i:%s";
    gantt2.config.date_grid = "%d-%m-%Y";
    gantt2.config.grid_width = 450;

    if(this.props.type == "allPlan") {
      gantt2.config.drag_move = false;
      gantt2.config.readonly = true;
      //gantt.config.show_grid = false;
      gantt2.config.show_links = false;
      //gantt.config.show_progress = false;
      gantt2.config.columns = [
        {name: "text", width: 150, hide: false, tree: true},
        {name: "start_date", hide: false, align: "center"},
        {name: "duration", width: 38, hide: false, align: "center"},
        {name: "add", hide: true, align: "center"}
      ];
    }
    //gantt.config.start_date = new Date();
    gantt2.config.start_date = gantt2.date.day_start(new Date());
    gantt2.init(this.ganttContainer);
    this.taskClass();
    gantt2.parse(ganttData);
    this.fetchTasks();
  }

  render() {
    //this.setZoom(this.props.zoom);
    return (
     <React.Fragment>
        <div className="loading" style={{
          display: this.state.loading ? 'block' : 'none'
        }}>
          <Spin size="large" />
        </div>
        <div
          ref={(input) => { this.ganttContainer = input }}
          style={{width: '100%', height: '100%'}}
      ></div>
     </React.Fragment>
    );
  }
}

export default GanttComponent