import React from 'react';
import Tags from './Tags.jsx'
import RepostHeader from './RepostHeader.jsx'
import StatsHeader from './StatsHeader.jsx'
import Comments from './Comments.jsx'
import PlaylistStatsHeader from './PlaylistStatsHeader.jsx'
import DropdownProfile from './DropdownProfile.jsx'
import { Link } from 'react-router-dom';

const _MS_PER_MINUTE = 1000 * 60;

export default class Playlist extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      followers: this.props.followers,
      likes: this.props.likes,
      reposts: this.props.reposts,
      comments: this.props.comments,
      playlist_mediaIds: [],
      playlistPosts: JSON.parse(this.props.posts),
      playlistIndex: 0
    };

    this.handleLike = this.handleLike.bind(this);
    this.handleRepost = this.handleRepost.bind(this);
    this.handleFollow = this.handleFollow.bind(this);
    this.setPlaylistIndex = this.setPlaylistIndex.bind(this)
  }

  handleLike(e) {
    fetch('/api/playlistLike', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        mediaId: this.props.id,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({likes: this.state.likes + 1})
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleRepost(e) {
    fetch('/api/playlistRepost', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        mediaId: this.props.id,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "success") {
        this.setState({reposts: this.state.reposts + 1})
      } else {
        console.log(data.message);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleFollow(e) {

  }

  setPlaylistIndex(index, e) {
    this.setState({playlistIndex: index})
  }

  dateDiffInDays(date) {
    var uploadDate = Math.floor((Date.now() - date) / _MS_PER_MINUTE)
    if (uploadDate > 1439) {
      uploadDate = "posted a playlist " + Math.floor((Date.now() - date) / (_MS_PER_MINUTE * 60 * 24)) + " days ago"
    } else if (uploadDate > 59) {
      uploadDate = "posted a playlist " + Math.floor((Date.now() - date) / (_MS_PER_MINUTE * 60)) + " hours ago"
    } else {
      uploadDate = "posted a playlist " + uploadDate + " minutes ago"
    }
    return uploadDate
  }

  render() {
    var currentPost = this.state.playlistPosts[this.state.playlistIndex]
    console.log("currentPost is", currentPost);
    var rendered_playlist_posts = [];
    if (this.state.playlistPosts.length > 0) {
      rendered_playlist_posts = this.state.playlistPosts.map((item, index) => {
        return (
          <li key={index} value={index} className={(this.state.playlistIndex === index) ? 'playlist_post_selected' : 'playlist_post'}
                disabled={(this.state.playlistIndex === index)}>
            <div id="playlist_post_user_title_div" onClick={this.setPlaylistIndex.bind(this, index)}>
              <div className="post_profile_link">
                <Link to={"/" + item.username}>
                  <p id="playlist_post_user">{item.profileName}</p>
                </Link>
                <DropdownProfile username={item.username} location={item.location}
                  userFollowers={item.userFollowers} userFollowed={item.userFollowed} followsYou={item.followsYou}/>
              </div>

              <p id="playlist_post_title">{item.title}</p>
            </div>
            {this.state.playlistIndex === index &&
              <div id="stats_wrapper">
                <StatsHeader mediaId={item.mediaId} views={item.views} likes={item.likes} reposts={item.reposts} comments={item.comments}
                  reposted={item.reposted} liked={item.liked}/>
              </div>
            }
          </li>
          )
      });
    }

      return (
        <div id="post_wrapper">
          <div id="polaroid_div">
            {this.props.repost_username ? <RepostHeader username={this.props.username} profileName={this.props.profileName}
              location={this.props.location} userFollowers={this.props.userFollowers} userFollowed={this.props.userFollowed}
              profile_image_src={this.props.profile_image_src} repost_username={this.props.repost_username}
              repost_profileName={this.props.repost_profileName} repost_profile_image_src={this.props.repost_profile_image_src}
              repost_location={this.props.repost_location} repost_userFollowers={this.props.repost_userFollowers}
              repost_isFollowing={this.props.repost_isFollowing} genre={this.props.genre} repostDate={this.props.repostDate}
              repost_userFollowed={this.props.repost_userFollowed} followsYou={this.props.followsYou} isPoster={this.props.isPoster} isReposter={this.props.isReposter}/> :
              <div id="post_header">
                <div className="post_profile_link">
                  <Link to={"/" + this.props.username}>
                    <div id="profile_image_div">
                      <img id="profile_image" alt="" src={this.props.profile_image_src}></img>
                    </div>
                    <strong id="user_name">{this.props.profileName}</strong>
                  </Link>
                  <DropdownProfile username={this.props.username} location={this.props.location}
                    userFollowers={this.props.userFollowers} userFollowed={this.props.userFollowed} followsYou={this.props.followsYou} isProfile={this.props.isPoster}/>
                </div>
                <p id="post_status">{this.dateDiffInDays(new Date(this.props.uploadDate))}</p>
                {this.props.genre && <button id="genre_button">{this.props.genre}</button>}
              </div>
            }
            <Link to={{ pathname: '/' + currentPost.username + '/' + currentPost.mediaId, state: { post_data: currentPost} }}>
            <div id="image_wrapper">
              <img id="post_image" alt="" src={currentPost.imageUrl}></img>
            </div>
          </Link>
          <div id="stats_wrapper">
            <PlaylistStatsHeader playlistId={this.props.playlistId} likes={this.state.likes} reposts={this.state.reposts} followers={this.state.followers}
            reposted={this.props.reposted} liked={this.props.liked} followed={this.props.followed} isPoster={this.props.isPoster}/>
          </div>
          </div>
            <div id="tags_div_wrapper">
              <div id="title">
                <p id="title_text">{this.props.title}</p>
              </div>
              <hr id="tag_title_hr"></hr>
              <Tags tags={currentPost.tags}/>
              <div id="description_wrapper">
                <p id="description">{this.props.description}</p>
              </div>
              <Comments playlistId={this.props.playlistId} comments={this.state.comments} />
              <ul id="playlist_posts_list">
                {rendered_playlist_posts}
              </ul>
          </div>
          <hr id="post_hr"></hr>
        </div>
    );
  }
}
