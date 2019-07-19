import React, {Component} from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import openSocket from 'socket.io-client';
import Compliment from '../atoms/Compliment';
import Popup from '../atoms/Popup';
import Settings from '../atoms/Settings';
import NetworkError from '../atoms/NetworkError';
import EC2 from '../SERVER';
import Algos from '../functional/Sorting'

export default class Compliments extends Component {

    constructor(props)  {
        super(props);
        this.socket = openSocket(EC2);
        this.state = { 
            networkError: false,
            loading: true,
            organizeByFav: false,
            organizeOldestFirst: true,
            complimentsData: [],
            animation: 'none',
            currentlySelected: false,
            helpVisible: false
        };
    }

    componentDidMount() {
        axios.get(EC2 + '/compliments')
            .then(res => {
                this.setupSocket();
                this.setState({ loading: false, complimentsData: res.data });
            })
            .catch(err => {
                console.error('Error getting compliments: ', err);
                this.setState({ networkError: err, loading: false }); 
            });
    }

    setupSocket = () => {
        this.socket.on('complimentsUpdated', compliments => this.setState({  complimentsData: compliments }));
        this.socket.emit('join');
    }

    onComplimentSelected = selectedCompliment => {
        if (!this.state.currentlySelected) {
            const popup = JSON.parse(JSON.stringify(selectedCompliment));
            popup.id = popup.id + '-popup';
            this.popup = <Popup 
                            key={popup.id}
                            data={popup}
                            hide={() => {this.setState({ animation: 'appear', currentlySelected: false })}}
                            onClick={() => this.socket.emit('complimentFavorited', selectedCompliment)} />;
            this.setState({  animation: 'disappear', currentlySelected: true });
        }
    };

    organizeCompliments = compliments => {
        if (this.state.organizeByFav) compliments = this.organizeFavFirst(compliments);
        else if (this.state.organizeOldestFirst) compliments = Algos.mergeSort(compliments, 'oldest');
        else compliments = Algos.mergeSort(compliments, 'newest');

        return compliments.reduce((acc, compliment) => 
            acc.concat(<Compliment
                            key={compliment.id}
                            data={compliment} 
                            currentAnimation={this.state.animation} 
                            onSelected={this.onComplimentSelected} 
                            onClick={() => this.socket.emit('complimentFavorited', compliment)} />), []);
    }

    organizeFavFirst = compliments => {
        let favorites = compliments.filter(compliment => compliment.favorited),
            nonfavorites = compliments.filter(compliment => !compliment.favorited);
        return favorites.concat(nonfavorites);
    }

    render() {
        if (this.state.loading)
            return <div/>;
        if (this.state.networkError)
            return <NetworkError networkError = {this.state.networkError} error='Compliments not loaded' />;

        const compliments = this.organizeCompliments(this.state.complimentsData);
        const options = {
            'Sort By': {
                suboptions: [
                    'Date (Oldest First)', 
                    'Date (Newest First)',
                    'Favorites'
                ],
                events: [
                    () => this.setState({ organizeByFav: false, organizeOldestFirst: true }),
                    () => this.setState({ organizeByFav: false, organizeOldestFirst: false }),
                    () => this.setState({ organizeByFav: true, organizeOldestFirst: false })
                ]
            }
        }

        return (
            <div className='compliment-container'>
                <div className='modal' style={{ transform: this.state.helpVisible ? 'scale(1)' : 'scale(0)' }}>
                    <div className='modal-icon' onClick={() => this.setState({ helpVisible: false })}>&times;</div>
                    <div className='help'>Click the + on a compliment to see the whole thing!</div>
                    <div className='help'>Click on the background of it to favorite it</div>
                    <div className='help'>Click <Link to={'/'}>here</Link> to submit a new one</div>
                    <div className='help'>Click <Link to={'/slideshow'}>here</Link> to see the slideshow</div>
                </div>
                <div id='display' className='box-display'>
                    <Settings options={options} />
                    <div className='fas fa-question modal-icon' style={{ fontSize: 26, top: 20, right: 65 }}
                        onClick={() => this.setState({ helpVisible: true })} />
                    {this.popup}   {/* only renders if it is defined */}
                    {compliments}
                </div>
            </div>
        )
     }
}
