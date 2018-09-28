import React from 'react';
import AlbumTetrisBlock from './AlbumTetrisBlock.jsx'

export default class AlbumTetris extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }


  render() {
    var renderedColumns = []
    const albums = this.props.albums
    if (albums.length > 0) {
      for (var i = 0; i < albums.length; i++) {
        if (i < 3) {
          renderedColumns.push([<AlbumTetrisBlock key={i} playlist={albums[i]} explore={this.props.explore}/>])
        } else {
          renderedColumns[i%3].push(<AlbumTetrisBlock key={i} playlist={albums[i]} explore={this.props.explore}/>)
        }
      }
    }
    return (
      <div className="image_tetris_wrapper">
        <div className="tetris_column">
          {renderedColumns[0]}
        </div>
        <div className="tetris_column">
          {renderedColumns[1]}
        </div>
        <div className="tetris_column">
          {renderedColumns[2]}
        </div>
      </div>
    );
  }
}
