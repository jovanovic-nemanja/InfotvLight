import React from 'react'
import '../styles/Media.css'
import { Header } from '../layouts/Header'
import { Footer } from '../layouts/Footer'
import $ from 'jquery'
import Common from '../Common'
import Pagination from "react-js-pagination";
import { MediaElement } from '../components/MediaElement'
import Modal from 'react-awesome-modal';
import { Link } from 'react-router-dom'
import Dropdown from 'react-dropdown'
import { strings } from '../Localization';


export class Media extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      mediaSource: [],
      pageIndex: 1,
      totalCount: 0,
      deletionVisible: false,
      selected_ids: [],
      from: 1,
      to: 1,
      type: 0,
      visible: false,
      loggedIn: Common.loggedIn()
    }
  }

  componentDidMount() {
    this.getMedias();
  }

  getMedias() {
    let url = Common.BACKEND + '/api/elements';
    url += '?page=' + this.state.pageIndex;
    url += '&type=' + this.state.type;
    url += '&token=' + Common.getToken();

    let self = this;
    $('.loading').show();

    $.ajax({
      url: url,
      method: 'GET',
      success: function (data) {
        $('.loading').hide();

        console.log('medias', data.data);
        self.setState({
          mediaSource: data.data,
          totalCount: data.total,
          from: data.from,
          to: data.to
        });

        $(".media-element-checkbox").each(function (i, item) {
          let selected_ids = self.state.selected_ids;
          item.checked = selected_ids.indexOf(parseInt($(item).attr('data-id'))) > -1;
          $(item).off('change');
          $(item).on('change', function () {
            let id = parseInt($(this).attr('data-id'));
            let ids = self.state.selected_ids;
            if (item.checked && !ids.includes(id)) {
              ids.push(id);
            }
            if (!item.checked && ids.includes(id)) {
              ids.splice(ids.indexOf(id), 1);
            }
            self.setState({ selected_ids: ids });
          });
        });
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

  handlePageChange(pageNumber) {
    this.setState({
      pageIndex: pageNumber,
    });

    let self = this;
    window.setTimeout(function() {
      self.getMedias();
    }, 100);
    $("html, body").animate({ scrollTop: "130px" }, 'fast');
    $("#elementContainer").animate({ scrollTop: "0px" }, 'fast');
  }

  openDeletionModal() {
    this.setState({
      deletionVisible: true,
      selected_ids: []
    });
    $("body").css('overflow', 'hidden');

    $(".media-element-checkbox").each(function (i, item) {
      item.checked = false;
    });
  }

  closeDeletionModal() {
    this.setState({
      deletionVisible: false
    });
    $("body").css('overflow', 'auto');
  }

  deleteMedias() {
    let selected_ids = this.state.selected_ids;
    if(selected_ids.length === 0) {
      Common.notify('warning', strings.PleaseSelectMediasToDelete);
      return;
    }

    console.log('delete', selected_ids);

    let self = this;
    $('.loading').show();
    let url = Common.BACKEND + '/api/elements';

    $.ajax({
      url: url,
      method: 'DELETE',
      data: {
        ids: selected_ids,
        token: Common.getToken()
      },
      success: function (data) {
        $('.loading').hide();

        console.log(data);
        Common.notify('success', strings.TheMediaHasBeenDeleted);
        self.closeDeletionModal();
        self.getMedias();
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  onTypeChange(event) {
    this.setState({
      type: event.value,
      pageIndex: 1
    });

    let self = this;
    window.setTimeout(function () {
      self.getMedias();
    }, 10);
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

  render() {
    let self = this;
    const types = [
      { value: 0, label: strings.AllTypes },
      { value: 1, label: strings.Video },
      { value: 2, label: strings.Image },
      { value: 3, label: strings.Gallery },
      { value: 4, label: strings.Website },
    ];

    const medias = this.state.mediaSource.map(function(item, i) {
      return (
        <MediaElement key={'element-' + i} data={item} deletion={self.state.showDeletion} loggedIn={self.state.loggedIn} />
      );
    });

    const select_elements = this.state.mediaSource.map(function (item, i) {
      return (
        <MediaElement key={'select-element-' + i} data={item} mode="select" loggedIn={self.state.loggedIn} />
      )
    });

    return (
      <div className="page-main">
        <Header />
        <div className="my-3 my-md-5 main-content">
          <div className="container">
            <div className="page-header">
              <h1 className="page-title">{strings.ManageMedia}</h1>
              <div className="page-subtitle">{this.state.from} - {this.state.to} {strings.of} {this.state.totalCount} {strings.medias}</div>
              <div className="page-options d-flex">
                <div id="typesContainer">
                  <Dropdown options={types} onChange={this.onTypeChange.bind(this)} value={types[this.state.type]} />
                </div>
                {this.state.loggedIn ?
                  <div>
                    <button className="btn btn-primary ml-5" onClick={this.openModal.bind(this)}>
                      <i className="fe fe-plus"></i> {strings.CreateMedia}
                    </button>
                    <button className="btn btn-outline-danger ml-2" onClick={this.openDeletionModal.bind(this)}>
                      <i className="fe fe-trash"></i> {strings.DeleteMedias}
                    </button>
                  </div>
                  : null}
              </div>
            </div>
            <div className="row row-cards">
              {medias}
            </div>
            <div className="mt-3 text-center">
              <Pagination
                activePage={this.state.pageIndex}
                itemsCountPerPage={12}
                totalItemsCount={this.state.totalCount}
                pageRangeDisplayed={5}
                onChange={this.handlePageChange.bind(this)}
                prevPageText="Prev"
                nextPageText="Next"
                firstPageText="First"
                lastPageText="Last"
              />
            </div>
          </div>
        </div>
        
        <Modal visible={this.state.deletionVisible} width="85%" height="600" effect="fadeInUp" onClickAway={() => this.closeDeletionModal()}>
          <div className="text-center" style={{ padding: 30, background: '#2c2c2c' }}>
            <div id="elementContainer" className="row" style={{ height: 450, overflow: 'auto', background: '#ededed', padding: '20px 10px', borderRadius: 2 }}>
              {select_elements}
            </div>
            <div className="text-center" style={{ marginTop: 20, marginBottom: 30 }}>
              <Pagination
                activePage={this.state.pageIndex}
                itemsCountPerPage={12}
                totalItemsCount={this.state.totalCount}
                pageRangeDisplayed={5}
                onChange={this.handlePageChange.bind(this)}
                prevPageText={strings.Prev}
                nextPageText={strings.Next}
                firstPageText={strings.First}
                lastPageText={strings.Last}
              />
            </div>
            <div>
              <Link to="#" onClick={() => this.deleteMedias()} className="btn btn-danger" style={{ width: 100 }}>{strings.Delete}</Link>
              <Link to="#" onClick={() => this.closeDeletionModal()} className="btn btn-secondary ml-3" style={{ width: 100 }}>{strings.Cancel}</Link>
            </div>
          </div>
        </Modal>
        <Modal visible={this.state.visible} width="240" height="330" effect="fadeInUp" onClickAway={() => this.closeModal()}>
          <div style={{ padding: 40 }}>
            <div className="mb-3">
              <Link to="/media/video_form/0" className="btn btn-secondary btn-block text-left">
                <i className="fe fe-video"></i>&nbsp;&nbsp;{strings.NewVideo}
              </Link>
            </div>
            <div className="mb-3">
              <Link to="/media/image_form/0" className="btn btn-secondary btn-block text-left">
                <i className="fa fa-picture-o"></i>&nbsp;&nbsp;{strings.NewImage}
              </Link>
            </div>
            <div className="mb-3">
              <Link to="/media/gallery_form/0" className="btn btn-secondary btn-block text-left">
                <i className="fa fa-folder-o"></i>&nbsp;&nbsp;{strings.NewGallery}
              </Link>
            </div>
            <div className="mb-3">
              <Link to="/media/website_form/0" className="btn btn-secondary btn-block text-left">
                <i className="fe fe-link"></i>&nbsp;&nbsp;{strings.NewWebsite}
              </Link>
            </div>
            <div className="mt-5" onClick={() => this.closeModal()}>
              <Link to="#" className="btn btn-secondary btn-block">
                {strings.Cancel}
              </Link>
            </div>
          </div>
        </Modal>
        <Footer />
      </div>
    );
  }
}