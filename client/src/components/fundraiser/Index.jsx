import React, { useEffect, useState } from "react";
import FundraiserCard from "../fundraiser/Card";
import Web3 from "web3";
import { Routes, Route } from "react-router-dom";
import factoryContract from "../../contracts/FundraiserFactory.json";
import NewFundraiser from "./New";
import DetailFundraiser from "./Detail";
const FundraiserIndex = () => {
  const [funds, setFunds] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        if (typeof window.ethereum === "undefined") {
          console.log("MetaMask is not installed!");
          return;
        }

        const web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");
        const networkID = await web3.eth.net.getId();
        const { abi } = factoryContract;
        let address = factoryContract.networks[networkID].address;
        let contract = new web3.eth.Contract(abi, address);

        const funds = await contract.methods.fundraisers(10, 0).call();
        setFunds(funds);
      } catch (err) {
        console.log(err);
      }
    };

    init();
  }, []);

  const displayFundraisers = () => {
    return funds.map((fundraiser) => {
      return <FundraiserCard fundraiser={fundraiser} key={fundraiser} />;
    });
  };

  return (
    <div>
      <h2>Fundraiser List</h2>
      <br />
      <div className="row">{displayFundraisers()}</div>
    </div>
  );
};

export default FundraiserIndex;
