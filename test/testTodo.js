const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const {ethers, upgrades } = require("hardhat");

  describe("Deploy", function(){
    async function deploy(){
        const [owner, other] = await ethers.getSigners();
        const TBNB = await ethers.getContractFactory('TestTBNB');
        const tbnb = await TBNB.deploy();
       

        const ToDo = await ethers.getContractFactory("Todoapp");
        const todo = await upgrades.deployProxy(ToDo, [tbnb.target], {
            initializer: "initialize",
        });
        return {owner, other, tbnb, todo};
    }
    describe("Constructor", function(){
        it("Should insert the interfaces and owner correct", async()=>{
            const {owner, other, tbnb, todo} = await loadFixture(deploy);
        expect(await todo.tbnb()).to.eq(tbnb.target);
        expect(await todo.owner()).to.eq(owner.address);
        })
    })
    describe("Exchange tokens", function(){
        it("Should revert if user try send zero value", async()=>{
            const {owner, other, tbnb, todo} = await loadFixture(deploy);
            await tbnb.mint(owner, 100);
            await tbnb.approve(todo.target, 100);
            await expect(todo.exchange(0)).to.be.revertedWith("You can't send zero tokens");
        });
        it("Balance of contract should increase", async()=>{
            const {owner, other, tbnb, todo} = await loadFixture(deploy);
            await tbnb.mint(owner, 100);
            await tbnb.approve(todo.target, 100);
             expect(await todo.exchange(100)).not.to.be.reverted;
             expect(await tbnb.balanceOf(todo.target)).to.eq(100);
        });
        it("User balance at mapping should increase", async()=>{
            const {owner, other, tbnb, todo} = await loadFixture(deploy);
            await tbnb.mint(owner, 100);
            await tbnb.approve(todo.target, 100);
            expect(await todo.exchange(100)).not.to.be.reverted;
            expect(await todo.balance(owner.address)).to.eq(100);
        });
        it('Event should emmited when transact end with succees', async()=>{
            const {owner, other, tbnb, todo} = await loadFixture(deploy);
            await tbnb.mint(owner, 100);
            await tbnb.approve(todo.target, 100);
            expect(await todo.exchange(100)).to.emit(todo, "Exchanged").withArgs(owner.address, 100);
        });
        it('Should mint ANTI tokens when user use function', async()=>{
            const {owner, other, tbnb, todo} = await loadFixture(deploy);
            await tbnb.mint(owner, 100);
            await tbnb.approve(todo.target, 100);
            await todo.exchange(100);
            expect(await todo.balanceOf(owner.address)).to.eq(100);
        })
        describe('Procent', function(){
            it('Should canculate procent corectly', async()=>{
                const {owner, other,tbnb, todo} = await loadFixture(deploy);
                expect( await todo.feeForWithdraw(100)).to.eq(30);
            });
        })
        describe('Witdraw', function(){
            it("User couldn't withdraw balance if they balance zero", async()=>{
                const {owner, other, tbnb, todo} = await loadFixture(deploy);
                await expect(todo.withdraw()).to.be.revertedWith("Yor balance is zero");
            })
            it("User could withdraw his balance only to 70%", async()=>{
                const {owner, other, tbnb, todo} = await loadFixture(deploy);
                await tbnb.connect(other).mint(other.address, 100);
                await tbnb.connect(other).approve(todo.target, 100);
                await todo.connect(other).exchange(100);
                await todo.connect(other).withdraw();
                expect(await tbnb.balanceOf(other)).to.eq(70);
            });
            it("User balance in map should become zero", async()=>{
                const {owner, other, tbnb, todo} = await loadFixture(deploy);
                await tbnb.connect(other).mint(other.address, 100);
                await tbnb.connect(other).approve(todo.target, 100);
                await todo.connect(other).exchange(100);
                await todo.connect(other).withdraw();
                expect(await todo.balance(other.address)).to.eq("0");
            })
            it("Function should emit after succees", async()=>{
                const {owner, other, anti, tbnb, todo} = await loadFixture(deploy);
                await tbnb.connect(other).mint(other.address, 100);
                await tbnb.connect(other).approve(todo.target, 100);
                await todo.connect(other).exchange(100);
                expect(await todo.connect(other).withdraw()).to.emit(todo, 'Withdraw').withArgs(other.address, 70);
            })
        })
        describe("addTask", function(){
            it("User couldn't use this if he has not have balance in the map", async()=>{
                const {owner, other, anti, tbnb, todo} = await loadFixture(deploy);
                await expect(todo.addTaskInMap(0, 0)).to.be.revertedWith("You doesn't have deposit tokens");
            })
            it("User couldn't use this if he has not have enough tokens", async()=>{
                const {owner, other, tbnb, todo} = await loadFixture(deploy);
                await tbnb.connect(other).mint(other.address, 100);
                await tbnb.connect(other).approve(todo.target, 100);
                await todo.connect(other).exchange(100);
                await expect(todo.connect(other).addTaskInMap(0, 150)).to.be.revertedWith("You doesn't have that much tokens");
            });
            it("User can not set award above the half his balance", async()=>{
                const {owner, other,tbnb, todo} = await loadFixture(deploy);
                await tbnb.connect(other).mint(other.address, 100);
                await tbnb.connect(other).approve(todo.target, 100);
                await todo.connect(other).exchange(100);
                await expect(todo.connect(other).addTaskInMap(0, 70)).to.be.revertedWith("You can't set awart above than half your balance");
            })
            it("Should add new task in the map", async()=>{
                const {owner, other, tbnb, todo} = await loadFixture(deploy);
                await tbnb.connect(other).mint(other.address, 100);
                await tbnb.connect(other).approve(todo.target, 100);
                await todo.connect(other).exchange(100);
                expect(await todo.connect(other).addTaskInMap(0, 30)).not.to.be.reverted;
                expect(await todo.connect(other).awarded(0)).not.to.be.reverted;
                const anti = await todo.balance(other.address);
                console.log(`Balance: ${anti}`);
            it("User can not set the same id", async()=>{
                const {owner, other,  tbnb, todo} = await loadFixture(deploy);
                await tbnb.connect(other).mint(other.address, 100);
                await tbnb.connect(other).approve(todo.target, 100);
                await todo.connect(other).exchange(100);
                expect(await todo.connect(other).addTaskInMap(0, 30)).not.to.be.reverted;
                await expect(todo.connect(other).addTaskInMap(0, 30)).to.be.reverted;
                })
            })
        describe("Awarded", function(){
            it("User, can't awared the task which alredy done", async()=>{
                const {owner, other, tbnb, todo} = await loadFixture(deploy);
                await tbnb.connect(other).mint(other.address, 100);
                await tbnb.connect(other).approve(todo.target, 100);
                await todo.connect(other).exchange(100);
                expect(await todo.connect(other).addTaskInMap(0, 30)).not.to.be.reverted;
                expect(await todo.connect(other).awarded(0)).not.to.be.reverted;
                await expect( todo.connect(other).awarded(0)).to.be.reverted;
                })
            it("User shoud recive they award", async()=>{
                const {owner, other,  tbnb, todo} = await loadFixture(deploy);
                await tbnb.connect(other).mint(other.address, 100);
                await tbnb.connect(other).approve(todo.target, 100);
                await todo.connect(other).exchange(100);
                expect(await todo.connect(other).addTaskInMap(0, 30)).not.to.be.reverted;
                expect(await todo.connect(other).awarded(0)).not.to.be.reverted;
                console.log(await todo.balance(other.address));
                });
            })
        describe("Check", function(){
            it("If user do not done task in 1 day he lost 30% tokens", async()=>{
                const {owner, other, tbnb, todo} = await loadFixture(deploy);
                await tbnb.connect(other).mint(other.address, 100);
                await tbnb.connect(other).approve(todo.target, 100);
                await todo.connect(other).exchange(100);
                expect(await todo.connect(other).addTaskInMap(0, 30)).not.to.be.reverted;
                await time.increase(604800);
                await todo.connect(other).checkTask(0);
                const balance = await tbnb.balanceOf(other.address);
                console.log(`Balance: ${balance}`);
                })
            })
            describe("Modifier", function(){
                it("If users are not owner they can't set new token", async()=>{
                    const {owner, other, tbnb, todo} = await loadFixture(deploy);
                    const upgrade = await ethers.getContractFactory("Todoapp2");
                    const upContr = await upgrades.upgradeProxy(todo.target, upgrade);
                    expect(await upContr.setToken("0xB973BfDC9597f249Fd34f695F397857AE0d2b04A")).to.be.reverted;
                    expect(await upContr.owner()).to.be.eq(owner.address);
                })
            })
        })
    })
  })