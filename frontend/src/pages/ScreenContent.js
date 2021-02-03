import React from 'react';
import { Header } from '../layouts/Header'
import { Footer } from '../layouts/Footer'
import Common from '../Common'
import $ from 'jquery'
import { strings } from '../Localization';


export class ScreenContent extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      image_src: '/assets/images/bg/bg.png'
    }
  }

  handleShow() {
    let url = Common.BACKEND + '/api/showScreen';
    url += '?token=' + Common.getToken();

    let self = this;
    $('.loading').show();

    $.ajax({
      url: url,
      method: 'GET',
      success: function (data) {
        $('.loading').hide();

        console.log(data);
        self.setState({
          image_src: Common.BACKEND + '/snapshot.png?' + parseInt(Math.random() * 100000).toString()
        })
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }
  
  render() {

    return (
      <div className="page-main">
        <Header />
        <div className="my-3 my-md-5 main-content">
          <div className="container">
            <div className="page-header">
              <h1 className="page-title">{strings.ShowScreenContent}</h1>
            </div>
            <div className="card">
              <div className="card-body">
                <button className="btn btn-primary mb-3" onClick={this.handleShow.bind(this)}>
                  <i className="fe fe-rotate-ccw"></i> {strings.ReloadImage}
                </button>
                <img src={this.state.image_src} alt="" width="100%" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

}
