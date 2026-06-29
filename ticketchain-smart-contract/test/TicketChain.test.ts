import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { EventFactory } from "../typechain-types";

/**
 * ethers v6 reserves `contract.getEvent()` for ABI event lookups.
 * Use `getFunction("getEvent")` to call the Solidity view function.
 */
async function fetchEvent(factory: EventFactory, eventId: number) {
  return factory.getFunction("getEvent")(eventId);
}

describe("TicketChain", function () {
  async function deployFixture() {
    const [owner, organizer, buyer1, buyer2] = await ethers.getSigners();

    const TicketNFT = await ethers.getContractFactory("TicketNFT");
    const ticketNFT = await TicketNFT.deploy();

    const EventFactory = await ethers.getContractFactory("EventFactory");
    const eventFactory = await EventFactory.deploy(
      await ticketNFT.getAddress()
    );

    await ticketNFT.setEventFactory(await eventFactory.getAddress());

    return { ticketNFT, eventFactory, owner, organizer, buyer1, buyer2 };
  }

  describe("TicketNFT", function () {
    it("should have correct name and symbol", async function () {
      const { ticketNFT } = await loadFixture(deployFixture);
      expect(await ticketNFT.name()).to.equal("TicketChain Ticket");
      expect(await ticketNFT.symbol()).to.equal("TCKT");
    });

    it("should allow owner to set event factory", async function () {
      const { ticketNFT, eventFactory } = await loadFixture(deployFixture);
      expect(await ticketNFT.eventFactory()).to.equal(
        await eventFactory.getAddress()
      );
    });

    it("should reject setEventFactory from non-owner", async function () {
      const { ticketNFT, buyer1 } = await loadFixture(deployFixture);
      await expect(
        ticketNFT.connect(buyer1).setEventFactory(buyer1.address)
      ).to.be.revertedWithCustomError(ticketNFT, "OwnableUnauthorizedAccount");
    });

    it("should reject minting from non-factory address", async function () {
      const { ticketNFT, buyer1 } = await loadFixture(deployFixture);
      await expect(
        ticketNFT
          .connect(buyer1)
          .mintTicket(buyer1.address, 0, 1000, 1500)
      ).to.be.revertedWithCustomError(ticketNFT, "OnlyFactory");
    });
  });

  describe("EventFactory", function () {
    const EVENT_NAME = "Test Concert";
    const TICKET_SUPPLY = 100;
    const PRICE_WEI = ethers.parseEther("0.1");
    const RESALE_BPS = 15000; // 150%

    describe("createEvent", function () {
      it("should create an event with correct data", async function () {
        const { eventFactory, organizer } = await loadFixture(deployFixture);

        await expect(
          eventFactory
            .connect(organizer)
            .createEvent(EVENT_NAME, TICKET_SUPPLY, PRICE_WEI, RESALE_BPS, 0)
        )
          .to.emit(eventFactory, "EventCreated")
          .withArgs(0, organizer.address, EVENT_NAME, TICKET_SUPPLY, PRICE_WEI, RESALE_BPS);

        const ev = await fetchEvent(eventFactory, 0);
        expect(ev.eventId).to.equal(0);
        expect(ev.organizer).to.equal(organizer.address);
        expect(ev.name).to.equal(EVENT_NAME);
        expect(ev.ticketSupply).to.equal(TICKET_SUPPLY);
        expect(ev.ticketsMinted).to.equal(0);
        expect(ev.priceWei).to.equal(PRICE_WEI);
        expect(ev.maxResaleMultiplierBps).to.equal(RESALE_BPS);
        expect(ev.disabled).to.equal(false);
      });

      it("should increment event IDs", async function () {
        const { eventFactory, organizer } = await loadFixture(deployFixture);

        await eventFactory
          .connect(organizer)
          .createEvent("Event 1", 10, PRICE_WEI, RESALE_BPS, 0);
        await eventFactory
          .connect(organizer)
          .createEvent("Event 2", 20, PRICE_WEI, RESALE_BPS, 0);

        expect((await fetchEvent(eventFactory, 0)).name).to.equal("Event 1");
        expect((await fetchEvent(eventFactory, 1)).name).to.equal("Event 2");
        expect(await eventFactory.nextEventId()).to.equal(2);
      });

      it("should revert if supply is zero", async function () {
        const { eventFactory, organizer } = await loadFixture(deployFixture);
        await expect(
          eventFactory
            .connect(organizer)
            .createEvent(EVENT_NAME, 0, PRICE_WEI, RESALE_BPS, 0)
        ).to.be.revertedWith("Supply must be > 0");
      });

      it("should revert if multiplier is below 100%", async function () {
        const { eventFactory, organizer } = await loadFixture(deployFixture);
        await expect(
          eventFactory
            .connect(organizer)
            .createEvent(EVENT_NAME, TICKET_SUPPLY, PRICE_WEI, 9999, 0)
        ).to.be.revertedWith("Multiplier must be >= 100%");
      });
    });

    describe("disableEvent", function () {
      it("should disable an event", async function () {
        const { eventFactory, organizer } = await loadFixture(deployFixture);

        await eventFactory
          .connect(organizer)
          .createEvent(EVENT_NAME, TICKET_SUPPLY, PRICE_WEI, RESALE_BPS, 0);

        await expect(eventFactory.connect(organizer).disableEvent(0))
          .to.emit(eventFactory, "EventDisabled")
          .withArgs(0);

        const ev = await fetchEvent(eventFactory, 0);
        expect(ev.disabled).to.equal(true);
      });

      it("should revert if not organizer", async function () {
        const { eventFactory, organizer, buyer1 } =
          await loadFixture(deployFixture);

        await eventFactory
          .connect(organizer)
          .createEvent(EVENT_NAME, TICKET_SUPPLY, PRICE_WEI, RESALE_BPS, 0);

        await expect(
          eventFactory.connect(buyer1).disableEvent(0)
        ).to.be.revertedWithCustomError(eventFactory, "NotOrganizer");
      });

      it("should revert if event does not exist", async function () {
        const { eventFactory, organizer } = await loadFixture(deployFixture);
        await expect(
          eventFactory.connect(organizer).disableEvent(999)
        ).to.be.revertedWithCustomError(eventFactory, "EventDoesNotExist");
      });

      it("should revert if already disabled", async function () {
        const { eventFactory, organizer } = await loadFixture(deployFixture);

        await eventFactory
          .connect(organizer)
          .createEvent(EVENT_NAME, TICKET_SUPPLY, PRICE_WEI, RESALE_BPS, 0);
        await eventFactory.connect(organizer).disableEvent(0);

        await expect(
          eventFactory.connect(organizer).disableEvent(0)
        ).to.be.revertedWithCustomError(eventFactory, "EventAlreadyDisabled");
      });
    });

    describe("purchaseTicket", function () {
      it("should mint a ticket and forward ETH to organizer", async function () {
        const { eventFactory, organizer, buyer1 } =
          await loadFixture(deployFixture);

        await eventFactory
          .connect(organizer)
          .createEvent(EVENT_NAME, TICKET_SUPPLY, PRICE_WEI, RESALE_BPS, 0);

        const orgBalBefore = await ethers.provider.getBalance(
          organizer.address
        );

        await eventFactory
          .connect(buyer1)
          .purchaseTicket(0, { value: PRICE_WEI });

        // Check organizer received payment
        const orgBalAfter = await ethers.provider.getBalance(
          organizer.address
        );
        expect(orgBalAfter - orgBalBefore).to.equal(PRICE_WEI);

        // Check tickets minted count
        const ev = await fetchEvent(eventFactory, 0);
        expect(ev.ticketsMinted).to.equal(1);
      });

      it("should emit TicketMinted on the NFT contract", async function () {
        const { eventFactory, ticketNFT, organizer, buyer1 } =
          await loadFixture(deployFixture);

        await eventFactory
          .connect(organizer)
          .createEvent(EVENT_NAME, TICKET_SUPPLY, PRICE_WEI, RESALE_BPS, 0);

        const maxResalePrice =
          (PRICE_WEI * BigInt(RESALE_BPS)) / BigInt(10000);

        await expect(
          eventFactory.connect(buyer1).purchaseTicket(0, { value: PRICE_WEI })
        )
          .to.emit(ticketNFT, "TicketMinted")
          .withArgs(0, buyer1.address, 0, PRICE_WEI, maxResalePrice);
      });

      it("should assign NFT ownership to buyer", async function () {
        const { eventFactory, ticketNFT, organizer, buyer1 } =
          await loadFixture(deployFixture);

        await eventFactory
          .connect(organizer)
          .createEvent(EVENT_NAME, TICKET_SUPPLY, PRICE_WEI, RESALE_BPS, 0);
        await eventFactory
          .connect(buyer1)
          .purchaseTicket(0, { value: PRICE_WEI });

        expect(await ticketNFT.ownerOf(0)).to.equal(buyer1.address);
      });

      it("should revert with incorrect payment", async function () {
        const { eventFactory, organizer, buyer1 } =
          await loadFixture(deployFixture);

        await eventFactory
          .connect(organizer)
          .createEvent(EVENT_NAME, TICKET_SUPPLY, PRICE_WEI, RESALE_BPS, 0);

        await expect(
          eventFactory.connect(buyer1).purchaseTicket(0, {
            value: ethers.parseEther("0.05"),
          })
        ).to.be.revertedWithCustomError(eventFactory, "IncorrectPayment");
      });

      it("should revert when sold out", async function () {
        const { eventFactory, organizer, buyer1, buyer2 } =
          await loadFixture(deployFixture);

        // Create event with supply of 1
        await eventFactory
          .connect(organizer)
          .createEvent(EVENT_NAME, 1, PRICE_WEI, RESALE_BPS, 0);
        await eventFactory
          .connect(buyer1)
          .purchaseTicket(0, { value: PRICE_WEI });

        await expect(
          eventFactory.connect(buyer2).purchaseTicket(0, { value: PRICE_WEI })
        ).to.be.revertedWithCustomError(eventFactory, "SoldOut");
      });

      it("should revert when event is disabled", async function () {
        const { eventFactory, organizer, buyer1 } =
          await loadFixture(deployFixture);

        await eventFactory
          .connect(organizer)
          .createEvent(EVENT_NAME, TICKET_SUPPLY, PRICE_WEI, RESALE_BPS, 0);
        await eventFactory.connect(organizer).disableEvent(0);

        await expect(
          eventFactory.connect(buyer1).purchaseTicket(0, { value: PRICE_WEI })
        ).to.be.revertedWithCustomError(eventFactory, "EventDisabledError");
      });
    });
  });

  describe("Resale (buyResaleTicket)", function () {
    const PRICE_WEI = ethers.parseEther("0.1");
    const RESALE_BPS = 15000; // 150%
    const MAX_RESALE_PRICE = (PRICE_WEI * BigInt(RESALE_BPS)) / BigInt(10000); // 0.15 ETH

    async function purchasedFixture() {
      const fixture = await deployFixture();
      const { eventFactory, organizer, buyer1 } = fixture;

      await eventFactory
        .connect(organizer)
        .createEvent("Concert", 100, PRICE_WEI, RESALE_BPS, 0);
      await eventFactory
        .connect(buyer1)
        .purchaseTicket(0, { value: PRICE_WEI });

      return fixture;
    }

    it("should allow resale at or below cap", async function () {
      const { ticketNFT, buyer1, buyer2 } =
        await loadFixture(purchasedFixture);

      const salePrice = ethers.parseEther("0.12"); // below 0.15 cap

      const sellerBalBefore = await ethers.provider.getBalance(buyer1.address);

      await expect(
        ticketNFT
          .connect(buyer2)
          .buyResaleTicket(buyer2.address, 0, salePrice, {
            value: salePrice,
          })
      )
        .to.emit(ticketNFT, "TicketTransferred")
        .withArgs(0, buyer1.address, buyer2.address, salePrice);

      // NFT transferred
      expect(await ticketNFT.ownerOf(0)).to.equal(buyer2.address);

      // Seller received payment
      const sellerBalAfter = await ethers.provider.getBalance(buyer1.address);
      expect(sellerBalAfter - sellerBalBefore).to.equal(salePrice);
    });

    it("should allow resale at exact cap price", async function () {
      const { ticketNFT, buyer1, buyer2 } =
        await loadFixture(purchasedFixture);

      await ticketNFT
        .connect(buyer2)
        .buyResaleTicket(buyer2.address, 0, MAX_RESALE_PRICE, {
          value: MAX_RESALE_PRICE,
        });

      expect(await ticketNFT.ownerOf(0)).to.equal(buyer2.address);
    });

    it("should REVERT if price exceeds cap (anti-scalping)", async function () {
      const { ticketNFT, buyer2 } = await loadFixture(purchasedFixture);

      const tooHigh = MAX_RESALE_PRICE + 1n;

      await expect(
        ticketNFT
          .connect(buyer2)
          .buyResaleTicket(buyer2.address, 0, tooHigh, { value: tooHigh })
      ).to.be.revertedWithCustomError(ticketNFT, "PriceExceedsCap");
    });

    it("should revert if msg.value does not match salePrice", async function () {
      const { ticketNFT, buyer2 } = await loadFixture(purchasedFixture);

      const salePrice = ethers.parseEther("0.1");

      await expect(
        ticketNFT
          .connect(buyer2)
          .buyResaleTicket(buyer2.address, 0, salePrice, {
            value: ethers.parseEther("0.05"),
          })
      ).to.be.revertedWith("Incorrect ETH amount");
    });

    it("should revert if seller tries to buy own ticket", async function () {
      const { ticketNFT, buyer1 } = await loadFixture(purchasedFixture);

      const salePrice = ethers.parseEther("0.1");

      await expect(
        ticketNFT
          .connect(buyer1)
          .buyResaleTicket(buyer1.address, 0, salePrice, {
            value: salePrice,
          })
      ).to.be.revertedWith("Cannot buy own ticket");
    });

    it("should revert resale of a used ticket", async function () {
      const { ticketNFT, buyer1, buyer2 } =
        await loadFixture(purchasedFixture);

      await ticketNFT.connect(buyer1).markAsUsed(0);

      await expect(
        ticketNFT
          .connect(buyer2)
          .buyResaleTicket(buyer2.address, 0, PRICE_WEI, {
            value: PRICE_WEI,
          })
      ).to.be.revertedWithCustomError(ticketNFT, "TicketAlreadyUsed");
    });
  });

  describe("markAsUsed", function () {
    const PRICE_WEI = ethers.parseEther("0.1");
    const RESALE_BPS = 15000;

    async function purchasedFixture() {
      const fixture = await deployFixture();
      const { eventFactory, organizer, buyer1 } = fixture;

      await eventFactory
        .connect(organizer)
        .createEvent("Show", 10, PRICE_WEI, RESALE_BPS, 0);
      await eventFactory
        .connect(buyer1)
        .purchaseTicket(0, { value: PRICE_WEI });

      return fixture;
    }

    it("should allow ticket owner to mark as used", async function () {
      const { ticketNFT, buyer1 } = await loadFixture(purchasedFixture);

      await expect(ticketNFT.connect(buyer1).markAsUsed(0))
        .to.emit(ticketNFT, "TicketUsed")
        .withArgs(0);

      const info = await ticketNFT.getTicketInfo(0);
      expect(info.isUsed).to.equal(true);
    });

    it("should allow contract owner (admin) to mark as used", async function () {
      const { ticketNFT, owner } = await loadFixture(purchasedFixture);

      await ticketNFT.connect(owner).markAsUsed(0);
      const info = await ticketNFT.getTicketInfo(0);
      expect(info.isUsed).to.equal(true);
    });

    it("should revert if not owner or admin", async function () {
      const { ticketNFT, buyer2 } = await loadFixture(purchasedFixture);

      await expect(
        ticketNFT.connect(buyer2).markAsUsed(0)
      ).to.be.revertedWithCustomError(ticketNFT, "NotTicketOwnerOrOrganizer");
    });

    it("should revert if ticket already used", async function () {
      const { ticketNFT, buyer1 } = await loadFixture(purchasedFixture);

      await ticketNFT.connect(buyer1).markAsUsed(0);

      await expect(
        ticketNFT.connect(buyer1).markAsUsed(0)
      ).to.be.revertedWithCustomError(ticketNFT, "TicketAlreadyUsed");
    });
  });

  describe("getTicketInfo", function () {
    it("should return correct ticket data", async function () {
      const { eventFactory, ticketNFT, organizer, buyer1 } =
        await loadFixture(deployFixture);

      const price = ethers.parseEther("0.1");
      const bps = 15000;
      const maxResale = (price * BigInt(bps)) / BigInt(10000);

      await eventFactory
        .connect(organizer)
        .createEvent("Gig", 50, price, bps, 0);
      await eventFactory
        .connect(buyer1)
        .purchaseTicket(0, { value: price });

      const info = await ticketNFT.getTicketInfo(0);
      expect(info.eventId).to.equal(0);
      expect(info.originalPrice).to.equal(price);
      expect(info.maxResalePrice).to.equal(maxResale);
      expect(info.isUsed).to.equal(false);
    });
  });
});
