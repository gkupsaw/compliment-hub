import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class NavBar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            show: false
        }
    }

    closeModal = () => {
        this.state.show && setTimeout(() => {
            let dropdown = document.getElementById('dropdown-container');
            dropdown && (dropdown.style.top = 0);
        }, 500);
        this.setState({ show: false });
    }

    render() {
        let items = this.props.items,
            nav = [<div key='-1' className='nav-section'><div className='nav-item'>{this.props.appName}</div></div>],
            section_items = [];
        items.forEach(section => {
            Object.keys(section).forEach(key => {
                section_items.push(<Link key={key} onClick={this.closeModal} className='nav-item' to={section[key]}>{key}</Link>)
            });
            nav.push(<div key={section_items.length} className='nav-section'>{section_items}</div>);
            section_items = [];
        });
        this.state.show && setTimeout(() => {
            let dropdown = document.getElementById('dropdown-container');
            dropdown && (dropdown.style.top = '-' + window.getComputedStyle(dropdown).height);
        }, 500);
        return (
            <div className='nav-wrapper'>
                <div id='dropdown-container' className='nav-dropdown-container' onClick={() => this.setState({ show: true })}>
                    <div className='fas fa-play nav-dropdown' style={{ transform: this.state.show ? 'rotate(630deg)' : 'rotate(90deg)' }} />
                </div>
                <div className='modal' style={{ transform: this.state.show ? 'scale(1)' : 'scale(0)' }}>
                    <div className='modal-icon' onClick={this.closeModal}>&times;</div>
                    {nav}
                </div>
            </div>
        );
    }

}