import React from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

import './mystyle.css';
import { registerCostumer } from './Web3Client';


function Register() {
    
    const [formValue, setformValue] = React.useState({
        fname: '',
        gname: '',
        email: ''
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        // store the states in the form data
        const loginFormData = new FormData();
        loginFormData.append("fname", formValue.fname)
        loginFormData.append("gname", formValue.gname)
        loginFormData.append("email", formValue.email)

        axios({
            method: "post",
            url: "http://localhost:5000/register",
            data: loginFormData,
            headers: { "Content-Type": "multipart/form-data" }
        })
        .then(response => {
            if (response.data['message'] === "User already exists!") {
                Swal.fire({
                    icon: 'error',
                    text: 'Bereits registriert',
                    allowOutsideClick: false
                }).then(function () {
                    window.location.replace('http://localhost:3000/bezahlen');
                });
            }
            else {
                console.log(response.data);
                registerCostumer(formValue.fname, formValue.gname, formValue.email);
                //depositCC();
                Swal.fire({
                    icon: 'success',
                    title: 'Sie wurden erfolgreich registriert',
                    imageUrl: "data:image/png;base64," + response.data['qrcode'],
                    imageHeight: 100,
                    imageAlt: 'QR Code kann nicht angezeigt werden',
                    text: 'Ihr persönlicher Hash-Key lautet: ' + response.data['hash'],
                    allowOutsideClick: false
                }).then(function () {
                    window.location.replace('http://localhost:3000/bezahlen');
                });
            }
            })
    }

    const handleChange = (event) => {
        setformValue({
          ...formValue,
          [event.target.name]: event.target.value
        });
    }

    return (
        <div className="App">
                <div class="cont">
                    <div class="form sign-in" id="registrate_div">
                        <div id="bg">
                            <h2>Zum ersten Mal hier?</h2>
                            <p>Bitte registriere dich unten</p>

                            <form id="reg_form" onSubmit={handleSubmit}>
                                <label>
                                    <span>Nachname</span>
                                    <input type="text" id="nachname" name="fname" value={formValue.fname} onChange={handleChange}/>
                                </label>
                                <label>
                                    <span>Vorname</span>
                                    <input type="text" id="vorname" name="gname" value={formValue.gname} onChange={handleChange}/>
                                </label>
                                <label>
                                    <span>Email</span>
                                    <input type="email" id="email" name="email" value={formValue.email} onChange={handleChange}/>
                                </label>
                                <button type="submit" id="register_button" class="submit">Registrieren</button>
                            </form>
                        </div>
                    </div>
                </div>
        </div>
    );
}

export default Register;
