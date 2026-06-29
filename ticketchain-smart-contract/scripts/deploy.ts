import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // 1. Deploy TicketNFT
  const TicketNFT = await ethers.getContractFactory("TicketNFT");
  const ticketNFT = await TicketNFT.deploy();
  await ticketNFT.waitForDeployment();
  const ticketNFTAddress = await ticketNFT.getAddress();
  console.log("TicketNFT deployed to:", ticketNFTAddress);

  // 2. Deploy EventFactory
  const EventFactory = await ethers.getContractFactory("EventFactory");
  const eventFactory = await EventFactory.deploy(ticketNFTAddress);
  await eventFactory.waitForDeployment();
  const eventFactoryAddress = await eventFactory.getAddress();
  console.log("EventFactory deployed to:", eventFactoryAddress);

  // 3. Wire up: let the factory mint tickets
  const tx = await ticketNFT.setEventFactory(eventFactoryAddress);
  await tx.wait();
  console.log("TicketNFT.eventFactory set to EventFactory");

  console.log("\n--- Deployment Summary ---");
  console.log("TicketNFT:    ", ticketNFTAddress);
  console.log("EventFactory: ", eventFactoryAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
