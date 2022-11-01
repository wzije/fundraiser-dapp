// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9;

import "./Fundraiser.sol";

contract FundraiserFactory {
    uint256 maxlimit = 20;
    Fundraiser[] private _fundraisers;

    event FundraiserCreated(
        Fundraiser indexed _fundraiser,
        address indexed owner
    );

    function createFundraiser(
        string memory _name,
        string memory _url,
        string memory _imageURL,
        string memory _description,
        address payable _beneficiary
    ) public {
        Fundraiser fundraiser = new Fundraiser(
            _name,
            _url,
            _imageURL,
            _description,
            _beneficiary,
            msg.sender
        );

        _fundraisers.push(fundraiser);
        emit FundraiserCreated(fundraiser, msg.sender);
    }

    function fundraiserCount() public view returns (uint256) {
        return _fundraisers.length;
    }

    //10, 0
    //0, 2
    function fundraisers(uint256 _limit, uint256 _offset)
        public
        view
        returns (Fundraiser[] memory collections)
    {
        require(_offset <= fundraiserCount(), "offset out of bounds");

        uint256 size = fundraiserCount() - _offset;
        size = size < _limit ? size : _limit;
        size = size < maxlimit ? size : maxlimit;

        collections = new Fundraiser[](size);

        for (uint256 i = 0; i < size; i++) {
            collections[i] = _fundraisers[_offset + i];
        }

        return collections;
    }
}
