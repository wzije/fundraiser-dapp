import React, { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import Web3 from "web3";
import FactoryContract from "../../contracts/FundraiserFactory.json";

const New = () => {
  const [name, setName] = useState(null);
  const [url, setURL] = useState(null);
  const [description, setDescription] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [beneficiary, setBeneficiary] = useState(null);
  // const [custodian, setCustodian] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        if (typeof window.ethereum === "undefined") {
          console.log("MetaMask is not installed!");
          return;
        }

        const web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");
        const accounts = await web3.eth.requestAccounts();
        const networkID = await web3.eth.net.getId();
        const { abi } = FactoryContract;
        let address = FactoryContract.networks[networkID].address;
        let contract = new web3.eth.Contract(abi, address);
        setAccounts(accounts);
        setContract(contract);
      } catch (err) {
        // alert("Failed to load web3, account, or contract");
        console.log(err);
      }
    };

    init();
  }, []);

  const handleCreateNew = async () => {
    await contract.methods
      .createFundraiser(
        name,
        url,
        imageURL,
        description,
        beneficiary
        // custodian
      )
      .send({ from: accounts[0] });
  };
  return (
    <div className="container" style={{ width: "100%" }}>
      <h2>Create New Fundraiser</h2>
      <Form>
        <Form.Group className="mb-3" controlId="formName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Enter Name"
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formURL">
          <Form.Label>URL</Form.Label>
          <Form.Control
            onChange={(e) => setURL(e.target.value)}
            type="text"
            placeholder="Enter URL"
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formImageURL">
          <Form.Label>ImageURL</Form.Label>
          <Form.Control
            onChange={(e) => setImageURL(e.target.value)}
            type="text"
            placeholder="Enter ImageURL"
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            onChange={(e) => setDescription(e.target.value)}
            type="text"
            placeholder="Enter Description"
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formAddress">
          <Form.Label>Beneficiary Address</Form.Label>
          <Form.Control
            onChange={(e) => setBeneficiary(e.target.value)}
            type="text"
            placeholder="Enter Beneficiary"
          />
        </Form.Group>
        {/* <Form.Group className="mb-3" controlId="formCustodian">
          <Form.Label>Custodian</Form.Label>
          <Form.Control
            onChange={(e) => setCustodian(e.target.value)}
            type="text"
            placeholder="Enter Custodian"
          />
        </Form.Group>  */}
        <Button variant="primary" type="submit" onClick={handleCreateNew}>
          Submit
        </Button>
      </Form>
    </div>
  );
};

export default New;
