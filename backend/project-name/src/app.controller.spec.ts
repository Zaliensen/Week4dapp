import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn().mockReturnValue('Hello World'),
            getLastBlock: jest.fn().mockReturnValue({ number: 1, timestamp: 1 }),
            getTotalSupply: jest.fn().mockReturnValue(Promise.resolve('1000')),
            getBalance: jest.fn().mockReturnValue(Promise.resolve('100')),
            getReceipt: jest.fn().mockReturnValue(Promise.resolve({})),
            requestTokens: jest.fn().mockReturnValue(Promise.resolve({ hash: 'abc' })),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('AppController', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World');
    });

    it('should return the last block', async () => {
      expect(await appController.getLastBlock()).toEqual({ blockNumber: 1, timestamp: 1 });
    });

    it('should return the total supply', async () => {
      expect(await appController.getTotalSupply()).toEqual({ totalSupply: '1000' });
    });

    it('should return the balance of an address', async () => {
      const mockAddress = 'mockAddress';
      expect(await appController.getBalance(mockAddress)).toEqual({ balance: '100' });
      expect(appService.getBalance).toHaveBeenCalledWith(mockAddress);
    });

    it('should return a receipt', async () => {
      const mockHash = 'mockHash';
      expect(await appController.getReceipt(mockHash)).toEqual({});
      expect(appService.getReceipt).toHaveBeenCalledWith(mockHash);
    });

    it('should request tokens for an address', async () => {
      const mockAddress = 'mockAddress';
      expect(await appController.requestTokens({ address: mockAddress })).toEqual({ transactionHash: 'abc' });
      expect(appService.requestTokens).toHaveBeenCalledWith(mockAddress);
    });
  });
});
