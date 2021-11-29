import React, { Component } from 'react';
import { getCoffeAmount } from './Web3Client';

const showCoffeeBalance = () => {
	getCoffeAmount()
	.then(amount => setCoffeeAmount(amount))
	.catch(err => console.log(err));
}

class CoffeeAmount extends Component {
	componentDidMount() {
		// call api or anything
		console.log("Component has been rendered");
	}
	render() {
		return <h1>Hello, World</h1>;
	}
}
