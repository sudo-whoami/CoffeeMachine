module.exports = {
	contracts_build_directory: './src/artifacts/',
	compilers: {
	  solc: {
		version: "0.8.7", // A version or constraint - Ex. "^0.5.0"
						   // Can be set to "native" to use a native solc or
						   // "pragma" which attempts to autodetect compiler versions
		docker: false, // Use a version obtained through docker
		parser: "solcjs",  // Leverages solc-js purely for speedy parsing
	  }
	},
	networks: {
		development: {
		  host: "127.0.0.1",
		  port: 7545,
		  network_id: "5777"
		}
	  }
  }