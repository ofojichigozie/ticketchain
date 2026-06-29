// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TicketNFT
 * @notice ERC-721 ticket contract for TicketChain with anti-scalping enforcement.
 *         Each token stores its event association, original price, and resale price cap.
 */
contract TicketNFT is ERC721, Ownable {
    struct TicketData {
        uint256 eventId;
        uint256 originalPrice;
        uint256 maxResalePrice;
        bool isUsed;
    }

    uint256 public nextTokenId;
    address public eventFactory;

    mapping(uint256 => TicketData) public tickets;

    event TicketMinted(
        uint256 indexed tokenId,
        address indexed to,
        uint256 indexed eventId,
        uint256 originalPrice,
        uint256 maxResalePrice
    );

    event TicketTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 salePrice
    );

    event TicketUsed(uint256 indexed tokenId);

    error OnlyFactory();
    error PriceExceedsCap(uint256 salePrice, uint256 maxResalePrice);
    error TicketAlreadyUsed();
    error NotTicketOwnerOrOrganizer();
    error TicketDoesNotExist();

    modifier onlyFactory() {
        if (msg.sender != eventFactory) revert OnlyFactory();
        _;
    }

    constructor() ERC721("TicketChain Ticket", "TCKT") Ownable(msg.sender) {}

    function setEventFactory(address _factory) external onlyOwner {
        eventFactory = _factory;
    }

    /**
     * @notice Mint a ticket NFT. Called exclusively by EventFactory.
     */
    function mintTicket(
        address _to,
        uint256 _eventId,
        uint256 _originalPrice,
        uint256 _maxResalePrice
    ) external onlyFactory returns (uint256 tokenId) {
        tokenId = nextTokenId++;

        _safeMint(_to, tokenId);

        tickets[tokenId] = TicketData({
            eventId: _eventId,
            originalPrice: _originalPrice,
            maxResalePrice: _maxResalePrice,
            isUsed: false
        });

        emit TicketMinted(tokenId, _to, _eventId, _originalPrice, _maxResalePrice);
    }

    /**
     * @notice Buy a resale ticket from its current owner.
     *         Reverts if `_salePrice` exceeds `maxResalePrice` (anti-scalping cap).
     *         Caller sends exact ETH as `msg.value`; payment is forwarded to the seller.
     */
    function buyResaleTicket(
        address _to,
        uint256 _tokenId,
        uint256 _salePrice
    ) external payable {
        TicketData storage t = tickets[_tokenId];
        if (t.originalPrice == 0 && t.maxResalePrice == 0) revert TicketDoesNotExist();
        if (t.isUsed) revert TicketAlreadyUsed();
        if (_salePrice > t.maxResalePrice) revert PriceExceedsCap(_salePrice, t.maxResalePrice);
        require(msg.value == _salePrice, "Incorrect ETH amount");

        address seller = ownerOf(_tokenId);
        require(msg.sender != seller, "Cannot buy own ticket");

        _transfer(seller, _to, _tokenId);

        (bool sent, ) = seller.call{value: msg.value}("");
        require(sent, "ETH transfer failed");

        emit TicketTransferred(_tokenId, seller, _to, _salePrice);
    }

    /**
     * @notice Mark a ticket as used at the event gate.
     *         Only the ticket owner or the contract owner (admin) may call this.
     */
    function markAsUsed(uint256 _tokenId) external {
        TicketData storage t = tickets[_tokenId];
        if (t.originalPrice == 0 && t.maxResalePrice == 0) revert TicketDoesNotExist();
        if (t.isUsed) revert TicketAlreadyUsed();

        address ticketOwner = ownerOf(_tokenId);
        if (msg.sender != ticketOwner && msg.sender != owner())
            revert NotTicketOwnerOrOrganizer();

        t.isUsed = true;
        emit TicketUsed(_tokenId);
    }

    function getTicketInfo(uint256 _tokenId) external view returns (TicketData memory) {
        return tickets[_tokenId];
    }

    /**
     * @dev Allows `buyResaleTicket` to move tokens on behalf of the contract.
     *      Normal `transferFrom` / `safeTransferFrom` still require approval.
     */
    function _isAuthorized(
        address owner_,
        address spender,
        uint256 /* tokenId */
    ) internal view override returns (bool) {
        if (spender == address(this)) return true;
        return super._isAuthorized(owner_, spender, 0);
    }
}
