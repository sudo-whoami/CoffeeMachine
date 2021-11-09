import { Component } from 'react'
import './mystyle.css';

class Bezahlen extends Component {
    render() {
        return (
            <div>
                {/* Overlay for Modal */}
                <div class="cont_bezahlen">
                    <h2> Wasserstand </h2>
                    <center>
                        <canvas id="gauge_canvas"></canvas>
                    </center>
                    <br />
                    <hr />
                    <br />
                    <button id="bezahlen" class="submit">Kaffee kaufen</button>
                    <br />
                    <hr />
                    <br />
                    <div>
                        <p>Mein Kontostand</p>
                    </div>
                </div>
            </div>
        )
    }
}

export default Bezahlen
