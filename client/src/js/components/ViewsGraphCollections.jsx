import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart } from 'react-d3-components'

var data = [
    {
    label: 'somethingA',
    values: [{x: 'SomethingA', y: 10}, {x: 'SomethingB', y: 4}, {x: 'SomethingC', y: 3}]
    },
    {
    label: 'somethingB',
    values: [{x: 'SomethingA', y: 6}, {x: 'SomethingB', y: 8}, {x: 'SomethingC', y: 5}]
    },
    {
    label: 'somethingC',
    values: [{x: 'SomethingA', y: 6}, {x: 'SomethingB', y: 8}, {x: 'SomethingC', y: 5}]
    }
];

export default class ViewsGraphCollections extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stats: {}
    };

    this.fetchPostsViewsGraph = this.fetchPostsViewsGraph.bind(this)
    this.tooltipScatter = this.tooltipScatter.bind(this)
  }

  componentDidMount() {
    this.fetchPostsViewsGraph()
  }

  componentDidUpdate(prevProps) {
    if (this.props.timePeriod !== prevProps.timePeriod) {
      this.fetchPostsViewsGraph()
    }
  }

  fetchPostsViewsGraph() {
    fetch('/api/postsViewsGraph/' + this.props.timePeriod, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data) {
        console.log(data);
        // this.setState({stats: data})
      }
    })
    .catch(e => {
      console.log(e);
    })
  }

  tooltipScatter(x, y) {
    console.log("x: " + x + " y: " + y);
    return "x: " + x + " y: " + y;
  };

  render() {
      return (
        <div id="views_graph_div">

        </div>
      );
  }
}
