//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarketplace is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public constant maxSupply = 999;
    uint256 public constant maxUserLimit = 1;

    constructor() ERC721("ParthVarde", "PV") {}

    event NFTMinted(address sender, uint256 tokenId);

    function mint(string memory _uri) public payable {
        require(_tokenIds.current() <= maxSupply, "No more NFTs available in the collection.");
        require(balanceOf(msg.sender) <= maxUserLimit, "Only one NFT per user");
        require(msg.value <= 0.0001 ether, "Not enough ether to mint the NFT");
        uint256 newTokenId = _tokenIds.current();
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _uri);

        emit NFTMinted(msg.sender, newTokenId);
    }
}