import React from 'react';
import { Header } from '../layouts/Header'
import { Footer } from '../layouts/Footer'
import Common from '../Common'
import $ from 'jquery'
import { Rnd } from 'react-rnd'
import '../styles/Overlay.css'
import Modal from 'react-awesome-modal';
import App from '../App';
import { strings } from '../Localization';
import renderHtml from 'react-render-html'


export class Overlay extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      id: parseInt(props.match.params.id),
      group_name: '',
      overlay: {},
      containerWidth: 0,
      containerHeight: 0,
      selectedItem: {
        id: null,
        positionX: 0,
        positionY: 0,
        width: 0,
        height: 0,
        text: '',
        animationspeed: 0,
        order_number: 0,
        type: 0,
        font: '',
        fontcolor: '0,0,0',
        fontsize: 0
      },
      visible: false,
      maxOrderNumber: 1
    }
  }

  componentDidMount() {
    if(this.state.id !== 0) {
      this.getOverlay();
    }

    let self = this;
    $(window).on('resize', function() {
      self.onResize();
    });

    this.onResize();

    $("#imageForm").on('submit', function (event) {
      event.preventDefault();

      let formData = new FormData();
      let files = $('#imageInput')[0].files;
      console.log('files', files);
      if (files.length === 0) {
        Common.notify('error', strings.PleaseSelectAnImageToUpload);
        return;
      }
      if (files[0].type.indexOf('image') < 0) {
        Common.notify('error', strings.PleaseSelectAnImageToUpload);
        return;
      }
      formData.append('image', files[0]);
      
      self.handleSaveTickers(function() {
        $('.loading').show();

        let url = Common.BACKEND + '/api/updateTickerImage';
        url += '?id=' + self.state.selectedItem.id;

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
            Common.notify('success', strings.TheImageElementHasBeenUpdated);
            self.getOverlay();
          },
          error: function (error) {
            Common.handleError(error);
          }
        });
      });
    });
  }

  onResize() {
    let width = $('.overlay-container').width();
    let height = width / Common.PLAYER_WIDTH * Common.PLAYER_HEIGHT;
    this.setState({
      containerWidth: width,
      containerHeight: height
    });

    $('.overlay-container').height(height);
  }

  handleChange(event) {
    let name = event.target.name;
    let state = this.state;
    state[name] = event.target.value;
    this.setState(state);
  }

  getOverlay() {
    $('.loading').show();
    let self = this;
    let url = Common.BACKEND + '/api/tickerGroups';
    url += '/' + this.state.id;
    url += '?token=' + Common.getToken();

    $.ajax({
      url: url,
      method: 'GET',
      success: function (data) {
        $('.loading').hide();

        console.log('overlay', data);
        let maxOrderNumber = self.state.maxOrderNumber;
        let tickerObjects = data.tickerObjects;
        for (let i = 0; i < tickerObjects.length; i++) {
          let ticker = tickerObjects[i];
          ticker.type = parseInt(ticker.type);
          if (ticker.type === 4 || ticker.type === 7) { // Fade Text or Cart Text
            ticker.text = ticker.text.split('||').join('\n');
          }
          ticker.order_number = parseInt(ticker.order_number);
          if(ticker.order_number > maxOrderNumber) {
            maxOrderNumber = ticker.order_number;
          }
        }
        self.setState({
          group_name: data.group_name,
          overlay: data,
          maxOrderNumber: maxOrderNumber
        });
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  onSubmit(event) {
    event.preventDefault();

    let self = this;
    let url = Common.BACKEND + '/api/tickerGroups';
    let body = {
      token: Common.getToken(),
      group_name: this.state.group_name
    }
    $('.loading').show();

    if(this.state.id === 0) { // Create
      $.ajax({
        url: url,
        method: 'POST',
        data: body,
        success: function (data) {
          $('.loading').hide();

          Common.notify('success', strings.TheOverlayGroupHasBeenCreated);
          self.props.history.push('/overlays');
        },
        error: function (error) {
          Common.handleError(error);
        }
      });
    } else { // Update
      body.id = this.state.id;

      $.ajax({
        url: url,
        method: 'PUT',
        data: body,
        success: function (data) {
          $('.loading').hide();

          Common.notify('success', strings.TheOverlayGroupHasBeenUpdated);
          self.getOverlay();
        },
        error: function (error) {
          Common.handleError(error);
        }
      });
    }
  }

  convertDimesion(item) {
    let x_rate = this.state.containerWidth / Common.PLAYER_WIDTH;
    let y_rate = this.state.containerHeight / Common.PLAYER_HEIGHT;
    let rect = {
      x: item.positionX * x_rate,
      y: item.positionY * y_rate,
      width: item.width * x_rate,
      height: item.height * y_rate
    }

    return rect;
  }

  convertRect(rect) {
    let x_rate = this.state.containerWidth / Common.PLAYER_WIDTH;
    let y_rate = this.state.containerHeight / Common.PLAYER_HEIGHT;
    rect.positionX = parseInt(rect.positionX / x_rate);
    rect.positionY = parseInt(rect.positionY / y_rate);
    rect.width = parseInt(rect.width / x_rate);
    rect.height = parseInt(rect.height / y_rate);

    return rect;
  }

  handleNumberChange(event) {
    let name = event.target.name;
    let item = this.state.selectedItem;
    item[name] = parseInt(event.target.value);
    if(name === 'animationspeed' && (item[name] <= 0 || Common.isNone(item[name]))) {
      Common.notify('error', strings.AnimationSpeedIsNotZero);
      return;
    }

    this.handleChangeTicker(item);
  }

  handleDragStop(e, d, item) {
    let selected_item = this.state.selectedItem;
    selected_item.positionX = d.x;
    selected_item.positionY = d.y;
    selected_item = this.convertRect(selected_item);
    selected_item.width = item.width;
    selected_item.height = item.height;
    selected_item = this.getSelectedItem(selected_item, item);

    this.handleChangeTicker(selected_item);
  }

  handleResizeStop(e, direction, ref, delta, position, item) {
    let width = parseInt(ref.style.width.replace('px', ''));
    let height = parseInt(ref.style.height.replace('px', ''));
    let selected_item = this.state.selectedItem;
    selected_item.width = width;
    selected_item.height = height;
    selected_item = this.convertRect(selected_item);
    selected_item.positionX = item.positionX;
    selected_item.positionY = item.positionY;
    selected_item = this.getSelectedItem(selected_item, item);

    this.handleChangeTicker(selected_item);
  }

  getSelectedItem(rect_item, item) {
    let selected_item = {};
    selected_item.id = item.id;
    selected_item.positionX = rect_item.positionX;
    selected_item.positionY = rect_item.positionY;
    selected_item.width = rect_item.width;
    selected_item.height = rect_item.height;
    selected_item.text = item.text;
    selected_item.animationspeed = item.animationspeed;
    selected_item.order_number = item.order_number;
    selected_item.type = item.type;
    selected_item.font = item.font;
    selected_item.fontsize = item.fontsize;
    selected_item.fontcolor = item.fontcolor;
    selected_item.id = item.id;

    return selected_item;
  }

  handleChangeTicker(item) {
    let tickers = [];
    for (let i = 0; i < this.state.overlay.tickerObjects.length; i++) {
      let row= this.state.overlay.tickerObjects[i];
      if(parseInt(row.id) === item.id) {
        for(let key in item) {
          row[key] = item[key];
        }
      }
      tickers.push(row);
    }
    
    let overlay = this.state.overlay;
    overlay.tickerObjects = tickers;
    this.setState({
      overlay: overlay,
      selectedItem: item
    });
  }

  handleSaveTickers(callback = null) {
    let tickers = this.state.overlay.tickerObjects;
    for (let i = 0; i < tickers.length; i++) {
      let ticker = tickers[i];
      if(ticker.type === 4 || ticker.type === 7) { // Fade Text or Cart Text 
        ticker.text = ticker.text.replace(/\n/g, '||');
      }
      
      // Set default field values for image 
      if(ticker.type === 6) { // Image
        ticker.font = Common.isNone(ticker.font) ? 'verdana' : ticker.font;
        ticker.fontcolor = Common.isNone(ticker.fontcolor) ? '255,255,255' : ticker.fontcolor;
        ticker.fontsize = Common.isNone(ticker.fontsize) || isNaN(ticker.fontsize) ? 12 : ticker.fontsize;
        ticker.animationspeed = Common.isNone(ticker.animationspeed) || isNaN(ticker.animationspeed) ? 2 : ticker.animationspeed;
      }
      
      // Validate ticker fields
      if(Common.isNone(ticker.font)) {
        Common.notify('error', strings.PleaseTypeFontName);
        return;
      }
      if (Common.isNone(ticker.fontcolor)) {
        Common.notify('error', strings.PleaseSelectFontcolor);
        return;
      }
      if (Common.isNone(ticker.animationspeed) || isNaN(ticker.animationspeed)) {
        Common.notify('error', strings.PleaseTypeAnimationspeed);
        return;
      }
      if (Common.isNone(ticker.fontsize) || isNaN(ticker.fontsize)) {
        Common.notify('error', strings.PleaseTypeFontsize);
        return;
      }
    }
    console.log('tickers', tickers);

    $('.loading').show();
    let self = this;
    let url = Common.BACKEND + '/api/tickerObjects/updateTickers';
    url += '?token=' + Common.getToken();

    $.ajax({
      url: url,
      method: 'POST',
      data: {
        tickers: tickers
      },
      success: function (data) {
        $('.loading').hide();

        console.log(data);
        if(callback === null) {
          Common.notify('success', strings.TheEelementsHaveBeenSaved);
          self.getOverlay();
        } else {
          callback();
        }
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  handleTickerChange(event) {
    let name = event.target.name;
    let item = this.state.selectedItem;
    item[name] = event.target.value;

    this.handleChangeTicker(item);
  }

  handleColorChange(event) {
    let name = event.target.name;
    let item = this.state.selectedItem;
    item[name] = Common.rgbColor(event.target.value);

    this.handleChangeTicker(item);
  }

  handleDelete() {
    let self = this;
    let id = this.state.selectedItem.id;
    if (id === null) {
      Common.notify('error', strings.PleaseSelectAnElement);
      return;
    }

    App.confirm(strings.AreYouSureToDeleteThisElement, function() {
      self.handleSaveTickers(function() {
        $('.loading').show();
        let url = Common.BACKEND + '/api/tickerObjects';
        url += '/' + id;
        url += '?token=' + Common.getToken();

        $.ajax({
          url: url,
          method: 'DELETE',
          success: function (data) {
            $('.loading').hide();

            console.log(data);
            Common.notify('success', strings.TheElementsHaveBeenDeleted);
            self.getOverlay();
          },
          error: function (error) {
            Common.handleError(error);
          }
        });
      });
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
  }

  createElement(type) {
    this.closeModal();
    let self = this;
    $('.loading').show();
    this.handleSaveTickers(function() {
      let url = Common.BACKEND + '/api/tickerObjects';
      let body = {
        type: type,
        group_id: self.state.id,
        token: Common.getToken()
      };
      console.log('create', body);

      $.ajax({
        url: url,
        method: 'POST',
        data: body,
        success: function (data) {
          $('.loading').hide();

          console.log(data);
          Common.notify('success', strings.AnElementHasBeenDeleted);
          self.getOverlay();
        },
        error: function (error) {
          Common.handleError(error);
        }
      });
    });
  }

  handleUploadImage(event) {
    event.preventDefault();

    let selectedItem = this.state.selectedItem;
    console.log(selectedItem);
  }

  handleDeleteOverlay() {
    let self = this;
    App.confirm(strings.AreYouSureToDeleteThisGroup, function() {
      let url = Common.BACKEND + '/api/tickerGroups';
      url += '?token=' + Common.getToken();
      url += '&id=' + self.state.id;

      $('.loading').show();
      $.ajax({
        url: url,
        method: 'DELETE',
        success: function (data) {
          $('.loading').hide();

          Common.notify('success', strings.TheOverlayGroupHasBeenDeleted);
          self.props.history.push('/overlays');
        },
        error: function (error) {
          Common.handleError(error);
        }
      });
    });
  }

  render() {
    let self = this;
    let tickerRnds = [];
    let overlayWidth = $('.overlay-container').width();
    let fontRatio = overlayWidth / Common.PLAYER_WIDTH;
    let maxOrderNumber = this.state.maxOrderNumber;
    
    if (this.state.id !== 0 && this.state.overlay.tickerObjects !== undefined) {
      tickerRnds = this.state.overlay.tickerObjects.map(function (item, i) {
        let rect = self.convertDimesion(item);
        let content = (<div></div>);
        item.type = parseInt(item.type);
        item.positionX = parseInt(item.positionX);
        item.positionY = parseInt(item.positionY);
        item.width = parseInt(item.width);
        item.height = parseInt(item.height);
        item.fontsize = parseInt(item.fontsize);
        let textStyle = {
          fontFamily: item.font === null ? 'verdana' : item.font.replace('.ttf', ''),
          fontSize: isNaN(item.fontsize) ? 14 : item.fontsize * fontRatio,
          color: 'rgb(' + item.fontcolor + ')'
        }
        let imageStyle = {
            width: '100%',
            height: '100%'
        }

        if (item.type === 6) { // Image
          content = (
            <div style={imageStyle}>
              <div style={{ background: 'url(' + Common.mediaUrl(item.text) + ')' }} className="strech-div-image"></div>
              <label className="tricker-type-label">{Common.tickerTypeName(item.type)}</label>
            </div>
          );
        } else if (item.type === 1) { // Date
          content = (
            <div style={textStyle}>
              {Common.humanDate()}
              <label className="tricker-type-label">{Common.tickerTypeName(item.type)}</label>
            </div>
          );
        } else if (item.type === 2) { // Time
          content = (
            <div style={textStyle}>
              {Common.humanTime()}
              <label className="tricker-type-label">{Common.tickerTypeName(item.type)}</label>
            </div>
          );
        } else { // Text
          content = (
            <div style={textStyle}>
              <div style={{width: '100%', height: rect.height, overflow: 'auto'}}>
                {renderHtml(item.text.replace(/\n/g, '<br/>'))}
              </div>
              <label className="tricker-type-label">{Common.tickerTypeName(item.type)}</label>
            </div>
          );
        }

        return (
          <Rnd
            key={item.id}
            position={{
              x: rect.x,
              y: rect.y,
            }}
            size={{
              width: rect.width,
              height: rect.height,
            }}
            bounds='parent'
            onDragStop={(e, d) => { self.handleDragStop(e, d, item) }}
            onResizeStop={(e, direction, ref, delta, position) => { self.handleResizeStop(e, direction, ref, delta, position, item)}}
            style={{zIndex: maxOrderNumber - parseInt(item.order_number) + 1}}
          >
            {content}
          </Rnd>
        )
      });
    }
    let selectedType = parseInt(this.state.selectedItem.type);
    let imageView = selectedType === 6 ? {} : { display: 'none' };

    return (
      <div className="page-main">
        <Header />
        <div className="my-3 my-md-5 main-content">
          <div className="container">
            <div className="page-header">
              <h1 className="page-title">{strings.Overlay}</h1>
            </div>
            <div className="card">
              <div className="card-body">
                <form className="row" onSubmit={this.onSubmit.bind(this)}>
                  <div className="col-md-2">
                    <label className="mt-1">{strings.GroupName}</label>
                  </div>
                  <div className="col-md-6">
                    <input className="form-control mb-2" required
                      name="group_name" value={this.state.group_name} onChange={this.handleChange.bind(this)} />
                  </div>
                  <div className="col-md-2">
                    {this.state.id !== 0 ?
                      <button type="submit" className="btn btn-success btn-block mb-2">{strings.Rename}</button>
                      : null
                    }
                  </div>
                  <div className="col-md-2">
                    {this.state.id !== 0 ?
                      <button type="button" className="btn btn-outline-danger btn-block mb-2" onClick={this.handleDeleteOverlay.bind(this)}>
                        <i className="fa fa-trash-o"></i> {strings.Delete}
                      </button>
                      :
                      <button type="submit" className="btn btn-primary btn-block mb-2">{strings.Create}</button>
                    }
                  </div>
                </form>
                {this.state.id !== 0 ?
                  <div>
                    <div className="overlay-container">
                      {tickerRnds}
                    </div>
                    <div className="row">
                      <div className="col-md-10">
                        <table cellPadding={5} style={{width: '100%'}} className="ticker-rect-table">
                          <tbody>
                            <tr>
                              <td style={{paddingLeft: 15}}>
                                <label className="float-right mr-2">{strings.Position}X</label>
                              </td>
                              <td>
                                <input type="number" min={0} className="form-control"
                                name="positionX" value={this.state.selectedItem.positionX} onChange={this.handleNumberChange.bind(this)} />
                              </td>
                              <td>
                                <label className="float-right mr-2">{strings.Position}Y</label>
                              </td>
                              <td>
                                <input type="number" min={0} className="form-control"
                                  name="positionY" value={this.state.selectedItem.positionY} onChange={this.handleNumberChange.bind(this)} />
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <label style={{fontSize: 13}}>{strings.AnimationSpeed}</label>
                              </td>
                              <td>
                                <input type="number" min={0} className="form-control"
                                  name="animationspeed" value={this.state.selectedItem.animationspeed} onChange={this.handleNumberChange.bind(this)} />
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <label className="float-right mr-2">{strings.Width}</label>
                              </td>
                              <td>
                                <input type="number" min={0} className="form-control"
                                  name="width" value={this.state.selectedItem.width} onChange={this.handleNumberChange.bind(this)} />
                              </td>
                              <td>
                                <label className="float-right mr-2">{strings.Height}</label>
                              </td>
                              <td>
                                <input type="number" min={0} className="form-control"
                                  name="height" value={this.state.selectedItem.height} onChange={this.handleNumberChange.bind(this)} />
                              </td>
                              <td style={{textAlign: 'right'}}>
                                <label style={{ fontSize: 13 }}>{strings.OrderNumber}</label>
                              </td>
                              <td>
                                <input type="number" min={0} className="form-control"
                                  name="order_number" value={this.state.selectedItem.order_number} onChange={this.handleNumberChange.bind(this)} />
                              </td>
                            </tr>
                            {selectedType !== 6 ?
                              <tr>
                                <td>
                                  <label className="float-right mr-2">{strings.Font}</label>
                                </td>
                                <td>
                                  <input type="text" min={0} className="form-control"
                                    name="font" value={this.state.selectedItem.font} onChange={this.handleTickerChange.bind(this)} />
                                </td>
                                <td>
                                  <label className="float-right mr-2">{strings.Size}</label>
                                </td>
                                <td>
                                  <input type="number" min={0} className="form-control"
                                    name="fontsize" value={this.state.selectedItem.fontsize} onChange={this.handleNumberChange.bind(this)} />
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <label>{strings.Color}</label>
                                </td>
                                <td>
                                  <input type="color" className="form-control"
                                    name="fontcolor" value={Common.hexColor(this.state.selectedItem.fontcolor)} onChange={this.handleColorChange.bind(this)} />
                                </td>
                              </tr>
                              : null}
                            {selectedType !== 1 && selectedType !== 2 && selectedType !== 6 ?
                              <tr>
                                <td>
                                  <label className="float-right mr-2">{strings.Text}</label>
                                </td>
                                <td colSpan={5}>
                                  <textarea className="form-control" rows={5}
                                    name="text" value={this.state.selectedItem.text} onChange={this.handleTickerChange.bind(this)} />
                                </td>
                              </tr>
                            : null}
                            <tr style={imageView}>
                              <td>
                                <label className="float-right mr-2">{strings.Image}</label>
                              </td>
                              <td colSpan={6}>
                                <form id="imageForm" onSubmit={this.handleUploadImage.bind(this)}>
                                  <input id="imageInput" type="file" />
                                  <button type="submit" className="btn btn-secondary ml-3">
                                    <i className="fe fe-upload"></i> {strings.Upload}
                                  </button>
                                </form>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="col-md-2 text-right">
                        <button className="btn btn-outline-primary btn-block" style={{ marginTop: 20 }}
                          onClick={() => this.handleSaveTickers()}>
                          {strings.SaveElements}
                        </button>
                        <button className="btn btn-outline-danger btn-block" style={{ marginTop: 20 }}
                          onClick={() => this.handleDelete()}>
                          <i className="fe fe-trash"></i> {strings.Remove}
                        </button>
                      </div>
                    </div>
                    <div className="text-center mt-5">
                      <button className="btn btn-secondary btn-block" onClick={() => this.openModal()}>
                        <i className="fe fe-plus"></i> {strings.Element}
                        </button>
                    </div>
                  </div>
                : null}
              </div>
            </div>
          </div>
        </div>

        <Modal visible={this.state.visible} width="300" height="480" effect="fadeInUp" onClickAway={() => this.closeModal()}>
          <div className="text-center" style={{ padding: 40 }}>
            <div className="mb-3">
              <button className="btn btn-secondary btn-block text-left" onClick={() => this.createElement(1)}>
                <i className="fe fe-plus"></i>&nbsp;&nbsp;{strings.Date}
              </button>
            </div>
            <div className="mb-3">
              <button className="btn btn-secondary btn-block text-left" onClick={() => this.createElement(2)}>
                <i className="fe fe-plus"></i>&nbsp;&nbsp;{strings.Time}
              </button>
            </div>
            <div className="mb-3">
              <button className="btn btn-secondary btn-block text-left" onClick={() => this.createElement(3)}>
                <i className="fe fe-plus"></i>&nbsp;&nbsp;{strings.ScrollText}
              </button>
            </div>
            <div className="mb-3">
              <button className="btn btn-secondary btn-block text-left" onClick={() => this.createElement(4)}>
                <i className="fe fe-plus"></i>&nbsp;&nbsp;{strings.FadeText}
              </button>
            </div>
            <div className="mb-3">
              <button className="btn btn-secondary btn-block text-left" onClick={() => this.createElement(5)}>
                <i className="fe fe-plus"></i>&nbsp;&nbsp;{strings.StaticText}
              </button>
            </div>
            <div className="mb-3">
              <button className="btn btn-secondary btn-block text-left" onClick={() => this.createElement(6)}>
                <i className="fe fe-plus"></i>&nbsp;&nbsp;{strings.Image}
              </button>
            </div>
            <div className="mb-3">
              <button className="btn btn-secondary btn-block text-left" onClick={() => this.createElement(7)}>
                <i className="fe fe-plus"></i>&nbsp;&nbsp;{strings.CartText}
              </button>
            </div>
            <div className="mt-5" onClick={() => this.closeModal()}>
              <button className="btn btn-secondary btn-block">{strings.Cancel}</button>
            </div>
          </div>
        </Modal>
        <Footer />
      </div>
    );
  }

}
