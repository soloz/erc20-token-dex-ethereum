const { expect } = require("chai");


describe("Token", () => {
    let initialSupply = "100";
    let owner;
    let token;
    let addr1;
    let addr2;

    beforeEach(async () => {
        [owner, addr1, addr2] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy(initialSupply);
    });

    describe("Deploy", () => {
        it("should assign total supply of token to owner/deployer", async () => {
            const ownerBalance = await token.balanceOf(owner.address);
            expect(await token.totalSupply()).to.equal(ownerBalance);
        })
    });

    describe("Transaction", () => {
        it("should transfer token between accounts", async () => {
            await token.transfer(addr1.address, 50);
            const addr1Balance = await token.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(50);
        });
        it("should have sufficient token in source address", async () => {
            await expect(token.connect(addr1).transfer(addr2.address, 51)).to.be.reverted;
        });     

        it("should have sufficient token in supplier address", async () => {
            await expect(token.transfer(addr1.address, 101)).to.be.reverted;
        });              
    });
})