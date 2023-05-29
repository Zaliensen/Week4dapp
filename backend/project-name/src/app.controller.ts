import { Body, Controller, ForbiddenException, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';

import { RequestTokenDto } from './dtos/requestToken.dto';
import { RequestVoteDto } from './dtos/requestVote.dto';


@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('token-contract-address')
  getTokenContractAddress(){
    return this.appService.getTokenContractAddress();
  }
  @Get('ballot-contract-address')
  getBallotContractAddress(){
    return this.appService.getBallotAddress();
  }
    @Get('last-block')
    getLastBlock(){
        return this.appService.getLastBlock();
    }

    @Get('balance')
    async getBalance(@Query('address') address: string) {
        return await this.appService.getBalance(address);
    }

    @Get('total-supply')
    async getTotalSupply() {
        return await this.appService.getTotalSupply();
    }

    @Get('receipt')
    async getReceipt(@Query('hash') hash: string) {
        return await this.appService.getReceipt(hash);
    }

    @Post('request-tokens')
requestTokens(@Body() requestTokenDto: RequestTokenDto) {
    return this.appService.requestTokens(requestTokenDto);
}

    @Get('proposal/:proposalId')
    async getProposal(@Param('proposalId') proposalId: number){
        return await this.appService.getProposal(proposalId);
    }

    @Get('proposals')
    async getAllProposals(){
        return await this.appService.getAllProposals();
    }

    @Get('past-votes/:address/:voteIndex')
    async getPastVotes(@Param('address') address: string, @Param('voteIndex') voteIndex: string){
        return await this.appService.getPastVotes(address, parseInt(voteIndex));
    }
    


    @Post('vote')
    async vote(@Body() body: RequestVoteDto) {
      return this.appService.vote(body);
    
    }
    

}