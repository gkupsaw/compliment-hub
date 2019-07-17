import React, {Component} from 'react';
import Animations from '../functional/Animations';

export default class Popup extends Component {

    componentDidMount = () => Animations.animate('appear', this.props.data.id, {grow: true})

    componentDidUpdate = () => Animations.animate('appear', this.props.data.id, {grow: true})

    render() {
        const { favorited, compliment, id, name } = this.props.data;
        return (
            <div id={id}
                key={id}
                onClick={this.props.onClick}
                className='compliment-popup'
                style={{backgroundColor: favorited ? 'gold' : ''}}>
                <div className='cross' 
                    onClick={e => {
                        e.stopPropagation();
                        Animations.animate('shrink', id);
                        this.props.hide();
                    }}>
                    &#10005;</div>
                {favorited ? '★' + compliment : compliment}
                <br/><br/>
                &#9829;&#9829;&#9829;{name}&#9829;&#9829;&#9829;
            </div>
        )
     }
}
