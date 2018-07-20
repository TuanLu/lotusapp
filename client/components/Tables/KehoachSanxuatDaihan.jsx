import React, { Component } from 'react';
import Gantt from './QuanlyQuytrinhSanxuat/Gantt'

class KehoachSanxuatDaihan extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let {mainState, dispatch} = this.props;
    return (
     <div className="wrap-gantt-chart khdh">
       <Gantt mainState={mainState} dispatch={dispatch} type="allPlan" />
     </div>
    );
  }
}

export default KehoachSanxuatDaihan