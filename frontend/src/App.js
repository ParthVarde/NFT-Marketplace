import { useEffect, useState } from 'react';
import { NFTStorage, File } from 'nft.storage';
import './App.css';

const token = process.env.REACT_APP_NFT_STORAGE_TOKEN;

function App() {
  const [currentAccount, setCurrentAccount] = useState("");

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
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      console.log("Connected account : ", accounts[0]);
      setCurrentAccount(accounts[0]);
    }
    catch (err) {
      console.log(err);
    }
  }

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const getIPFSLink = async () => {
    const client = new NFTStorage({ token: token });
    const randNumber = Math.floor(Math.random() * (11 - 1) + 1);
    const file = await fetch(`/NFTs/${randNumber}.png`).then((res) => { 
      return res.blob();
    }).then((blob) => {
      const file = new File([blob], `${randNumber}.png`, { type: "image/png" });
      return file;
    });
    const metadata = await client.store({
      name: `My NFT#${randNumber}`,
      description: 'Just some description',
      image: file
    });
    return metadata;
  }

  const mintNFT = async () => {
    let url = await getIPFSLink();
    url = "https://ipfs.io/ipfs/" + url.ipnft + "/metadata.json";
    console.log(url);
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : <button type='button' onClick={mintNFT} className="cta-button connect-wallet-button">Mint NFT</button>}
        </div>
      </div>
    </div>
  );
}

export default App;
