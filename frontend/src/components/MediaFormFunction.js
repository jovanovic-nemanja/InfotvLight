import React from 'react'
import Common from '../Common'
import $ from 'jquery'
import App from '../App'
import { strings } from '../Localization'


export class MediaFormFunction extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {};
  }

  handleDelete(id, parent) {
    console.log('delete media', id);
    App.confirm(strings.AreYouSureToDeleteThisMedia, function () {
      let url = Common.BACKEND + '/api/elements';
      url += '/' + id;
      url += '?token=' + Common.getToken();
      $('.loading').show();

      $.ajax({
        url: url,
        method: 'DELETE',
        success: function (data) {
          $('.loading').hide();
          
          Common.notify('success', strings.TheMediaHasBeenDeleted);
          parent.props.history.push('/media');
        },
        error: function (error) {
          Common.handleError(error);
        }
      });
    });
  }

  render() {
    return (<div></div>);
  }
}