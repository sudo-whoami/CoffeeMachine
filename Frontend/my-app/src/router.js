import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Bezahlen from "./bezahlen";
import Login from "./login";
import Register from "./register";

export default function App() {
	return (
	  <Router>
		<div>
		  <Routes>
			<Route exact path="/" element={<Login/>}/>
			<Route path="/register" element={<Register/>}/>
			<Route path="/bezahlen" element={<Bezahlen/>}/>
		  </Routes>
		</div>
	  </Router>
	);
  }