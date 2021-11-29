import Web3 from 'web3';
import BillingSystem from './artifacts/BillingSystem.json';

let selectedAccount;

// let nftContract;
let billingSystem;

let isInitialized = false;

let web3;

export const init = async () => {
	let provider = window.ethereum;

	if (typeof provider !== 'undefined') {
		provider
			.request({ method: 'eth_requestAccounts' })
			.then((accounts) => {
				selectedAccount = accounts[0];
				console.log(`Selected account is ${selectedAccount}`);
			})
			.catch((err) => {
				console.log(err);
				return;
			});

		window.ethereum.on('accountsChanged', function (accounts) {
			selectedAccount = accounts[0];
			console.log(`Selected account changed to ${selectedAccount}`);
		});
	}

	web3 = new Web3(provider);

	const networkId = await web3.eth.net.getId();

	billingSystem = new web3.eth.Contract(
		BillingSystem.abi,
		BillingSystem.networks[networkId].address
	);

	isInitialized = true;
};

export const getCCBalance = async () => {
	if (!isInitialized) {
		await init();
	}

	return billingSystem.methods
		.getBalanceOf(selectedAccount)
		.call()
		.then((balance) => {
			return balance;
		});
};

export const getCoffeAmount = async () => {
	if (!isInitialized) {
		await init();
	}

	return billingSystem.methods
		.getAmountOfPurchasedCoffees()
		.call({from: selectedAccount, gas: 6721975})
		.then((balance) => {
			return balance;
		});
};

export const buyCoffee = async () => {
	if (!isInitialized) {
		await init();
	}

	return billingSystem.methods
		.purchaseCoffee()
		.send({from: selectedAccount, value: web3.utils.toWei("1", "ether"), gas: 6721975})
		.then(res => {
			return res;
		});
};

export const depositCC = async () => {
	if (!isInitialized) {
		await init();
	}

	return billingSystem.methods
		.deposit()
		.send({from: selectedAccount, value: web3.utils.toWei("1", "ether")})
		.then((res) => {
			return res;
		});
};

export const registerCostumer = async (fname, gname, email) => {
	if (!isInitialized) {
		await init();
	}

	return billingSystem.methods
		.register([fname, gname, email])
		.call()
		.then((res) => {
			return res;
		});
};