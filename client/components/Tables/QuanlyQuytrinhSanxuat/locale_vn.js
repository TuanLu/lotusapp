/*
@license

dhtmlxGantt v.5.2.0 Standard
This software is covered by GPL license. You also can obtain Commercial or Enterprise license to use it in non-GPL project - please contact sales@dhtmlx.com. Usage without proper license is prohibited.

(c) Dinamenta, UAB.

*/
! function(e) {
  var t = {};

  function n(r) {
      if (t[r]) return t[r].exports;
      var o = t[r] = {
          i: r,
          l: !1,
          exports: {}
      };
      return e[r].call(o.exports, o, o.exports, n), o.l = !0, o.exports
  }
  n.m = e, n.c = t, n.d = function(e, t, r) {
      n.o(e, t) || Object.defineProperty(e, t, {
          enumerable: !0,
          get: r
      })
  }, n.r = function(e) {
      "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
          value: "Module"
      }), Object.defineProperty(e, "__esModule", {
          value: !0
      })
  }, n.t = function(e, t) {
      if (1 & t && (e = n(e)), 8 & t) return e;
      if (4 & t && "object" == typeof e && e && e.__esModule) return e;
      var r = Object.create(null);
      if (n.r(r), Object.defineProperty(r, "default", {
              enumerable: !0,
              value: e
          }), 2 & t && "string" != typeof e)
          for (var o in e) n.d(r, o, function(t) {
              return e[t]
          }.bind(null, o));
      return r
  }, n.n = function(e) {
      var t = e && e.__esModule ? function() {
          return e.default
      } : function() {
          return e
      };
      return n.d(t, "a", t), t
  }, n.o = function(e, t) {
      return Object.prototype.hasOwnProperty.call(e, t)
  }, n.p = "/codebase/", n(n.s = 173)
}({
  173: function(e, t) {
      gantt.locale = {
          date: {
              month_full: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
              month_short: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
              day_full: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
              day_short: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]
          },
          labels: {
              new_task: "Nhiệm vụ",
              dhx_cal_today_button: "Hôm nay",
              day_tab: "Theo Ngày",
              week_tab: "Theo Tuần",
              month_tab: "Theo Tháng",
              new_event: "Thêm sự kiện",
              icon_save: "Lưu",
              icon_cancel: "Huỷ",
              icon_details: "Chi tiết",
              icon_edit: "Chỉnh sửa",
              icon_delete: "Xoá",
              confirm_closing: "",
              confirm_deleting: "Bạn thật sự muốn xoá công việc này?",
              section_description: "Mô tả công việc",
              section_time: "Thời gian thực hiện",
              section_type: "Kiểu",
              column_wbs: "Mục lục",
              column_text: "Tên công việc",
              column_start_date: "Bắt đầu",
              column_duration: "Số ngày",
              column_add: "",
              link: "Liên kết",
              confirm_link_deleting: "Bạn thật sự muốn xoá liên kết này?",
              link_start: "(Bắt đầu)",
              link_end: "(Kết thúc)",
              type_task: "Công việc",
              type_project: "Dự án",
              type_milestone: "Milestone",
              minutes: "Phút",
              hours: "Giờ",
              days: "Ngày",
              weeks: "Tuần",
              months: "Tháng",
              years: "Năm",
              message_ok: "OK",
              message_cancel: "Huỷ"
          }
      }
  }
});
//# sourceMappingURL=locale_de.js.map