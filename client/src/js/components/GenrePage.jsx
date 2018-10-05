import React from 'react';
import TypeSelector from './TypeSelector.jsx'
import TimePeriod from './TimePeriod.jsx'
import ImageTetris from './ImageTetris.jsx'

const url = process.env.REACT_APP_API_URL

export default class GenrePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      type_selector_value: 0,
      timePeriod: 0,
      streamData: []
    };

    this.toggle_type = this.toggle_type.bind(this);
  }

  componentDidMount() {
    fetch(url + '/api/genre/' + this.props.genre + '/' + this.state.timePeriod, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data) {
        console.log(data);
        this.setState({streamData: data})
      }
    })
    .catch(e => {
      console.log(e);
    })
  }

  toggle_type(e) {
    this.setState({type_selector_value: e.target.name});
  }

  toggleTime(e) {
    this.setState({timePeriod: e.target.name})
  }

  render() {
    return (
      <div id="white_background_wrapper">
        <p id="genre_title">{this.props.genre.replace(/^\w/, c => c.toUpperCase())}</p>
        <TypeSelector toggle_type={this.toggle_type} types={["Hot", "New", "Top", "Random"]}
        type_selector_value={this.state.type_selector_value} right={<TimePeriod toggleTime={this.toggleTime} />} />
        <ImageTetris />
      </div>
    );
  }
}
