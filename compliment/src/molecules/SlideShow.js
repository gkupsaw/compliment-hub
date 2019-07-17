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
            imageLinks: [],
            networkError: false,
            imageOneLink: null,
            imageTwoLink: null,
            imageOneVisible: false,
            imageTwoVisible: false,
            loading: true
        }
    }

    componentWillUnmount = () => clearInterval(this.interval)

    componentDidMount() {
        axios.get(EC2 + '/pictures')
        .then(res => {
            console.log('Server up and running! Received', res.data.length, 'pictures');
            let imageLinks = res.data.reduce((acc, imageDoc) => acc.concat(imageDoc.data.location), []);
            this.availableImageLinks = [...imageLinks];
            this.interval = setInterval(this.intervalFunc, this.imageTransition);    //interval for fade in/out

            let imageOneLink = (imageLinks.length === 1) ? imageLinks[0] : this.pickNewImg(),
                    // without line above, if len === 1 then available links will be empty before state is set and it can be copied from imageLinks (see pickNewImg)
                imageTwoLink = this.pickNewImg();
            this.setState({ imageLinks, imageOneLink, imageTwoLink, imageOneVisible: true, loading: false });
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

    render() {
        if (this.state.loading) 
            return <div/>;
        if (this.state.networkError)
            return <NetworkError networkError = {this.state.networkError} error='Image(s) not loaded/submitted' />;
        return (
            <div className='slideshow-container'>
                <div className='slideshow-img-container'>
                    <img id='dummy-img' alt='' style={{ opacity: 0 }} />
                    <img id='one' className='slideshow-img' src={this.state.imageOneLink} alt='family pic' 
                        style={{ opacity: this.state.imageOneVisible ? 1 : 0 }} />
                    <img id='two' className='slideshow-img' src={this.state.imageTwoLink} alt='family pic' 
                        style={{ opacity: this.state.imageTwoVisible ? 1 : 0 }} />
                </div>
                <SlideShowForm imageLinks={this.state.imageLinks} callback={newLinks => this.setState( newLinks )} />
            </div>
        )
     }
}

// Local Testing
// const sample_loc = './img/';
// let imgs = ['boat.jpeg', 'cpax.png', 'Door.jpg', 'sexy.jpg', 'sexier.jpeg', 'nice.png', 'o0o.jpg'];
// for (let i in imgs) imgs[i] = sample_loc + imgs[i];
