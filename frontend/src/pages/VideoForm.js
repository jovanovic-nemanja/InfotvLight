import React from 'react'
import { Header } from '../layouts/Header'
import { Footer } from '../layouts/Footer'
import $ from 'jquery'
import Common from '../Common'
import { MediaFormFunction } from '../components/MediaFormFunction';
import { strings } from '../Localization';
// added by Rpz
import App from '../App'

export class VideoForm extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      id: parseInt(props.match.params.id),
      filename: ''
    }
    this.mediaFunction = React.createRef();
  }
  
  componentDidMount() {
    if(this.state.id !== 0) {
      this.getVideoMedia();
    }

    let self = this;

    $("#form").on('submit', function(event) {
      event.preventDefault();

      let formData = new FormData();
      let files = $('#videoInput')[0].files;
      console.log('files', files);
      if(files.length === 0) {
        Common.notify('error', strings.PleaseSelectAMP4FileToUpload);
        return;
      }
      if (files[0].type !== 'video/mp4') {
        Common.notify('error', strings.PleaseSelectAMP4FileToUpload);
        return;
      }
      formData.append('video', $('#videoInput')[0].files[0]);

      $('.loading').show();

      if (self.state.id === 0) { // create
        let url = Common.BACKEND + '/api/storeVideoMedia';

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
            Common.notify('success', strings.VideoMediaHasBeenCreated);
            self.props.history.push('/media');
          },
          error: function (error) {
            Common.handleError(error);
          }
        });
      } else { // update
        let preurl = Common.BACKEND + '/api/preupdateVideoMedia';
      
        $.ajax({
          url: preurl,
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
            if( data.IsExist ) {
              self.overwriteVideoMedia();
            } else {
              self.updateVideoMedia();
            }
          },
          error: function (error) {
            Common.handleError(error);
          }
        });
      }
    });
  }

  overwriteVideoMedia() {
      let self = this;
      let url = Common.BACKEND + '/api/updateVideoMedia';
      url += '?id=' + self.state.id;  
      let formData = new FormData();
      let files = $('#videoInput')[0].files;
      console.log('files', files);
      if(files.length === 0) {
        Common.notify('error', strings.PleaseSelectAMP4FileToUpload);
        return;
      }
      if (files[0].type !== 'video/mp4') {
        Common.notify('error', strings.PleaseSelectAMP4FileToUpload);
        return;
      }
      formData.append('video', $('#videoInput')[0].files[0]);
      App.confirm(strings.AreYouSureToOverwriteThisMedia, function () {
      
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
            Common.notify('success', strings.VideoMediaHasBeenUpdated);
            window.location.reload();
          },
          error: function (error) {
            Common.handleError(error);
          }
        });
    });
  }

  updateVideoMedia() {
    let self = this;
    let url = Common.BACKEND + '/api/updateVideoMedia';
      url += '?id=' + self.state.id;  
      let formData = new FormData();
      let files = $('#videoInput')[0].files;
      console.log('files', files);
      if(files.length === 0) {
        Common.notify('error', strings.PleaseSelectAMP4FileToUpload);
        return;
      }
      if (files[0].type !== 'video/mp4') {
        Common.notify('error', strings.PleaseSelectAMP4FileToUpload);
        return;
      }
      formData.append('video', $('#videoInput')[0].files[0]);

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
          Common.notify('success', strings.VideoMediaHasBeenUpdated);
          window.location.reload();
        },
        error: function (error) {
          Common.handleError(error);
        }
      });
  }

  getVideoMedia() {
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
          filename: Common.mediaUrl(data.filename)
        })
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
              <h1 className="page-title">{strings.Media} - {strings.Video}</h1>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-2"></div>
                  <div className="col-md-8">
                    <div className="text-center">
                      {this.state.filename !== '' ?
                        <video width="100%" controls>
                          <source src={this.state.filename} type="video/mp4" />
                        </video>
                        : null}
                      <form id="form" encType="multipart/form-data" method="post" className="mt-4">
                        <div className="row">
                          <div className="col-md-5">
                            <input id="videoInput" type="file" name="video" className="float-left mb-3 mt-1" />
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