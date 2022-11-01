import { useEffect } from "react";
import { useState } from "react";
import { Card, Button, ListGroup } from "react-bootstrap";
import FundraiserContract from "../../contracts/Fundraiser.json";
import Web3 from "web3";

const FundraiserCard = (fundraiser) => {
  // const web3 = new Web3(
  //   new Web3.providers.HttpProvider("http://localhost:8545")
  // );

  // const [contract, setContract] = useState(null);
  // const [accounts, setAccounts] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [url, setURL] = useState("");
  const [totalDonations, setTotalDonations] = useState(0);
  const [totalDonor, setTotalDonor] = useState(0);

  useEffect(() => {
    if (fundraiser) {
      init(fundraiser);
    }
  }, [fundraiser]);

  const init = async (fundraiser) => {
    const fund = fundraiser["fundraiser"];

    try {
      if (typeof window.ethereum === "undefined") {
        console.log("MetaMask is not installed!");
        return;
      }

      const web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");
      // const accounts = await web3.eth.requestAccounts();
      const { abi } = FundraiserContract;
      const contract = new web3.eth.Contract(abi, fund);
      // setContract(contract);

      const name = await contract.methods.name().call();
      const description = await contract.methods.description().call();
      const totalDonations = await contract.methods.totalDonations().call();
      const imageURL = await contract.methods.imageURL().call();
      const url = await contract.methods.url().call();
      const totalDonors = await contract.methods.myDonationCount().call();

      setName(name);
      setDescription(description);
      setImageURL(imageURL);
      setTotalDonations(totalDonations);
      setURL(url);
      setTotalDonor(totalDonors);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Card style={{ width: "18rem", margin: "10px", padding: "0" }}>
      <Card.Img variant="top" src={imageURL} />
      <Card.Body>
        <Card.Title>{name}</Card.Title>
        <Card.Text>{description}</Card.Text>
        <Card.Link href={url}>Go Somewhere</Card.Link>
      </Card.Body>
      <ListGroup className="list-group-flush">
        <ListGroup.Item>Total Donation: $ {totalDonations} </ListGroup.Item>
        <ListGroup.Item>Total Donor: {totalDonor} </ListGroup.Item>
      </ListGroup>
      <Card.Body>
        <Button variant="primary">Go somewhere</Button>
      </Card.Body>
    </Card>
  );
};

export default FundraiserCard;
