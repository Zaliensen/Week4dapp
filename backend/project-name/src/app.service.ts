import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { BigNumber, ethers } from 'ethers';
import * as tokenJson from './assets/MyERC20Votes.json'
import * as BallotJson from './assets/Ballot.json'
import { ConfigService } from '@nestjs/config';
import * as imVoteJson from './assets/ImVoteToken.json'
import { RequestTokenDto } from './dtos/requestToken.dto';
import { RequestVoteDto } from './dtos/requestVote.dto';

@Injectable()
export class AppService {
    private readonly logger = new Logger(AppService.name);
    provider: ethers.providers.Provider;
    ballotContract: ethers.Contract;
    voteContract: ethers.Contract;
    interfaceContract: ethers.Contract;

    constructor(private configService: ConfigService) {
        this.provider = new ethers.providers.InfuraProvider("sepolia", this.configService.get<string>('INFURA_API_KEY'));
        
        this.voteContract = new ethers.Contract(
            this.getTokenContractAddress(),
            tokenJson.abi,
            this.provider
        );  

        this.ballotContract = new ethers.Contract(
            this.getBallotAddress(),
            BallotJson.abi,
            this.provider
        ); 
        this.interfaceContract = new ethers.Contract(
            this.getBallotAddress(),
            imVoteJson.abi,
            this.provider
        );
    }

    getBallotAddress(): string {
        return this.configService.get<string>('NEXT_PUBLIC_CONTRACT_ADDRESS');//Ballot 
    }

    getTokenContractAddress(): string {
        return this.configService.get<string>('VOTING_CONTRACT_ADDRESS');//Token
    }

    getLastBlock() {
        return this.provider.getBlock('latest');
    }

    async getBalance(address: string) {
        const balance = await this.voteContract.balanceOf(address);
        return ethers.utils.formatUnits(balance._hex);
    }

    async getTotalSupply() {
        const supply = await this.voteContract.totalSupply();
        return ethers.utils.formatUnits(supply._hex);
    }

    async getReceipt(hash: string) {
        const tx = await this.provider.getTransaction(hash);
        const receipt = await tx.wait();
        return receipt;
    }

    requestTokens(dto: RequestTokenDto) {
        const recoveredAddress = ethers.utils.verifyMessage("Some message", dto.signature);
        
        if (recoveredAddress !== dto.address) {
            throw new Error("Invalid signature");
        }
    
        const privateKey = this.configService.get<string>('PRIVATE_KEY');
        const wallet = new ethers.Wallet(privateKey);
        const signer = wallet.connect(this.provider);
        this.logger.log(`Minting tokens to address: ${dto.address}`);
    
        return this.voteContract
        .connect(signer)
        .mint(dto.address, ethers.utils.parseUnits("1"));
    }
    

    async getProposal(proposalId: number) {
        const proposal = await this.ballotContract.proposals(proposalId);
        return {
            name: ethers.utils.parseBytes32String(proposal.name),
            voteCount: ethers.utils.formatUnits(proposal.voteCount),
             // assuming this is a timestamp
        };
    }

    async getAllProposals() {
        const proposalCount = await this.ballotContract.getNumProposals();
        const proposals = [];
        for (let i = 0; i < proposalCount; i++) {
            const proposal = await this.getProposal(i);
            proposals.push(proposal);
        }
        return proposals;
    }

    async vote(dto: RequestVoteDto) {
        try {
            // Transaction has been initiated by the frontend, just return the hash
            return dto.signature;
        } catch (error) {
            this.logger.error(`Error in vote: ${error.message}`);
            throw error;
        }
    }
    
      



  async getPastVotes(address: string, voteIndex: number) {
    this.logger.log('getPastVotes called with address: ' + address + ' and voteIndex: ' + voteIndex);
    
    try {
      const votes = await this.interfaceContract.getPastVotes(address, voteIndex);
      this.logger.log('getPastVotes completed successfully');
      
      return ethers.utils.formatUnits(votes);
    } catch (error) {
      this.logger.error('Error occurred in getPastVotes: ' + error.message);
      throw error;
    }
  }
}
