// Create a new React component here!import React from 'react';
import React from 'react';
import shirt from 'images/shirt-icon.png'
import jacket from 'images/jacket-icon.png'
import shorts from 'images/shorts-icon.png'
import shoes from 'images/shoes-icon.png'


export default class Tags extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rendered_tags: []
    };

    this.renderClothingIcon = this.renderClothingIcon.bind(this);
}
  renderClothingIcon(itemType) {
    switch(itemType) {
      case 'shirt':
        return shirt;
      case 'jacket':
        return jacket;
      case 'shorts':
        return shorts;
      case 'shoes':
        return shoes;
      default:
        return null;
      }
}

  render() {
    var rendered_tags = [];
    if (this.props.tags) {
      rendered_tags = this.props.tags.map((item, index) => {
          return (
            <div key={index} className="clothing_tag" id={item.itemType + "_tag"}>
              <img className="tag_image" src={this.renderClothingIcon(item.itemType)} alt="clothing icon"></img>
                <div className="tags_text_div">
                  <p className="tag_brand">{item.itemBrand}</p>
                  <p className="tag_name">{item.itemName}</p>
                </div>
            {item.original ? <div className="og_tag">
              <img className="og_icon" alt="original icon" src="/../images/og-icon.png"></img>
            </div> : ''}
          </div>
          )
      });
    }

    return (
      <div id="tags_div">
        {rendered_tags}
      </div>
    );
  }
}
