import React from 'react';
import StatsColumn from './StatsColumn.jsx'
import Navbar from './Navbar.jsx'
import RenderedPosts from './RenderedPosts.jsx'
import TypeSelector from './TypeSelector.jsx'

export default class Stream extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      response: '',
      json_data: [],
      post_data: [],
      rendered_posts: [],
      type_selector_value: 0
    };

    this.getRequest();
    this.toggle_type = this.toggle_type.bind(this);
  }

  componentDidMount() {
    // window.addEventListener('scroll', this.handleScroll)
    fetch('/api/home')
    .then(res => res.json())
    .then(data => {
      console.log("api home data is", data);
      this.setState({post_data: data, json_data: data});
    });
  }

  componentWillUnmount() {
    // window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll(event) {
    if (window.scrollY > 50) {
      console.log("scrolled to 50!");
      // elem.style.height = "40px";
    } else {
      // elem.style.height = "70px";
    }
    // do something like call `this.setState`
    // access window.scrollY etc
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
    var data = this.state.json_data
    var temp_data = [];
    if (e.target.name == 1) {
      for (var i = 0; i < data.length; i++) {
        if(data[i].original) {
          temp_data.push(data[i]);
        }
      }
    } else if (e.target.name == 2) {
      for (i = 0; i < data.length; i++) {
        if(!data[i].original) {
          temp_data.push(data[i]);
        }
      }
    } else {
      temp_data = data;
    }
    this.setState({post_data: temp_data, type_selector_value: e.target.name});
  }

  render() {
      return (
        <div>
        <Navbar />
        <div id="white_background_wrapper">
        <div id="content_wrapper">
          <TypeSelector toggle_type={this.toggle_type.bind(this)} types={["All", "Original", "Non-Original"]}
          type_selector_value={this.state.type_selector_value}/>
          <RenderedPosts post_data={this.state.post_data} />
        </div>
          <StatsColumn show_profile={false}/>
        </div>
      </div>
    );
  }
}
