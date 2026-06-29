// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./TicketNFT.sol";

/**
 * @title EventFactory
 * @notice Manages on-chain event creation and ticket sales for TicketChain.
 *         Each event stores its supply, base price, and anti-scalping multiplier.
 */
contract EventFactory {
    struct EventData {
        uint256 eventId;
        address organizer;
        string name;
        uint256 ticketSupply;
        uint256 ticketsMinted;
        uint256 priceWei;
        uint256 maxResaleMultiplierBps;
        uint256 maxTicketsPerWallet;
        bool disabled;
    }

    TicketNFT public ticketNFT;
    uint256 public nextEventId;
    mapping(uint256 => EventData) public events;
    mapping(uint256 => mapping(address => uint256)) public walletTicketCount;

    event EventCreated(
        uint256 indexed eventId,
        address indexed organizer,
        string name,
        uint256 ticketSupply,
        uint256 priceWei,
        uint256 maxResaleMultiplierBps
    );

    event EventDisabled(uint256 indexed eventId);

    error NotOrganizer();
    error EventDoesNotExist();
    error EventAlreadyDisabled();
    error EventDisabledError();
    error SoldOut();
    error IncorrectPayment();
    error WalletLimitReached();

    constructor(address _ticketNFT) {
        ticketNFT = TicketNFT(_ticketNFT);
    }

    /**
     * @notice Create a new event.
     * @param _name                   Human-readable event name
     * @param _ticketSupply           Total tickets available
     * @param _priceWei               Base price per ticket in wei
     * @param _maxResaleMultiplierBps Resale cap in basis points (10000 = 100%)
     * @param _maxTicketsPerWallet    Max tickets one wallet can buy (0 = unlimited)
     */
    function createEvent(
        string calldata _name,
        uint256 _ticketSupply,
        uint256 _priceWei,
        uint256 _maxResaleMultiplierBps,
        uint256 _maxTicketsPerWallet
    ) external returns (uint256 eventId) {
        require(_ticketSupply > 0, "Supply must be > 0");
        require(_maxResaleMultiplierBps >= 10000, "Multiplier must be >= 100%");

        eventId = nextEventId++;

        events[eventId] = EventData({
            eventId: eventId,
            organizer: msg.sender,
            name: _name,
            ticketSupply: _ticketSupply,
            ticketsMinted: 0,
            priceWei: _priceWei,
            maxResaleMultiplierBps: _maxResaleMultiplierBps,
            maxTicketsPerWallet: _maxTicketsPerWallet,
            disabled: false
        });

        emit EventCreated(
            eventId,
            msg.sender,
            _name,
            _ticketSupply,
            _priceWei,
            _maxResaleMultiplierBps
        );
    }

    /**
     * @notice Disable an event. Only the organizer may call this.
     */
    function disableEvent(uint256 _eventId) external {
        EventData storage e = events[_eventId];
        if (e.organizer == address(0)) revert EventDoesNotExist();
        if (msg.sender != e.organizer) revert NotOrganizer();
        if (e.disabled) revert EventAlreadyDisabled();

        e.disabled = true;
        emit EventDisabled(_eventId);
    }

    /**
     * @notice Purchase a primary ticket for an event.
     *         Send exact `priceWei` as msg.value; ETH is forwarded to the organizer.
     */
    function purchaseTicket(uint256 _eventId) external payable returns (uint256 tokenId) {
        EventData storage e = events[_eventId];
        if (e.organizer == address(0)) revert EventDoesNotExist();
        if (e.disabled) revert EventDisabledError();
        if (e.ticketsMinted >= e.ticketSupply) revert SoldOut();
        if (msg.value != e.priceWei) revert IncorrectPayment();
        if (e.maxTicketsPerWallet > 0 && walletTicketCount[_eventId][msg.sender] >= e.maxTicketsPerWallet)
            revert WalletLimitReached();

        e.ticketsMinted++;
        walletTicketCount[_eventId][msg.sender]++;

        uint256 maxResalePrice = (e.priceWei * e.maxResaleMultiplierBps) / 10000;

        tokenId = ticketNFT.mintTicket(
            msg.sender,
            _eventId,
            e.priceWei,
            maxResalePrice
        );

        (bool sent, ) = e.organizer.call{value: msg.value}("");
        require(sent, "ETH transfer failed");
    }

    function getEvent(uint256 _eventId) external view returns (EventData memory) {
        return events[_eventId];
    }
}
