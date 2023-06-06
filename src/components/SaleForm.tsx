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


const buyTokens = async () => {

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

    
    // and just call buyTokens method according to smart contract
    const result = await contract.methods
      .moneyTransfer({
        hashcode, _key,_amount,_currency
      } as never)
      .send({
        from: userAddress,
        amount,
        bounce: true,
      });
    if (result?.id?.lt && result?.endStatus === "active") {
      setStatusMsg("Transfer Success, Share the code :" + withDraw_Code);
      getBalance(address);
    }
  } catch (e) {
    console.error(e);
  }

};

const TransferRs = async () => {

  if (!venomConnect || !address  || !provider) return;
  const userAddress = new Address(address);

  const amount = new BigNumber(300).multipliedBy(10 ** 2).toString(); // Contract"s rate parameter is 1 venom = 10 tokens

  const deployWalletValue = new BigNumber(0.5).multipliedBy(10 ** 9).toString(); // Contract"s rate parameter is 1 venom = 10 tokens

  const payload = "undefined";


  const contractAddress = new Address("0:65c3ff8fdd39c2487a9b0536c785ef8d528b1a6e8cefa9c2d03ddb1981255b6b"); // Our Tokensale contract address

  const recipient = new Address("0:d142a8a9aa01b3a0a77835ecc4bfb803ff52805f0ed0677cf82a29400fc91542"); // Our Tokensale contract address

  const remainingGasTo = new Address("0:d142a8a9aa01b3a0a77835ecc4bfb803ff52805f0ed0677cf82a29400fc91542"); // Our Tokensale contract address

  const contract = new provider.Contract(TokenWallet, contractAddress);

  const notify = false;

  var _secret_code = secretCode;
  setSecretCodeDisplay(_secret_code);

  try {

    // Transfer Rupees method according to smart contract
    const result = await contract.methods
      .transfer({
        amount, recipient,deployWalletValue,remainingGasTo,notify,payload
      } as never)
      .send({
        from: userAddress,
        amount,
        bounce: true,
      });
    if (result?.id?.lt && result?.endStatus === "active") {
      setStatusMsg("Transfer Rupeees !");
      getBalance(address);
    }
  } catch (e) {
    console.error(e);
  }

};

  const withDrawTokens = async () => {

    if (!venomConnect || !address || !secretCode || !provider) return;
    const userAddress = new Address(address);
    const contractAddress1 = new Address("0:fac0dea61ab959bf5fc5d325b6ef97ef45ef371c8649042e92b64e46c3c854d5"); // Our Tokensale contract address

    const contractAddress = new Address("0:d142a8a9aa01b3a0a77835ecc4bfb803ff52805f0ed0677cf82a29400fc91542"); // Our Tokensale contract address

    const contract = new provider.Contract(WenomUnionAbi, contractAddress);

    var _secret_code = secretCode;
    const amount = new BigNumber(1).plus(new BigNumber(1).multipliedBy(10 ** 9)).toString();;
    setSecretCodeDisplay(_secret_code);

    try {

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
        getBalance(address);
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
        <span>(Indian Rupee) INR</span>
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
      <div className="card__amount">
        <div className="number">
          <span>Amount</span>
          <input
            type="number"
            min={0}
            value={tokenAmount !== undefined ? tokenAmount : ""}
            onChange={(e) => {
              onChangeAmount(e.target.value);
            }}
            maxLength={5}            

          />
        </div>

      </div>
      <div className="item-info">
      <a className={!tokenAmount ? "btn disabled" : "btn"} onClick={buyTokens}>
          Transfer Now
        </a>        
      <a className={!secretCode ? "btn disabled" : "btn"} onClick={withDrawTokens}>
          With Draw Fund
        </a>
      </div>
      <div>
      <a className="btn" onClick={onTokenAdd}>
          Add Token
        </a>
      </div>

      <div>
      <a className="btn" onClick={TransferRs}>
          Transfer Fund
        </a>
      </div>
    </>
  );
}

export default SaleForm;
