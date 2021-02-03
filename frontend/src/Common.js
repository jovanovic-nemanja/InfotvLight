import React from 'react';
import { notify } from 'react-notify-toast';
import $ from 'jquery';
import { Header } from './layouts/Header';
import { Footer } from './layouts/Footer';
import { strings } from './Localization';
import { Domain } from './Domain';


export const FILENAME_LIMIT = 15;
export const URL_LIMIT = 20;

export default class Common extends React.Component {

  static BACKEND = Domain.BACKEND;
  static FRONTEND = Domain.FRONTEND;

  static SETTINGS = Common.getSettings();
  static PLAYER_WIDTH = Common.isNone(Common.SETTINGS) ? 1920 : Common.SETTINGS.screen_max_width;
  static PLAYER_HEIGHT = Common.isNone(Common.SETTINGS) ? 1080 : Common.SETTINGS.screen_max_height;

  static setUser(user) {
    localStorage.setItem('_user', JSON.stringify(user));
  }

  static getUser() {
    let user = localStorage.getItem('_user');
    if(Common.isNone(user)) {
      return null;
    }

    return JSON.parse(user);
  }

  static setToken(token) {
    localStorage.setItem('_token', token);
  }

  static getToken() {
    let token = localStorage.getItem('_token');

    return token;
  }

  static loggedIn() {
    return !Common.isNone(Common.getToken());
  }

  static logout() {
    localStorage.setItem('_user', null);
    localStorage.setItem('_token', null);
    window.location.replace('/');
  }

  static notify(type, msg) {
    if (type === 'success') {
      notify.show(msg, 'success');
    } else if (type === 'error') {
      notify.show(msg, 'error');
    } else if (type === 'warning') {
      notify.show(msg, 'warning');
    }
  }

  static handleError(error) {
    $('.loading').hide();

    console.error(error);
    if (error.status === 401) {
      // Common.notify('error', strings.TokenInvalid);
      Common.logout();
      return;
    }
    if (error.status === 0) {
      Common.notify('error', strings.ServerConnectionError);
      if(Common.loggedIn()) {
        Common.logout();
      }
      return;
    }
    let msg = '';
    if (error.responseJson !== undefined) {
      msg = error.responseJson.message;
    } else if (error.errorMessage !== undefined) {
      msg = error.errorMessage;
    } else if (error.responseJSON !== undefined) {
      if (error.responseJSON.message !== undefined) {
        if (error.responseJSON.message.message !== undefined) {
          msg = error.responseJSON.message.message;
        } else {
          msg = error.responseJSON.message;
        }
      } else if (error.responseJSON.error) {
        msg = error.responseJSON.error;
      } else {
        msg = 'Some errors happended!';
      }
    } else {
      msg = 'Some errors happended!';
    }
    if(Common.isNone(msg)) {
      msg = 'Some errors happended!';
    }
    
    Common.notify('error', msg);
  }

  static isNone(value) {
    return value === '' || value === undefined || value === 'undefined' || value === null || value === 'null';
  }

