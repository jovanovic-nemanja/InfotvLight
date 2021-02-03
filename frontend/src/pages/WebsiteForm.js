import React from 'react'
import { Header } from '../layouts/Header'
import { Footer } from '../layouts/Footer'
import $ from 'jquery'
import Common from '../Common'
import { AudioFormElement } from '../components/AudioFormElement';
import { MediaFormFunction } from '../components/MediaFormFunction';
import { strings } from '../Localization';


export class WebsiteForm extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      id: parseInt(props.match.params.id),
      filename: '',
      audio_source: '',
      duration: 0
    }
    this.mediaFunction = React.createRef();
  }
  
  componentDidMount() {
    if(this.state.id !== 0) {
      this.getWebsiteMedia();
    }
  }

  getWebsiteMedia() {
    let self = this;
    let url = Common.BACKEND + '/api/elements/' + this.state.id;
    url += '?token=' + Common.getToken();
    $('.loading').show();

    $.ajax({
      url: url,
      method: 'GET',
      success: function (data) {
        $('.loading').hide();

        console.log(data);
        self.setState({
          filename: data.filename,
          audio_source: data.audio_source,
          duration: data.duration
        })
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  handleChange(event) {
    let name = event.target.name;
    let state = this.state;
    state[name] = event.target.value;
    this.setState(state);
  }

  handleAudioChange(name, value) {
    let state = this.state;
    state[name] = value;
    this.setState(state);
  }

  onSubmit(event) {
    event.preventDefault();

    let self = this;
    let body = {
      filename: this.state.filename,
      audio_source: this.state.audio_source,
      duration: this.state.duration,
      token: Common.getToken()
    }
    $('.loading').show();

    if(this.state.id === 0) { // create
      let url = Common.BACKEND + '/api/storeWebsiteMedia';
      console.log('create', body);

      $.ajax({
        url: url,
        method: 'POST',
        data: body,
        success: function (data) {
          $('.loading').hide();

          console.log(data);
          Common.notify('success', strings.WebsiteMediaHasBeenCreated);
          self.props.history.push('/media');
        },
        error: function (error) {
          Common.handleError(error);
        }
      });
    } else { // update
      let url = Common.BACKEND + '/api/updateWebsiteMedia';
      body.id = this.state.id;
      console.log('update', body);

      $.ajax({
        url: url,
        method: 'POST',
        data: body,
        success: function (data) {
          $('.loading').hide();

          console.log(data);
          Common.notify('success', strings.WebsiteMediaHasBeenUpdated);
        },
        error: function (error) {
          Common.handleError(error);
        }
      });
    }
  }

  handleDelete() {
    this.mediaFunction.current.handleDelete(this.state.id, this);
  }

  render() {

    return (
      <div className="page-main">
        <Header />
        <div className="my-3 my-md-5 main-content">
          <div className="container">
            <div className="page-header">
              <h1 className="page-title">{strings.Media} - {strings.Website}</h1>
            </div>
            <div className="card">
              <div className="card-body">
                <form id="form" className="row mb-2" onSubmit={this.onSubmit.bind(this)}>
                  <div className="col-md-2">
                    <label className="float-right mt-1">{strings.Website}</label>
                  </div>
                  <div className="col-md-8">
                    <input className="form-control mb-2" required
                      name="filename" value={this.state.filename} onChange={this.handleChange.bind(this)} />
                  </div>
                  <div className="col-md-2">
                    {this.state.id === 0 ?
                      <button type="submit" className="btn btn-primary btn-block">{strings.Create}</button>
                      :
                      <button type="submit" className="btn btn-success btn-block">{strings.Save}</button>
                    }
                  </div>
                </form>
                <div className="row">
                  <div className="col-md-2">
                    <label className="float-right mt-1">{strings.Audio}</label>
                  </div>
                  <div className="col-md-8">
                    <AudioFormElement audio_source={this.state.audio_source} duration={this.state.duration}
                      onAudioChange={this.handleAudioChange.bind(this)} />
                  </div>
                  <div className="col-md-2">
                    {this.state.id !== 0 ?
                      <button className="btn btn-outline-danger btn-block" onClick={this.handleDelete.bind(this)}>
                        <i className="fe fe-trash"></i> {strings.Delete}
                      </button>
                      : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <MediaFormFunction ref={this.mediaFunction} />
        <Footer />
      </div>
    );
  }
}