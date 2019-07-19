import React, {Component} from 'react';
import axios from 'axios';
import NetworkError from '../atoms/NetworkError';
import EC2 from '../SERVER';

export default class SlideShowForm extends Component {

    constructor() {
        super();
        this.state = {
            networkError: false,
            fileAmt: 0,
            selectedFiles: undefined
        }
    }

    submitFile = e => {
        e.preventDefault();
        if (this.state.selectedFiles) {
            let formData = new FormData(),
                config = { headers: { 'content-type': 'multipart/form-data' } },
                files = {...this.state.selectedFiles};
            delete files.length;
            Object.keys(files).forEach(key => formData.append('image', files[key]));

            axios.post(EC2 + '/upload', formData, config)
                .then(res => {
                    console.log('Req complete, res data:', res.data);
                    this.props.callback(res.data);
                    this.setState({ selectedFiles: [], fileAmt: 0 });
                })
                .catch(err => {
                    console.error('Error submitting file:', err);
                    this.setState({ networkError: true });
                });
        }
    }

    handleFileSelection = e => {
        e.preventDefault();
        this.setState({
            fileAmt: e.target.files.length, 
            selectedFiles: e.target.files
        });
    }

    render() {
        if (this.state.networkError)
            return <NetworkError networkError = {this.state.networkError} error='Image(s) not loaded/submitted' />;
        return (
            <form onSubmit={this.submitFile} encType="multipart/form-data">
                <div className='file-wrapper'>
                    <input type='text' name='fake file' placeholder='Choose File(s)' value={'Number of files: ' + this.state.fileAmt} readOnly />
                    <input type='file' name='enter filename' onChange={this.handleFileSelection} multiple />
                </div>
                <input type='submit' name='upload' value='Upload'
                    style={{visibility: this.state.fileAmt === 0 ? 'hidden' : 'visible'}} />
            </form>
        );
     }
}
