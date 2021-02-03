import React from 'react'
import { Header } from '../layouts/Header'
import { Footer } from '../layouts/Footer'
import $ from 'jquery'
import Common from '../Common'
import { GalleryElement } from '../components/GalleryElement';
import { AudioFormElement } from '../components/AudioFormElement';
import { MediaFormFunction } from '../components/MediaFormFunction';
import { strings } from '../Localization';


export class GalleryForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      id: parseInt(props.match.params.id),
      filename: '',
      files: [],
      element: {
        filename: ''
      },
      audio_source: '',
      duration: 0
    }
    this.mediaFunction = React.createRef();
  }

  componentDidMount() {
    if (this.state.id !== 0) {
      this.getGalleryMedia();
    }

    let self = this;

    $("#fileForm").on('submit', function (event) {
      event.preventDefault();

      let formData = new FormData();
      let files = $('#fileInput')[0].files;
      if (files.length === 0) {
        Common.notify('error', strings.PleaseSelectAnImageToUpload);
        return;
      }
      if (files[0].type.indexOf('image') < 0) {
        Common.notify('error', strings.PleaseSelectAnImageToUpload);
        return;
      }
      formData.append('file', $('#fileInput')[0].files[0]);

      let url = Common.BACKEND + '/api/storeGalleryFile';
      url += '?folder=' + self.state.filename;
      $('.loading').show();

      $.ajax({
        url: url,
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + Common.getToken()
        },
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
          $('.loading').hide();

          console.log(data);
          Common.notify('success', strings.TheGalleryFileHasBeenUploaded);
          $('#fileInput').val('');
          self.getGalleryMedia();
        },
        error: function (error) {
          Common.handleError(error);
        }
      });
    });
  }

  getGalleryMedia() {
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
        let filename = data.filename.replace('upload/', '');
        self.setState({
          filename: filename,
          files: data.files,
          element: data,
          audio_source: data.audio_source,
          duration: sec.toFixed(1)
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

  onSubmit(event) {
    event.preventDefault();

    let self = this;
    let body = {
      filename: this.state.filename,
      audio_source: this.state.audio_source,
      duration: this.state.duration * 1000,
      token: Common.getToken()
    }
    if(Common.isNone(body.audio_source)) {
      Common.notify('error', strings.PleaseSelectAudioSource);
      return;
    }
    
    $('.loading').show();
    if (this.state.id === 0) { // create
      let url = Common.BACKEND + '/api/storeGalleryMedia';
      console.log('create', body);

      $.ajax({
        url: url,
        method: 'POST',
        data: body,
        success: function (data) {
          $('.loading').hide();

          console.log(data);
          Common.notify('success', strings.GalleryMediaHasBeenCreated);
          self.props.history.push('/media');
        },
        error: function (error) {
          Common.handleError(error);
        }
      });
    } else { // update
      let url = Common.BACKEND + '/api/updateGalleryMedia';
      body.id = this.state.id;
      console.log('update', body);

      $.ajax({
        url: url,
        method: 'POST',
        data: body,
        success: function (data) {
          $('.loading').hide();

          console.log(data);
          Common.notify('success', strings.GalleryMediaHasBeenUpdated);
          self.getGalleryMedia();
        },
        error: function (error) {
          Common.handleError(error);
        }
      });
    }
  }

  handleDelete(file) {
    console.log('delete', file);

    let self = this;
    let url = Common.BACKEND + '/api/deleteGalleryFile';
    let path = this.state.filename + '/' + file;
    $('.loading').show();
    console.log('delete', path);

    $.ajax({
      url: url,
      method: 'POST',
      data: {
        path: path,
        token: Common.getToken()
      },
      success: function (data) {
        $('.loading').hide();

        console.log(data);
        Common.notify('success', strings.AFileHasBeenDeleted);
        self.getGalleryMedia();
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

  handelDeleteGallery() {
    this.mediaFunction.current.handleDelete(this.state.id, this);
  }

  render() {
    let self = this;
    const filename = self.state.element.filename;
    const files = this.state.files.map(function(item, i) {
      return (
        <GalleryElement key={"gallery-item-" + i} data={item} folder={filename} onDelete={self.handleDelete.bind(self)} />
      )
    });

    return (
      <div className="page-main">
        <Header />
        <div className="my-3 my-md-5 main-content">
          <div className="container">
            <div className="page-header">
              <h1 className="page-title">{strings.Media} - {strings.Gallery}</h1>
            </div>
            <div className="card">
              <div className="card-body">
                <form id="form" className="row mb-2" onSubmit={this.onSubmit.bind(this)}>
                  <div className="col-md-1">
                    <label className="mt-2">{strings.Gallery}</label>
                  </div>
                  <div className="col-md-9">
                    <input className="form-control mb-2" required
                      name="filename" value={this.state.filename} onChange={this.handleChange.bind(this)} />
                  </div>
                  <div className="col-md-2">
                    {this.state.id !== 0 ?
                      <button type="submit" className="btn btn-success btn-block">{strings.Save}</button>
                      :
                      <button type="submit" className="btn btn-primary btn-block">{strings.Create}</button>
                    }
                  </div>
                </form>
                <div className="row">
                  <div className="col-md-1">
                    <label className="mt-2">{strings.Audio}</label>
                  </div>
                  <div className="col-md-9">
                    <AudioFormElement audio_source={this.state.audio_source} duration={this.state.duration}
                      onAudioChange={this.handleAudioChange.bind(this)} />
                  </div>
                  <div className="col-md-2">
                    {this.state.id !== 0 ?
                      <button className="btn btn-outline-danger btn-block" onClick={this.handelDeleteGallery.bind(this)}>
                        <i className="fe fe-trash"></i> {strings.Delete}
                      </button>
                      : null}
                  </div>
                </div>
                {this.state.id !== 0 ?
                  <div style={{marginTop: 30}}>
                    <form id="fileForm" className="text-center">
                      <input id="fileInput" type="file" name="file" className="mt-1 mb-3" />
                      <button type="submit" className="btn btn-secondary ml-3"><i className="fe fe-upload"></i> {strings.Upload}</button>
                    </form>
                    <div className="mt-5">
                      <div className="row">
                        {files}
                      </div>
                    </div>
                  </div>
                  : null}
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