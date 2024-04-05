const { expect } = require("chai");

describe("DEX", () => {
    let initialSupply = "100";
    let owner;
    let token;
    let addr1;
    let addr2;
    let price = 100;
    let dex;

    before(async () => {
        [owner, addr1, addr2] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy(initialSupply);

        const DEX = await ethers.getContractFactory("DEX");
        dex = await DEX.deploy(token, price);

    });

    describe("Sell", () => {
        it("should fail if contract is not approved", async () => {
            await expect(dex.sell()).to.be.reverted;
        });

        it("should approve to allow DEX to transfer token", async () => {
            await token.approve(dex, 100);
        });

        it("should not allow non-owner to call sell() on DEX", async () => {
            await expect(dex.connect(addr1).sell()).to.be.reverted;
        }); 

        it("should allow transfer of tokens from owner to dex", async () => {
             expect(await dex.sell()).to.changeTokenBalances(
                token, 
                [owner.address, dex.address],
                [-100, 100]
            );
        });

    });

    describe("Getters", () => {
        it("should return correct token balance", async () => {
            expect(await dex.getTokenBalance()).to.equal(100);
        });

        it("should return correct token price", async () => {
            expect(await dex.getPrice(10)).to.equal(price * 10);
        });        
    });

    describe("Buy", () => {
        it("should allow users to buy tokens", async () => {
            expect(await dex.connect(addr1).buy(10, {value: 1000})).to.changeTokenBalances(token, [dex.address, addr1.address], [100, 10]);
        });

        it("should not allow buying invalid amount of tokens", async () => {
            await expect(dex.connect(addr1).buy(91, {value: 9100})).to.be.reverted;
        });

        it("should not allow buying with insufficient balance/funds/payments", async () => {
            await expect(dex.connect(addr1).buy(5, {value: 510})).to.be.reverted;
        });
    });
    
    describe("Withdraw tokens", () => {
        it("should not allow non-owners to withdraw token", async () => {
            await expect(dex.connect(addr1).withdrawTokens()).to.be.reverted;
        });

        it("should allow token supplier to withdraw their tokens", async () => {
            expect(await dex.withdrawTokens()).to.changeTokenBalances(token, [dex.address, owner.address], [-100, 100]);
        });

    });
    describe("Withdraw funds", () => {
        it("should allow token provider to withdraw funds", async () => {
            expect(await dex.withdrawFunds()).to.changeEtherBalances([dex.address, owner.address], [-1000, 1000]);
        });

        it("should not allow non-owner to withdraw token funds", async () => {
            await expect(dex.connect(addr1).withdrawFunds()).to.be.reverted;
        })        
    });
});
