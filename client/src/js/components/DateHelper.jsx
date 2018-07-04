// Create a new React component here!import React from 'react';
import React from 'react';

const _MS_PER_MINUTE = 1000 * 60;

export default class DateHelper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };

    this.dateDiffInDays = this.dateDiffInDays.bind(this);
  }

  dateDiffInDays(date) {
    var uploadDate = Math.floor((Date.now() - date) / _MS_PER_MINUTE)
    if (uploadDate > 1439) {
      uploadDate = "posted a fit " + Math.floor((Date.now() - date) / (_MS_PER_MINUTE * 60 * 24)) + " days ago"
    } else if (uploadDate > 59) {
      uploadDate = "posted a fit " + Math.floor((Date.now() - date) / (_MS_PER_MINUTE * 60)) + " hours ago"
    } else {
      uploadDate = "posted a fit " + uploadDate + " minutes ago"
    }
    return uploadDate
  }

  render() {
    return (
    );
  }
}
