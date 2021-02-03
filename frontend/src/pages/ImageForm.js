import React from 'react'
import { Header } from '../layouts/Header'
import { Footer } from '../layouts/Footer'
import '../styles/ImageForm.css'
import $ from 'jquery'
import Common from '../Common'
import { AudioFormElement } from '../components/AudioFormElement';
import { MediaFormFunction } from '../components/MediaFormFunction';
import { strings } from '../Localization';
// added by Rpz
import App from '../App'


const DEFAULT_IMAGE = '/assets/images/empty.png';

export class ImageForm extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      id: parseInt(props.match.params.id),
      image_path: DEFAULT_IMAGE,
      audio_source: '',
      duration: 0
    }
    this.mediaFunction = React.createRef();
  }
  
  componentDidMount() {
    if(this.state.id !== 0) {
      this.getImageMedia();
    }

    let self = this;
    
    $('#imageInput').change(function (event) {
      var FR = new FileReader();
      self.setState({ image_name: event.target.files[0].name })
      FR.addEventListener("load", function (e) {
        let type = e.target['result'].split("/")[0];
        if (type !== 'data:image') {
          Common.notify('warning', strings.PleaseSelectAnImageToUpload);
          $('#imageInput').val('');
        } else {
          self.setState({ image_path: e.target['result'] });
        }
      });

      if (event.target.files === null) return;
      FR.readAsDataURL(event.target.files[0]);
    });
  }

  getImageMedia() {
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
        var sec = data.duration / 1000;
        self.setState({
          image_path: Common.mediaUrl(data.filename),
          audio_source: data.audio_source,
          duration: sec.toFixed(1)
        })
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  onSubmit(event) {
    event.preventDefault();
    let upload_file = $('#imageInput').val();
    if ($('#imageInput').val() === '') {
      Common.notify('error', strings.PleaseSelectAnImageToUpload);
      return;
    }
    
    let self = this;
    let body = {
      image: this.state.image_path,
      image_name: this.state.image_name,
      token: Common.getToken()
    }
    console.log("Rpz-upload_file ===>",upload_file);
    console.log("Rpz-image_name ===>",body.image_name);
    console.log("Rpz-state_id ===>",this.state.id);

    $('.loading').show();

    if(this.state.id === 0) { // create
      let url = Common.BACKEND + '/api/storeImageMedia';
      console.log('create', body);

      $.ajax({
        url: url,
        method: 'POST',
        data: body,
        success: function (data) {
          $('.loading').hide();

          console.log(data);
          Common.notify('success', strings.ImageMediaHasBeenCreated);
          self.props.history.push('/media');
        },
        error: function (error) {
          Common.handleError(error);
        }
      });
    } else { // update
      // let url = Common.BACKEND + '/api/updateImageMedia';
      // body.id = this.state.id;
      // body.audio_source = this.state.audio_source;
      // body.duration = this.state.duration * 1000;
      // console.log('update', body);

      let preurl = Common.BACKEND + '/api/preupdateImageMedia';
      
      $.ajax({
        url: preurl,
        method: 'POST',
        data: body,
        success: function (data) {
          $('.loading').hide();
          console.log("this part first");
          console.log(data);
          if( data.IsExist ) {
            self.overwriteImageMedia();
          } else {
            self.updateImageMedia();
          }
        },
        error: function (error) {
          Common.handleError(error);
        }
      });
    }
  }

  overwriteImageMedia() {
    let url = Common.BACKEND + '/api/updateImageMedia';
    let body = {
      image: this.state.image_path,
      image_name: this.state.image_name,
      token: Common.getToken()
    }
    body.id = this.state.id;
    body.audio_source = this.state.audio_source;
    body.duration = this.state.duration * 1000;

    console.log('confirm overwrite');
    App.confirm(strings.AreYouSureToOverwriteThisMedia, function () {
      $.ajax({
        url: url,
        method: 'POST',
        data: body,
        success: function (data) {
          $('.loading').hide();

          console.log(data);
          Common.notify('success', strings.ImageMediaHasBeenUpdated);
        },
        error: function (error) {
          Common.handleError(error);
        }
      });
    });
  }
  
  updateImageMedia() {
    let url = Common.BACKEND + '/api/updateImageMedia';
    let body = {
      image: this.state.image_path,
      image_name: this.state.image_name,
      token: Common.getToken()
    }
    body.id = this.state.id;
    body.audio_source = this.state.audio_source;
    body.duration = this.state.duration * 1000;

    $.ajax({
      url: url,
      method: 'POST',
      data: body,
      success: function (data) {
        $('.loading').hide();

        console.log(data);
        Common.notify('success', strings.ImageMediaHasBeenUpdated);
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  handleAudioChange(name, value) {
    let state = this.state;
    state[name] = value;
    this.setState(state);
  }

  handleUpdateAudio() {
    let url = Common.BACKEND + '/api/updateImageMediaAudio';
    let body = {
      id: this.state.id,
      audio_source: this.state.audio_source,
      duration: this.state.duration * 1000,
      token: Common.getToken()
    }
    console.log('update audio', body);
    $('.loading').show();

    $.ajax({
      url: url,
      method: 'POST',
      data: body,
      success: function (data) {
        $('.loading').hide();

        console.log(data);
        Common.notify('success', strings.TheAudioHasBeenUpdated);
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
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
              <h1 className="page-title">{strings.Media} - {strings.Image}</h1>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-2"></div>
                  <div className="col-md-8">
                    {this.state.id !== 0 ?
                      <div className="row mb-2">
                        <div className="col-md-2">
                          <label className="mt-2">{strings.Audio}</label>
                        </div>
                        <div className="col-md-7">
                          <AudioFormElement audio_source={this.state.audio_source} duration={this.state.duration}
                            onAudioChange={this.handleAudioChange.bind(this)} />
                        </div>
                        <div className="col-md-3">
                          <button className="btn btn-secondary btn-block" onClick={() => this.handleUpdateAudio()}>{strings.Save}</button>
                        </div>
                      </div>
                      : null}
                    <div className="text-center">
                      <img src={this.state.image_path} className="media-image-preview card" alt="" width="100%" />
                      <form id="form" encType="multipart/form-data" method="post" className="mt-4" onSubmit={this.onSubmit.bind(this)}>
                        <div className="row">
                          <div className="col-md-5">
                            <input id="imageInput" type="file" name="image" className="float-left mb-3 mt-1" />
                          </div>
                          {this.state.id === 0 ?
                            <div className="col-md-7 text-right">
                              <button type="submit" className="btn btn-primary ml-2">{strings.Upload}</button>
                            </div>
                            :
                            <div className="col-md-7 text-right">
                              <button type="submit" className="btn btn-success ml-2">{strings.Upload}</button>
                              <button type="button" className="btn btn-outline-danger ml-2" onClick={this.handleDelete.bind(this)}>
                                <i className="fe fe-trash"></i> {strings.Delete}
                              </button>
                            </div>
                          }
                        </div>
                      </form>
                    </div>
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