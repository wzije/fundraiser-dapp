import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button, Form, ListGroup, Badge } from "react-bootstrap";
import Web3 from "web3";
import FundraiserContract from "../../contracts/Fundraiser.json";
import cc from "cryptocompare";
import "./Style.css";
import currency from "currency.js";
import moment from "moment";

const FundraiserDetail = () => {
  cc.setApiKey(
    "a9eac19cd945cd5fa59bec5920196b8f812baf6fa7c58c3f7ce7b2e4c6c68253"
  );

  const IDR = (value) =>
    currency(value, { symbol: "Rp ", decimal: ",", separator: "." });

  let { fundId } = useParams();
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [url, setURL] = useState("");
  const [totalDonations, setTotalDonations] = useState(0);
  const [userDonations, setUserDonations] = useState(0);
  const [donationAmount, setDonationAmount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [totalDonationInETH, setTotalDonationInETH] = useState(0);
  const [donationInETH, setDonationInETH] = useState(0);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const init = async (fundId, donationAmount) => {
      try {
        if (typeof window.ethereum === "undefined") {
          console.log("MetaMask is not installed!");
          return;
        }

        const web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");
        const { abi } = FundraiserContract;
        const contract = new web3.eth.Contract(abi, fundId);
        const accounts = await web3.eth.requestAccounts();
        setContract(contract);
        setWeb3(web3);
        setAccounts(accounts);

        const name = await contract.methods.name().call();
        const description = await contract.methods.description().call();
        const imageURL = await contract.methods.imageURL().call();
        const url = await contract.methods.url().call();
        setName(name);
        setDescription(description);
        setImageURL(imageURL);
        setURL(url);

        const totalDonations = await contract.methods.totalDonations().call();
        const exchangeRate = await cc.price("ETH", ["IDR"]);
        const totalDonationInETH = web3.utils.fromWei(totalDonations, "ether");
        const idrDonationAmount = IDR(
          exchangeRate.IDR * totalDonationInETH
        ).format();

        const userDonations = await contract.methods
          .myDonations()
          .call({ from: accounts[0] });

        const owner = await contract.methods.owner().call();
        if (owner !== undefined && owner === accounts[0]) setIsOwner(true);

        const balance = await web3.eth.getBalance(fundId);
        console.info(parseInt(balance), "current contract balance");

        setExchangeRate(exchangeRate);
        setTotalDonations(idrDonationAmount);
        setTotalDonationInETH(totalDonationInETH);
        setUserDonations(userDonations);
      } catch (err) {
        console.log(err);
      }
    };

    init(fundId, donationAmount);
  }, [fundId, donationAmount]);

  window.ethereum.on("accountsChanged", function (accounts) {
    window.location.reload();
  });

  const _changeDonationAmount = (e) => {
    e.preventDefault();
    const value = e.target.value;
    setDonationAmount(value);

    const ethRate = exchangeRate.IDR;
    const ethTotal = value / ethRate;
    console.info(value, ethRate, "rate today", ethTotal, "total");
    setDonationInETH(ethTotal);
  };

  const _handleSubmit = async (e) => {
    e.preventDefault();

    const ethRate = exchangeRate.IDR;
    const ethTotal = donationAmount / ethRate;
    const donation = web3.utils.toWei(ethTotal.toString());

    await contract.methods.donate().send({
      from: accounts[0],
      value: donation,
      gas: 650000,
    });

    alert("thank you for donation.");
    window.location.reload();
  };

  const _renderMyDonations = () => {
    let donations = userDonations;
    if (donations === 0) return null;

    const donationCount = donations.values.length;
    const donationList = [];

    for (let i = 0; i < donationCount; i++) {
      const ethAmount = web3.utils.fromWei(donations.values[i]);
      const donationUser = exchangeRate.IDR * ethAmount;
      const donationDate = donations.dates[i];

      donationList.push({
        amount: donationUser,
        date: donationDate,
      });
    }

    // console.info(donationList);

    return donationList.map((donation, index) => {
      return (
        <ListGroup.Item
          as="li"
          className="d-flex justify-content-between align-items-start"
          key={index}
        >
          <div className="ms-1 me-auto">
            <div className="fw-bold"></div>
            {IDR(donation.amount).format()}
          </div>
          <Badge bg="secondary" style={{ fontSize: "8pt" }}>
            at {moment.unix(donation.date).format("DD/M/Y")}
          </Badge>
        </ListGroup.Item>
      );
    });
  };

  const _handleWithdraw = async () => {
    if (isOwner) {
      await contract.methods.withdraw().send({ from: accounts[0] });
      alert("fund withdraw");
    }
  };

  return (
    <div className="container mt-5 fdetails">
      <div className="row">
        <div className="col-lg-8">
          <article>
            <header className="mb-4">
              <h1 className="fw-bolder mb-1">{name}</h1>
              <div className="text-muted fst-italic mb-2">
                {/* Posted on January 1, 2022 by Start Bootstrap */}
                Posted on
              </div>
            </header>
            <figure className="mb-4">
              <img
                className="img-fluid rounded"
                src={`${imageURL}/700/300`}
                alt="..."
              />
            </figure>
            <section className="mb-5">
              <p className="fs-5 mb-4" style={{ textAlign: "justify" }}>
                {description}
              </p>
              <p>
                More Info:
                <br />
                <Link to={url}>{url}</Link>
              </p>
            </section>
          </article>
        </div>
        <div className="col-lg-4">
          <div className="d-grid gap-2 mb-4">
            <div
              className="p-3 rounded"
              style={{ border: "solid 1px #5E60E7", height: "65px" }}
            >
              <div className="fdetail-title">Total Donation:</div>
              <p className="text-center fdetail-value"> {totalDonations}</p>
            </div>
            <div
              className="p-3 rounded"
              style={{
                background: "#5E60E7",
                color: "white",
                height: "65px",
              }}
            >
              <div className="fdetail-title">ETH:</div>
              <p className="text-center fdetail-value">
                {totalDonationInETH} ETH
              </p>
            </div>
          </div>
          <div className="mb-4">
            <Form onSubmit={_handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Control
                  className="text-center"
                  onChange={_changeDonationAmount}
                  value={donationAmount}
                  type="number"
                  placeholder="0.00"
                />
                <Form.Text>Eth: {donationInETH}</Form.Text>
              </Form.Group>
              <div className="d-grid gap-2">
                <Button type="submit" variant="warning" size="lg">
                  Donate
                </Button>
              </div>
            </Form>
          </div>

          <div className="mb-4">
            <ListGroup>
              <ListGroup.Item active>My Donation Receipt</ListGroup.Item>
              {_renderMyDonations()}
            </ListGroup>
          </div>

          {isOwner && (
            <div className="mb-4">
              <div className="d-grid gap-2">
                <Button
                  type="button"
                  onClick={_handleWithdraw}
                  variant="success"
                  size="lg"
                >
                  Withdraw
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FundraiserDetail;
