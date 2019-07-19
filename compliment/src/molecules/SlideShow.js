import React, { Component } from 'react';
import axios from 'axios';
import EC2 from '../SERVER';
import NetworkError from '../atoms/NetworkError';
import SlideShowForm from '../forms/SlideShowForm';

export default class SlideShow extends Component {

    constructor() {
        super();
        this.imageTransition = 5000;
        this.availableImageLinks = [];
        this.state = {
            fileDocs: [],
            imageLinks: [],
            networkError: false,
            imageOneLink: null,
            imageTwoLink: null,
            imageOneVisible: false,
            imageTwoVisible: false,
            loading: true,
            modalVisible: false,
            warningVisible: false,
            imageToBeRemoved: ''
        }
    }

    componentWillUnmount = () => clearInterval(this.interval)

    componentDidMount() {
        axios.get(EC2 + '/pictures')
        .then(res => {
            console.log('Server up and running! Received', res.data.length, 'pictures');
            let imageLinks = res.data.reduce((acc, imageDoc) => acc.concat(imageDoc.data.location), []);   // using S3
            // let imageLinks = res.data;    // using filesystem
            this.availableImageLinks = [...imageLinks];
            this.interval = setInterval(this.intervalFunc, this.imageTransition);    //interval for fade in/out

            let imageOneLink = (imageLinks.length === 1) ? imageLinks[0] : this.pickNewImg(),
                    // without line above, if len === 1 then available links will be empty before state is set and it can be copied from imageLinks (see pickNewImg)
                imageTwoLink = this.pickNewImg();
            this.setState({ fileDocs: res.data, imageLinks, imageOneLink, imageTwoLink, imageOneVisible: true, loading: false });
        })
        .catch(err => console.error('Error getting image documents', err) && this.setState({ networkError: err }));
    }

    pickNewImg = () => {
        (this.availableImageLinks.length === 0) && (this.availableImageLinks = [...this.state.imageLinks]); //resets availableImageLinks when all sources have been used
        const randIndex = Math.floor(Math.random()*this.availableImageLinks.length),
              chosenLink = this.availableImageLinks[randIndex];  //choose a random available source
        this.availableImageLinks.splice(randIndex, 1);   //remove the source chosen one line above from availableImageLinks

        return chosenLink;
    }

    //function called every {this.imageTransition} ms
    intervalFunc = () => this.setState(this.state.imageOneVisible 
                                            ? { imageTwoLink: this.pickNewImg(), imageOneVisible: false, imageTwoVisible: true }
                                            : { imageOneLink: this.pickNewImg(), imageOneVisible: true, imageTwoVisible: false });

    handleSubmissionRes = data => {
        let newLinks = data.reduce((acc, mongoDoc) => acc.concat(mongoDoc.data.location), []);
        this.availableImageLinks = [...this.state.imageLinks].concat(newLinks);
        let imageOneLink = (this.availableImageLinks.length === 1) ? this.availableImageLinks[0] : this.pickNewImg(),
            imageTwoLink = this.pickNewImg();
        this.setState({ 
            fileDocs: [...this.state.fileDocs].concat(data),
            imageLinks: [...this.state.imageLinks].concat(newLinks),
            imageOneLink,
            imageTwoLink
        });
    }

    shift = () => {
        clearInterval(this.interval);
        this.intervalFunc();
        this.interval = setInterval(this.intervalFunc, this.imageTransition);
    }

    removeImage = () => {
        let file;
        const { imageToBeRemoved, fileDocs } = this.state;
        fileDocs.forEach(fileDoc => fileDoc.data.location === imageToBeRemoved && (file = fileDoc));
        if (file) {
            axios.post(EC2 + '/remove/image', { file })
                .catch(err => console.error('Error deleting image:', err));
            let imgContainer = document.getElementById(imageToBeRemoved+'container'),
                transitionTime = window.getComputedStyle(imgContainer).transitionDuration;
            imgContainer.style.transform = 'scale(0)';
            transitionTime = transitionTime.substring(0, transitionTime.length - 1) * 1000;
            setTimeout(() => imgContainer.style.display = 'none', transitionTime);
            this.setState({ warningVisible: false });
        } else {
            console.error('Error, file not available');
        }
    }

    render() {
        if (this.state.loading) 
            return <div/>;
        if (this.state.networkError)
            return <NetworkError networkError = {this.state.networkError} error='Image(s) not loaded/submitted' />;
        return (
            <div className='slideshow-container'>
                <div className='slideshow-img-container'>
                    <div className='fas fa-cloud modal-icon' style={{ fontSize: 30, top: '-40px', right: '-40px' }}
                            onClick={() => this.setState({ modalVisible: true })} />
                    <div className='modal' style={{transform: this.state.modalVisible ? 'scale(1)' : 'scale(0)'}}>
                        <div className='modal-icon' onClick={() => this.setState({ modalVisible: false })}>&times;</div>
                        <div className='box-display' style={{ justifyContent: 'flex-start' }}>
                            {this.state.imageLinks.reduce((acc, link) => acc.concat(
                                <div id={link+'container'} key={link} className='preview-img-container'>
                                    <div id='remove-img' className='modal-icon'>
                                        <div id={link} onClick={e => this.setState({ warningVisible: true, imageToBeRemoved: e.target.id })} style={{ position: 'absolute', right: 10, top: -8 }}>&times;</div>
                                    </div>
                                    <img src={link} className='preview-img' alt='preview' />
                                </div>), [])}
                        </div>
                    </div>
                    <div className='modal' style={{transform: this.state.warningVisible ? 'scale(1)' : 'scale(0)'}}>
                        <div>Are you sure?</div>
                        <div className='flex-centered'>
                            <div style={{ margin: 10, cursor: 'pointer' }} onClick={this.removeImage}>Yes</div>
                            <div style={{ margin: 10, cursor: 'pointer' }} onClick={() => this.setState({ warningVisible: false })}>No</div>
                        </div>
                    </div>
                    <img id='dummy-img' alt='' style={{ opacity: 0 }} />
                    <div className='flex-centered-col max-size' style={{ visibility: this.state.imageLinks.length === 0 ? 'visible' : 'hidden', fontSizefontWeight: 'bold', position: 'absolute' }}>
                        <h1>Upload some pics!</h1>
                        <h3>This looks a lot nicer if you do :)</h3>
                    </div>
                    <img id='one' className='slideshow-img' src={this.state.imageOneLink} alt='family pic' 
                        style={{ opacity: this.state.imageOneVisible ? 1 : 0, visibility: this.state.imageLinks.length === 0 ? 'hidden' : 'visible' }} />
                    <img id='two' className='slideshow-img' src={this.state.imageTwoLink} alt='family pic' 
                        style={{ opacity: this.state.imageTwoVisible ? 1 : 0, visibility: this.state.imageLinks.length === 0 ? 'hidden' : 'visible' }} />
                    <div className='shift-right' onClick={this.shift}>&gt;</div>
                </div>
                <SlideShowForm callback={this.handleSubmissionRes} />
            </div>
        )
     }
}

// Local Testing
// const sample_loc = './img/';
// let imgs = ['boat.jpeg', 'cpax.png', 'Door.jpg', 'sexy.jpg', 'sexier.jpeg', 'nice.png', 'o0o.jpg'];
// for (let i in imgs) imgs[i] = sample_loc + imgs[i];
