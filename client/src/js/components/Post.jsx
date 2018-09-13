import React from 'react';
import Tags from './Tags.jsx'
import RepostHeader from './RepostHeader.jsx'
import MediaHeader from './MediaHeader.jsx'
import StatsHeader from './StatsHeader.jsx'
import Comments from './Comments.jsx'
import CarouselImages from './CarouselImages.jsx'
import { LinkContainer } from 'react-router-bootstrap'
import { Carousel } from 'react-bootstrap'
import Cookie from 'js-cookie'

export default class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
      var nowISOString = now.toISOString()
      var view = {}
      if (this.props.repost_username) {
        view = {mediaId: this.props.mediaId, reposter:this.props.repost_username, dateTime: nowISOString}
      } else {
        view = {mediaId: this.props.mediaId, dateTime: nowISOString}
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
        var newArr = [view]
        Cookie.set('viewHistory', JSON.stringify(newArr))
      }
      this.setState({seen: true})
    }
  }

  render() {
    return (
        <div className="post_wrapper" ref={this.myRef}>
          <div id="polaroid_div">
            {this.props.repost_username ?
              <RepostHeader username={this.props.username} profile_image_src={this.props.profile_image_src} profileName={this.props.profileName}
                repost_username={this.props.repost_username} repost_profileName={this.props.repost_profileName} repost_profile_image_src={this.props.repost_profile_image_src}
                genre={this.props.genre} repostDate={this.props.repostDate} isPlaylist={false} classStyle={"post_profile_link"}/>
              :
              <MediaHeader username={this.props.username} profile_image_src={this.props.profile_image_src} profileName={this.props.profileName}
                genre={this.props.genre} uploadDate={this.props.uploadDate} isPlaylist={false} classStyle={"post_profile_link"}/>
            }
            <LinkContainer to={{ pathname: '/' + this.props.username + '/' + this.props.mediaId, state: { post_data: this.props}}}>
            <div id="image_wrapper">
              <CarouselImages imageUrls={this.props.imageUrls} />
            </div>
          </LinkContainer>
          <div id="stats_wrapper">
            <StatsHeader mediaId={this.props.mediaId} views={this.props.views} likes={this.props.likes} reposts={this.props.reposts}
              reposted={this.props.reposted} liked={this.props.liked} isPoster={this.props.isPoster}/>
          </div>
        </div>
        <div id="tags_div_wrapper">
          <div id="tags_div_flexbox">
            <div id="title">
              <p id="title_text">{this.props.title}</p>
              <div id="og_tag">
                {this.props.original !== 0 && <span>✔</span>}
              </div>
            </div>
            <Tags tags={this.props.tags} modify={false}/>
            <div id="description_wrapper">
              <p id="description">{this.props.description}</p>
            </div>
            <Comments mediaId={this.props.mediaId} username={this.props.username} comments={this.props.comments} />
          </div>
        </div>
      </div>
    );
  }
}
