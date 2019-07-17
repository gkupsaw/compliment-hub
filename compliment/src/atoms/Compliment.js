import React, { Component } from 'react';
import Animations from '../functional/Animations';

export default class Compliment extends Component {

    componentDidUpdate = () => Animations.animate(this.props.currentAnimation, this.props.data.id)

    scrollToTop = id => {
        let scrollTop = document.getElementById('display').scrollTop;
        if (scrollTop <= 0) {
            document.getElementById('display').scrollTop = 0;
            clearInterval(id);
        } else {
            document.getElementById('display').scrollTop = scrollTop - scrollTop/10;
        }
    }

    render() {
        const { favorited, compliment, id, name } = this.props.data;
        return (
            <div id={id}
                key={id}
                onClick={this.props.onClick}
                className='compliment'
                style={{backgroundColor: favorited ? 'gold' : ''}}>
                <div className='fas fa-grip-lines more' 
                    onClick={e => {
                        e.stopPropagation();
                        this.props.onSelected(this.props.data)
                        let id = setInterval(() => this.scrollToTop(id), 20);
                    }} />
                {favorited ? '★' + compliment : compliment}
                <br/><br/>
                &#9829;&#9829;&#9829;{name}&#9829;&#9829;&#9829;
            </div>
        )
     }
}
