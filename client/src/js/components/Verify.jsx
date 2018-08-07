import React from 'react';
import {Redirect} from 'react-router-dom'

export default class Verify extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url: props.location.search,
      redirect: false
    };
  }

  componentDidMount() {
    fetch('api/verify/' + this.state.url, {
      method: 'GET',
      credentials: 'include',
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'verified') {
        this.setState({redirect: true})
      } else {

      }
    })
    .catch(function(err) {
        console.log(err);
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({url: nextProps.match})
  }

  render() {
    return (
      <div id="white_background_wrapper">
        {this.state.redirect && <Redirect to='/' />}
        <p>Yo</p>
      </div>
    );
  }
}
