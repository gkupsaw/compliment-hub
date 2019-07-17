import React, {Component} from 'react';
import axios from 'axios';
import EC2 from '../SERVER';

export default class SlideShowForm extends Component {

    constructor() {
        super();
        this.state = {
            networkError: false,
            fileAmt: 0,
            selectedFiles: null,
        }
    }

    submitFile = e => {
        e.preventDefault();
        if (this.state.selectedFiles !== null) {
            let formData = new FormData(),
                config = { headers: { 'content-type': 'multipart/form-data' } },
                files = {...this.state.selectedFiles};
            delete files.length;
            Object.keys(files).forEach(key => formData.append('image', files[key]));

            axios.post(EC2 + '/upload', formData, config)
            .then(res => {
                console.log('Req complete, res data:', res.data);
                this.props.callback({ imageLinks: [...this.props.imageLinks].concat(res.data.data.location) });
            })
            .catch(err => console.error('Error submitting file:', err) && this.props.callback({ networkError: true }));
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
        return (
        <form onSubmit={this.submitFile} encType="multipart/form-data">
            <div className='file-wrapper'>
                <input type='text' name='fake file' placeholder='Choose File(s)' value={'Number of files: ' + this.state.fileAmt} readOnly />
                <input type='file' name='enter filename' onChange={this.handleFileSelection} multiple />
            </div>
            {/* <button onClick={() => axios.delete(EC2 + '/delete/imgs')}>Delete Images</button> */}
            <input type='submit' name='upload' value='Upload'
                style={{visibility: this.state.fileAmt === 0 ? 'hidden' : 'visible'}} />
        </form>
        )
     }
}
