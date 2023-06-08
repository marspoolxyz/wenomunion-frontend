import React, { useState } from "react";
import { VenomConnect } from "venom-connect";
import { Address, ProviderRpcClient,Contract } from "everscale-inpage-provider";

import { SAMPLE_ABI } from '../abi/Sample';


import { sha256, sha224 } from 'js-sha256';


// we will user bignumber library to operate with deposit values (remember about decimals multiply)
import BigNumber from "bignumber.js";

// Importing of our contract ABI from smart-contract build action. Of cource we need ABI for contracts calls.
import tokenSaleAbi from "../abi/Tokensale.abi.json";

import WenomUnionAbi from "../abi/WenomUnion.abi.json";

import TokenWallet from "../abi/TokenWallet.abi.json";
import TokenRootAbi from "../abi/TokenRoot.abi.json";

import IndianRupee from "../abi/IndiaRupee.abi.json";
import AddTokenImg from "../styles/img/add_token.svg";

type Props = {
  balance: string | undefined;
  getBalance: (wallet: string) => void;
  venomConnect: VenomConnect | undefined;
  address: string | undefined;
  provider: ProviderRpcClient | undefined;
};




function SaleForm({ balance, venomConnect, address, provider, getBalance }: Props) {
  const [tokenAmount, setTokenAmount] = useState<number | undefined>();

  const [secretCode, setSecretCode] = useState<string | undefined>("");

  const [RupeeBalance, setBalance] = useState<string | undefined>("0");

  const [secretCodeDisplay, setSecretCodeDisplay] = useState<string | undefined>("");

  const [statusMsg, setStatusMsg] = useState<string | undefined>("Enter the amount for transfer or To Withdraw secret code");


  const onChangeCode = (e: string) => {
    if (e === "") setSecretCode(undefined);
    setSecretCode(e);
  };

  const onChangeAmount = (e: string) => {
    if (e === "") setTokenAmount(undefined);
    setTokenAmount(Number(e));
  };

  const setMaxValue = async () => {

    if (!venomConnect || !address  || !provider) return;

    const userAddress = new Address(address);
  
    const TokenRootContractAddress = new Address("0:65c3ff8fdd39c2487a9b0536c785ef8d528b1a6e8cefa9c2d03ddb1981255b6b")
    const tokenRootContract = new provider.Contract(TokenRootAbi, TokenRootContractAddress);
  
    const {value0: userTokenWalletAddress} = await tokenRootContract.methods.walletOf({answerId: 0, walletOwner: userAddress} as never).call();
    const contract = new provider.Contract(TokenWallet, userTokenWalletAddress);
    const {value0: userTokenBalance } = await contract.methods.balance({answerId: 0} as never).call();
    const inr_balance = new BigNumber(userTokenBalance).dividedToIntegerBy(10**2); 

    setTokenAmount(Number(inr_balance));
  }

  // handler that helps us to ask user about adding our token to the user's venom wallet
  const onTokenAdd = () => {
    console.log(provider?.addAsset({
      account: new Address(address as string), // user's wallet address
      params: {
        rootContract: new Address("0:65c3ff8fdd39c2487a9b0536c785ef8d528b1a6e8cefa9c2d03ddb1981255b6b"), // TokenRoot address
      },
      type: "tip3_token", // tip3 - is a standart we use
    }))
  }

  const onDisconnect = async () => {
    console.log("TEST");
    provider?.disconnect();
    window.location.reload();
  };

const generateSecretCode = async () => {

  if (!venomConnect || !address || !tokenAmount || !provider) return;
  const userAddress = new Address(address);
  const contractAddressINR = new Address("0:65c3ff8fdd39c2487a9b0536c785ef8d528b1a6e8cefa9c2d03ddb1981255b6b"); // Our Tokensale contract address

  const contractAddress = new Address("0:d142a8a9aa01b3a0a77835ecc4bfb803ff52805f0ed0677cf82a29400fc91542"); // Our Tokensale contract address



  const deposit = new BigNumber(tokenAmount).multipliedBy(1 ** 1).toString(); // Contract"s rate parameter is 1 venom = 10 tokens
  const _amount = new BigNumber(tokenAmount).multipliedBy(1 ** 1).toString(); // Contract"s rate parameter is 1 venom = 10 tokens

  const contract1 = new provider.Contract(tokenSaleAbi, contractAddress);

  const contract = new provider.Contract(WenomUnionAbi, contractAddress);

  var _key = (Math.floor(Math.random() * 10000) + 1).toString();


  const hashcode = sha256(_key).toUpperCase();
  

  let hash_key = hashcode.substring(1, 7);

  var withDraw_Code = "WU-"+_key+hash_key;

  setSecretCodeDisplay(withDraw_Code);


  console.log("sha256 = " + hashcode);
  console.log("Big Number = " + _key);
  
  const _currency = "100";

  // another 1 venom for connection. You will receive a change, as you remember
  const amount = new BigNumber(deposit).plus(new BigNumber(1).multipliedBy(10 ** 9)).toString();;
  try {

    
    // and just call generateSecretCode method according to smart contract
    const result = await contract.methods
      .moneyTransfer({
        hashcode, _key,_amount,_currency
      } as never)
      .send({
        from: userAddress,
        amount,
        bounce: true,
      });

      setStatusMsg("Secret Code generation in progress...");

    if (result?.id?.lt && result?.endStatus === "active") {
     
  
      setStatusMsg("Share the Secret Code  "+ withDraw_Code + " to receive INR " + tokenAmount);

      getBalanceINR();
    }


    



  } catch (e) {
    console.error(e);
  }

};
const getBalanceINR = async () => {
  if (!venomConnect || !address  || !provider) return;

  const userAddress = new Address(address);

  const TokenRootContractAddress = new Address("0:65c3ff8fdd39c2487a9b0536c785ef8d528b1a6e8cefa9c2d03ddb1981255b6b")
  const tokenRootContract = new provider.Contract(TokenRootAbi, TokenRootContractAddress);

  const {value0: userTokenWalletAddress} = await tokenRootContract.methods.walletOf({answerId: 0, walletOwner: userAddress} as never).call();
  const contract = new provider.Contract(TokenWallet, userTokenWalletAddress);
  const {value0: userTokenBalance } = await contract.methods.balance({answerId: 0} as never).call();

  
  const inr_balance = new BigNumber(userTokenBalance).dividedToIntegerBy(10**2).toString(); 
  setBalance(inr_balance);

}
getBalanceINR();

const TransferINR = async () => {

  if (!venomConnect || !address || !tokenAmount  || !provider) return;
  const userAddress = new Address(address);








  const TokenRootContractAddress = new Address("0:65c3ff8fdd39c2487a9b0536c785ef8d528b1a6e8cefa9c2d03ddb1981255b6b")
  const tokenRootContract = new provider.Contract(TokenRootAbi, TokenRootContractAddress);

  const {value0: userTokenWalletAddress} = await tokenRootContract.methods.walletOf({answerId: 0, walletOwner: userAddress} as never).call();
  const contract = new provider.Contract(TokenWallet, userTokenWalletAddress);
  const {value0: userTokenBalance } = await contract.methods.balance({answerId: 0} as never).call();

  const amount = new BigNumber(tokenAmount).multipliedBy(10 ** 2).toString(); // Contract"s rate parameter is 1 venom = 10 tokens
  const inr_balance = new BigNumber(userTokenBalance).dividedToIntegerBy(1).toString(); 

  if(inr_balance < amount)
  {
    setStatusMsg("Insucfficient Balance");
    return;
  }

  setStatusMsg("Waiting for Transfer Approval INR " + tokenAmount + ".00 ");

  const {value0: symbol} = await tokenRootContract.methods.symbol({answerId: 0} as never ).call();
  const {value0: decimals} = await tokenRootContract.methods.decimals({answerId: 0} as never).call();
 

  getBalanceINR();


  const gas = new BigNumber(15).multipliedBy(10 ** 7).toString(); // Contract"s rate parameter is 1 venom = 10 tokens

  const deployWalletValue = new BigNumber(15).multipliedBy(10 **6).toString(); // Contract"s rate parameter is 1 venom = 10 tokens

  const payload = '';


  const remainingGasTo = new Address("0:da5e5db1755592b73d27fcdc640d26b251abe0280a0240d06ee79e08f02aa151"); // Our Tokensale contract address
  const contractAddress = new Address("0:65c3ff8fdd39c2487a9b0536c785ef8d528b1a6e8cefa9c2d03ddb1981255b6b"); // Our Tokensale contract address
  const tokenRupee = new provider.Contract(IndianRupee, contractAddress);

  const recipient = tokenRupee.address;

  const notify = true;


  
 
  try {

    setStatusMsg("Transaction is in progress....");

    // Transfer Rupees method according to smart contract
    const result = await contract.methods
      .transfer({
        amount, recipient,deployWalletValue,remainingGasTo,notify,payload
      } as never)
      .send({
        from: userAddress,
        amount: gas,
        bounce: true,
      });



    if (result?.id?.lt && result?.endStatus === "active") {

      const {value0: userTokenBalance } = await contract.methods.balance({answerId: 0} as never).call();

      setStatusMsg("Secret Code generation in started");

      generateSecretCode();

      console.log(result);

      getBalanceINR();
    }
  } catch (e) {
    
    setStatusMsg("Use rejected the transaction");


  }

   

};

  const withDrawTokens = async () => {

    if (!venomConnect || !address || !secretCode || !provider) return;
    const userAddress = new Address(address);
    const contractAddress1 = new Address("0:fac0dea61ab959bf5fc5d325b6ef97ef45ef371c8649042e92b64e46c3c854d5"); // Our Tokensale contract address

    const contractAddress = new Address("0:d142a8a9aa01b3a0a77835ecc4bfb803ff52805f0ed0677cf82a29400fc91542"); // Our Tokensale contract address

    const contract = new provider.Contract(WenomUnionAbi, contractAddress);

    setStatusMsg("Withdraw of INR started");


    var _secret_code = secretCode;
    const amount = new BigNumber(1).plus(new BigNumber(1).multipliedBy(10 ** 9)).toString();;
    setSecretCodeDisplay(_secret_code);

    try {
      setStatusMsg("Withdraw of INR is in progress.....");

      // withDrawTokens method according to smart contract
      const result = await contract.methods
        .withDrawTokens({
          _secret_code 
        } as never)
        .send({
          from: userAddress,
          amount,
          bounce: true,
        });


      if (result?.id?.lt && result?.endStatus === "active") {
        setStatusMsg("Withdraw Success !");
        getBalanceINR();
      }
    } catch (e) {
      console.error(e);
    }

  };
  return (
    <>
      <h1>WenomUnion Exchange </h1>
      <div className="item-msg">
        <span>{statusMsg}</span>
       
      </div>      
      <div className="item-info">
        <span>(Indian Rupee) INR {RupeeBalance}.00 </span>
        <b>0:65c...b6b</b> 
      </div>
      <div className="item-info">
        <span>Secret Code {secretCodeDisplay}</span>
      </div>
      <div className="item-info">
        <input
            type="text"
            value={secretCode !== undefined ? secretCode : ""}
            onChange={(e) => {
              onChangeCode(e.target.value);
            }}
            maxLength={15}            
          />
      </div>      
      <div className="item-info">
        <div className="item-info">
        <span>Amount</span>&nbsp;
          <input
            type="number"
            min={0}
            value={tokenAmount !== undefined ? tokenAmount : ""}
            onChange={(e) => {
              onChangeAmount(e.target.value);
            }}
            maxLength={5}           
           />&nbsp;&nbsp;
           <a  onClick={setMaxValue}>Max</a>
        </div>

      </div>
      <div className="item-info">
      <a className={!tokenAmount ? "btn disabled" : "btn"} onClick={TransferINR}>
          Transfer Now
        </a>        
      <a className={!secretCode ? "btn disabled" : "btn"} onClick={withDrawTokens}>
          With Draw Fund
        </a>
      </div>

      <div className="item-info">
      <a className="btn" onClick={onTokenAdd}>
          Add Token INR
        </a>
        <a className="btn" onClick={onDisconnect}>
          Change Wallet
        </a>  
      </div>
      <div className="item-info"> 
        <span>New Users : Use Secret Code WU-6280AFB865 for INR 1000</span>
      </div>      
     
      

    </>
  );
}

export default SaleForm;
