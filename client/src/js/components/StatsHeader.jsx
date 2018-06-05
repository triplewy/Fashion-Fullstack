import React from 'react';
import view_icon from 'images/view-icon.png'
import like_icon from 'images/heart-icon.png'
import repost_icon from 'images/repost-icon.png'
import comment_icon from 'images/comment-icon.png'
import plus_icon from 'images/plus-icon.svg'

export default class StatsHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }


  render() {
    var stats_icon_style = "stats_icon";
    var stats_button_style="stats_button";
    if (this.props.is_collection) {
      stats_icon_style = "collection_stats_icon";
      stats_button_style="collection_stats_button";
    }

    return (
      <div id="single_post_stats_header">
        <button id="views" className={stats_button_style}>
          <img id="views_icon" alt="view icon" className={stats_icon_style} src={view_icon}></img>
          <p className="stats_number" id="view_number">{this.props.view_count}</p>
        </button>
        <button id="likes" className={stats_button_style}>
          <img id="like_icon" alt="like icon" className={stats_icon_style} src={like_icon}></img>
          <p className="stats_number" id="like_number">{this.props.like_count}</p>
        </button>
        <button id="reposts" className={stats_button_style}>
          <img id="repost_icon" alt="repost icon" className={stats_icon_style} src={repost_icon}></img>
          <p className="stats_number" id="repost_number">{this.props.repost_count}</p>
        </button>
      <button id="comments" className={stats_button_style}>
        <img id="comment_icon" alt="comment icon" className={stats_icon_style} src={comment_icon}></img>
        <p className="stats_number" id="comment_number">{this.props.comment_count}</p>
      </button>
      {this.props.is_collection ? null :
      <button id="add_to_playlist" className="stats_button">
        <img id="add_to_playlist_icon" alt="add icon" className={stats_icon_style} src={plus_icon}></img>
      </button>
    }
    </div>
    );
  }
}
