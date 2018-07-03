import React from 'react';
import StatsColumn from './StatsColumn.jsx'
import Navbar from './Navbar.jsx'
import RenderedPosts from './RenderedPosts.jsx'
import TypeSelector from './TypeSelector.jsx'
import {Redirect} from 'react-router-dom';

export default class Stream extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: false,
      redirectURL: '',
      response: '',
      json_data: [],
      streamData: [],
      posts: [],
      reposts: [],
      rendered_posts: [],
      type_selector_value: 0,
    };

    this.getRequest();
    this.toggle_type = this.toggle_type.bind(this);
  }

  componentDidMount() {
    fetch('/api/home', {
      credentials: 'include'
    })
    .then(res => {
      console.log(res);
      if (res.redirected) {
        this.setState({redirect: true, redirectURL: res.url});
      } else {
        return res.json()
      }
    })
    .then(data => {
      console.log("api home data is", data);
      var streamData = data.stream
      console.log("streamData is", streamData);
      this.setState({streamData: streamData, json_data: data.posts});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getRequest() {
    fetch('http://ec2-18-216-120-197.us-east-2.compute.amazonaws.com:3030/feed/start')
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  toggle_type(e) {
    if (e.target.name == 1) {
      console.log("og");
    } else if (e.target.name == 2) {
      console.log("non og");
    } else {

    }
    this.setState({type_selector_value: e.target.name});
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to={'/home'}/>
    }
      return (
        <div>
          <Navbar />
          <div id="white_background_wrapper">
            <div id="content_wrapper">
              <TypeSelector toggle_type={this.toggle_type.bind(this)} types={["All", "Original", "Non-Original"]}
              type_selector_value={this.state.type_selector_value}/>
              <RenderedPosts streamData={this.state.streamData} />
            </div>
          </div>
      </div>
    );
  }
}
