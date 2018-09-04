import React from 'react';
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
        <h1>Views</h1>
        <div className="view_div">
          <p className="view_counter">Last 24 Hours</p>
          <p className="stat_number">{this.props.dayViews}</p>
        </div>
        <div className="view_div" id="right_half_view_div">
          <p className="view_counter" id="seven_days_counter">Last 7 days</p>
          <p className="stat_number" id="seven_days_views">{this.props.weekViews}</p>
        </div>
        <p id="total_plays">{this.props.totalViews} total</p>
        <hr id="stats_title_hr"></hr>
        <Link to={'/you/stats'}>
          <p className="see_all_link">See all stats</p>
        </Link>
      </div>
    );
  }
}
