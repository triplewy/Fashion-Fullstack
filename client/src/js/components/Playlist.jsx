import React from 'react';
import Tags from './Tags.jsx'
import RepostHeader from './RepostHeader.jsx'
import MediaHeader from './MediaHeader.jsx'
import StatsHeader from './StatsHeader.jsx'
import Comments from './Comments.jsx'
import PlaylistStatsHeader from './PlaylistStatsHeader.jsx'
import DropdownProfile from './DropdownProfile.jsx'
import { Link } from 'react-router-dom';
import {dateDiffInDays} from './DateHelper.js'
import Cookie from 'js-cookie'

export default class Playlist extends React.Component {
  constructor(props) {
    super(props);

    var posts = JSON.parse(this.props.posts)

    this.state = {
      playlistPosts: posts,
      playlistIndex: 0,
      bottom: 0,
      seen: new Array(posts.length).fill(false)
    };

    this.myRef = React.createRef()
    this.setPlaylistIndex = this.setPlaylistIndex.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
  }

  componentDidMount() {
    console.log(this.state.seen);
    console.log("playlist mounted");
    window.addEventListener('scroll', this.handleScroll);
    setTimeout(() => {
      console.log("component height", this.myRef.current.clientHeight);
      console.log("component bottom", this.myRef.current.offsetTop + this.myRef.current.clientHeight);
      this.setState({bottom: this.myRef.current.offsetTop + this.myRef.current.clientHeight - 80})
    }, 10);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll() {
    if (window.scrollY + window.innerHeight >= this.state.bottom && !this.state.seen[this.state.playlistIndex]) {
      console.log("hit bottom");
      var now = new Date()
      var nowISOString = now.toISOString()
      var view = {}
      if (this.props.repost_username) {
        view = {playlistId: this.props.playlistId, mediaId: this.state.playlistPosts[this.state.playlistIndex].mediaId, reposter: this.props.repost_username, dateTime: nowISOString}
      } else {
        view = {playlistId: this.props.playlistId, mediaId: this.state.playlistPosts[this.state.playlistIndex].mediaId, dateTime: nowISOString}
      }
      if (Cookie.get('viewHistory')) {
        var arr = JSON.parse(Cookie.get('viewHistory'));
        arr.push(view)
        if (arr.length > 9) {
          fetch('/api/storeViews', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              views: arr,
            })
          })
          .then(res => res.json())
          .then(data => {
            if (data.message === "success") {
              console.log("success");
              Cookie.set('viewHistory', [])
            } else {
              console.log(data.message);
            }
          })
          .catch((error) => {
            console.error(error);
          });
        }
        Cookie.set('viewHistory', arr)
      } else {
        var arr = [view]
        Cookie.set('viewHistory', JSON.stringify(arr))
      }
      console.log("seen");
      var tempSeen = this.state.seen
      tempSeen[this.state.playlistIndex] = true
      this.setState({seen: tempSeen})
    }
  }

  setPlaylistIndex(index, e) {
    this.setState({playlistIndex: index})
  }

  render() {
    var currentPost = this.state.playlistPosts[this.state.playlistIndex]
    var rendered_playlist_posts = [];
    if (this.state.playlistPosts.length > 0) {
      rendered_playlist_posts = this.state.playlistPosts.map((item, index) => {
        return (
          <li key={index} value={index} className={(this.state.playlistIndex === index) ? 'playlist_post_selected' : 'playlist_post'}
                disabled={(this.state.playlistIndex === index)}>
            <div id="playlist_post_user_title_div" onClick={this.setPlaylistIndex.bind(this, index)}>
              <MediaHeader username={item.username} profileName={item.profileName} isPlaylist={false} />
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
        <div className="post_wrapper" ref={this.myRef}>
          <div id="polaroid_div">
            {this.props.repost_username ?
              <RepostHeader username={this.props.username} profileName={this.props.profileName} profile_image_src={this.props.profile_image_src}
                repost_username={this.props.repost_username} repost_profileName={this.props.repost_profileName} repost_profile_image_src={this.props.repost_profile_image_src}
                genre={this.props.genre} repostDate={this.props.repostDate} />
              :
              <MediaHeader username={this.props.username} profileName={this.props.profileName} profile_image_src={this.props.profile_image_src}
                genre={this.props.genre} uploadDate={this.props.uploadDate} isPlaylist={true} />
            }
            <Link to={{ pathname: '/' + currentPost.username + '/' + currentPost.mediaId, state: { post_data: currentPost} }}>
            <div id="image_wrapper">
              <img className="post_image" alt="" src={currentPost.imageUrl}></img>
            </div>
          </Link>
          <div id="stats_wrapper">
            <PlaylistStatsHeader playlistId={this.props.playlistId} likes={this.props.likes} reposts={this.props.reposts} followers={this.props.followers}
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
