import React, { useEffect, useState } from "react";
import FundraiserCard from "../fundraiser/Card";
import Web3 from "web3";
import factoryContract from "../../contracts/FundraiserFactory.json";

const Home = () => {
  // const [web3, setWeb3] = useState();
  // const [accounts, setAccounts] = useState();
  // const [contract, setContract] = useState();
  const [funds, setFunds] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        if (typeof window.ethereum === "undefined") {
          console.log("MetaMask is not installed!");
          return;
        }

        const web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");
        // const accounts = await web3.eth.requestAccounts();
        const networkID = await web3.eth.net.getId();
        const { abi } = factoryContract;
        let address = factoryContract.networks[networkID].address;
        let contract = new web3.eth.Contract(abi, address);

        // setWeb3(web3);
        // setAccounts(accounts);
        // setContract(contract);

        // const count = await contract.methods.fundraiserCount().call();
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
      <h2>The Home Page</h2>
      <br />
      <div className="row">{displayFundraisers()}</div>
    </div>
  );
};

export default Home;
