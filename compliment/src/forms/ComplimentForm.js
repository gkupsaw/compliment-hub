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
        <div id='compliment-form-container'>
            {
                !this.state.submitted && 
                <form onSubmit={this.onSubmit} id='compliment-form'>
                    <input name='compliment' type="text" placeholder='Type Something Nice!' autoComplete='off'
                        value={this.state.id} onChange={e => this.setState({ compliment: e.target.value })} required />
                    <input name='name' type="text" placeholder='Your Name' autoComplete='off'
                        value={this.state.id} onChange={e => this.setState({ name: e.target.value })} required />
                    <input name='submit' type='submit' value='Submit' />
                </form>
            }
            {
                this.state.submitted &&
                <div className='popup-messages'>
                    <div className='submitted'>Compliment Submitted!</div>
                    <div className='submitted'>Click <Link to={'/compliments'} style={{ color: 'rgba(0, 0, 0, 0.6)' }}>here</Link> to view all of them</div>
                    <div className='submitted'>Click <a href='#/' style={{ color: 'rgba(0, 0, 0, 0.6)' }} onClick={() => this.setState({ submitted: false })}>here</a> to make another</div>
                </div>
            }
        </div>
        )
     }
}
