import React from 'react';
import ProfileColumn from './ProfileColumn.jsx'
import { Link } from 'react-router-dom';

export default class StatsColumn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }


  render() {
    return (
      <div id="stats_column">
        <div className="vertical_line"></div>
        <div id="stats_wrapper">
          {this.props.show_profile ? <ProfileColumn profileInfo={this.props.profileInfo}/>
          :
          <div id="genre_of_the_day_div">
            <p id="genre_of_the_day">Genre of the Day:</p>
            <button id="genre_button">
                <p id="genre_text">#Techwear</p>
            </button>
            <p id="genre_of_the_day_desc">People cosplaying as characters from Ghost in The Shell
            but use the excuse of 'tech' to make themselves not appear as weebs</p>
          </div>
        }
        <p id="stats_column_title">Stats</p>
        <Link to={'/profile/stats'}>
          <p className="see_all_link">See all</p>
      </Link>
        <hr id="stats_title_hr"></hr>
        <div className="view_div">
          <p className="view_counter">Views Last 24 Hours</p>
          <p className="stat_number">2,504</p>
        </div>
        <div className="view_div" id="right_half_view_div">
          <p className="view_counter" id="seven_days_counter">Views Last 7 days</p>
          <p className="stat_number" id="seven_days_views">20,902</p>
        </div>
        <p id="total_plays">129,756 views in total</p>
        <hr id="stats_title_hr"></hr>
        <p id="time_period_title">This Week</p>
        <p className="top_location_title">Top Country:</p>
        <img className="country_icon" alt="country icon"></img>
        <p className="top_location">Australia</p>
        <div className="view_bar_container">
          <div className="view_bar">10,864 views</div>
        </div>
        <p className="top_location_title">Top City:</p>
        <img className="country_icon" alt="city icon"></img>
        <p className="top_location">Perth, Australia</p>
        <div className="view_bar_container">
          <div className="view_bar">1,135 views</div>
        </div>
        <p className="top_viewer_title">Top Viewer:</p>
        <img className="viewer_icon" alt="viewer icon"></img>
        <p className="top_viewer">YUSHUF</p>
        <div className="view_bar_container">
          <div className="view_bar">58 views</div>
        </div>
        <hr id="stats_title_hr"></hr>
        <p id="who_to_follow_title">Who to Follow</p>


        </div>

      </div>
    );
  }
}
