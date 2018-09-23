import React from 'react';
import ProfileHover from './ProfileHover.jsx'
import PlaylistStatsHeader from './PlaylistStatsHeader.jsx'
import { setAspectRatioImageTetrisBlock } from './aspectRatio.js'
import { Link } from 'react-router-dom'

export default class AlbumTetrisBlock extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      entered: false
    };

    this.setEntered = this.setEntered.bind(this)
    this.setLeft = this.setLeft.bind(this)
  }

  setEntered(e) {
    if (!this.state.entered) {
      this.setState({entered: true})
    }
  }

  setLeft(e) {
    if (this.state.entered) {
      this.setState({entered: false})
    }
  }

  render() {
    const playlist = this.props.playlist
    const coverImage = this.props.playlist.coverImage
    const [width, height] = setAspectRatioImageTetrisBlock(coverImage.width, coverImage.height)
    return (
      <div className="tetris_block_wrapper" onMouseEnter={this.setEntered} onMouseLeave={this.setLeft}>
        <Link to={{ pathname: '/' + playlist.username + '/album/' + playlist.url}}>
          <div className="tetris_image" style={{backgroundImage: 'url(' + coverImage.imageUrl + ')',
            width: width, height: height, backgroundSize: width + "px " + height + "px"}} />
        </Link>
        <div className="block_profile" style={{opacity: this.state.entered ? 1 : 0}}>
          <ProfileHover classStyle="post_profile_link" username={playlist.username} profileName={playlist.profileName}
            profile_image_src={playlist.profile_image_src} />
        </div>
        <div className="block_stats" style={{opacity: this.state.entered ? 1 : 0}}>
          <PlaylistStatsHeader playlistId={playlist.playlistId} followers={playlist.followers} likes={playlist.likes} reposts={playlist.reposts}
            followed={playlist.followed} reposted={playlist.reposted} liked={playlist.liked} isPoster={playlist.isPoster}/>
        </div>
      </div>
    );
  }
}
