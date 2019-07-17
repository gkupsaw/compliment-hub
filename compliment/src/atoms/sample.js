// import React, {Component} from 'react';
// import { Redirect } from "react-router-dom";

// export default class FindParty extends Component {

//     constructor(props)  {
//         super(props);
//         this.state = { 
            
//         };
//     }

//     componentDidMount()   {
//         axios.get(EC2 + '/join').then(res => {
//             this.parties = res.data;
//         }).catch(err => {
//             console.log(err);
//             alert('Offline mode activated...');
//             this.parties = [Offline.sample_party];
//         });
//         axios.post(EC2 + '/info',  {
//             id: this.props.location.state.user_id,
//          }).then((res) => {
//              this.user = res.data.user;
//              this.setState({ loading: false });
//          }).catch(err => {
//              console.log(err);
//              alert('Offline mode activated...');
//              this.user = Offline.guest;
//              this.setState({ loading: false });
//          });
//     }

//     render() {
//         if (this.state.loading)    {
//             return (<Loading loading={this.state.loading} />);
//         }
//         else if (this.props.location.state === undefined
//             || this.props.location.state.user_id === undefined)    {
//             return (<Redirect to={{
//                                  pathname: '/',
//                                  state: {
//                                     last_page: {last_page: '/join/'}
//                                 }
//                                 }}/>
//                     );
//         }
//         else if (this.state.redirect)    {
//             return <Redirect to={{
//                                  pathname: '/party/'+this.party.name,
//                                  state: { party_id: this.party.id, user_id: this.props.location.state.user_id }
//                                 }}/>;
//         }
//         return (
//             <div style={{display: 'flex'}}>
//                 <Loading loading={this.state.loading} />
//                 <div className='container appear' style={{height: 300, width: 320, padding: 50, display: this.state.warning ? 'none' : 'block'}}>
//                     <div style={{position: 'relative', height: 30, marginBottom: 20, width: '100%'}}>
//                         {this.state.error && <div style={{fontSize: 20}} className='fancyErr' id='error'>Party Not Found</div>}
//                     </div>
//                     <form onSubmit={this.findParty}>
//                         <input name='party id' type="text" placeholder='Party ID' 
//                             style={{fontSize: 40}} value={this.state.id} onChange={(event) => {this.setState({ id: event.target.value })}} required />
//                         <input name='search' type='submit' value='Search' />
//                     </form>
//                 </div>
//                 <div className='container appear' style={{height: 300, width: 320, 
//                          display: this.state.warning ? 'block' : 'none'}}>
//                     <Warning online={true} condition={this.state.warning} action={() => {this.setState({ redirect: true })}}
//                         cancel={() => {this.setState({ warning: false })}} />
//                     {this.state.warning && <div className='centered' style={{flexFlow: 'column'}}>
//                         <div className='confirmation'>Name: {this.party.name}</div>
//                         <div className='confirmation'>Cost: ${this.party.cost}</div>
//                         <div className='confirmation'>Guests: </div>
//                         <ul style={{backgroundColor: '#337ab7', borderRadius: 10, boxShadow: '1px 1px 15px grey'}}>{this.guestList()}</ul>
//                     </div>}
//                 </div>
//             </div>
//         )
//      }
// }
