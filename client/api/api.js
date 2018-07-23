import _ from "lodash";

//Get host name
function getHostName(url) {
  var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
  if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
  return match[2];
  }
  else {
      return null;
  }
}
//Global config 
if(!window.ISD_BASE_URL ||  window.ISD_BASE_URL == '') {
  window.ISD_BASE_URL = window.location.protocol + '//' + getHostName(document.location.href) + '/';
}

// Will add more code later
export function bootstrapApp() {

}

//JSON string return an object contain objects, we need to covert them to array
export function convertObjectsToArray(objects) {
  let objectsArr = [];
  Object.keys(objects).forEach((objectId) => {
    objectsArr.push({
      id: objectId,
      ...objects[objectId]
    })
  });
  return objectsArr;
}
export function convertArrayObjectToObject(objectArr, propId) {
  let objects = {};
  propId = propId || 'id';
  if(objectArr.length) {
    objectArr.forEach((object) => {
      objects[object[propId]] = object;
    })
  }
  return objects;
}
//Sort an array by property
export const sortArrayByProp = (prop, unsortArr) => {
  var sortedArray = unsortArr.sort((a, b) => {
    //Sort by prop
    if(a.hasOwnProperty(prop) && b.hasOwnProperty(prop)) {
      return a[prop] - b[prop];
    }
    //Try to sort by id
    if(a.hasOwnProperty('id') && b.hasOwnProperty('id')) {
      return a['id'] - b['id'];
    }
    //Will not sort invalid format array
    return 0;
  });
  return sortedArray;
};

export const getTokenHeader = () => {
  let token = sessionStorage.getItem('ISD_TOKEN');
  if(token != "" && token != null) {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    };
  }
}

export const statusOptions = [
  {value: '0', text: 'Ngừng kích hoạt'},
  {value: '1', text: 'Kích hoạt'},
];

export const trangThaiPhieu = [
  {
    id: '0',
    value: '0',
    text: 'Không duyệt'
  },
  {
    id: '1',
    value: '1',
    text: 'Đã duyệt'
  },
  {
    id: '2',
    value: '2',
    text: 'Chưa duyệt'
  },
];

export const qcQAStatus = [
  {
    id: '0',
    value: '0',
    text: 'Chờ duyệt'
  },
  {
    id: '2',
    value: '2',
    text: 'Không đạt'
  },
  {
    id: '1',
    value: '1',
    text: 'Đã đạt'
  },
];

export const blankGanttData = {
  data: [],
  links: []
} 


