import { Component } from 'react'
import QrReader from 'react-qr-reader'
import axios from 'axios'
import './mystyle.css';

class Login extends Component {

    handleScan = data => {
        if (data) {
            console.log(data);
            axios.post('http://localhost:5000/login', {hash: data})
                .then(response => {
                    if (response.data['message'] === 'Success')
                    {
                        window.location.replace("http://localhost:3000/bezahlen");
                    }
                    else if(response.data['message'] === 'User Not Found')
                    {
                        window.location.replace("http://localhost:3000/register");
                    }
                    else
                    {
                        window.location.replace("http://localhost:3000/");
                    }
                })
        }
    }

    handleError = err => {
        console.error(err)
    }

    render() {
        return (
            <div class="cont">
                <div class="form sign-in" id="login_div">
                    <h2 id="header">Login</h2>
                    <form id="log_form">
                        <div>
                            <QrReader
                                delay={300}
                                onError={this.handleError}
                                onScan={this.handleScan}
                                style={{with:'10%'}}
                            />
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default Login;