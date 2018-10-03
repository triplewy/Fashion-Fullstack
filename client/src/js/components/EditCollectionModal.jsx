import React from 'react';
import EditCollectionModalMetadata from './EditCollectionModalMetadata.jsx'
import CarouselImages from './CarouselImages.jsx'
import { Modal } from 'react-bootstrap'
import { setAspectRatio } from './aspectRatio.js'
import edit_icon from 'images/edit-icon.svg'

export default class EditCollectionModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: this.props.collection.posts,
      carouselIndex: 0,
      collectionIndex: 0,
      showModal: false
    };

    this.showModal = this.showModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.setPlaylistIndex = this.setPlaylistIndex.bind(this)
    this.setCarouselIndex = this.setCarouselIndex.bind(this)
    this.handlePostDelete = this.handlePostDelete.bind(this)
    this.reorder = this.reorder.bind(this)
  }

  componentDidMount() {
  }

  showModal(e) {
    this.setState({showModal: true})
  }

  closeModal(e) {
    this.setState({showModal: false})
  }

  setPlaylistIndex(index, e) {
    this.setState({collectionIndex: index, carouselIndex: 0})
  }

  setCarouselIndex(index) {
    this.setState({carouselIndex: index})
  }

  reorder(startIndex, endIndex) {
    const posts = this.state.posts;
    const [removedPosts] = posts.splice(startIndex, 1);
    posts.splice(endIndex, 0, removedPosts);
    for (var i = 0; i < posts.length; i++) {
      posts[i].playlistIndex = posts.length - 1 - i;
    }
    this.setState({posts: posts, playlistIndex: endIndex})
  }

  handlePostDelete(index) {
    var posts = this.state.posts
    posts.splice(index, 1)
    if (this.state.collectionIndex !== 0 && this.state.collectionIndex >= index) {
      this.setState({posts: posts, collectionIndex: this.state.collectionIndex - 1})
    } else {
      this.setState({posts: posts})
    }
  }


  render() {
    const collection = this.props.collection
    const currentPost = this.state.posts[this.state.collectionIndex]
    return (
      <div>
        <li onClick={this.showModal}>
          <div style={{backgroundImage: 'url(' + edit_icon + ')'}} />
          <p>Edit</p>
        </li>
        <Modal show={this.state.showModal} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              Edit Collection
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="edit_collection_div">
              <div id="image_wrapper">
                <CarouselImages
                  imageUrls={currentPost.imageUrls}
                  carouselIndex={this.state.carouselIndex}
                  setCarouselIndex={this.setCarouselIndex}
                />
              </div>
              <EditCollectionModalMetadata
                collection={collection}
                posts={this.state.posts}
                carouselIndex={this.state.carouselIndex}
                playlistIndex={this.state.collectionIndex}
                setPlaylistIndex={this.setPlaylistIndex}
                setCarouselIndex={this.setCarouselIndex}
                handlePostDelete={this.handlePostDelete}
                reorder={this.reorder}
                closeModal={this.closeModal}
              />
            </div>
          </Modal.Body>
        </Modal>
      </div>

    );
  }
}
