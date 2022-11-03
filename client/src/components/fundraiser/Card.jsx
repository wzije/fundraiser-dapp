import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, ListGroup } from "react-bootstrap";
import FundraiserContract from "../../contracts/Fundraiser.json";
import currency from "currency.js";
import Web3 from "web3";
import cc from "cryptocompare";
cc.setApiKey(
  "a9eac19cd945cd5fa59bec5920196b8f812baf6fa7c58c3f7ce7b2e4c6c68253"
);

const FundraiserCard = (fundraiser) => {
  const IDR = (value) =>
    currency(value, { symbol: "Rp ", decimal: ",", separator: "." });

  const fundId = fundraiser["fundraiser"]["fundraiser"];
  const index = fundraiser["fundraiser"]["index"];
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [url, setURL] = useState("");
  const [totalDonations, setTotalDonations] = useState(0);

  useEffect(() => {
    const init = async (fundraiser) => {
      const fund = fundraiser;

      try {
        if (typeof window.ethereum === "undefined") {
          console.log("MetaMask is not installed!");
          return;
        }

        const web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");
        const { abi } = FundraiserContract;
        const contract = new web3.eth.Contract(abi, fund);

        const name = await contract.methods.name().call();
        const description = await contract.methods.description().call();
        const totalDonations = await contract.methods.totalDonations().call();
        const imageURL = await contract.methods.imageURL().call();
        const url = await contract.methods.url().call();
        setName(name);
        setDescription(description);
        setImageURL(imageURL);
        setURL(url);

        const exchangeRate = await cc.price("ETH", ["IDR"]);
        const eth = web3.utils.fromWei(totalDonations, "ether");
        const idrDonationAmount = IDR(exchangeRate.IDR * eth).format();
        setTotalDonations(idrDonationAmount);
      } catch (err) {
        console.log(err);
      }
    };

    if (fundId) {
      init(fundId);
    }
  }, [fundId]);

  return (
    <Card style={{ width: "18rem", margin: "10px", padding: "0" }}>
      <Card.Img variant="top" src={`${imageURL}/100/50?random=${index}`} />
      <Card.Body>
        <Card.Title>{name}</Card.Title>
        <Card.Text>{description.substring(0, 144)}</Card.Text>
        <Card.Link href={url}>Go Somewhere</Card.Link>
      </Card.Body>
      <ListGroup className="list-group-flush">
        <ListGroup.Item>Total Donation: {totalDonations} </ListGroup.Item>
        {/* <ListGroup.Item>Total Donor: {totalDonor} </ListGroup.Item> */}
      </ListGroup>
      <Card.Body>
        <Link
          to={`/funds/${fundId}`}
          className="btn btn-success text-white p-2"
        >
          Detail
        </Link>
      </Card.Body>
    </Card>
  );
};

export default FundraiserCard;
