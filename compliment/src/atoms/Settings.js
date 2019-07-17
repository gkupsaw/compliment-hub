import React, { Component } from 'react';

export default class Settings extends Component {

    constructor(props) {
        super(props);
        this.state = { 
            modalVisible: false
        };
    }

    renderOptions = allOptions => {
        // option object has suboptions and associated events
        // suboptions can have subsuboptions and associated events
        // {
        //  option1: {
        //     options: [
        //         suboption1,
        //         suboption2,
        //         suboption3
        //     }
        //     events: [
        //         event1,
        //         event2
        //     ]
        //  }
        //  option2: {
        //      event
        //  }
        // }

        let layerOneOptions = [],
            layerTwoOptions = [];
        Object.keys(allOptions).forEach(key => {
            let option = allOptions[key],
                suboptions = option.suboptions;
            layerOneOptions.push(   // push the top option (i.e. Sort By)
                <div key={key}
                    className='layer-one-option'
                    onClick={!suboptions ? option.event : () => {
                        document.getElementById(key + '-options').style.display = 'flex';
                        document.getElementById('layer-one-options').style.display = 'none';
                    }}>
                    {key}
                </div>
            );
            if (suboptions) { // if there are suboptions
                let suboptionsElements = [];
                suboptions.forEach((suboption, index) => {   // get a list of each suboption (i.e. oldest first, newest first, ...)
                    suboptionsElements.push(
                        <div key={suboption} 
                            className='layer-two-option'
                            onClick={() => option.events[index]()}>
                            {suboption}
                        </div>
                    );
                });
                layerTwoOptions.push(   // put the suboptions in a div that can appear and disappear
                    <div key={key + '-options'}
                        id={key + '-options'}
                        className='flex-centered-col'
                        style={{display: 'none', position: 'relative'}}>
                            <div className='modal-icon'
                                style={{top: 0, right: '-10px'}}
                                onClick={() => {
                                    document.getElementById(key + '-options').style.display = 'none';
                                    document.getElementById('layer-one-options').style.display = 'flex';
                                }}>
                            &times;</div>
                            {suboptionsElements}
                    </div>
                );
            }
        });
        return (
            <div className='settings-container'>
                <div id='layer-one-options' className='flex-centered-col'>
                    {layerOneOptions}
                </div>
                <div className='flex-centered-col'>
                    {layerTwoOptions}
                </div>
            </div>
        );
    }

    openModal = () => {
        let gear = document.getElementById('gear');
        gear.style.transform = gear.style.transform === 'rotate(720deg)' ? 'rotate(0deg)' : 'rotate(720deg)';
        this.setState({ modalVisible: true });
    }

    render() {
        const content = this.renderOptions(this.props.options);

        return (
            <div className='settings'>
                <div id='gear' className='fas fa-cog' onClick={this.openModal} />
                <div className='modal' style={{transform: this.state.modalVisible ? 'scale(1)' : 'scale(0)'}}>
                    <div className='modal-icon' onClick={() => this.setState({ modalVisible: false })}>&times;</div>
                    {content}
                </div>
            </div>
        )
    }
}