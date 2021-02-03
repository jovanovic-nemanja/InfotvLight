import React from 'react'
import renderHtml from 'react-render-html'
import Common from '../Common'


export class Footer extends React.Component {

  static self;

  constructor(props) {
    super(props);
    
    let settings = Common.getSettings();
    this.state = {
      footer: Common.isNone(settings) || settings.footer === undefined ? '' : settings.footer,
      copyright: Common.isNone(settings) || settings.copyright === undefined ? '' : settings.copyright,
      logo: Common.isNone(settings) || settings.logo === undefined ? '/assets/images/tremtec-logo-small.png' : settings.logo,
    }
    Footer.self = this;
  }
  
  componentDidMount() {
  }

  render() {

    return(
      <div>
        <div className="footer">
          <div className="container">
            <div className="row">
              <div className="col-lg-8">
                {renderHtml(this.state.footer)}
              </div>
              <div className="col-lg-4 mt-4 mt-lg-0">
                <img src={this.state.logo} alt="" width="200px" />
              </div>
            </div>
          </div>
        </div>
        <footer className="footer">
          <div className="container">
            <div className="mt-3 mt-lg-0">
              {this.state.copyright}
            </div>
          </div>
        </footer>
      </div>
    );
  }
}