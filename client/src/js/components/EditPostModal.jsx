import React from 'react';
import EditPostModalMetadata from './EditPostModalMetadata.jsx'
import CarouselImages from './CarouselImages.jsx'
import InputTag from './InputTag.jsx'
import { Modal } from 'react-bootstrap'
import { setAspectRatio } from './aspectRatio.js'
import edit_icon from 'images/edit-icon.svg'

const url = process.env.REACT_APP_API_URL

export default class EditPostModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tags: null,
      deletedTags: [],
      tagX: 0,
      tagY: 0,
      displayInputTag: 'none',
      editTagIndex: -1,
      editTag: {itemType:'shirt', itemBrand: '', itemName: '', itemLink: '', original: false},

      displayTagLocation: false,

      showOverlay: false,
      target: null,

      carouselIndex: 0,
      showModal: false
    };

    this.handleTagSave = this.handleTagSave.bind(this)
    this.handleTagCancel = this.handleTagCancel.bind(this)
    this.handleTagEdit = this.handleTagEdit.bind(this)
    this.handleTagDelete = this.handleTagDelete.bind(this)

    this.showModal = this.showModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.setCarouselIndex = this.setCarouselIndex.bind(this)
    this.setTagCarouselIndex = this.setTagCarouselIndex.bind(this)
  }

  fetchTags() {
    fetch(url + '/api/postTags/' + this.props.post.mediaId, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      this.setState({tags: data});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleTagSave(itemType, itemBrand, itemName, link, original, e) {
    if (this.state.tags.length > 4) {
      this.setState({showOverlay: true, target: e.target})
      setTimeout(function() {
        this.setState({showOverlay: false})
      }.bind(this), 2000)
    } else {
      var tempTags = this.state.tags
      var saveTag = {
        itemType: itemType,
        itemBrand: itemBrand,
        itemName: itemName,
        itemLink: link,
        original: original,
        x: this.state.tagX,
        y: this.state.tagY,
        imageIndex: this.state.carouselIndex
      }
      if (this.state.editTagIndex >= 0) {
        saveTag.tagId = tempTags[this.state.editTagIndex].tagId
        tempTags[this.state.editTagIndex] = saveTag
      } else {
        tempTags.push(saveTag)
      }
      this.setState({
        tags: tempTags,
        displayInputTag: 'none',
        editTag: {itemType:'shirt', itemBrand: '', itemName: '', itemLink: '', original: false},
        editTagIndex: -1
      })
    }
  }

  handleTagCancel(e) {
    this.setState({
      displayInputTag: 'none',
      editTagIndex: -1,
      editTag: {itemType:'shirt', itemBrand: '', itemName: '', itemLink: '', original: false}
    })
  }

  handleTagDelete(index) {
    var tempTags = this.state.tags
    var tempDeletedTags = this.state.deletedTags
    const deletedTag = tempTags[index]
    tempTags.splice(index, 1)
    tempDeletedTags.push(deletedTag)
    this.setState({tags: tempTags, deletedTags: tempDeletedTags})
  }

  handleTagEdit(index) {
    const tag = this.state.tags[index]
    console.log(tag);
    this.setState({
      tagX: tag.x,
      tagY: tag.y,
      displayInputTag: 'block',
      editTagIndex: index,
      editTag: tag,
      carouselIndex: tag.imageIndex
    })
  }

  showModal(e) {
    this.setState({showModal: true})
    this.fetchTags()
  }

  closeModal(e) {
    this.setState({showModal: false})
  }

  handleClick(e) {
    if (e.target.className === "post_image") {
      var bounds = e.target.getBoundingClientRect();
      var x = (e.clientX - bounds.left)/bounds.width * 100;
      var y = (e.clientY - bounds.top)/bounds.height * 100;
      this.setState({
        tagX: x,
        tagY: y,
        displayInputTag: 'block'
      })
    }
  }

  setCarouselIndex(index) {
    this.setState({carouselIndex: index})
  }

  setTagCarouselIndex(index, x, y, show) {
    if (show) {
      console.log(x + ', ' + y);
      this.setState({carouselIndex: index, tagX: x, tagY: y, displayTagLocation: show})
    } else {
      this.setState({displayTagLocation: show})
    }
  }


  render() {
    const post = this.props.post
    return (
      <div>
        <li onClick={this.showModal}>
          <div style={{backgroundImage: 'url(' + edit_icon + ')'}} />
          <p>Edit</p>
        </li>
        <Modal show={this.state.showModal} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              Edit Post
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <div id="tag_click_div_wrapper">
                <div style={{position: "relative"}} onClick={this.handleClick}>
                  <div className="tag_location" style={{left: this.state.tagX + '%', top: this.state.tagY + '%', opacity: this.state.displayTagLocation ? 1 : 0}} />
                  <InputTag
                    left={this.state.tagX}
                    top={this.state.tagY}
                    display={this.state.displayInputTag}
                    showOverlay={this.state.showOverlay}
                    target={this.state.target}
                    handleTagSave={this.handleTagSave}
                    handleTagCancel={this.handleTagCancel}
                    tag={this.state.editTag}
                  />
                  <CarouselImages
                    imageUrls={post.imageUrls}
                    carouselIndex={this.state.carouselIndex}
                    setCarouselIndex={this.setCarouselIndex}
                  />
                </div>
              </div>
              <EditPostModalMetadata
                post={post}
                tags={this.state.tags}
                deletedTags={this.state.deletedTags}
                handleTagEdit={this.handleTagEdit}
                handleTagDelete={this.handleTagDelete}
                carouselIndex={this.state.carouselIndex}
                setTagCarouselIndex={this.setTagCarouselIndex}
                closeModal={this.closeModal}
              />
          </Modal.Body>
        </Modal>
      </div>

    );
  }
}
