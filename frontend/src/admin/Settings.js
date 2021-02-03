import React from 'react'
import { Header } from '../layouts/Header'
import { Footer } from '../layouts/Footer'
import '../styles/Settings.css'
import $ from 'jquery'
import Common from '../Common'
import { strings } from '../Localization';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import Modal from 'react-awesome-modal';


export class Settings extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      editorState: EditorState.createEmpty(),
      copyright: '',
      database_path: '',
      exe_path: '',
      screen_max_width: 0,
      screen_max_height: 0,
      logo: '',
      auth_logo: '',
      visible: false
    }
  }

  componentDidMount() {
    this.getSettings();

    let self = this;
    $('.logo-input').change(function (event) {
      let FR = new FileReader();
      let element = $(this);
      
      FR.addEventListener("load", function (e) {
        let type = e.target['result'].split("/")[0];
        if (type !== 'data:image') {
          Common.notify('error', strings.PleaseSelectAnImageToUpload);
          element.val('');
        } else {
          let state = self.state;
          state[element[0].name] = e.target['result'];
          self.setState(state);
        }
      });

      FR.readAsDataURL(event.target.files[0]);
    });
  }

  openModal() {
    this.setState({
      visible: true
    });
  }

  closeModal() {
    this.setState({
      visible: false
    });

    window.location.href = "/";
  }

  getSettings() {
    let url = Common.BACKEND + '/api/settings';

    let self = this;
    $('.loading').show();

    $.ajax({
      url: url,
      method: 'GET',
      success: function (data) {
        $('.loading').hide();

        console.log('settings', data);
        const contentBlock = htmlToDraft(data.footer);
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
        const editorState = EditorState.createWithContent(contentState);
        self.setState({
          editorState: editorState,
          copyright: data.copyright,
          database_path: data.database_path,
          exe_path: data.exe_path,
          screen_max_width: data.screen_max_width,
          screen_max_height: data.screen_max_height,
          logo: data.logo,
          auth_logo: data.auth_logo
        });
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  onEditorStateChange(editorState) {
    this.setState({
      editorState,
    });
  };

  onSubmit(event) {
    event.preventDefault();

    let footerHtml = draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()));
    let body = {
      footer: footerHtml,
      copyright: this.state.copyright,
      database_path: this.state.database_path,
      exe_path: this.state.exe_path,
      screen_max_width: this.state.screen_max_width,
      screen_max_height: this.state.screen_max_height,
      logo: this.state.logo,
      auth_logo: this.state.auth_logo
    }
    console.log('update', body);
    let url = Common.BACKEND + '/api/settings';
    url += '?token=' + Common.getToken();

    let self = this;
    $('.loading').show();

    $.ajax({
      url: url,
      method: 'POST',
      data: body,
      success: function (data) {
        $('.loading').hide();

        console.log(data);
        self.openModal();
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

  render() {
    const { editorState } = this.state;

    return (
      <div className="page-main">
        <Header />
        <div className="my-3 my-md-5 main-content">
          <div className="container">
            <div className="page-header">
              <h1 className="page-title">{strings.Settings}</h1>
            </div>
            <div className="card">
              <div className="card-body">
                <form onSubmit={this.onSubmit.bind(this)} className="settings-form">
                  <div className="row">
                    <div className="col-md-2">
                      <label className="mt-2">{strings.DatabasePath}</label>
                    </div>
                    <div className="col-md-7">
                      <input className="form-control"
                        name="database_path" value={this.state.database_path} onChange={this.handleChange.bind(this)} />
                    </div>
                  </div>
                  <div className="row mt-4">
                    <div className="col-md-2">
                      <label className="mt-2">{strings.ExePath}</label>
                    </div>
                    <div className="col-md-7">
                      <input className="form-control"
                        name="exe_path" value={this.state.exe_path} onChange={this.handleChange.bind(this)} />
                    </div>
                  </div>
                  <div className="row mt-4">
                    <div className="col-md-2">
                      <label className="mt-2">{strings.Screen}</label>
                    </div>
                    <div className="col-md-3">
                      <input className="form-control" placeholder={strings.MaxWidth} type="number"
                        name="screen_max_width" value={this.state.screen_max_width} onChange={this.handleChange.bind(this)} />
                    </div>
                    <div className="col-md-1 text-center">
                      <label className="mt-2">X</label>
                    </div>
                    <div className="col-md-3">
                      <input className="form-control" placeholder={strings.MaxHeight} type="number"
                        name="screen_max_height" value={this.state.screen_max_height} onChange={this.handleChange.bind(this)} />
                    </div>
                  </div>
                  <div className="row mt-4">
                    <div className="col-md-2">
                      <label className="mt-2">{strings.Footer}</label>
                    </div>
                    <div className="col-md-10">
                      <Editor
                        editorState={editorState}
                        wrapperClassName="settings-footer-wrapper"
                        editorClassName="settings-footer-editor"
                        onEditorStateChange={this.onEditorStateChange.bind(this)}
                      />
                    </div>
                  </div>
                  <div className="row mt-4">
                    <div className="col-md-2">
                      <label className="mt-2">{strings.Copyright}</label>
                    </div>
                    <div className="col-md-10">
                      <input className="form-control"
                        name="copyright" value={this.state.copyright} onChange={this.handleChange.bind(this)} />
                    </div>
                  </div>
                  <div className="row mt-4">
                    <div className="col-md-2">
                      <label className="mt-2">{strings.Logo}</label>
                    </div>
                    <div className="col-md-4">
                      <div className="settings-logo-bg">
                        <img src={this.state.logo} width="100%" alt="" />
                      </div>
                      <input id="logoInput" className="logo-input" name="logo" type="file" />
                    </div>
                    <div className="col-md-2">
                      <label className="mt-2">{strings.AuthLogo}</label>
                    </div>
                    <div className="col-md-4">
                      <div className="settings-logo-bg">
                        <img src={this.state.auth_logo} width="100%" alt="" />
                      </div>
                      <input id="authLogoInput" className="logo-input" name="auth_logo" type="file" />
                    </div>
                  </div>
                  <div className="row" style={{marginTop: 40}}>
                    <div className="col-md-4"></div>
                    <div className="col-md-4 text-center">
                      <button type="submit" className="btn btn-primary btn-block">Update</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <Modal visible={this.state.visible} width="400" height="160" effect="fadeInUp" onClickAway={() => this.closeModal()}>
            <div className="text-center" style={{ padding: 40 }}>
              <p>{strings.SettingsHaveBeenUpdated}</p>
              <div style={{ marginTop: 30 }}>
                <button onClick={() => this.closeModal()} className="btn btn-secondary" style={{ width: 100 }}>{strings.Ok}</button>
              </div>
            </div>
          </Modal>
        </div>
        <Footer />
      </div>
    );
  }
}