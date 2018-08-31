// Create a new React component here!import React from 'react';
import React from 'react';
import Tags from './Tags.jsx'
import RepostHeader from './RepostHeader.jsx'
import StatsHeader from './StatsHeader.jsx'
import Comments from './Comments.jsx'
import DropdownProfile from './DropdownProfile.jsx'
import { Link } from 'react-router-dom';
import {dateDiffInDays} from './DateHelper.js'
import Cookie from 'js-cookie'

export default class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: this.props.comments,
      bottom: 0,
      seen: false
    };

    this.myRef = React.createRef()
    this.handleScroll = this.handleScroll.bind(this)
  }


  componentDidMount() {
    console.log("post mounted");
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
    if (window.scrollY + window.innerHeight >= this.state.bottom && !this.state.seen) {
      console.log("hit bottom");
      var now = new Date()
      var viewType = 0
      if (this.props.repost_username) {
        viewType = 1
      }
      if (Cookie.get('viewHistory')) {
        var arr = JSON.parse(Cookie.get('viewHistory'));
        arr.push({mediaId: this.props.mediaId, viewType: viewType, dateTime: now.toISOString()})
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
        var newArr = [{mediaId: this.props.mediaId, viewType: viewType, dateTime: now.toIsoString()}]
        Cookie.set('viewHistory', JSON.stringify(newArr))
      }
      this.setState({seen: true})
    }
  }

  addNewPlaylist(e) {
    this.setState({displayPlaylist: true})
  }

  render() {
    return (
        <div className="post_wrapper" ref={this.myRef}>
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
                    userFollowers={this.props.userFollowers} userFollowed={this.props.userFollowed} followsYou={this.props.followsYou}
                    isProfile={this.props.isPoster}/>
                </div>
                <p id="post_status">{"posted a fit " + dateDiffInDays(new Date(this.props.uploadDate)) + " ago"}</p>
                {this.props.genre && <button id="genre_button">{this.props.genre}</button>}
              </div>
            }
            <Link to={{ pathname: '/' + this.props.username + '/' + this.props.mediaId, state: { post_data: this.props}}}>
            <div id="image_wrapper">
              <img className="post_image" alt="" src={this.props.post_image_src}></img>
            </div>
          </Link>
          <div id="stats_wrapper">
            <StatsHeader mediaId={this.props.mediaId} views={this.props.views} likes={this.props.likes} reposts={this.props.reposts}
              reposted={this.props.reposted} liked={this.props.liked} isPoster={this.props.isPoster}/>
          </div>
        </div>
        <div id="tags_div_wrapper">
          <div id="title">
            <p id="title_text">{this.props.title}</p>
          </div>
          <div id="og_tag">
            {this.props.original !== 0 && <span>✔</span>}
          </div>
          <hr id="tag_title_hr"></hr>
          <Tags tags={this.props.tags} modify={false}/>
          <div id="description_wrapper">
            <p id="description">{this.props.description}</p>
          </div>
          <Comments mediaId={this.props.mediaId} username={this.props.username} comments={this.state.comments} />
        </div>
        <hr id="post_hr"></hr>
      </div>
    );
  }
}
