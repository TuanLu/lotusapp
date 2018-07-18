/*global gantt*/
import React, { Component } from 'react';
import 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/ext/dhtmlxgantt_undo.js';
//import 'dhtmlx-gantt/codebase/locale/locale_ar.js';
//import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import './Theme.css';
import {connect} from 'react-redux'
import {getTokenHeader} from 'ISD_API'
import {updateStateData} from 'actions'
import moment from 'moment'
import { 
  message,
  Spin
} from 'antd';

class Gantt extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataUpToDate: true,
      loading: false
    }
  }
  setZoom(value){
    switch (value){
      case 'Hours':
        gantt.config.scale_unit = 'day';
        gantt.config.date_scale = '%d %M';

        gantt.config.scale_height = 60;
        gantt.config.min_column_width = 30;
        gantt.config.subscales = [
          {unit:'hour', step:1, date:'%H'}
        ];
        break;
      case 'Days':
        gantt.config.min_column_width = 70;
        gantt.config.scale_unit = "week";
        gantt.config.date_scale = "#%W";
        gantt.config.subscales = [
          {unit: "day", step: 1, date: "%d %M"}
        ];
        gantt.config.scale_height = 60;
        break;
      case 'Months':
        gantt.config.min_column_width = 70;
        gantt.config.scale_unit = "month";
        gantt.config.date_scale = "%F";
        gantt.config.scale_height = 60;
        gantt.config.subscales = [
          {unit:"week", step:1, date:"#%W"}
        ];
        break;
      default:
        break;
    }
  }

  // shouldComponentUpdate(nextProps ){
  //   console.log('component should update', nextProps);
  //   return this.props.tasks !== nextProps.tasks;
  // }
  fetchTasks() {
    this.setState({loading: true});
    fetch(ISD_BASE_URL + 'gantt/fetchTasks', {
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
            ganttData: json.data,
          }));
        }
      }
      this.setState({loading: false});
      this.renderGantt();
    })
    .catch((error) => {
      message.error('Có lỗi khi tải dữ liệu quy trình sản xuất!', 3);
      console.log(error);
      this.setState({loading: false});
    }); 
  }
  renderGantt(data) {
    let {mainState} = this.props;
    let {ganttData} = mainState;
    ganttData = ganttData || {};
    gantt.clearAll();
    gantt.parse(ganttData);   
    gantt.render();
  }
  updateTask(id, mode, task) {
    if(mode == "inserted") {
      //delete task['id'];
      let taskData = {
        text: task.text,
        start_date: moment(task.start_date).format('YYYY-MM-DD HH:mm:ss'),
        duration: task.duration,
        parent: task.parent,
        progress: task.progress
      };

      console.log(taskData);
      console.warn(JSON.stringify(taskData));
      fetch(ISD_BASE_URL + 'gantt/update', {
        method: 'POST',
        headers: getTokenHeader(),
        body: JSON.stringify(taskData)
      })
      .then((response) => {
        return response.json()
      }).then((json) => {
        if(json.status == 'error') {
          message.error(json.message, 3);
          if(json.show_login) {
            this.props.dispatch(updateStateData({showLogin: true}));
          }
        } else {
          this.fetchTasks();
        }
      }).catch((ex) => {
        console.log('parsing failed', ex)
        message.error('Có lỗi xảy ra trong quá trình lưu hoặc chỉnh sửa quy trình!');
      });
    }
  }

  initGanttEvents() {
    if(gantt.ganttEventsInitialized){
      return;
    }
    gantt.ganttEventsInitialized = true;

    gantt.attachEvent('onBeforeTaskAdd', (id, task) => {
      console.log('before');
    });

    gantt.attachEvent('onAfterTaskAdd', (id, task) => {
      console.log(task);
      this.updateTask(id, 'inserted', task);
    });

    gantt.attachEvent('onAfterTaskUpdate', (id, task) => {
      if(this.props.onTaskUpdated) {
        this.props.onTaskUpdated(id, 'updated', task);
      }
    });

    gantt.attachEvent('onAfterTaskDelete', (id) => {
      if(this.props.onTaskUpdated) {
        this.props.onTaskUpdated(id, 'deleted');
      }
    });

    gantt.attachEvent('onAfterLinkAdd', (id, link) => {
      if(this.props.onLinkUpdated) {
        this.props.onLinkUpdated(id, 'inserted', link);
      }
    });

    gantt.attachEvent('onAfterLinkUpdate', (id, link) => {
      if(this.props.onLinkUpdated) {
        this.props.onLinkUpdated(id, 'updated', link);
      }
    });

    gantt.attachEvent('onAfterLinkDelete', (id, link) => {
      if(this.props.onLinkUpdated) {
        this.props.onLinkUpdated(id, 'deleted');
      }
    });
  }
  
  componentDidMount() {
    let {mainState} = this.props;
    let {ganttData} = mainState;
    this.initGanttEvents();
    gantt.config.xml_date = "%Y-%m-%d %H:%i:%s";
    gantt.config.date_grid = "%d-%m-%Y";
    //gantt.config.start_date = new Date();
    gantt.config.start_date = gantt.date.day_start(new Date());
    //gantt.config.task_date = "%d-%m-%Y";
    gantt.config.order_branch = true;
    gantt.config.order_branch_free = true;
    gantt.init(this.ganttContainer);
    gantt.parse(ganttData);
    this.fetchTasks();
  }
  // static getDerivedStateFromProps(nextProps, prevState) {
  //   let {refresh} = nextProps.mainState.phieuxuat;
  //   if(refresh) {
  //     return {
  //       dataUpToDate: null
  //     }
  //   }
  //   return null;
  // }
  componentDidUpdate() {
    if(this.state.dataUpToDate === null) {
      this.fetchTasks();
    }
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

export default connect((state) => {
  return {
    mainState: state.main.present,
  }
})(Gantt)