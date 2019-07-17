import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class NavBar extends Component {

    render() {
        const items = this.props.items;
        let nav = [], section_items = [];
        items.forEach(section => {
            Object.keys(section).forEach(key => {
                section_items.push(<Link key={key} className='nav-item' to={section[key]}>{key}</Link>)
            });
            nav.push(<div key={section_items.length} className='nav-section'>{section_items}</div>);
            section_items = [];
        });
        return (
            <div className='nav-wrapper'>
                {nav}
            </div>
        );
    }

}