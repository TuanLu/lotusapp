import React from 'react'
import { TreeSelect } from 'antd';
import {connect} from 'react-redux'
import {updateStateData} from 'actions'
import {getTokenHeader} from 'ISD_API'
const SHOW_PARENT = TreeSelect.SHOW_PARENT;

class GroupUserRoles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.selectedRoles || [],
      treeData: []
    }
  }
  fetchData() {
    fetch(ISD_BASE_URL + 'qlpb/fetchGroupRoles', {
      headers: getTokenHeader()
    })
    .then((response) => response.json())
    .then((json) => {
      if(json.data) {
        this.setState({
          treeData: json.data
        });
        this.props.dispatch(updateStateData({
          allUserRoles: json.data
        }));
      } else {
        console.warn(json.message);
      }
    })
    .catch((error) => {
      console.log(error);
    });
  }
  componentDidMount() {
    let {allUserRoles} = this.props.mainState;
    if(!allUserRoles) {
      this.fetchData();
    } else {
      this.setState({
        treeData: allUserRoles
      })
    }
  }
  onChange = (value) => {
    this.setState({ value });
    if(this.props.onChange) {
      this.props.onChange(value);
    }
  }
  render() {
    const tProps = {
      treeData: this.state.treeData,
      value: this.state.value,
      onChange: this.onChange,
      treeCheckable: true,
      showCheckedStrategy: SHOW_PARENT,
      searchPlaceholder: 'Hãy chọn quyền',
      style: {
        width: 250,
      },
    };
    return <TreeSelect {...tProps} />;
  }
}

export default connect((state) => {
  return {
    mainState: state.main.present
  }
})(GroupUserRoles);