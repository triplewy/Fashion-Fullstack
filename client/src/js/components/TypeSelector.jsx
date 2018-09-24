import React from 'react';
import { Link } from 'react-router-dom'

export default class TypeSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    console.log("Type selector mounted");
  }

  render() {
    var rendered_types = [];
    if (this.props.types != null) {
      rendered_types = this.props.types.map((item, index) => {
          return (
            <button key={index} name={index} className="type_selector_button"
              style={{color: this.props.type_selector_value == index ? 'red' : '', boxShadow: this.props.type_selector_value == index ? '0 1px 0 0 red' : ''}}
              disabled={(this.props.type_selector_value == index)}
              onClick={this.props.toggle_type}>{item}</button>
          )
      });
    }
    return (
      <div id="type_selector">
        {rendered_types}
        {this.props.right}
      </div>
    )
  }
}
