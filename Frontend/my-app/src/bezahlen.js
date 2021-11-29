import React, { useState, useEffect } from 'react';

import './mystyle.css';
import { buyCoffee, getCoffeAmount } from './Web3Client';

function Bezahlen() {

    const [CoffeeAmount, setCoffeeAmount] = useState(0);

    const payCoffee = () => {
        buyCoffee()
        .then(res => console.log(res))
        .catch(err => console.log(err));
    }

    const showCoffeeBalance = () => {
        getCoffeAmount()
        .then(amount => setCoffeeAmount(amount))
        .catch(err => console.log(err));
    }

    useEffect(() => {
        console.log("loaded");
        showCoffeeBalance();
    })

    return ( 
        <div class="cont_bezahlen">
            <h2> Wasserstand </h2>
            <center>
                <canvas id="gauge_canvas"></canvas>
            </center>
            <br />
            <hr />
            <br />
            <button id="bezahlen" class="submit" onClick={() => {payCoffee()}}>Kaffee kaufen</button>
            <br />
            <hr />
            <br />
            <div>
                <h5 class="balance">Dein Kaffeeanzahl</h5>
                <h6>{CoffeeAmount}</h6>
            </div>
        </div>
    )
}

export default Bezahlen
