import { useEffect, useState } from 'react';
import { NFTStorage, File } from 'nft.storage';
import { ethers } from 'ethers';
import nftMarketplaceABI from './utils/NFTMarketplaceABI.json';
import './App.css';
import { parseEther } from 'ethers/lib/utils';

const token = process.env.REACT_APP_NFT_STORAGE_TOKEN;
const contract_address = process.env.REACT_APP_CONTRACT_ADD;

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [ipfsLoading, setIpfsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [minted, setMinted] = useState(false);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
    }
    else {
      console.log("We have ethereum object", ethereum);
    }

    const chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connect to chain : " + chainId);

    if (chainId !== "0x5") {
      alert("You are not on Goerli Test Network");
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      console.log("Found an authorized account : ", accounts[0]);
    }
    else {
      console.log("No authorized account found");
    }
  }

  const connectWallet = async () => {
    try {
      setLoading(true);
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      console.log("Connected account : ", accounts[0]);
      setCurrentAccount(accounts[0]);
      checkBalance(accounts[0]);
    }
    catch (err) {
      console.log(err);
      setLoading(false);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    window.ethereum.on('accountsChanged', function (accounts) {
      setCurrentAccount("");
      setLoading(false);
      setIpfsLoading(false);
      setMinted(false);
    });
  }, []);

  const checkBalance = async (address) => {
    try {
      // Get signer
      const signer = await getProviderSigner();
      const contract = new ethers.Contract(contract_address, nftMarketplaceABI.abi, signer);
      // Check the balance of connected account
      let balance = await contract.getBalance(address);

      if (balance.toNumber() >= 1) {
        setMinted(true);
      } else {
        setMinted(false);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  // Gets the signer and returns it
  const getProviderSigner = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        return signer;
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Uploads the image to IPFS using nft.storage
  const getIPFSLink = async () => {
    // Initialize NFTStorage
    const client = new NFTStorage({ token: token });
    // Get random number which is between 1 and 10, bcoz there are 10 images uploaded in NFTs folder.
    const randNumber = Math.floor(Math.random() * (11 - 1) + 1);
    // Get file object from path
    const file = await fetch(`/NFTs/${randNumber}.png`).then((res) => {
      return res.blob();
    }).then((blob) => {
      const file = new File([blob], `${randNumber}.png`, { type: "image/png" });
      return file;
    });
    // Upload the ERC721 metadata to IPFS and returns CID
    const metadata = await client.store({
      name: `PV NFT#${randNumber}`,
      description: 'Just some description',
      image: file
    });
    return metadata;
  }

  const mintNFT = async () => {
    try {
      // Generate IPFS link using nft.storage
      setIpfsLoading(true);
      let url = await getIPFSLink();
      url = "https://nftstorage.link/ipfs/" + url.ipnft + "/metadata.json";
      setIpfsLoading(false);

      // Call the mint function of smart contract
      setLoading(true);
      const signer = await getProviderSigner();
      const contract = new ethers.Contract(contract_address, nftMarketplaceABI.abi, signer);

      let txn = await contract.mint(url, { value: parseEther('0.0001') });
      console.log(txn);
      console.log(`Mined, see transaction: https://goerli.etherscan.io/tx/${txn.hash}`);

      // Check for event emitted from the smart contract
      contract.on("NFTMinted", (from, tokenId) => {
        console.log(`https://testnets.opensea.io/assets/goerli/${contract_address}/${tokenId.toNumber()}`);
        alert(`Hey, there! We've minted your NFT. It may be blank right now. It can take max of 10 minutes. Here's the link: <https://testnets.opensea.io/assets/goerli/${contract_address}/${tokenId.toNumber()}>`);
        checkBalance(currentAccount);
        setLoading(false);
      });
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  const renderButton = () => {
    if (currentAccount === "") {
      return (
        <button onClick={connectWallet} className="connect-wallet-button">
          Connect to Wallet
        </button>
      );
    }

    if (currentAccount !== "") {
      if (minted) {
        return (<button type='button' disabled className="connect-wallet-button">Already Minted!</button>);
      }
      else {
        if (loading) {
          return (<button type='button' disabled className="connect-wallet-button">Loading...</button>);
        }
        else if (ipfsLoading) {
          return (<button type='button' disabled className="connect-wallet-button">Uploading to IPFS...</button>);
        }
        else {
          return (<button type='button' onClick={mintNFT} className="connect-wallet-button">Mint NFT</button>);
        }
      }
    }
  }

  return (
    <>
      <div className="App">
        <div className="container">
          <div className="header-container">
            <p className="header gradient-text">My NFT Collection</p>
            <p className="sub-text">
              Each unique. Each beautiful. Discover your NFT today.
            </p>
            {renderButton()}
          </div>
        </div>
      </div>
      <footer className='footer'>
        Made by Parth Varde
      </footer>
    </>
  );
}

export default App;
