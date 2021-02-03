import React from 'react';
import '../styles/Schedule.css'
import { Header } from '../layouts/Header'
import { Footer } from '../layouts/Footer'
import $ from 'jquery';
import 'fullcalendar/dist/locale/de'
import 'fullcalendar';
import 'fullcalendar/dist/fullcalendar.min.css'
import Modal from 'react-awesome-modal';
import moment from 'moment';
import { DatetimePickerTrigger } from 'rc-datetime-picker';
import 'rc-datetime-picker/dist/picker.min.css'
import Common from '../Common'
import Dropdown from 'react-dropdown'
import { strings } from '../Localization';


export class Schedule extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      events: [],
      creating: true,
      repeat_flag: 0,
      repeat_end: moment(),
      event: {
        title: '',
        resourceId: 0,
        start: moment().format(),
        end: moment().format(),
        repeat_flag: 0
      },
      playlists: [],
      visible: false
    }
  }
  
  componentDidMount() {
    this.getPlaylists();
    this.createCalendar();
  }

  getPlaylists() {
    let url = Common.BACKEND + '/api/playlists/all';
    url += '?token=' + Common.getToken();

    let self = this;
    $('.loading').show();

    $.ajax({
      url: url,
      method: 'GET',
      success: function (data) {
        $('.loading').hide();

        self.setState({
          playlists: data,
        });
        self.getEvents();
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  getEvents() {
    let url = Common.BACKEND + '/api/timetable';
    url += '?token=' + Common.getToken();

    let self = this;
    $('.loading').show();

    $.ajax({
      url: url,
      method: 'GET',
      success: function (data) {
        $('.loading').hide();

        let events = [];
        for (let i = 0; i < data.length; i++) {
          let row = data[i];
          if(row.playlist === null) continue;
          events.push(Common.timetableToEvent(row));          
        }
        console.log('events', events);
        self.setState({
          events: events,
        });
        $('#calendar').fullCalendar('removeEvents');
        $('#calendar').fullCalendar('addEventSource', events);
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  createCalendar() {
    let self = this;
    let localeCode = Common.language() === 'English' ? 'en' : 'de';

    $('#calendar').fullCalendar({
      header: {
        left: 'title',
        center: 'month,agendaWeek,agendaDay,listWeek',
      },
      buttonText: {
        today: strings.Today,
        month: strings.Month,
        week: strings.Week,
        day: strings.Day,
        list: strings.Overview
      },
      defaultView: 'agendaWeek',
      selectable: true,
      droppable: true,
      editable: true,
      allDaySlot: false,
      locale: localeCode,
      firstHour: 0
    });

    let calendar = $('#calendar').fullCalendar('getCalendar');

    calendar.on('select', function (start, end, jsEvent, view) {
      self.onSelectRange(start, end);
    });

    calendar.on('eventClick', function (calEvent, jsEvent, view) {
      self.setState({
        event: calEvent,
        creating: false,
        repeat_end: moment()
      });
      window.setTimeout(function() {
        self.openModal();
      }, 10);
    });

    calendar.on('eventDrop', function (event, delta, revertFunc, jsEvent, ui, view) {
      self.onDrop(event, delta, revertFunc, jsEvent, ui, view);
    });

    calendar.on('eventResize', function (event, delta, revertFunc, jsEvent, ui, view) {
      self.onResize(event, delta, revertFunc, jsEvent, ui, view);
    });
  }

  onSelectRange(start, end) {
    console.log('selected from ' + start.format() + ' to ' + end.format());
    let event = this.state.event;
    event.start = start.format();
    event.end = end.format();
    event.resourceId = 0;
    this.setState({
      event: event,
      creating: true,
      repeat_flag: 0
    });
    let self = this;
    window.setTimeout(function() {
      self.openModal();
    }, 10);
  }

  onDrop(event, delta, revertFunc, jsEvent, ui, view) {
    this.updateRequest(event);
  }

  onResize(event, delta, revertFunc, jsEvent, ui, view) {
    this.updateRequest(event);
  }

  openModal() {
    if(!Common.loggedIn()) {
      return;
    }

    this.setState({
      visible: true
    });
  }

  closeModal() {
    this.setState({
      visible: false
    });
  }

  handleStartChange(start) {
    let event = this.state.event;
    event.start = start.format();
    this.setState({ event: event });
  }

  handleEndChange(end) {
    let event = this.state.event;
    event.end = end.format();
    this.setState({ event: event });
  }

  handleRepeatEndChange(repeat_end) {
    let state = this.state;
    state.repeat_end = repeat_end;
    this.setState(state);
  }

  handleSelectChange(option) {
    let event = this.state.event;
    event.resourceId = option.value;
    event.title = option.label;
    this.setState({ event: event });
  }

  handleCheckChange(checkEvent) {
    let event = this.state.event;
    event[checkEvent.target.name] = checkEvent.target.checked ? 1 : 0;
    this.setState({ event: event });
  }

  handleRepeatFlagChange(event) {
    let name = event.target.name;
    let state = this.state;
    state[name] = event.target.checked ? 1 : 0;
    this.setState(state);
  }

  handleSubmitEvent(event) {
    event.preventDefault();

    event = this.state.event;
    if(parseInt(event.resourceId) === 0) {
      Common.notify('error', strings.PleaseSelectAPlaylist);
      return;
    }
    if (event.start > event.end) {
      Common.notify('error', strings.TheStartMustBeEailerThanTheEnd);
      return;
    }

    if(this.state.creating) { // Create
      this.createRequest(event);
    } else { // Update
      this.closeModal();
      this.updateRequest(event);
    }
  }

  createRequest(event) {
    let self = this;
    let url = Common.BACKEND + '/api/timetable';
    url += '?token=' + Common.getToken();
    let body = {
      playlist_id: event.resourceId,
      repeat_flag: parseInt(this.state.repeat_flag)
    };
    if (body.repeat_flag === 1) { // Create repeat events
      body.repeat_start = Common.getFormattedDate(event.start);
      body.repeat_end = this.state.repeat_end.format('YYYY-MM-DD');
      body.start_time = Common.getFormattedTime(event.start);
      body.end_time = Common.getFormattedTime(event.end);

      console.log(event, body);

      if(body.start_time >= body.end_time || body.repeat_start > body.repeat_end) {
        Common.notify('error', strings.TheStartMustBeEailerThanTheEnd);
        return;
      }
    } else {
      body.start_time = Common.getTimestamp(event.start);
      body.end_time = Common.getTimestamp(event.end);
    }
    console.log('create', body);

    $('.loading').show();
    this.closeModal();

    $.ajax({
      url: url,
      method: 'POST',
      data: body,
      success: function (data) {
        $('.loading').hide();

        let events = self.state.events;
        for (let i = 0; i < data.length; i++) {
          let row = data[i];          
          let event = Common.timetableToEvent(row);
          events.push(event);
          $('#calendar').fullCalendar('addEventSource', [event]);
        }
        console.log('created', events);
        self.setState({ events: events });
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  updateRequest(event) {
    let self = this;
    let url = Common.BACKEND + '/api/timetable';
    url += '/' + event.id;
    url += '?token=' + Common.getToken();
    let body = {
      playlist_id: event.resourceId,
      start_time: Common.getTimestamp(event.start) / 1000,
      end_time: Common.getTimestamp(event.end) / 1000,
    };
    console.log('update', body);

    $.ajax({
      url: url,
      method: 'PUT',
      data: body,
      success: function (data) {
        let event = Common.timetableToEvent(data);
        console.log('updated', event);
        self.updateEvent(event);
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  updateEvent(event) {
    let events = this.state.events;
    for (let i = 0; i < events.length; i++) {
      if (event.id === events[i].id) {
        events.splice(i, 1, event);
        break;
      }
    }
    this.setState({ events: events });
    $('#calendar').fullCalendar('removeEvents');
    $('#calendar').fullCalendar('addEventSource', events);
  }

  removeEvent(event) {
    let events = this.state.events;
    for (let i = 0; i < events.length; i++) {
      if (event.id === events[i].id) {
        events.splice(i, 1);
        break;
      }
    }
    this.setState({ events: events });
    $('#calendar').fullCalendar('removeEvents');
    $('#calendar').fullCalendar('addEventSource', events);
  }

  handleDelete() {
    this.closeModal();
    $('.loading').show();
    let self = this;
    let url = Common.BACKEND + '/api/timetable';
    url += '/' + this.state.event.id;
    url += '?token=' + Common.getToken();

    $.ajax({
      url: url,
      method: 'DELETE',
      success: function (data) {
        $('.loading').hide();

        let event = Common.timetableToEvent(data);
        console.log('deleted', event);
        self.removeEvent(event);
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  handleDeleteRepeats() {
    this.closeModal();
    $('.loading').show();
    let self = this;
    let url = Common.BACKEND + '/api/timetable/repeats';
    url += '/' + this.state.event.repeat_id;
    url += '?token=' + Common.getToken();

    $.ajax({
      url: url,
      method: 'DELETE',
      success: function (data) {
        $('.loading').hide();

        self.getEvents();
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  render() {
    let start_moment = moment(this.state.event.start);
    let end_moment = moment(this.state.event.end);
    // Playlist dropdown
    let options = this.state.playlists.map(function(item, i) {
      return (
        { value: item.id, label: item.name }
      );
    });
    let selected_option = null;
    for (let i = 0; i < options.length; i++) {
      if(options[i].value === this.state.event.resourceId) {
        selected_option = options[i];
        break;
      }
    }
    // Daily repeat
    let repeatFlag = this.state.repeat_flag === 1;
    let startTime = repeatFlag ? start_moment.format('HH:mm') : start_moment.format('YYYY-MM-DD HH:mm');
    let endTime = repeatFlag ? end_moment.format('HH:mm') : end_moment.format('YYYY-MM-DD HH:mm');
    let repeatEnd = this.state.repeat_end.format('YYYY-MM-DD');

    return (
      <div className="page-main">
        <Header />
        <div className="my-3 my-md-5 main-content">
          <div className="container">
            <div className="page-header">
              <h1 className="page-title">{strings.Schedule}</h1>
            </div>
            <div className="card">
              <div className="card-body" style={{minHeight: 400}}>
                <div id="calendar"></div>
              </div>
            </div>
          </div>
        </div>

        <Modal visible={this.state.visible} width="500" effect="fadeInUp" onClickAway={() => this.closeModal()}>
          <form className="text-center" style={{ padding: '30px 40px' }} onSubmit={this.handleSubmitEvent.bind(this)}>
            {this.state.creating ? 
              <h3>{strings.NewEvent}</h3>
              :
              <h3>{strings.EditEvent}</h3>
            }
            <hr style={{ marginTop: 0 }} />
            <div className="row">
              <div className="col-sm-3">
                <label className="mt-2">{strings.Start}</label>
              </div>
              <div className="col-sm-6">
                <DatetimePickerTrigger
                  moment={start_moment}
                  showCalendarPicker={!repeatFlag}
                  onChange={this.handleStartChange.bind(this)}>
                  <input type="text" className="form-control" value={startTime} readOnly />
                </DatetimePickerTrigger>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-sm-3">
                <label className="mt-2">{strings.End}</label>
              </div>
              <div className="col-sm-6">
                <DatetimePickerTrigger
                  moment={end_moment}
                  showCalendarPicker={!repeatFlag}
                  onChange={this.handleEndChange.bind(this)}>
                  <input type="text" className="form-control" value={endTime} readOnly />
                </DatetimePickerTrigger>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-sm-3">
                <label className="mt-2">{strings.Playlist}</label>
              </div>
              <div className="col-sm-9">
                <Dropdown options={options} value={selected_option} onChange={this.handleSelectChange.bind(this)} />
              </div>
            </div>
            {this.state.creating ?
              <div>
                {this.state.repeat_flag === 1 ? 
                  <div className="row mt-3">
                    <div className="col-sm-3">{strings.RepeatEnd}</div>
                    <div className="col-sm-9">
                      <DatetimePickerTrigger
                        moment={this.state.repeat_end}
                        showTimePicker={false}
                        onChange={this.handleRepeatEndChange.bind(this)}>
                        <input type="text" className="form-control" value={repeatEnd} readOnly />
                      </DatetimePickerTrigger>
                    </div>
                  </div>
                  : null}
                <div className="row mt-3">
                  <div className="col-sm-3"></div>
                  <div className="col-sm-9">
                    <label className="custom-control custom-checkbox" style={{ float: 'left' }}>
                      <input type="checkbox" className="custom-control-input" checked={repeatFlag}
                        name="repeat_flag" onChange={this.handleRepeatFlagChange.bind(this)} />
                      <span className="custom-control-label">{strings.RepeatDaily}</span>
                    </label>
                  </div>
                </div>
              </div>
              : null}
            {this.state.creating ? 
              <div className="event-modal-control row">
                <div className="col-sm-6">
                  <button type="submit" className="btn btn-primary btn-block">{strings.Create}</button>
                </div>
                <div className="col-sm-6">
                  <button type="button" onClick={() => this.closeModal()} className="btn btn-secondary btn-block">{strings.Cancel}</button>
                </div>
              </div>  
            :
              <div className="event-modal-control row">
                <div className="col-sm-6">
                  <button type="submit" className="btn btn-success btn-block">
                    {strings.Update}
                  </button>
                </div>
                <div className="col-md-6">
                  {parseInt(this.state.event.repeat_flag) === 1 ?
                    <button type="button" onClick={() => this.handleDeleteRepeats()} className="btn btn-danger btn-block">
                      <i className="fe fe-trash"></i> {strings.DeleteRepeats}
                    </button>
                  :
                    <button type="button" onClick={() => this.handleDelete()} className="btn btn-danger btn-block">
                      <i className="fe fe-trash"></i> {strings.Delete}
                    </button>
                  }
                </div>
              </div>
            }
          </form>
        </Modal>
        <Footer />
      </div>
    );
  }

}