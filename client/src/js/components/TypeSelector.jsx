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
            <button key={index} name={index} className={(this.props.type_selector_value == index)?
              'type_selector_button_selected' : 'type_selector_button'}
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