  static refreshUI() {
    if(Common.loggedIn()) {
      let url = Common.BACKEND + '/api/getMe';
      url += '?token=' + Common.getToken();

      $.ajax({
        url: url,
        method: 'POST',
        success: function (data) {
          Common.setUser(data.user);
          Header.self.setState({user: data.user});
        }
      });
    }

    // Get settings
    let url = Common.BACKEND + '/api/settings';

    $.ajax({
      url: url,
      method: 'GET',
      success: function (data) {
        if(Footer.self) {
          Footer.self.setState(data);
        }
        Common.setSettings(data);
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  static setSettings(settings) {
    Common.PLAYER_WIDTH = settings.screen_max_width;
    Common.PLAYER_HEIGHT = settings.screen_max_height;
    localStorage.setItem('_settings', JSON.stringify(settings));
  }
  
  static getSettings() {
    let settings = localStorage.getItem('_settings');

    if(Common.isNone(settings)) {
      return null;
    }

    return JSON.parse(settings);
  }

  static humanDayMonth(timestamp) {
    let datetime = new Date(timestamp);
    let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let formattedDate = monthNames[datetime.getMonth()] + ' ' + datetime.getDate();

    return formattedDate;
  }

  static diff(date) {
    date = new Date(date);
    let today = new Date();
    let timeDiff = today.getTime() - date.getTime();
    if (timeDiff < 1000 * 60) {
      return Math.floor(timeDiff / 1000).toString() + ' ' + strings.seconds;
    } else if (timeDiff < 1000 * 3600) {
      return Math.floor(timeDiff / (1000 * 60)).toString() + ' ' + strings.minutes;
    } else if (timeDiff < 1000 * 3600 * 24) {
      return Math.floor(timeDiff / (1000 * 3600)).toString() + ' ' + strings.hours;
    } else if (timeDiff < 1000 * 3600 * 24 * 7) {
      return Math.floor(timeDiff / (1000 * 3600 * 24)).toString() + ' ' + strings.days;
    } else if (timeDiff < 1000 * 3600 * 24 * 30) {
      return Math.floor(timeDiff / (1000 * 3600 * 24 * 7)).toString() + ' ' + strings.weeks;
    } else if (timeDiff < 1000 * 3600 * 24 * 365) {
      return Math.floor(timeDiff / (1000 * 3600 * 24 * 30)).toString() + ' ' + strings.months;
    } else {
      return Math.floor(timeDiff / (1000 * 3600 * 24 * 365)).toString() + ' ' + strings.years;
    }
  }

  static humanDate(timestamp = null) {
    let datetime = new Date(timestamp);
    if(timestamp === null) {
      datetime = new Date();
    }
    // let monthNames = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let formattedDate = datetime.getDate() + '.' + datetime.getMonth() + '.' + datetime.getFullYear();

    return formattedDate;
  }

  static humanTime() {
    let datetime = new Date();
    let formatteTime = datetime.toTimeString().split(' GMT')[0];

    return formatteTime;
  }

  static mediaUrl(url) {
    // modified by Rpz
    url = Common.BACKEND + url.replace('public/', '').replace(/\\/g, '/');
    
    return url;
  }

  static mediaFilename(url, limit = FILENAME_LIMIT) {
    let array = url.split('\\');
    let array2 = array[array.length - 1].split('/');
    let array3 = array2[array2.length - 1];
    let filename = array3.split('.')[0];
    let extension = array3.split('.')[1];
    // if (filename.length > limit) {
    //   filename = filename.substr(0, limit) + '~';
    // }

    return filename + '.' + extension;
  }

  static mediaWebsiteUrl(url, limit = URL_LIMIT) {
    let filename = url;
    // if (filename.length > limit) {
    //   filename = filename.substr(0, limit) + '~';
    // }

    return filename;
  }

  static typeName(type) {
    let type_name = "";
    if (type === 1) type_name = strings.Video;
    else if (type === 2) type_name = strings.Picture;
    else if (type === 3) type_name = strings.Picture + ' ' + strings.Gallery;
    else if (type === 4) type_name = strings.Website;

    return type_name;
  }

  static getFilename($path) {
    $path = $path.replace(/\\/g, '/');
    let array = $path.split('/');

    return array[array.length - 1];
  }

  static tickerTypeName(type) {
    switch(type) {
      case 1: return strings.Date;
      case 2: return strings.Time;
      case 3: return strings.ScrollText;
      case 4: return strings.FadeText;
      case 5: return strings.StaticText;
      case 6: return strings.Image;
      case 7: return strings.CartText;
      default: return strings.Ticker;
    }
  }

  static componentToHex(c) {
    c = parseInt(c);
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }

  static rgbToHex(r, g, b) {
    return "#" + Common.componentToHex(r) + Common.componentToHex(g) + Common.componentToHex(b);
  }

  static hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  static hexColor(fontcolor) {
    if (fontcolor === null) {
      return '#ffffff';
    }
    let colors = fontcolor.split(',');
    return Common.rgbToHex(colors[0], colors[1], colors[2]);
  }

  static rgbColor(color) {
    let colors = Common.hexToRgb(color);
    return colors.r + ',' + colors.g + ',' + colors.b;
  }

  static timetableToEvent(timetable) {
    let repeat = parseInt(timetable.repeat_flag) === 1 ? ' (' + strings.Repeat + ')' : '';
    let event = {
      id: timetable.id,
      title: timetable.playlist.name + repeat,
      start: new Date(parseInt(timetable.start_time + "000")).toISOString(),
      end: new Date(parseInt(timetable.end_time + "000")).toISOString(),
      resourceId: timetable.playlist.id,
      repeat_flag: timetable.repeat_flag,
      repeat_id: timetable.repeat_id
    }

    return event;
  }

  static getTimestamp(formattedDate) {
    if (typeof formattedDate !== 'string') {
      formattedDate = formattedDate.format();
    }
    console.log(formattedDate);
    formattedDate = formattedDate.split('+')[0];
    if(formattedDate.search("Z") < 0) formattedDate = formattedDate + "Z"; // UTC Time
    let datetime = new Date(formattedDate);
    let timestamp = datetime.getTime();
    
    return timestamp;
  }

  static getFormattedTime(formattedDate) {
    let time = formattedDate.split("T")[1].split(".")[0].split("+")[0];

    return time;
  }

  static getFormattedDate(formattedDate) {
    let date = formattedDate.split("T")[0];

    return date;
  }

  static language() {
    let language = localStorage.getItem('_language');
    if (Common.isNone(language)) {
      localStorage.setItem('_language', 'German');
      return 'German';
    }
    
    return language;
  }

  static audioTypeName(audio_source) {
    audio_source = parseInt(audio_source);
    let types = [strings.OwnAudio, strings.Radio];

    return types[audio_source];
  }
}
