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
                files = {...this.state.selectedFiles},
                file, notEmpty = false;
            delete files.length;
            Object.keys(files).forEach(key => {
                file = files[key];
                if (file.type === 'image/jpeg' || file.type === 'image/png') {
                    formData.append('image', file);
                    (notEmpty = true);
                }
                else {
                    console.error('Error uploading file: File "' + file.name + '" is not of type JPEG or PNG. Ignoring file.');
                }
            });
            this.setState({ selectedFiles: [], fileAmt: 0 });

            notEmpty
                ? axios.post(EC2 + '/upload', formData, config)
                    .then(res => {
                        console.log('Req complete, res data:', res.data);
                        this.props.callback(res.data);
                    })
                    .catch(err => {
                        console.error('Error submitting file:', err);
                        this.setState({ networkError: true });
                    })
                : console.error('No files in FormData => all of invalid type and ignored');
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
            <form id='slideshow-form' onSubmit={this.submitFile} encType="multipart/form-data">
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
