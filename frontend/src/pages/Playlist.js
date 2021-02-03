import React from 'react'
import { Header } from '../layouts/Header'
import { Footer } from '../layouts/Footer'
import Common from '../Common'
import $ from 'jquery'
import { MediaElement } from '../components/MediaElement'
import Modal from 'react-awesome-modal';
import { Link } from 'react-router-dom'
import ReactCrop from 'react-image-crop';
import '../styles/ReactImageCrop.css'
import '../styles/Playlist.css'
import Pagination from "react-js-pagination";
import App from '../App';
import { strings } from '../Localization';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';


const SortableItem = SortableElement(({ value }) =>
  <div>{value}</div>
);

const SortableList = SortableContainer(({ items }) => {
  return (
    <div>
      {items.map((value, index) => (
        <SortableItem key={`item-${index}`} index={index} value={value} />
      ))}
    </div>
  );
});

export class Playlist extends React.Component {

  constructor(props) {
    super(props);
    this.reactcrop = React.createRef();
    this.state = {
      id: parseInt(props.match.params.id),
      playlist: {
        name: '',
        positionX: 0,
        positionY: 0,
        width: Common.PLAYER_WIDTH,
        height: Common.PLAYER_HEIGHT,
        elements: []
      },
      visible: false,
      crop: {
        x: 0,
        y: 0,
        width: 100,
        height: 100
      },
      elements: [],
      offset: 1,
      totalElements: 0,
      selected_ids: [],
      tickerGroups: [],
      loggedIn: Common.loggedIn(),
      containerWidth: 860
    }
  }
  
  componentDidMount() {
    console.log("==================>", this.reactcrop.current.offsetWidth);
    this.setState({containerWidth: this.reactcrop.current.offsetWidth});
    if (this.state.id !== 0) {
      this.getPlaylist(true);
      this.getTickerGroups();
    }
  }

