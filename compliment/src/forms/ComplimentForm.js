import React, {Component} from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import EC2 from '../SERVER';
import NetworkError from '../atoms/NetworkError';

export default class ComplimentForm extends Component {

    constructor(props)  {
        super(props);
        this.state = { 
            compliment: '',
            name: '',
            networkError: false,
            submitted: false
        };
    }

    onSubmit = e => {
        e.preventDefault();
        const { compliment, name } = this.state;
        axios.post(EC2 + '/compliment',  {compliment, name})
            .then(this.setState({ submitted: true }))
            .catch(err => console.error('Error submitting compliment:', err) && this.setState({ networkError: err }));
    }

    render() {
        if (this.state.networkError)
            return <NetworkError networkError = {this.state.networkError} error='Compliment not submitted' />;
        return (
        <div className='container'>
            {
                !this.state.submitted && 
                <form onSubmit={this.onSubmit}>
                    <input name='compliment' type="text" placeholder='Type Something Nice!' autoComplete='off'
                        value={this.state.id} onChange={(event) => {this.setState({ compliment: event.target.value })}} required />
                    <input name='name' type="text" placeholder='Your Name' autoComplete='off'
                        value={this.state.id} onChange={(event) => {this.setState({ name: event.target.value })}} required />
                    <input name='submit' type='submit' value='Submit' />
                    {/* <button onClick={() => axios.delete(EC2 + '/delete/compliments')}>Delete Compliments</button> */}
                </form>
            }
            {
                this.state.submitted &&
                <div className='popup-messages'>
                    <p className='submitted'>Compliment Submitted!</p>
                    <p className='submitted'>Click<Link to={'/compliments'}><button>here</button></Link>to view all of them</p>
                    <p className='submitted'>Click<button onClick={() => this.setState({ submitted: false })}>here</button>to make another</p>
                </div>
            }
        </div>
        )
     }
}
