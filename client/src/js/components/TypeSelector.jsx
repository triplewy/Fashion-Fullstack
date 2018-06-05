import React from 'react';

export default class TypeSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
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
          </div>
    );
  }
}
