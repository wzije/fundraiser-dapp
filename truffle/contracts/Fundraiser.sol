// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Fundraiser is Ownable {
    using SafeMath for uint256;

    //donation struct
    struct Donation {
        uint256 value;
        uint256 date;
    }

    mapping(address => Donation[]) private _donations;

    string public name;
    string public url;
    string public imageURL;
    string public description;

    //(alamat penyimpanan) alamat ini terasosiasi dengan manajer penggalangan
    //alamat ini tidak akan menerima dana apapun,
    //tapi menjadi alamat yang diijinkan membuat pertukaran dan permintaan tranfer dana ke penerima.
    address public custodian;

    //(alamat penerima) alamat ini diasosiakan dengan koinbase atau semacamnya, bukan alamat yang digunakan untuk mengirim transaksi.
    //address payable dapat menerima ether, dan akan memiliki methode transfer dan pengiriman yang tersedia.
    //payable identifier attribute/fungsi jadi dapat mengakses transfer, send, call
    address payable public beneficiary;

    uint256 public totalDonations;
    uint256 public donationCount;

    event DonationRecieived(address indexed donor, uint256 value);
    event Withdraw(uint256 amount);

    constructor(
        string memory _name,
        string memory _url,
        string memory _imageURL,
        string memory _description,
        address payable _beneficiary,
        address _custodian
    ) {
        name = _name;
        url = _url;
        imageURL = _imageURL;
        description = _description;
        beneficiary = _beneficiary;
        // custodian = _custodian;

        _transferOwnership(_custodian);
    }

    //digunakan untuk mengedit beneficiary (penerima),
    //digunakan untuk menangani kemungkinan salah input data, seperti tidak sengaja memasukkan alamat
    //atau beneficiary sengaja ingin mengubah alamat tukar
    //oleh karena itu, dibutuhan restriksi untuk mengidentifikasi pemilik custodian yang hanya dapat mengubahnya
    //diidentifikasi dengan onlyOwner
    function setBeneficiary(address payable _beneficiary) public onlyOwner {
        beneficiary = _beneficiary;
    }

    function myDonationCount() public view returns (uint256) {
        return _donations[msg.sender].length;
    }

    function donate() public payable {
        Donation memory donation = Donation({
            value: msg.value,
            date: block.timestamp
        });

        _donations[msg.sender].push(donation);

        totalDonations = totalDonations.add(msg.value);
        donationCount++;

        emit DonationRecieived(msg.sender, msg.value);
    }

    //karena masalah limimation pada abi, maka tidak bisa mengembalikan sebuah array atau struct dari eksternal atau public function
    //sebagai gantinya kita dapat mengembalikan multiple value atau array untuk menariknya.
    function myDonations()
        public
        view
        returns (uint256[] memory values, uint256[] memory dates)
    {
        uint256 count = myDonationCount();
        values = new uint256[](count);
        dates = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            Donation storage donation = _donations[msg.sender][i];
            values[i] = donation.value;
            dates[i] = donation.date;
        }

        return (values, dates);
    }

    function withdraw() public onlyOwner {
        //get balance from this address / owner address
        uint256 balance = address(this).balance;
        //transfer beneficiary
        beneficiary.transfer(balance);
        //emit event
        emit Withdraw(balance);
    }

    //fallback, fungsi tanpa nama, akan mensupply default behavior di dalam event yang menerima ether melalui sebuah plain transaction.abi
    //fungsi ini akan digunakan sebagai anonymous donasi.
    fallback() external payable {
        totalDonations = totalDonations.add(msg.value);
        donationCount++;
    }

    receive() external payable {
        totalDonations = totalDonations.add(msg.value);
        donationCount++;
    }
}