  getPlaylist() {
    let url = Common.BACKEND + '/api/playlists';
    url += '/' + this.state.id;
    url += '?token=' + Common.getToken();

    let self = this;

    $.ajax({
      url: url,
      method: 'GET',
      success: function (data) {
        console.log('playlist', data);
        let selected_ids = [];
        for (let i = 0; i < data.elements.length; i++) {
          selected_ids.push(data.elements[i].id);
        }
        let state = self.state;
        state.playlist = data;
        state.selected_ids = selected_ids;
        self.setState(state);
        self.rectToCrop(data);
        self.getMedias();
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  getMedias() {
    let url = Common.BACKEND + '/api/elements';
    url += '?page=' + this.state.offset;
    url += '&token=' + Common.getToken();

    let self = this;

    $.ajax({
      url: url,
      method: 'GET',
      success: function (data) {
        let elements = data.data;
        let selected_ids = self.state.selected_ids;
        for (let i = 0; i < elements.length; i++) {
          let row = elements[i];
          row.selected = selected_ids.includes(row.id);
        }
        console.log('elements', elements);
        self.setState({
          elements: elements,
          totalElements: data.total
        });

        $(".media-element-checkbox").each(function(i, item) {
          let id = parseInt($(item).attr('data-id'));
          item.checked = selected_ids.includes(id);
          $(item).off('change');
          $(item).on('change', function() {
            let id = parseInt($(this).attr('data-id'));
            let ids = self.state.selected_ids;
            if(item.checked && !ids.includes(id)) {
              ids.push(id);
            }
            if(!item.checked && ids.includes(id)) {
              ids.splice(ids.indexOf(id), 1);
            }
            self.setState({selected_ids: ids});
          });
        });
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  getTickerGroups() {
    let url = Common.BACKEND + '/api/tickerGroups/all';
    url += '?token=' + Common.getToken();

    let self = this;
    $('.loading').show();

    $.ajax({
      url: url,
      method: 'GET',
      success: function (data) {
        $('.loading').hide();

        self.setState({
          tickerGroups: data,
        });
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  handleChange(event) {
    let name = event.target.name;
    let data = this.state.playlist;
    data[name] = event.target.value;
    this.setState({ playlist: data });

    let self = this;
    window.setTimeout(function () {
      self.rectToCrop(data);
    }, 1);
  }

  handlePageChange(pageNumber) {
    this.setState({
      offset: pageNumber
    });

    let self = this;
    window.setTimeout(function () {
      self.getMedias();
    }, 10);
    $("#elementContainer").animate({ scrollTop: "0px" }, 'fast');
  }

  onSubmit(event) {
    event.preventDefault();

    $('.loading').show();
    let self = this;
    let url = Common.BACKEND + '/api/playlists';
    let body = {
      name: this.state.playlist.name,
      positionX: this.state.playlist.positionX,
      positionY: this.state.playlist.positionY,
      width: this.state.playlist.width,
      height: this.state.playlist.height,
      token: Common.getToken()
    }

    if(this.state.id === 0) { // Create
      $.ajax({
        url: url,
        method: 'POST',
        data: body,
        success: function (data) {
          $('.loading').hide();

          console.log(data);
          Common.notify('success', strings.APlaylistHasBeenCreated);
          self.props.history.push('/playlists');
        },
        error: function (error) {
          Common.handleError(error);
        }
      });
    } else { // Update
      url += '/' + this.state.id;

      $.ajax({
        url: url,
        method: 'PUT',
        data: body,
        success: function (data) {
          $('.loading').hide();

          console.log(data);
          Common.notify('success', strings.ThePlaylistHasBeenUpdated);
        },
        error: function (error) {
          Common.handleError(error);
        }
      });
    }
  }

  handleDelete() {
    let self = this;
    App.confirm(strings.AreYouSureToDeleteThisPlaylist, function() {
      $('.loading').show();
      let url = Common.BACKEND + '/api/playlists';
      url += '/' + self.state.id;
      url += '?token=' + Common.getToken();

      $.ajax({
        url: url,
        method: 'DELETE',
        success: function (data) {
          $('.loading').hide();

          console.log(data);
          Common.notify('success', strings.ThePlaylistHasBeenDeleted);
          self.props.history.push('/playlists');
        },
        error: function (error) {
          Common.handleError(error);
        }
      });
    });
  }

  onCropChange(crop) {
    this.setState({
      crop: crop
    });

    let self = this;
    window.setTimeout(function() {
      self.cropToRect(crop);
    }, 1);
  }

  rectToCrop(data) {
    let crop = {
      x: parseFloat(data.positionX) / Common.PLAYER_WIDTH * 100,
      y: parseFloat(data.positionY) / Common.PLAYER_HEIGHT * 100,
      width: parseFloat(data.width) / Common.PLAYER_WIDTH * 100,
      height: parseFloat(data.height) / Common.PLAYER_HEIGHT * 100
    }

    this.setState({ crop: crop });
  }

  cropToRect(crop) {
    let data = this.state.playlist;
    data.positionX = parseInt(crop.x / 100 * Common.PLAYER_WIDTH);
    data.positionY = parseInt(crop.y / 100 * Common.PLAYER_HEIGHT);
    data.width = parseInt(crop.width / 100 * Common.PLAYER_WIDTH);
    data.height = parseInt(crop.height / 100 * Common.PLAYER_HEIGHT);

    this.setState({
      playlist: data
    });
  }

  openModal() {
    this.setState({
      visible: true
    });

    $("body").css('overflow', 'hidden');
  }

  closeModal() {
    this.setState({
      visible: false
    });

    $("body").css('overflow', 'auto');
  }

  saveMedias() {
    let self = this;
    let url = Common.BACKEND + '/api/playlists';
    url += '/' + this.state.id;
    url += '/updateMedias';
    $('.loading').show();
    
    //modified by Rpz
    console.log("------------ start ----------------");
    console.log("===>", this.state.id);
    console.log(self.state.selected_ids);
    console.log("------------ end ----------------");

    $.ajax({
      url: url,
      method: 'POST',
      data: {
        element_ids: self.state.selected_ids,
        token: Common.getToken()
      },
      success: function (data) {
        $('.loading').hide();
        console.log("====> success added.", data.ok);
        console.log(data);
        self.closeModal();
        self.getPlaylist();
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  handleOrderChange(id, order) {
    let playlist = this.state.playlist;
    for (let i = 0; i < playlist.elements.length; i++) {
      if (playlist.elements[i].id === id) {
        playlist.elements[i].order_number = order;
      }
    }
    this.setState({
      playlist: playlist
    });
  }

  saveOrder(elements = null) {
    let self = this;
    let url = Common.BACKEND + '/api/playlists';
    url += '/' + this.state.id;
    url += '/updateOrder';
    let body = {
      elements: elements === null ? this.state.playlist.elements : elements,
      token: Common.getToken()
    };
    if(elements !== null) {
      $(".loading").show();
    }

    $.ajax({
      url: url,
      method: 'POST',
      data: body,
      success: function (data) {
        $('.loading').hide();
        self.getPlaylist();
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  handleDeleteFromPlaylist(id) {
    console.log('delete', id);
    let self = this;

    App.confirm(strings.AreYouSureToRemoveThisMediaFromThePlaylist, function() {
      let url = Common.BACKEND + '/api/playlists';
      url += '/' + self.state.id;
      url += '/deleteMedia';
      url += '/' + id;
      url += '?token=' + Common.getToken();
      $('.loading').show();

      $.ajax({
        url: url,
        method: 'POST',
        success: function (data) {
          $('.loading').hide();

          console.log(data);
          Common.notify('success', strings.AMediaHasBeenRemovedFromThePlaylist);
          self.getPlaylist();
        },
        error: function (error) {
          Common.handleError(error);
        }
      });
    });
  }

  handleChangeGroup(group_id, playlistelement_id) {
    // let self = this;
    let url = Common.BACKEND + '/api/tickerGroupPlaylistElements';
    let body = {
      group_id: group_id,
      playlistelement_id: playlistelement_id,
      token: Common.getToken()
    };
    $('.loading').show();

    $.ajax({
      url: url,
      method: 'POST',
      data: body,
      success: function (data) {
        $('.loading').hide();

        console.log(data);
        Common.notify('success', strings.TheElementGroupHasBeenChanged);
        // self.getPlaylist();
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  handleDragUpdate({ oldIndex, newIndex }) {
    let elements = arrayMove(this.state.playlist.elements, oldIndex, newIndex);
    for (let i = 0; i < elements.length; i++) {
      let element = elements[i];
      element.order_number = i + 1;
    }
    let playlist = this.state.playlist;
    playlist.elements = elements;

    this.setState({ playlist: playlist });
    this.saveOrder(elements);
  }

  render() {
    let self = this;

    const elements = this.state.playlist.elements.map(function(item, index) {
      return (
        <MediaElement key={'element-' + index} data={item}
          playlistMedia={true}
          onOrderChange={self.handleOrderChange.bind(self)}
          onDeleteFromPlaylist={self.handleDeleteFromPlaylist.bind(self)}
          tickerGroups={self.state.tickerGroups}
          onChangeGroup={self.handleChangeGroup.bind(self)}
          onSaveOrder={self.saveOrder.bind(self)}
          loggedIn={self.state.loggedIn} />
      );
    });

    let dragContainer = this.state.playlist.elements.length === 0 ? null : (
      <SortableList items={elements} onSortEnd={this.handleDragUpdate.bind(this)} />
    );

    const select_elements = this.state.elements.map(function(item, i) {
      return (
        <MediaElement key={'select-element-' + i} data={item} mode="select" loggedIn={self.state.loggedIn} />
      )
    });

    
    let mod_height;
    let mod_width;
    let padding_width = 0;
    
    // console.log(Common.PLAYER_HEIGHT, ":::", Common.PLAYER_WIDTH, this.state.containerWidth);
    
    if(Common.PLAYER_HEIGHT > Common.PLAYER_WIDTH){
      mod_height = this.state.containerWidth;
      mod_width = mod_height*Common.PLAYER_WIDTH/Common.PLAYER_HEIGHT;
      padding_width = (this.state.containerWidth -mod_width)/2
    } else {
      mod_width = this.state.containerWidth;
      mod_height = mod_width*Common.PLAYER_HEIGHT/Common.PLAYER_WIDTH;
    }
    // mod_width = this.state.containerWidth;
    // mod_height = mod_width*Common.PLAYER_HEIGHT/Common.PLAYER_WIDTH;
    // console.log("============");
    // console.log(mod_height,":::", mod_width);

    return (
      <div className="page-main">
        <Header />
        <div className="my-3 my-md-5 main-content">
          <div className="container">
            <div className="page-header">
              <h1 className="page-title">{strings.Playlist}</h1>
            </div>
            <div className="card">
              <div className="card-body">
                <form onSubmit={this.onSubmit.bind(this)}>
                  <div className="row">
                    <label className="col-md-2 col-form-label">{strings.Name}</label>
                    <div className="col-md-6">
                      <input className="form-control mb-2" name="name" required
                        value={this.state.playlist.name} onChange={this.handleChange.bind(this)} />
                    </div>
                    <div className="col-md-2">
                      {this.state.id !== 0 ?
                        <button type="submit" className="btn btn-success btn-block mb-2">{strings.Save}</button>
                      : null}
                    </div>
                    <div className="col-md-2">
                      {this.state.id !== 0 ?
                        <button type="button" className="btn btn-outline-danger btn-block mb-2" onClick={this.handleDelete.bind(this)}>
                          <i className="fa fa-trash-o"></i> {strings.Delete}
                        </button>
                        : 
                        <button type="submit" className="btn btn-primary btn-block mb-2">{strings.Create}</button>
                      }
                    </div>
                  </div>
                </form>
                <div className="row mt-5">
                  <div ref={this.reactcrop} className="col-md-9">
                    <ReactCrop src="/assets/images/bg/bg.png" crop={this.state.crop} onChange={this.onCropChange.bind(this)}
                       style={{width:mod_width, height:mod_height, marginLeft:padding_width}} imageStyle={{width:mod_width, height:mod_height}}  maxWidth={100} maxHeight={100} />

                  </div>
                  <div className="col-md-3">
                    <table className="crop-info-table">
                      <tbody>
                        <tr>
                          <td>
                            <label>PosX</label>
                          </td>
                          <td>
                            <input className="form-control" name="positionX" required type="number"
                              value={this.state.playlist.positionX} onChange={this.handleChange.bind(this)} />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <label>PosY</label>
                          </td>
                          <td>
                            <input className="form-control" name="positionY" required type="number"
                              value={this.state.playlist.positionY} onChange={this.handleChange.bind(this)} />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <label>{strings.Width}</label>
                          </td>
                          <td>
                            <input className="form-control" name="width" required type="number"
                              value={this.state.playlist.width} onChange={this.handleChange.bind(this)} />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <label>{strings.Height}</label>
                          </td>
                          <td>
                            <input className="form-control" name="height" required type="number"
                              value={this.state.playlist.height} onChange={this.handleChange.bind(this)} />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="card-title mt-5">
                  <h4>{strings.MediaFiles}</h4>
                </div>
                {this.state.id !== 0 ?
                  <div>
                    <div className="mt-5 mb-5 text-center">
                      <button className="btn btn-secondary btn-block" onClick={this.openModal.bind(this)}>
                        <i className="fa fa-check-square-o"></i> {strings.AddOrRemoveMedias}
                      </button>
                    </div>
                    {dragContainer}
                    {/* <div className="mt-3 text-center">
                      <button className="btn btn-secondary btn-block" onClick={this.saveOrder.bind(this)}>
                        {strings.SaveMediaOrder}
                      </button>
                    </div> */}
                  </div>
                  : null}
              </div>
            </div>
          </div>
        </div>
        
        <Modal visible={this.state.visible} width="85%" height="600" effect="fadeInUp" onClickAway={() => this.closeModal()}>
          <div className="text-center" style={{ padding: 30, background: '#2c2c2c' }}>
            <div id="elementContainer" className="row" style={{height: 450, overflow: 'auto', background: '#ededed', padding: '20px 10px', borderRadius: 2}}>
              {select_elements}
            </div>
            <div className="text-center" style={{ marginTop: 20, marginBottom: 30 }}>
              <Pagination
                activePage={this.state.offset}
                itemsCountPerPage={12}
                totalItemsCount={this.state.totalElements}
                pageRangeDisplayed={10}
                onChange={this.handlePageChange.bind(this)}
                prevPageText={strings.Prev}
                nextPageText={strings.Next}
                firstPageText={strings.First}
                lastPageText={strings.Last}
              />
            </div>
            <div>
              <Link to="#" onClick={() => this.saveMedias()} className="btn btn-primary" style={{ width: 100 }}>{strings.Save}</Link>
              <Link to="#" onClick={() => this.closeModal()} className="btn btn-secondary ml-3" style={{ width: 100 }}>{strings.Cancel}</Link>
            </div>
          </div>
        </Modal>
        <Footer />
      </div>
    );
  }
}